/* Optional browser check: PLAYWRIGHT_MODULE may point at an existing Playwright installation.
   Every Supabase auth, data and storage request is intercepted. Never writes to the live project. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
fs.mkdirSync("tests/browser/artifacts", { recursive: true });
const base = process.env.CC_TEST_URL || "http://127.0.0.1:5173";
(async () => {
  const env = fs.readFileSync(".env", "utf8");
  const project = env.match(/^VITE_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)[1];
  const ref = new URL(project).hostname.split(".")[0];
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1800, height: 1100 },
    reducedMotion: "no-preference",
  });
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    email: "preview@example.test",
    aud: "authenticated",
    role: "authenticated",
  };
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const token =
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ) +
    "." +
    Buffer.from(
      JSON.stringify({ sub: user.id, exp, role: "authenticated" }),
    ).toString("base64url") +
    ".mock";
  await context.addInitScript(
    ({ ref, user, exp, token }) =>
      localStorage.setItem(
        `sb-${ref}-auth-token`,
        JSON.stringify({
          access_token: token,
          refresh_token: "mock-refresh",
          expires_at: exp,
          expires_in: 3600,
          token_type: "bearer",
          user,
        }),
      ),
    { ref, user, exp, token },
  );
  const db = {
    upcoming_events: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        title: "Published workshop",
        description: "A practical workshop.",
        image_url: "/team/maadhav.jpg",
        image_display: null,
        event_date: "2028-10-29",
        event_time: "12:00",
        starts_at: "2028-10-29T06:30:00Z",
        ends_at: "2028-10-29T08:30:00Z",
        speakers: [],
        category: "Workshop",
        location: "Campus",
        is_published: true,
      },
    ],
    team_members: [
      {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Published member",
        role: "Community lead",
        image_url: "/team/vatsal.jpg",
        image_display: null,
        github_url: null, behance_url: null, linkedin_url: null,
        group_type: "core",
        is_active: true,
      },
    ],
    testimonials: [
      {
        id: "44444444-4444-4444-8444-444444444444",
        name: "Published reviewer",
        role: "Member",
        text: "We learn by building together.",
        avatar_url: "/team/maadhav.jpg",
        image_display: null,
        is_published: true,
      },
    ],
    past_event_albums: [
      {
        id: "55555555-5555-4555-8555-555555555555",
        title: "Published album",
        description: "Community photos.",
        event_date: "2026-10-28",
        cover_image_url: "/team/maadhav.jpg",
        cover_display: null,
        photo_display: null,
        photos: ["/team/maadhav.jpg", "/team/vatsal.jpg"],
        photo_captions: {
          "/team/maadhav.jpg": "First photo",
          "/team/vatsal.jpg": "Second photo",
        },
        is_published: true,
      },
    ],
    site_page_content: [],
    site_presentation_settings: [
      {
        key: "gallery_reel",
        value: {
          enabled: true,
          title: "Community in frames",
          speedSeconds: 48,
          direction: "left",
          pauseOnHover: true,
          albumIds: [],
          photoKeys: [],
        },
      },
      { key: "event_cards", value: { style: "ticket", animation: "none" } },
    ],
  };
  let writes = 0;
  let failCleanup = false;
  let failSave = false;
  let missingImageSchema = false;
  const errors = [];
  await context.route("**/auth/v1/**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    }),
  );
  await context.route("**/rest/v1/**", async (r) => {
    const url = new URL(r.request().url());
    const table = url.pathname.split("/").pop();
    const method = r.request().method();
    if (method === "POST") {
      writes++;
      assert.match(r.request().headers().authorization || "", /^Bearer /);
      if (failSave)
        return r.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({ code: "42501", message: "Test save denied" }),
        });
      const payload = r.request().postDataJSON();
      const entries = Array.isArray(payload) ? payload : [payload];
      if (
        missingImageSchema &&
        entries.some(
          (item) =>
            item.image_display || item.cover_display || item.photo_display,
        )
      )
        return r.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            code: "PGRST204",
            message: "image_display column missing",
          }),
        });
      for (const item of entries) {
        const key =
          table === "site_page_content"
            ? "page"
            : table === "site_presentation_settings"
              ? "key"
              : "id";
        const index = db[table].findIndex((row) => row[key] === item[key]);
        if (index < 0) db[table].push(item);
        else db[table][index] = { ...db[table][index], ...item };
      }
      const result = r.request().headers().accept?.includes("vnd.pgrst.object")
        ? entries[0]
        : entries;
      return r.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(result),
      });
    }
    let rows = db[table] || [];
    for (const field of ["page", "is_published", "is_active", "group_type"]) {
      const filter = url.searchParams.get(field);
      if (filter?.startsWith("eq."))
        rows = rows.filter((row) => String(row[field]) === filter.slice(3));
    }
    return r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(rows),
    });
  });
  await context.route("**/storage/v1/**", async (r) => {
    if(r.request().method()==='DELETE') return r.fulfill({status:failCleanup?403:200,contentType:'application/json',body:failCleanup?'{"message":"Cleanup denied"}':'[]'});
    if (r.request().method() === "POST") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return r.fulfill({
        status: 200,
        contentType: "application/json",
        body: '{"Key":"site-media/mock.jpg"}',
      });
    }
    return r.fulfill({
      status: 200,
      contentType: "image/jpeg",
      body: fs.readFileSync("src/images/maadhav.jpg"),
    });
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.log("Browser error:", e.message);
  });
  await page.goto(base + "/admin");
  await page
    .getByRole("heading", { name: "Page manager", exact: true })
    .waitFor();
  const nav = page.getByRole("navigation", { name: "Website pages" });

  assert.equal(await page.locator('iframe').count(), 0);
  await nav.getByRole('button', { name: 'Navigation & footer', exact: true }).click();
  await page.locator('summary').filter({hasText:'Social links'}).click();
  const social = page.locator('.cms-icon-select select').first();
  await social.waitFor();
  for (const value of ['FaDiscord','FaBehance','FaInstagram','FaGithub','FaLinkedin']) {
    await social.selectOption(value);
    assert.equal(await social.inputValue(), value);
  }
  await social.selectOption('FaDiscord');
  assert.ok((await social.boundingBox()).width > 200);
  await page.getByRole('button', {name:'Save page',exact:true}).click();
  await page.getByText('Navigation & footer page saved.',{exact:false}).waitFor();
  assert.equal(db.site_page_content.find(row => row.page === 'shared').content.social.items[0].icon,'FaDiscord');
  await nav.getByRole('button', { name: 'Team', exact: true }).click();
  await page.getByRole('button', { name: 'Core Members', exact: true }).click();

  let drags = 0;
  await page.exposeFunction('recordNativeDrag', () => { drags++; });
  await page.evaluate(() => document.addEventListener('dragstart', () => window.recordNativeDrag()));
  for (const [label, fraction] of [['Zoom (', .75], ['Focal point left/right', .8], ['Focal point up/down', .2]]) {
    const slider = page.getByRole('slider', {name: new RegExp(label.replace('(', '\\('))}).first();
    await slider.scrollIntoViewIfNeeded();
    const box = await slider.boundingBox();
    const before = await slider.evaluate(n => ({min:Number(n.min),max:Number(n.max),value:Number(n.value)}));
    const travel = box.width - 16;
    const start = box.x + 8 + travel * (before.value-before.min)/(before.max-before.min);
    await page.mouse.move(start, box.y+box.height/2);
    await page.mouse.down();
    await page.mouse.move(box.x+8+travel*fraction, box.y+box.height/2, {steps:15});
    await page.mouse.up();
    const after = Number(await slider.inputValue());
    assert.ok(Math.abs(after-(before.min+(before.max-before.min)*fraction)) < (before.max-before.min)*.06, `${label}: dragging produced ${after}`);
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    assert.ok(Number(await slider.inputValue()) > after, 'Keyboard adjustment works');
  }
  assert.equal(drags,0,'Slider gestures must not start a record reorder');
  await page.getByRole('button',{name:'Add Core Member',exact:true}).click();
  await page.getByLabel('Name',{exact:true}).last().fill('Second member');
  await page.setViewportSize({width:1800,height:2600});
  await page.evaluate(()=>window.scrollTo(0,0));
  const grips = page.locator('[title="Drag to reorder"]');
  const source = await grips.first().boundingBox();
  const target = await grips.last().boundingBox();
  await page.mouse.move(source.x+8,source.y+8);
  await page.mouse.down();
  await page.mouse.move(source.x+20,source.y+20,{steps:5});
  await page.mouse.move(target.x+8,target.y+8,{steps:20});
  await page.mouse.up();
  await page.locator('h3').filter({hasText:/Published member|Second member/}).first().filter({hasText:'Second member'}).waitFor();
  console.log('PASS: real pointer dragging and keyboard adjustment for zoom and both focal sliders with custom cursor enabled');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});

