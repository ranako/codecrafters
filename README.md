# CodeCrafters

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in your Supabase project values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_STORAGE_BUCKET` if you use a custom bucket name
3. Run `npm install`.
4. Run `npm run dev`.

The admin panel at `/admin` depends on Supabase auth. If those env vars are missing, the route will open but sign-in will fail.

## Vercel setup

Add the same environment variables in your Vercel project settings before deploying:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET`

After updating Vercel env vars, redeploy the project so the client build picks them up.

## Community content

The existing admin modules manage publication with `is_published` (events,
albums, testimonials) and `is_active` (core members). Save with **Publish
Changes** to persist a toggle. Public pages fetch published content when opened
or refreshed. Club Life uses the same published albums as the Events page;
no separate gallery content needs maintaining.

Events accept an optional `registration_url` text column in `upcoming_events`
(the column was added separately in Supabase). Only complete HTTP/HTTPS links
are accepted. An absent link displays "Registration not open" and never creates
a registration or claims an RSVP was saved. Registration happens on the linked
service. Existing records may leave this column null.

For countdowns, enter the date as `YYYY-MM-DD` and start time as `HH:mm` in India
time. An explicit offset is supported, for example `14:30 +00:00` for UTC.
Legacy dates or descriptive time strings remain visible but do not produce an
inaccurate countdown. No upcoming event is required to use the site.

Album viewers support Previous/Next, arrow keys, Escape, focus restoration, and
manual photo navigation. Reduced motion disables the cursor accent and looping
testimonials; desktop album scrolling becomes a manually scrollable row.

The existing RLS policies grant management to all authenticated users. These
changes preserve that policy; they do not introduce an administrator allowlist.
Authenticated create/edit/publish/delete and Storage operations need verification
with an authorized admin account. Do not use production records as disposable
fixtures.

Validation: `npm run build`, `npm run lint`. This JavaScript project currently has
no separate type-check or automated-test script. Existing lint failures include
Framer Motion JSX being reported as unused imports and existing hook rules.

## Event schedule and gallery

The **Events** admin module manages every event using the historical
`upcoming_events` table. Start and end inputs use India time and persist UTC
`starts_at` / `ends_at` timestamps. An end after the start is required when
saving an event. The existing date/time text fields are retained for compatibility.

Choose **Automatic from schedule** for upcoming → live → past transitions.
Public Home and Events views recompute status every second while open; this is
computed presentation, not a database job. Manual Upcoming, Live, or Past overrides
persist until switched back to Automatic. Existing undated records appear under
"Schedule to be confirmed" rather than being assigned invented times. Home shows
separate Live and Upcoming sections; Events also lists Past events.

Save an event before using **Add event album**, or choose a **Linked event**
in Photo Album. Standalone albums remain supported. Add searchable captions beside
each photo. Gallery at `/gallery` searches captions, album titles/descriptions,
event titles, dates, and filenames and can filter by linked event. Only published
content is fetched publicly. Deleting an event leaves its albums as standalone
albums through the verified foreign key's `ON DELETE SET NULL` behavior.

Database fields were added through `supabase/event-lifecycle-and-gallery.sql` and
verified by the owner. No RLS policy changes were made. Run the scheduling/search
checks with `node --test tests/eventUtils.test.js`.

## Appearance settings

Admin > **Appearance** saves the public carousel and event-card settings in
`site_presentation_settings`. The owner verified its policies, and the public
`key,value` query was checked before integrating it. Existing event/album RLS
policies are unchanged.

Carousel controls include visibility, title, loop duration (15–120 seconds),
first-row direction, hover pause, included albums, and individual photo selection.
Unchecked album/photo lists mean all eligible published content. Individual photos
play in selection order. Removed or unpublished photos cannot appear through a
saved selection. Preview selections locally, then choose **Save appearance**.

