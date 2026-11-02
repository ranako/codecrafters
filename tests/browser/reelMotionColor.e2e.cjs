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

  for(let i=2;i<=6;i++) db.past_event_albums.push({...db.past_event_albums[0],id:require('node:crypto').randomUUID(),title:`Archive ${i}`,photos:[`/team/maadhav.jpg?a=${i}`,`/team/vatsal.jpg?a=${i}`],photo_captions:{}});
  await page.goto(base+'/admin');
  const nav=page.getByRole('navigation',{name:'Website pages'});
  await nav.getByRole('button',{name:'Gallery',exact:true}).click();
  await page.locator('.admin-modules').getByRole('button',{name:'Reel settings',exact:true}).click();
  await page.getByRole('heading',{name:'Gallery reel & appearance',exact:true}).waitFor();
  await page.getByRole('button',{name:'Relaxed',exact:true}).click();
  const duration=page.getByRole('spinbutton',{name:/Loop duration/});
  assert.equal(await duration.inputValue(),'96');
  await duration.fill('36');
  assert.equal(await page.getByRole('slider',{name:'Reel loop duration',exact:true}).inputValue(),'36');
  page.once('dialog',dialog=>dialog.dismiss());
  await page.locator('.site-nav').getByRole('link',{name:'Home',exact:true}).click();
  assert.ok(page.url().endsWith('/admin'),'Unsaved reel settings guard navigation');
  assert.equal(await duration.inputValue(),'36');
  await page.getByLabel('Published album',{exact:true}).check();
  await page.getByRole('radio',{name:'Choose specific photos',exact:true}).check();
  await page.getByRole('button',{name:'Save appearance',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'Select at least one photo'}).waitFor();
  assert.equal(writes,0,'Invalid empty photo selection cannot publish');
  await page.getByRole('checkbox',{name:'Include First photo',exact:true}).check();
  await page.getByRole('checkbox',{name:'Include Second photo',exact:true}).check();
  await page.getByRole('button',{name:'Move Second photo earlier',exact:true}).click();
  const visitor=await context.newPage();await visitor.goto(base+'/gallery');
  await visitor.locator('.gallery-reel-track').first().waitFor();
  assert.equal(await visitor.locator('.gallery-reel-track').first().evaluate(n=>n.style.animationDuration),'48s','Unsaved settings remain private');
  failSave=true;await page.getByRole('button',{name:'Save appearance',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'Test save denied'}).waitFor();
  assert.equal(await duration.inputValue(),'36');failSave=false;
  await page.getByRole('button',{name:'Save appearance',exact:true}).click();
  await page.getByText('Appearance saved to Supabase.',{exact:false}).waitFor();
  const saved=db.site_presentation_settings.find(row=>row.key==='gallery_reel').value;
  assert.equal(saved.speedSeconds,36);assert.equal(saved.photoKeys.length,2);assert.ok(saved.photoKeys[0].endsWith('/team/vatsal.jpg'));
  await visitor.reload();await visitor.locator('.gallery-reel-track').first().waitFor();
  assert.deepEqual(await visitor.locator('.gallery-reel-track').evaluateAll(nodes=>nodes.map(n=>n.style.animationDuration)),['36s','42s']);
  assert.equal(await visitor.locator('.gallery-reel-frame').first().getAttribute('aria-label'),'View Second photo');
  const reel=visitor.locator('.gallery-reel');await reel.scrollIntoViewIfNeeded();
  const box=await reel.boundingBox();await visitor.mouse.move(box.x+60,box.y+25);
  await visitor.evaluate(()=>{window.cursorWrites=0;window.rootWrites=0;new MutationObserver(records=>{window.cursorWrites+=records.length;}).observe(document.querySelector('.cc-cursor'),{attributes:true,attributeFilter:['data-interactive','data-mode','data-visible']});new MutationObserver(records=>{window.rootWrites+=records.length;}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});});
  for(let i=0;i<18;i++)await visitor.mouse.move(box.x+60+i*15,box.y+25);
  const pointer=await visitor.evaluate(()=>({writes:window.cursorWrites,root:window.rootWrites,offset:new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.cc-cursor-follow')).transform)}));
  assert.ok(pointer.writes<8,'Stable pointer movement does not rewrite hover attributes each event');assert.equal(pointer.root,0,'Pointer movement does not mutate the global cursor class');
  const lag=await visitor.locator('.cc-cursor-follow').evaluate(n=>{const m=new DOMMatrixReadOnly(getComputedStyle(n).transform);return Math.hypot(m.m41,m.m42);});assert.ok(lag<=20.1,'Trailing ring offset stays bounded');
  assert.equal(await visitor.locator('.gallery-reel-track').first().evaluate(n=>getComputedStyle(n).willChange),'transform');
  await visitor.locator('.site-footer').scrollIntoViewIfNeeded();await visitor.waitForTimeout(100);
  assert.ok((await visitor.locator('.gallery-reel-track').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).animationPlayState))).every(state=>state==='paused'),'Offscreen reels pause');
  for(const route of ['/','/events','/team','/gallery','/about']) {
    await visitor.goto(base+route);await visitor.locator('h1').waitFor();
    const desaturated=await visitor.locator('main img').evaluateAll(nodes=>nodes.flatMap(n=>{const result=[];for(let p=n;p&&p.tagName!=='MAIN';p=p.parentElement){const filter=getComputedStyle(p).filter;if(/grayscale|saturate\(0|saturate\(\./.test(filter))result.push(filter);}return result;}));
    assert.deepEqual(desaturated,[],`${route} photos keep their source colors`);
  }
  await visitor.goto(base+'/events');const stage=visitor.locator('#photo-albums');await stage.waitFor();
  const stageTop=await stage.evaluate(n=>n.getBoundingClientRect().top+scrollY);
  await visitor.evaluate(top=>window.scrollTo({top,behavior:'instant'}),stageTop+50);await visitor.waitForTimeout(700);
  const track=visitor.locator('.album-hanging-track');
  const before=await track.evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41);
  await visitor.mouse.move(700,400);await visitor.mouse.wheel(0,250);await visitor.waitForTimeout(30);
  const during=await track.evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41);
  await visitor.waitForTimeout(800);const after=await track.evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41);
  assert.ok(after<before-10,'Album strip moves horizontally with vertical scroll');assert.ok(during>after+1,'Lenis spreads movement smoothly across frames');
  await visitor.emulateMedia({reducedMotion:'reduce'});await visitor.waitForFunction(()=>document.querySelector('#photo-albums.album-natural'));
  assert.equal(await track.evaluate(n=>getComputedStyle(n).scrollBehavior),'auto');
  await visitor.setViewportSize({width:390,height:844});await visitor.emulateMedia({reducedMotion:'no-preference'});
  await visitor.waitForTimeout(100);assert.equal(await track.evaluate(n=>getComputedStyle(n).scrollBehavior),'smooth');
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  console.log('PASS: reel speed/album/photo/order controls save and persist; empty selections blocked; failed-save retention and draft isolation; public settings parity; bounded cursor trail and reduced attribute writes; reels pause offscreen; photo color retained on all routes; spring album scroll and mobile/reduced-motion behavior. Backend mocked.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
