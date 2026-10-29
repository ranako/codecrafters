// Explicit public projection for the preview. Auth, uploader state and CMS-only metadata never enter the frame.
const fields = {
  upcoming: [
    "id",
    "title",
    "description",
    "category",
    "registration_url",
    "starts_at",
    "ends_at",
    "status_override",
    "date",
    "time",
    "location",
    "image",
    "image_display",
    "speakers",
    "is_published",
  ],
  album: [
    "id",
    "title",
    "date",
    "description",
    "coverImage",
    "cover_display",
    "photos",
    "photo_captions",
    "photo_display",
    "event_id",
    "is_published",
    "previewPhoto",
  ],
  team: [
    "id",
    "name",
    "role",
    "linkedin",
    "image",
    "image_display",
    "is_active",
  ],
  testimonials: [
    "id",
    "name",
    "role",
    "text",
    "avatar",
    "image_display",
    "is_published",
  ],
};
export function projectPreviewRecord(type, record) {
  if (!record) return null;
  return Object.fromEntries(
    (fields[type] || [])
      .filter((key) => Object.hasOwn(record, key))
      .map((key) => [key, record[key]]),
  );
}