Event cards offer Scrapbook ticket, Editorial, or Minimal styles with Tilt and
lift, Gentle lift, or No animation. Reduced-motion preferences override animation.
Home keeps its distinct spotlight for the next upcoming event. Event details use
a larger native dialog with a blurred backdrop, fixed-page scroll lock, Escape,
and focus/scroll restoration. Admin's **Preview event** supports unsaved drafts.

Saved appearance changes reload in the current page and other open local tabs.
Other visitors receive them when opening or focusing a page. Settings have safe
visual defaults if a public fetch fails; admin load/save failures are shown and
failed loads cannot overwrite settings.

Run checks: `node --test tests/eventUtils.test.js tests/presentationUtils.test.js`.

## Page-by-page content management

The admin now starts with Home, About, Events, Gallery, Team, Contact, and
Navigation & footer. Choose **Page content** for headings, descriptions, buttons,
links, repeated items, icons, images and section visibility. Existing collection
editors remain underneath their relevant pages: events/albums/testimonials on
Home, events/albums on Events, albums on Gallery, and core members on Team.
These collections are shared, so an album edit also changes Home and Gallery.
Original team members are now editable in Team > Page content > Original team.

### One-time database setup

Run `supabase/page-content.sql` in this project's Supabase SQL Editor. It creates
`site_page_content` with public reads and authenticated insert/update permissions,
matching the existing CMS authorization model. No existing content or policies
are overwritten. There are no seed rows: missing page rows use the current site
content. The migration is idempotent and can be rerun.

Until this table exists, public pages retain their current content and the admin
shows the setup message with editing disabled. Do not put a service-role key in
the frontend. The SQL migration needs to be applied separately by the project
owner; local development does not install it automatically.

**Save page** publishes only the selected page. Draft edits and uploaded image
references are not published until saving. **Discard changes** restores the last
loaded/saved copy. **Load original content into draft** prepares the built-in
content without publishing it. Page switching warns about unsaved changes;
switching and saving are blocked during uploads. There are keyboard-accessible
up/down controls to reorder list items. Uploads use the existing storage bucket
under `pages/` and are not automatically deleted, because images can be shared.

Public pages listen for successful saves in the same window, other local tabs,
and when the window is focused. Other visitors receive the published values on
load or focus. Failed requests keep the existing public defaults; failed editor
loads cannot overwrite saved content. Button links accept site paths, anchors,
and HTTP/HTTPS destinations; executable URLs are rejected. EmailJS service IDs
and keys remain deployment configuration rather than editable public content.

Validation: `node --test tests/pageContentUtils.test.js tests/eventUtils.test.js
tests/presentationUtils.test.js`. Page editors and public rendering were also
checked with isolated browser fixtures, including saves/reloads, failed writes,
missing migration, unsaved drafts, URL validation and visibility. These checks do
not replace a live authenticated save after applying the database migration.

## Image display and admin editing

The page manager retains its existing page/module navigation and save actions.
Live website previews have been removed at the user's request. Editors use the
full available width; image framing controls remain available. Use **View saved
page** to inspect published content after saving.

Image controls are placement-specific:

- Event covers have separate settings for Events cards, the Home spotlight,
  and the details dialog.
- Album covers have Home and hanging-album placements. Individual photo settings
  have Gallery grid, reel, and viewer placements. Settings and captions follow
  photo URLs on reorder and move to a replacement URL. Duplicate replacements
  are rejected. Removing a photo removes its draft metadata as well.
- Core/original member portraits, testimonial avatars, and About pillar photos
  keep their frames and support fit, focal position, crop/zoom and reset.
- Flexible album covers, full-size photos, and the logo also support bounded
  width, alignment, aspect-ratio lock/presets and optional unlocked height.

Cropping uses CSS; the uploaded original is never resized or rewritten. The focal
point can be dragged or changed with keyboard-accessible sliders. Dimensions are
bounded to the available width and viewport. Missing settings retain the original
image markup and appearance. Failed images show an accessible fallback. No new
runtime dependencies or temporary object URLs are used.

### Additive database migration

