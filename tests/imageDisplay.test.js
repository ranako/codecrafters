import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  normalizeImageDisplay,
  normalizePhotoDisplays,
  imageDefaults,
  imageStyles,
  replaceAlbumPhoto,
  removeAlbumPhoto,
} from "../src/lib/imageDisplay.js";
import { normalizeFields } from "../src/lib/pageContentUtils.js";
import { projectPreviewRecord } from "../src/lib/previewData.js";
const photo = "/first.jpg";
const second = "/second.jpg";
test("legacy and malformed settings leave original image rendering untouched", () => {
  for (const value of [undefined, null, [], 0, "bad", {}]) {
    assert.deepEqual(normalizeImageDisplay(value), {});
    assert.equal(imageStyles(value, "eventCard", 1.5), null);
  }
});
test("dimensions, crop, zoom and focal values are bounded and finite", () => {
  const result = normalizeImageDisplay({
    eventCard: {
      focalX: -10,
      focalY: 400,
      zoom: 99,
      width: -1,
      height: 10000,
      ratio: "bad",
      fit: "fill",
      align: "bad",
    },
    unknown: { zoom: 2 },
    member: { zoom: NaN, width: Infinity },
  });
  assert.equal(result.eventCard.focalX, 0);
  assert.equal(result.eventCard.focalY, 100);
  assert.equal(result.eventCard.zoom, 3);
  assert.equal(result.eventCard.width, 10);
  assert.equal(result.eventCard.height, 900);
  assert.equal(result.eventCard.fit, "cover");
  assert.equal(result.eventCard.ratio, "original");
  assert.equal(result.eventCard.align, "center");
  assert.equal("unknown" in result, false);
  assert.equal(result.member.zoom, 1);
  assert.equal(result.member.width, 100);
});
test("fixed frames ignore arbitrary dimensions and retain undistorted fitting", () => {
  const result = imageStyles(
    {
      eventCard: {
        width: 10,
        height: 900,
        fit: "contain",
        zoom: 1.2,
        focalX: 24,
        focalY: 76,
      },
    },
    "eventCard",
    2,
  );
  assert.equal(result.frame.width, "100%");
  assert.equal(result.frame.height, "100%");
  assert.equal(result.image.objectFit, "contain");
  assert.equal(result.image.objectPosition, "24% 76%");
  assert.equal(result.image.transform, "scale(1.2)");
});
test("flexible images lock original ratio and align within responsive available width", () => {
  const result = imageStyles(
    { albumHome: { width: 75, lock: true, ratio: "original", align: "right" } },
    "albumHome",
    1.5,
  );
  assert.equal(result.frame.width, "75%");
  assert.equal(result.frame.aspectRatio, "1.5");
  assert.equal(result.frame.height, "auto");
  assert.equal(result.frame.marginLeft, "auto");
  assert.equal(result.frame.marginRight, "0");
});
test("unlocked flexible dimensions are capped to the viewport and never use stretch fit", () => {
  const result = imageStyles(
    { logo: { width: 60, lock: false, height: 180, fit: "contain" } },
    "logo",
    1.5,
  );
  assert.equal(result.frame.height, "min(180px, 70vh)");
  assert.equal(result.image.objectFit, "contain");
  assert.equal("aspectRatio" in result.frame, false);
});
test("custom aspect ratios are supported and resetting restores the legacy path", () => {
  const display = {
    albumHome: { ...imageDefaults("albumHome"), ratio: "16/9" },
  };
  assert.equal(imageStyles(display, "albumHome", 1).frame.aspectRatio, "16/9");
  delete display.albumHome;
  assert.equal(imageStyles(display, "albumHome", 1), null);
});
test("placement settings are independent", () => {
  const display = normalizeImageDisplay({
    eventCard: { focalX: 20 },
    eventHome: { focalX: 80 },
  });
  assert.equal(display.eventCard.focalX, 20);
  assert.equal(display.eventHome.focalX, 80);
  assert.equal(display.eventDetail, undefined);
});
test("album metadata follows URLs through reorder, replacement and removal", () => {
  const initial = {
    photos: [photo, second],
    photo_captions: { [photo]: "First", [second]: "Second" },
    photo_display: {
      [photo]: { photoGrid: { focalX: 24 } },
      [second]: { photoGrid: { focalX: 76 } },
    },
  };
  const reordered = { ...initial, photos: [second, photo] };
  assert.equal(
    normalizePhotoDisplays(reordered.photo_display, reordered.photos)[photo]
      .photoGrid.focalX,
    24,
  );
  const replaced = replaceAlbumPhoto(reordered, 1, "/replacement.jpg");
  assert.equal(replaced.photo_display["/replacement.jpg"].photoGrid.focalX, 24);
  assert.equal(replaced.photo_captions["/replacement.jpg"], "First");
  assert.equal(replaced.photo_display[photo], undefined);
  assert.deepEqual(initial.photos, [photo, second]);
  const removed = removeAlbumPhoto(replaced, 0);
  assert.deepEqual(removed.photos, ["/replacement.jpg"]);
  assert.equal(removed.photo_display[second], undefined);
  assert.equal(removed.photo_captions[second], undefined);
});
test("duplicate photo replacement is rejected without mutating album or metadata", () => {
  const album = {
    photos: [photo, second],
    photo_display: { [photo]: { photoGrid: { zoom: 2 } } },
  };
  assert.throws(
    () => replaceAlbumPhoto(album, 0, second),
    /already in the album/,
  );
  assert.deepEqual(album.photos, [photo, second]);
  assert.equal(album.photo_display[photo].photoGrid.zoom, 2);
});
test("empty or stale photo metadata does not force a migration for legacy text edits", () => {
  assert.deepEqual(
    normalizePhotoDisplays(
      { [photo]: {}, "/removed.jpg": { photoGrid: { zoom: 2 } } },
      [photo, second],
    ),
    {},
  );
});
test("page image companion settings survive normalization while original URLs stay strings", () => {
  const fields = {
    image: { label: "Photo", type: "image", default: "/original.jpg" },
  };
  const result = normalizeFields(fields, {
    image: photo,
    image_display: { member: { focalX: 32 } },
  });
  assert.equal(result.image, photo);
  assert.equal(result.image_display.member.focalX, 32);
  assert.deepEqual(normalizeFields(fields).image_display, {});
});
test("only selected public-facing record fields enter the preview", () => {
  const result = projectPreviewRecord("team", {
    name: "Member",
    image: photo,
    image_display: { member: { zoom: 2 } },
    access_token: "secret",
    password: "secret",
    uploaderSession: { private: true },
    _displaySchema: true,
  });
  assert.deepEqual(
    Object.keys(result).sort(),
    ["name", "image", "image_display"].sort(),
  );
  assert.equal(projectPreviewRecord("team", null), null);
});
test("migration is additive and does not alter rows, policies, authentication or storage permissions", () => {
  const sql = readFileSync(
    new URL("../supabase/image-display.sql", import.meta.url),
    "utf8",
  );
  assert.match(sql, /add column if not exists %I jsonb/);
  assert.match(sql, /relrowsecurity is distinct from/);
  assert.match(sql, /b\.policies is distinct from/);
  assert.match(sql, /existing_type <> 'jsonb'/);
  assert.doesNotMatch(
    sql,
    /^\s*(grant|revoke|create policy|alter policy|drop policy|update public\.|delete from|insert into public\.|alter table .*disable row level security)/im,
  );
  assert.doesNotMatch(sql, /default '\{\}'|set not null|storage\.objects/i);
});

