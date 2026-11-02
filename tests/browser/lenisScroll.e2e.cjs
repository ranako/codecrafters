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

  db.upcoming_events[0].description='A detailed event description. '.repeat(160);
  for(let i=2;i<=6;i++)db.past_event_albums.push({...db.past_event_albums[0],id:require('node:crypto').randomUUID(),title:`Archive ${i}`,photos:[`/team/maadhav.jpg?a=${i}`],photo_captions:{}});
  await page.goto(base+'/gallery');
  await page.waitForFunction(()=>document.documentElement.dataset.lenisScope==='/gallery');
  assert.equal(await page.locator('html.lenis').count(),1);
  await page.mouse.move(700,200);await page.mouse.wheel(0,600);
  await page.waitForTimeout(25);const early=await page.evaluate(()=>scrollY);
  await page.waitForTimeout(350);const middle=await page.evaluate(()=>scrollY);
  await page.waitForTimeout(800);const end=await page.evaluate(()=>scrollY);
  assert.ok(middle>early+20,'Lenis eases scrolling over multiple frames');assert.ok(end>=middle);
  const reel=page.locator('.gallery-reel');assert.equal(await reel.locator('.gallery-reel-track').count(),2);
  await page.locator('.gallery-archive-frame').first().click();
  await page.getByRole('dialog').waitFor();await page.waitForFunction(()=>document.documentElement.classList.contains('lenis-stopped'));
  const lockedY=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,350);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>scrollY),lockedY,'Gallery dialog keeps background stationary');
  await page.getByRole('button',{name:'Close gallery viewer',exact:true}).click();await page.waitForFunction(()=>!document.documentElement.classList.contains('lenis-stopped'));
  await page.locator('.site-nav').getByRole('link',{name:'Events',exact:true}).click();
  await page.waitForFunction(()=>document.documentElement.dataset.lenisScope==='/events');
  assert.ok(await page.evaluate(()=>scrollY<2),'Route change resets scroll immediately');
  await page.getByRole('button',{name:'Published workshop',exact:true}).waitFor();
  await page.evaluate(()=>window.scrollTo({top:160,behavior:'instant'}));await page.waitForTimeout(100);

  await page.getByRole('button',{name:'Published workshop',exact:true}).click();
  const modal=page.getByRole('dialog');await modal.waitFor();await page.waitForFunction(()=>document.documentElement.classList.contains('lenis-stopped'));
  const beforeModal=await page.evaluate(()=>-Number.parseFloat(document.body.style.top));
  const r=await modal.boundingBox();await page.mouse.move(r.x+100,r.y+150);await page.mouse.wheel(0,450);await page.waitForTimeout(250);
  assert.ok(await modal.evaluate(n=>n.scrollTop)>100,'Event modal retains native independent scrolling');
  await page.getByRole('button',{name:'Close event details',exact:true}).click();await page.waitForFunction(()=>!document.documentElement.classList.contains('lenis-stopped'));
  assert.ok(Math.abs((await page.evaluate(()=>scrollY))-beforeModal)<2,'Closing event modal restores the page position');
  await page.locator('.site-nav').getByRole('link',{name:'Home',exact:true}).click();
  await page.waitForFunction(()=>!document.documentElement.classList.contains('lenis'));
  assert.equal(await page.locator('html').getAttribute('data-lenis-scope'),null);
  await page.locator('.site-nav').getByRole('link',{name:'Gallery',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.lenisScope==='/gallery');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.documentElement.classList.contains('lenis'));
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.documentElement.classList.contains('lenis'));
  await page.goto(base+'/admin');await page.getByRole('heading',{name:'Page manager',exact:true}).waitFor();assert.equal(await page.locator('html.lenis').count(),0,'Admin remains native');
  assert.deepEqual(errors,[]);
  console.log('PASS: single route-scoped Lenis integration, eased wheel input, reel rows preserved, modal background lock/native scrolling/position restoration, route reset and cleanup, dynamic reduced motion, admin exclusion. Backend mocked.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
