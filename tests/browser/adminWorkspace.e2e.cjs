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
  let storageUploads = 0;
  let failUploadAt = 0;
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
        if (!['site_page_content','site_presentation_settings'].includes(table) && !item.id) item.id = require('node:crypto').randomUUID();
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
      storageUploads++;
      if(storageUploads === failUploadAt) return r.fulfill({status:500,contentType:'application/json',body:'{"message":"Test upload failed"}'});
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

  db.upcoming_events.push({id:require('node:crypto').randomUUID(),title:'Legacy event',is_published:true,starts_at:null,ends_at:null,status_override:'',event_date:'',image_url:'',speakers:[]});
  const firstAlbum = db.past_event_albums[0];
  firstAlbum.title='Coding with AI'; firstAlbum.description='';
  for(const title of ['Ideathon','Data Science Playground','Launch Event']) db.past_event_albums.push({...firstAlbum,id:require('node:crypto').randomUUID(),title});

  const homeBefore=await context.newPage();
  await homeBefore.goto(base+'/');
  await homeBefore.locator('.club-life-grid').scrollIntoViewIfNeeded();
  await homeBefore.waitForTimeout(1100);
  assert.equal(await homeBefore.locator('.club-life-grid button').count(),4);
  const balanced=await homeBefore.locator('.club-life-grid').evaluate(n=>{const cards=[...n.querySelectorAll('button')].map(c=>c.getBoundingClientRect());const r=n.getBoundingClientRect();return Math.abs(cards[1].right-r.right)<2&&Math.abs(cards[3].right-r.right)<2&&cards[2].top>cards[0].top;});
  assert.ok(balanced,'Four albums fill both columns without an empty right side');
  await homeBefore.locator('.club-life-grid').screenshot({path:'tests/browser/artifacts/club-life-balanced.png'});
  await homeBefore.close();
  await page.goto(base+'/admin');
  await page.getByRole('heading',{name:'Page manager',exact:true}).waitFor();
  const nav=page.getByRole('navigation',{name:'Website pages'});
  const modules=page.locator('.admin-modules');
  const save=page.getByRole('button',{name:'Save changes',exact:true});
  const saved=()=>page.getByText('Saved to Supabase.',{exact:true}).waitFor();
  await nav.getByRole('button',{name:'Events',exact:true}).click();
  await modules.getByRole('button',{name:'Events',exact:true}).click();
  await page.locator('.admin-past-starters summary').click();
  await page.getByRole('button',{name:'Prepare Coding Workshop at MSU',exact:true}).click();
  assert.equal(await page.getByLabel('Event Title',{exact:true}).inputValue(),'Coding Workshop at MSU');
  assert.equal(await page.getByLabel('Published on website',{exact:true}).isChecked(),false);
  await save.click(); await saved();
  const workshop=db.upcoming_events.find(e=>e.title==='Coding Workshop at MSU');
  assert.equal(workshop.status_override,'past');assert.equal(workshop.is_published,false);assert.equal(workshop.starts_at,'2026-01-30T04:45:00.000Z');assert.equal(workshop.image_url,'/events/msu-ember-coding-workshop-2026.png');
  assert.equal(await page.getByLabel('Event Title',{exact:true}).inputValue(),workshop.title);
  await page.getByRole('button',{name:'Add event album',exact:true}).click();
  await page.getByLabel('Event Title',{exact:true}).waitFor();
  assert.equal(await page.getByLabel('Event Title',{exact:true}).inputValue(),workshop.title);
  assert.equal(await page.getByLabel('Published on website',{exact:true}).isChecked(),false);
  const file=name=>({name,mimeType:'image/jpeg',buffer:fs.readFileSync('src/images/maadhav.jpg')});
  await page.getByLabel('Upload album photos',{exact:true}).setInputFiles([file('one.jpg'),file('two.jpg')]);
  await page.getByRole('progressbar',{name:'Album upload progress'}).waitFor();
  await nav.getByRole('button',{name:'Home',exact:true}).click();
  assert.ok(await page.locator('.album-photo-manager').isVisible(),'Navigation is blocked during upload');
  await page.getByText('2 photos added to this draft.',{exact:false}).waitFor();
  assert.equal(await page.locator('.album-photo-grid button').count(),2);

  const firstPhoto=await page.locator('.album-photo-grid img').first().getAttribute('src');
  await page.getByRole('button',{name:'Edit photo 1',exact:true}).dragTo(page.getByRole('button',{name:'Edit photo 2',exact:true}));
  assert.equal(await page.locator('.album-photo-grid img').last().getAttribute('src'),firstPhoto);
  await page.getByRole('button',{name:'Edit photo 1',exact:true}).dragTo(page.getByRole('button',{name:'Edit photo 2',exact:true}));
  await page.getByRole('button',{name:'Edit photo 2',exact:true}).click();
  await page.getByLabel('Photo caption (searchable)',{exact:true}).fill('Workshop memories');
  await page.getByRole('button',{name:'Earlier',exact:true}).click();
  assert.equal(await page.getByLabel('Photo caption (searchable)',{exact:true}).inputValue(),'Workshop memories');
  await page.getByLabel('Replace selected photo',{exact:true}).setInputFiles(file('replacement.jpg'));
  await page.getByText('Photo replaced in this draft.',{exact:false}).waitFor();
  assert.equal(await page.getByLabel('Photo caption (searchable)',{exact:true}).inputValue(),'Workshop memories');
  await page.getByRole('button',{name:'Use as cover',exact:true}).click();
  failUploadAt=storageUploads+2;
  await page.getByLabel('Upload album photos',{exact:true}).setInputFiles([file('three.jpg'),file('four.jpg')]);
  await page.getByRole('alert').filter({hasText:'1 completed uploads remain in this draft'}).waitFor();
  assert.equal(await page.locator('.album-photo-grid button').count(),3);
  await page.getByLabel('Upload album photos',{exact:true}).setInputFiles(file('four.jpg'));
  await page.getByText('1 photo added to this draft.',{exact:false}).waitFor();
  assert.equal(await page.locator('.album-photo-grid button').count(),4);
  failSave=true;await save.click();await page.getByRole('alert').filter({hasText:'Test save denied'}).waitFor();
  assert.equal(await page.locator('.album-photo-grid button').count(),4);
  failSave=false;await save.click();await saved();
  const album=db.past_event_albums.find(a=>a.event_id===workshop.id);
  assert.equal(album.is_published,false);assert.equal(album.photos.length,4);assert.equal(album.photo_captions[album.photos[0]],'Workshop memories');assert.equal(album.cover_image_url,album.photos[0]);
  const visitor=await context.newPage();await visitor.goto(base+'/gallery');
  await visitor.locator('h1').waitFor();assert.equal(await visitor.getByText('Workshop memories',{exact:true}).count(),0);
  await nav.getByRole('button',{name:'Events',exact:true}).click();await modules.getByRole('button',{name:'Events',exact:true}).click();
  await page.locator('.admin-record-index-row > button').filter({hasText:'Coding Workshop at MSU'}).click();
  await page.getByLabel('Published on website',{exact:true}).check();await save.click();await saved();
  await page.getByRole('button',{name:'Add event album',exact:true}).click();
  assert.equal(await page.getByLabel('Event Title',{exact:true}).inputValue(),workshop.title);
  assert.equal(await page.locator('.album-photo-grid button').count(),4,'Existing album reopened instead of creating a duplicate');
  await page.getByLabel('Published on website',{exact:true}).check();await save.click();await saved();
  assert.equal(db.past_event_albums.filter(a=>a.event_id===workshop.id).length,1);
  await visitor.reload();await visitor.getByText('Workshop memories',{exact:true}).first().waitFor();
  await nav.getByRole('button',{name:'Events',exact:true}).click();await modules.getByRole('button',{name:'Events',exact:true}).click();
  await page.locator('.admin-past-starters summary').click();await page.getByRole('button',{name:'Prepare Mini Hackathon at ITM',exact:true}).click();await save.click();await saved();
  assert.equal(db.upcoming_events.find(e=>e.title==='Mini Hackathon at ITM').is_published,false);
  await nav.getByRole('button',{name:'Gallery',exact:true}).click();await modules.getByRole('button',{name:'Photo Album',exact:true}).click();
  await page.getByRole('button',{name:'Fill missing descriptions',exact:true}).click();await save.click();await saved();
  assert.ok(db.past_event_albums.every(a=>a.description.trim()));
  await page.screenshot({path:'tests/browser/artifacts/admin-workspace-desktop.png',fullPage:true});
  for(const width of [320,390,768]) { await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Admin fits ${width}px`); }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'tests/browser/artifacts/admin-workspace-mobile.png',fullPage:true});
  await visitor.goto(base+'/');await visitor.locator('.club-life-grid').scrollIntoViewIfNeeded();
  await visitor.getByText('Explore coding with AI tools,',{exact:false}).waitFor();
  const grid=await visitor.locator('.club-life-grid').evaluate(n=>({columns:getComputedStyle(n).gridTemplateColumns,width:n.getBoundingClientRect().width}));assert.ok(grid.width>500);

  await nav.getByRole('button',{name:'Home',exact:true}).click();
  const headline=page.locator('.cms-page-editor').getByLabel('Headline',{exact:true});
  await headline.fill('Private editor check');
  page.once('dialog',d=>d.dismiss());
  await nav.getByRole('button',{name:'Team',exact:true}).click();
  assert.equal(await headline.inputValue(),'Private editor check','Unsaved page edit remains after cancelling navigation');
  page.once('dialog',d=>d.accept());
  await page.getByRole('button',{name:'Discard changes',exact:true}).click();
  await modules.getByRole('button',{name:'Appearance',exact:true}).click();
  await page.getByRole('button',{name:'Save appearance',exact:true}).click();
  await page.getByText('Appearance saved to Supabase.',{exact:false}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS: unpublished past-event starters without invented dates; linked albums create/reopen; multi-file uploads and progress; upload navigation lock; partial upload recovery; caption persistence through reorder/replacement; cover selection; failed-save retention; draft isolation; publication; missing descriptions; responsive workspace. All backend requests mocked.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