test("unrecognized prototype keys and malformed album photo arrays are ignored", () => {
  assert.deepEqual(
    normalizeImageDisplay(
      JSON.parse('{"__proto__":{"zoom":2},"constructor":{"fit":"cover"}}'),
    ),
    {},
  );
  assert.deepEqual(
    normalizePhotoDisplays(
      { "/photo.jpg": { photoGrid: { zoom: 2 } } },
      { unexpected: true },
    ),
    {},
  );
});

test('temporarily clearing a photo URL retains its framing for the replacement',()=>{
 const original={photos:[photo,second],photo_captions:{[photo]:'Keep caption'},photo_display:{[photo]:{photoGrid:{focalX:32,zoom:1.5}}}};
 const cleared=replaceAlbumPhoto(original,0,'');assert.equal(cleared.photo_display[photo],undefined);assert.equal(cleared._photoDrafts[0].display.photoGrid.zoom,1.5);
 const replaced=replaceAlbumPhoto(cleared,0,'/new.jpg');assert.equal(replaced.photo_display['/new.jpg'].photoGrid.focalX,32);assert.equal(replaced.photo_captions['/new.jpg'],'Keep caption');assert.equal(replaced._photoDrafts,undefined);
 const reordered={...cleared,photos:[second,''],_photoDrafts:[undefined,cleared._photoDrafts[0]]};
 assert.equal(replaceAlbumPhoto(reordered,1,'/new.jpg').photo_display['/new.jpg'].photoGrid.zoom,1.5);
 assert.equal(removeAlbumPhoto(cleared,0)._photoDrafts,undefined);
 assert.equal(projectPreviewRecord('album',cleared)._photoDrafts,undefined);
});
