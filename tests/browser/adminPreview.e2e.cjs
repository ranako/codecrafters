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
    reducedMotion: "reduce",
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
  const frame = page.frameLocator('iframe[title$="website preview"]');
  await page
    .locator(".cms-page-editor")
    .getByLabel("Headline", { exact: true })
    .waitFor();
  await frame.locator("h1").waitFor();
  const initialWrites = writes;
  await page
    .locator(".cms-page-editor")
    .getByLabel("Headline", { exact: true })
    .fill("Private home headline");
  await frame.getByRole("heading", { name: /Private home headline/ }).waitFor();
  assert.equal(writes, initialWrites);
  const visitor = await context.newPage();
  await visitor.goto(base + "/");
  await visitor.locator("h1").waitFor();
  assert.ok(
    !(await visitor.locator("h1").innerText()).includes(
      "Private home headline",
    ),
  );
  console.log("PASS: page draft preview updates with no write or public leak");
  page.once("dialog", (d) => d.accept());
  await nav.getByRole("button", { name: "Events", exact: true }).click();
  await page
    .getByRole("button", { name: "Events", exact: true })
    .last()
    .click();
  await page.getByLabel("Event Title", { exact: true }).first().waitFor();
  await page
    .getByLabel("Event Title", { exact: true })
    .first()
    .fill("Private workshop title");
  await frame
    .locator(".event-card h3")
    .filter({ hasText: "Private workshop title" })
    .waitFor();
  const controls = page.locator(".image-controls").first();
  await controls.getByLabel("Fit", { exact: true }).selectOption("contain");
  await controls
    .getByLabel("Focal point left/right", { exact: false })
    .fill("23");
  await controls.getByLabel("Zoom (", { exact: false }).fill("1.4");
  await frame.locator('[data-image-placement="eventCard"] img').waitFor();
  assert.equal(
    await frame
      .locator('[data-image-placement="eventCard"] img')
      .evaluate((e) => e.style.objectPosition),
    "23% 50%",
  );
  assert.equal(
    await frame
      .locator('[data-image-placement="eventCard"] img')
      .evaluate((e) => e.style.objectFit),
    "contain",
  );
  await controls
    .getByLabel("Placement", { exact: true })
    .selectOption("eventHome");
  await frame.locator(".home-event-spotlight").waitFor();
  assert.equal(
    await frame.locator(".home-event-photo [data-image-placement]").count(),
    0,
  );
  await controls
    .getByLabel("Focal point left/right", { exact: false })
    .fill("71");
  await frame.locator('[data-image-placement="eventHome"] img').waitFor();
  assert.equal(
    await frame
      .locator('[data-image-placement="eventHome"] img')
      .evaluate((e) => e.style.objectPosition),
    "71% 50%",
  );
  console.log(
    "PASS: unsaved event image controls reflect exact selected placement",
  );
  await visitor.goto(base + "/events");
  await visitor.locator(".event-card h3").waitFor();
  assert.equal(
    (await visitor.locator(".event-card h3").innerText()).includes(
      "Private workshop title",
    ),
    false,
  );
  failSave = true;
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText("Test save denied", { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel("Event Title", { exact: true }).first().inputValue(),
    "Private workshop title",
  );
  failSave = false;
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText("Saved to Supabase.", { exact: true }).waitFor();
  assert.equal(db.upcoming_events[0].image_display.eventHome.focalX, 71);
  assert.equal(db.upcoming_events[0].image_display.eventCard.focalX, 23);
  await controls
    .getByLabel("Placement", { exact: true })
    .selectOption("eventCard");
  await visitor.setViewportSize({ width: 1280, height: 1000 });
  await visitor.goto(base + "/events");
  await visitor.locator('[data-image-placement="eventCard"] img').waitFor();
  assert.deepEqual(
    await frame
      .locator(".event-card-image")
      .first()
      .evaluate((e) => [e.clientWidth, e.clientHeight]),
    await visitor
      .locator(".event-card-image")
      .first()
      .evaluate((e) => [e.clientWidth, e.clientHeight]),
  );
  assert.equal(
    await visitor
      .locator('[data-image-placement="eventCard"] img')
      .evaluate((e) => e.style.objectPosition),
    "23% 50%",
  );
  await page.reload();
  await page
    .getByRole("heading", { name: "Page manager", exact: true })
    .waitFor();
  await nav.getByRole("button", { name: "Events", exact: true }).click();
  await page
    .getByRole("button", { name: "Events", exact: true })
    .last()
    .click();
  await controls
    .getByLabel("Focal point left/right", { exact: false })
    .waitFor();
  assert.equal(
    await controls
      .getByLabel("Focal point left/right", { exact: false })
      .inputValue(),
    "23",
  );
  console.log(
    "PASS: failed save retains draft; successful save persists settings and public parity",
  );

  await controls
    .getByLabel("Placement", { exact: true })
    .selectOption("eventDetail");
  await frame.getByRole("dialog").waitFor();
  assert.equal(await page.getByRole("dialog").count(), 0);
  await frame.getByRole("button", { name: "Close event details" }).click();
  await frame.getByRole("dialog").waitFor({ state: "hidden" });
  console.log(
    "PASS: event dialog stays inside preview and closes without altering editor",
  );
  await nav.getByRole("button", { name: "Gallery", exact: true }).click();
  await page
    .getByRole("button", { name: "Photo Album", exact: true })
    .last()
    .click();
  await page
    .locator(".image-controls")
    .nth(1)
    .getByLabel("Zoom (", { exact: false })
    .waitFor();
  let photoControls = page.locator(".image-controls").nth(1);
  await photoControls.getByLabel("Zoom (", { exact: false }).fill("1.7");
  await photoControls
    .getByLabel("Focal point left/right", { exact: false })
    .fill("35");
  await frame.locator('[data-image-placement="photoGrid"] img').waitFor();
  assert.equal(
    await frame
      .locator('[data-image-placement="photoGrid"] img')
      .evaluate((e) => e.style.transform),
    "scale(1.7)",
  );
  const rows = page.locator('div[draggable][class*="grid-cols-"]');
  const transfer = await page.evaluateHandle(() => new DataTransfer());
  await rows.nth(0).dispatchEvent("dragstart", { dataTransfer: transfer });
  await rows.nth(1).dispatchEvent("drop", { dataTransfer: transfer });
  assert.equal(
    await page.getByPlaceholder("Paste photo URL").nth(1).inputValue(),
    "/team/maadhav.jpg",
  );
  await page.getByPlaceholder("Paste photo URL").nth(1).fill("/team/kunal.jpg");
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText("Saved to Supabase.", { exact: true }).waitFor();
  assert.deepEqual(db.past_event_albums[0].photos, [
    "/team/vatsal.jpg",
    "/team/kunal.jpg",
  ]);
  assert.equal(
    db.past_event_albums[0].photo_display["/team/kunal.jpg"].photoGrid.zoom,
    1.7,
  );
  assert.equal(
    db.past_event_albums[0].photo_display["/team/maadhav.jpg"],
    undefined,
  );
  assert.equal(
    db.past_event_albums[0].photo_captions["/team/kunal.jpg"],
    "First photo",
  );
  await visitor.goto(base + "/gallery");
  await visitor.locator('[data-image-placement="photoGrid"] img').waitFor();
  assert.equal(
    await visitor
      .locator('[data-image-placement="photoGrid"] img')
      .getAttribute("src"),
    "/team/kunal.jpg",
  );
  console.log(
    "PASS: album reorder and replacement retain photo settings and captions; public gallery matches",
  );
  photoControls = page.locator(".image-controls").nth(2);
  await photoControls
    .getByLabel("Placement", { exact: true })
    .selectOption("photoViewer");
  await frame.getByRole("dialog").waitFor();
  await photoControls
    .getByLabel("Width (% of available space)", { exact: true })
    .fill("70");
  await photoControls
    .getByLabel("Aspect ratio", { exact: true })
    .selectOption("4/3");
  await photoControls
    .getByLabel("Alignment", { exact: true })
    .selectOption("right");
  await frame.locator('[data-image-placement="photoViewer"]').waitFor();
  assert.equal(
    await frame
      .locator('[data-image-placement="photoViewer"]')
      .evaluate((e) => e.style.width),
    "70%",
  );
  assert.equal(
    await frame
      .locator('[data-image-placement="photoViewer"]')
      .evaluate((e) => e.style.aspectRatio),
    "4 / 3",
  );
  await photoControls
    .getByLabel("Lock aspect ratio", { exact: true })
    .uncheck();
  await photoControls
    .getByLabel("Height (px, capped to viewport)", { exact: true })
    .fill("180");
  assert.equal(
    await frame
      .locator('[data-image-placement="photoViewer"]')
      .evaluate((e) => e.style.height),
    "min(180px, 70vh)",
  );
  await photoControls
    .getByRole("button", { name: "Reset this placement" })
    .click();
  assert.equal(
    await frame.locator('[data-image-placement="photoViewer"]').count(),
    0,
  );
  await frame.getByRole("button", { name: "Close photo album" }).click();
  console.log(
    "PASS: flexible width, height, fit, alignment, aspect lock and reset",
  );
  await nav.getByRole("button", { name: "Team", exact: true }).click();
  await page.getByRole("button", { name: "Core Members", exact: true }).click();
  await page
    .locator(".image-controls")
    .first()
    .getByLabel("Zoom (", { exact: false })
    .fill("1.3");
  await frame.locator('[data-image-placement="member"] img').waitFor();
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText("Saved to Supabase.", { exact: true }).waitFor();
  await visitor.goto(base + "/team");
  await visitor.locator('[data-image-placement="member"] img').waitFor();
  assert.equal(
    await visitor
      .locator('[data-image-placement="member"] img')
      .evaluate((e) => e.style.transform),
    "scale(1.3)",
  );
  console.log("PASS: member portrait preview and public settings parity");
  await nav.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Testimonials", exact: true }).click();
  await page
    .getByLabel("Testimonial Quote", { exact: true })
    .fill("Private testimonial draft");
  await frame
    .locator("p")
    .filter({ hasText: "Private testimonial draft" })
    .waitFor();
  await page
    .locator(".image-controls")
    .first()
    .getByLabel("Focal point left/right", { exact: false })
    .fill("42");
  await frame.locator('[data-image-placement="avatar"] img').waitFor();
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText("Saved to Supabase.", { exact: true }).waitFor();
  assert.equal(db.testimonials[0].image_display.avatar.focalX, 42);
  await page
    .getByLabel("Avatar Image URL", { exact: true })
    .fill("/missing-image.jpg");
  await frame.getByRole("img", { name: /image unavailable/ }).waitFor();
  assert.equal(
    await page.getByLabel("Testimonial Quote", { exact: true }).inputValue(),
    "Private testimonial draft",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await nav
    .getByRole("button", { name: "Navigation & footer", exact: true })
    .click();
  await page
    .locator(".cms-page-editor")
    .getByLabel("Logo", { exact: true })
    .waitFor();
  const logoControls = page.locator(".image-controls").first();
  await logoControls
    .getByLabel("Width (% of available space)", { exact: true })
    .fill("60");
  await logoControls
    .getByLabel("Aspect ratio", { exact: true })
    .selectOption("3/2");
  await frame.locator('[data-image-placement="logo"]').waitFor();
  assert.equal(
    await frame
      .locator('[data-image-placement="logo"]')
      .evaluate((e) => e.style.width),
    "60%",
  );
  await page
    .locator(".cms-page-editor")
    .getByRole("button", { name: "Save page", exact: true })
    .click();
  await page
    .getByText("Navigation & footer page saved.", { exact: false })
    .waitFor();
  assert.equal(
    db.site_page_content.find((row) => row.page === "shared").content.navigation
      .logo_display.logo.width,
    60,
  );
  console.log(
    "PASS: testimonials, broken images and page-image display persistence",
  );
  // Model the real legacy schema: basic edits must not start requiring new columns.
  delete db.upcoming_events[0].image_display;
  // A missing migration must keep the record draft and report a precise setup error.
  await nav.getByRole("button", { name: "Events", exact: true }).click();
  await page
    .getByRole("button", { name: "Events", exact: true })
    .last()
    .click();
  missingImageSchema=true;
  await page.getByLabel('Event Title',{exact:true}).first().fill('Legacy record without image metadata');
  await page.getByRole('button',{name:'Publish Changes',exact:true}).click();
  await page.getByText('Saved to Supabase.',{exact:true}).waitFor();
  assert.equal(Object.hasOwn(db.upcoming_events[0],'image_display'),false);
  console.log('PASS: legacy text edits still save before the image migration');
  missingImageSchema=false;
  await controls.getByLabel("Zoom (", { exact: false }).fill("1.8");
  missingImageSchema = true;
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText(/Image display needs its database columns/).waitFor();
  assert.equal(
    await controls.getByLabel("Zoom (", { exact: false }).inputValue(),
    "1.8",
  );
  missingImageSchema = false;
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText("Saved to Supabase.", { exact: true }).waitFor();
  console.log(
    "PASS: missing migration reports clearly without discarding image draft",
  );
  // Uploads retain the current record and framing settings, and cannot race saves/navigation.
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles("src/images/maadhav.jpg");
  assert.equal(
    await page
      .getByRole("button", { name: "Publish Changes", exact: true })
      .isDisabled(),
    true,
  );
  await nav.getByRole("button", { name: "Home", exact: true }).click();
  assert.equal(
    await nav
      .getByRole("button", { name: "Events", exact: true })
      .getAttribute("aria-current"),
    "page",
  );
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("button")).some(
      (button) =>
        button.textContent.trim() === "Publish Changes" && !button.disabled,
    ),
  );
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText("Saved to Supabase.", { exact: true }).waitFor();
  assert.match(db.upcoming_events[0].image_url, /storage\/v1\/object\/public/);
  assert.equal(db.upcoming_events[0].image_display.eventCard.zoom, 1.8);
  console.log(
    "PASS: upload locking preserves record selection and image settings",
  );
  failCleanup=true;
  await page.locator('input[type=file]').first().setInputFiles('src/images/maadhav.jpg');
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(button=>button.textContent.trim()==='Publish Changes' && !button.disabled));
  await page.getByRole('button',{name:'Publish Changes',exact:true}).click();
  await page.getByText('Content saved. Some unused image files could not be cleaned up; the files have been kept.',{exact:true}).waitFor();
  await page.getByText('Saved to Supabase.',{exact:true}).waitFor();
  failCleanup=false;
  console.log('PASS: storage cleanup failure does not falsely report a failed content save');

  await page.getByLabel("Published on website", { exact: true }).uncheck();
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText("Saved to Supabase.", { exact: true }).waitFor();
  await visitor.goto(base + "/events");
  await visitor
    .getByText("No upcoming events are announced yet.", { exact: true })
    .waitFor();
  assert.equal(await visitor.locator(".event-card").count(), 0);
  await page.getByLabel("Published on website", { exact: true }).check();
  await page
    .getByRole("button", { name: "Publish Changes", exact: true })
    .click();
  await page.getByText("Saved to Supabase.", { exact: true }).waitFor();
  console.log(
    "PASS: existing publication flag still controls public visibility",
  );
  await nav.getByRole("button", { name: "About", exact: true }).click();
  await page
    .locator(".cms-page-editor")
    .getByLabel("Heading", { exact: true })
    .first()
    .waitFor();
  await page.locator("summary").filter({ hasText: "Club pillars" }).click();
  const pillarControls = page.locator(".image-controls").first();
  await pillarControls
    .getByLabel("Focal point left/right", { exact: false })
    .fill("58");
  await frame.locator('[data-image-placement="about"] img').first().waitFor();
  await page
    .locator(".cms-page-editor")
    .getByRole("button", { name: "Save page", exact: true })
    .click();
  await page.getByText("About page saved.", { exact: false }).waitFor();
  assert.equal(
    db.site_page_content.find((row) => row.page === "about").content.pillars
      .items[0].image_display.about.focalX,
    58,
  );
  await nav.getByRole("button", { name: "Team", exact: true }).click();
  await page
    .locator(".cms-page-editor")
    .getByLabel("Heading", { exact: true })
    .first()
    .waitFor();
  await page.locator("summary").filter({ hasText: "Original team" }).click();
  await page
    .locator(".image-controls")
    .first()
    .getByLabel("Focal point up/down", { exact: false })
    .fill("38");
  await page
    .locator(".cms-page-editor")
    .getByRole("button", { name: "Save page", exact: true })
    .click();
  await page.getByText("Team page saved.", { exact: false }).waitFor();
  assert.equal(
    db.site_page_content.find((row) => row.page === "team").content.originals
      .items[0].image_display.member.focalY,
    38,
  );
  console.log(
    "PASS: About photos and original-member image settings persist in page content",
  );
  await nav.getByRole("button", { name: "Gallery", exact: true }).click();
  await page.getByRole("button", { name: "Appearance", exact: true }).click();
  await page
    .getByLabel("Carousel title", { exact: false })
    .fill("Private reel title");
  await frame.getByText("Private reel title", { exact: true }).waitFor();
  const beforeAppearance = writes;
  assert.equal(
    db.site_presentation_settings.find((row) => row.key === "gallery_reel")
      .value.title,
    "Community in frames",
  );
  await page
    .getByRole("button", { name: "Save appearance", exact: true })
    .click();
  await page
    .getByText(
      "Appearance saved to Supabase. Public pages use these settings.",
      { exact: true },
    )
    .waitFor();
  assert.equal(writes, beforeAppearance + 1);
  console.log(
    "PASS: appearance preview stays local until its existing save action",
  );

  for (const mode of ["Mobile", "Tablet", "Desktop"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    await page.waitForFunction(
      (width) =>
        document.querySelector("iframe").contentWindow.innerWidth === width,
      { Mobile: 390, Tablet: 768, Desktop: 1280 }[mode],
    );
    assert.equal(
      await frame.locator("html").evaluate((e) => e.clientWidth),
      { Mobile: 390, Tablet: 768, Desktop: 1280 }[mode],
    );
  }
  await visitor.setViewportSize({ width: 1280, height: 1000 });
  await visitor.goto(base + "/gallery");
  await visitor.locator(".gallery-archive-frame").first().waitFor();
  assert.deepEqual(
    await frame
      .locator(".gallery-archive-frame")
      .first()
      .evaluate((e) => [e.clientWidth, e.clientHeight]),
    await visitor
      .locator(".gallery-archive-frame")
      .first()
      .evaluate((e) => [e.clientWidth, e.clientHeight]),
  );
  console.log(
    "PASS: independent mobile/tablet/desktop viewports and public component geometry parity",
  );
  await page.screenshot({
    path: "tests/browser/artifacts/admin-preview-desktop.png",
    fullPage: false,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Show preview", exact: true }).click();
  await page.getByRole("button", { name: "Mobile", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector("iframe").contentWindow.innerWidth === 390,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: "tests/browser/artifacts/admin-preview-mobile.png",
    fullPage: false,
  });
  assert.deepEqual(errors, []);
  console.log("PASS: responsive editor and no browser errors");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