Review and run `supabase/image-display.sql` in the **CodeCrafters** Supabase SQL
Editor before saving the new settings on collection records. It adds nullable,
no-default JSONB columns only:

- `upcoming_events.image_display`
- `team_members.image_display`
- `testimonials.image_display`
- `past_event_albums.cover_display` and `photo_display`

Page-content image companions live in the existing `site_page_content.content`
JSON, so they require no additional table or column. Image URL fields and album
photo arrays retain their existing format.

The migration begins with read-only schema/policy queries, checks the existing
source-column types and expected RLS flags, and aborts on incompatible metadata
columns. It also stops on column-only privilege setups or whole-row RLS expressions that need owner review. It snapshots and verifies policy definitions, RLS flags and table ACLs.
It does **not** update existing rows, defaults, authentication, storage rules,
publication flags, grants or policies. A lock timeout avoids waiting indefinitely
on active tables. Applying it is a separate owner-controlled database operation.

Legacy collection text edits can still save before the migration: the API omits
new columns unless they are present or customized settings require them. Trying
to save new image settings without the migration keeps the draft and shows a
specific setup error. Once columns exist, resets persist as empty settings.

### Draft isolation and save behavior

Unsaved edits stay in local component state and are never broadcast to public
pages. Public content changes only through the existing save/publication actions.

Uploading continues to use the existing storage bucket. As before, uploaded files
can exist there before saving; their references and display settings are not
added to public website content until the existing save/publication action.
Saving and editor switching are blocked while an upload is pending. Unsaved
navigation is guarded, failed saves retain the draft, and content loading does
not reset drafts merely because the authentication session object refreshes.

### Verification and limits

Run the pure checks with:

```
node --test tests/eventUtils.test.js tests/presentationUtils.test.js tests/pageContentUtils.test.js tests/imageDisplay.test.js
```

The current optional browser suite is `tests/browser/adminSocialCursor.e2e.cjs`.
Start Vite first; `PLAYWRIGHT_MODULE` can specify an existing Playwright module.
It intercepts every Supabase auth, REST and Storage request and never changes
production records. It covers social icon selection, member links, reload/removal,
failed saves, draft isolation, preview removal and desktop cursor states. The old
`adminPreview.e2e.cjs` suite documents the retired preview feature and is no longer
applicable to the current UI.

Live read-only inspection verified the current table columns and album SQL-array
behavior. The migration was not applied during implementation. The available API
does not expose full live RLS policy definitions; authenticated live writes and
post-migration permissions must be verified by the owner after reviewing/applying
the SQL. No changes were made to another repository, authentication configuration
or storage permissions, and nothing was committed, pushed or deployed.

Collection saves preserve the existing multi-request backend workflow. If a later
record operation fails after an earlier write was acknowledged, the editor keeps
the draft and explicitly warns that some changes may already be saved. Storage
cleanup runs only after confirmed record readback; cleanup failure is reported
as a warning rather than incorrectly calling a successful content save a failure.

### Social icons, member links and cursor

Social selectors include Behance, Instagram, GitHub, LinkedIn and Discord.
Original and core members have optional GitHub, Behance and LinkedIn links;
public cards show icons only for HTTPS URLs on the corresponding platform.
Core-member GitHub and Behance persistence requires owner review/application of
`supabase/team-social-links.sql`. This additive migration adds nullable text
columns and aborts on unexpected schema/security state. It does not change rows,
policies, authentication, storage permissions or publication settings. It has
not been applied. Existing text-only edits omit absent link columns until needed.

The custom circular cursor covers public/admin desktop pages, including
form fields and dialogs, with brief hover and press feedback. Text fields use a
custom caret, sliders use horizontal arrows, and drag handles use move arrows.
The center dot tracks immediately; the larger ring follows with a short,
frame-rate-independent delay and stops animating when settled. Reduced motion
removes the delay. There is no idle animation. Native pointer hiding
is activated only while the fine-pointer custom cursor is present. Touch input
keeps normal platform behavior; reduced motion retains static cursor states.
