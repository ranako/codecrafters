import { normalizeImageDisplay, normalizePhotoDisplays } from "./imageDisplay";
import { supabase } from "./supabase";

function isTemporaryId(id) {
  return !id || typeof id !== "string" || id.startsWith("temp-");
}

// Bulk upserts below use missing=default so new rows receive database IDs
// when saved alongside existing rows. Existing IDs remain unchanged.
function withSortOrder(items, mapItem) {
  return items.map((item, index) => {
    const mapped = mapItem(item, index);

    if (isTemporaryId(mapped.id)) {
      delete mapped.id;
    }

    return mapped;
  });
}

function sortByOrder(query) {
  return query.order("sort_order", { ascending: true }).order("created_at", {
    ascending: true,
  });
}

function mapUpcomingEvent(row) {
  return {
    id: row.id,
    title: row.title || "",
    description: row.description || "",
    category: row.category || "",
    registration_url: row.registration_url || "",
    starts_at: row.starts_at || "",
    ends_at: row.ends_at || "",
    status_override: row.status_override || "",
    date: row.event_date || "",
    time: row.event_time || "",
    location: row.location || "",
    image: row.image_url || "",
    image_display: normalizeImageDisplay(row.image_display),
    _displaySchema: Object.hasOwn(row,"image_display"),
    gradient: row.gradient || "",
    speakers: Array.isArray(row.speakers) ? row.speakers : [],
    sort_order: row.sort_order ?? 0,
    is_published: row.is_published ?? true,
  };
}

function mapTeamMember(row) {
  return {
    id: row.id,
    name: row.name || "",
    role: row.role || "",
    linkedin: row.linkedin_url || "",
    github: row.github_url || "",
    behance: row.behance_url || "",
    _githubSchema: Object.hasOwn(row, "github_url"),
    _behanceSchema: Object.hasOwn(row, "behance_url"),
    image: row.image_url || "",
    image_display: normalizeImageDisplay(row.image_display),
    _displaySchema: Object.hasOwn(row,"image_display"),
    group_type: row.group_type || "core",
    sort_order: row.sort_order ?? 0,
    is_active: row.is_active ?? true,
  };
}

function mapTestimonial(row) {
  return {
    id: row.id,
    name: row.name || "",
    role: row.role || "",
    text: row.text || "",
    avatar: row.avatar_url || "",
    image_display: normalizeImageDisplay(row.image_display),
    _displaySchema: Object.hasOwn(row,"image_display"),
    sort_order: row.sort_order ?? 0,
    is_published: row.is_published ?? true,
  };
}

function mapPastEventAlbum(row) {
  return {
    id: row.id,
    title: row.title || "",
    date: row.event_date || "",
    description: row.description || "",
    coverImage: row.cover_image_url || "",
    cover_display: normalizeImageDisplay(row.cover_display),
    _displaySchema: Object.hasOwn(row,"cover_display") && Object.hasOwn(row,"photo_display"),
    photo_display: normalizePhotoDisplays(row.photo_display,row.photos),
    event_id: row.event_id || "",
    photo_captions: row.photo_captions && typeof row.photo_captions === "object" && !Array.isArray(row.photo_captions) ? row.photo_captions : {},
    photos: Array.isArray(row.photos) ? row.photos : [],
    sort_order: row.sort_order ?? 0,
    is_published: row.is_published ?? true,
  };
}

async function runQuery(query) {
  const { data, error } = await query;

  if (error) {
    if (["PGRST204", "42703"].includes(error.code) && /github_url|behance_url/.test(error.message || "")) {
      throw new Error("Member links need the database columns in supabase/team-social-links.sql. Your draft has been kept; ask the project owner to review this migration before retrying.");
    }
    if (['PGRST204','42703'].includes(error.code) && /image_display|photo_display|cover_display/.test(error.message || '')) {
      throw new Error('Image display needs its database columns. Review and run supabase/image-display.sql in the CodeCrafters SQL Editor, then retry. Your draft has been kept.');
    }
    throw error;
  }

  return data;
}

export async function fetchUpcomingEvents({ admin = false } = {}) {
  let query = supabase.from("upcoming_events").select("*");

  if (!admin) {
    query = query.eq("is_published", true);
  }

  const data = await runQuery(sortByOrder(query));
  return data.map(mapUpcomingEvent);
}

export async function saveUpcomingEvents(items) {
  const payload = withSortOrder(items, (item, index) => ({
    id: item.id,
    title: item.title?.trim() || "",
    description: item.description?.trim() || "",
    category: item.category?.trim() || "",
    registration_url: item.registration_url?.trim() || null,
    starts_at: item.starts_at || null,
    ends_at: item.ends_at || null,
    status_override: item.status_override || null,
    event_date: item.date?.trim() || "",
    event_time: item.time?.trim() || "",
    location: item.location?.trim() || "",
    image_url: item.image?.trim() || "",
    ...(item._displaySchema || Object.keys(normalizeImageDisplay(item.image_display)).length ? {image_display:normalizeImageDisplay(item.image_display)} : {}),
    gradient: item.gradient?.trim() || "",
    speakers: Array.isArray(item.speakers) ? item.speakers : [],
    sort_order: index,
    is_published: item.is_published ?? true,
  }));

  return runQuery(
    supabase.from("upcoming_events").upsert(payload, { defaultToNull: false }).select("*"),
  );
}

export async function deleteUpcomingEvents(ids) {
  if (!ids.length) return;
  await runQuery(supabase.from("upcoming_events").delete().in("id", ids));
}

export async function fetchCoreTeamMembers({ admin = false } = {}) {
  let query = supabase
    .from("team_members")
    .select("*")
    .eq("group_type", "core");

  if (!admin) {
    query = query.eq("is_active", true);
  }

  const data = await runQuery(sortByOrder(query));
  return data.map(mapTeamMember);
}

export async function saveCoreTeamMembers(items) {
  const payload = withSortOrder(items, (item, index) => ({
    id: item.id,
    name: item.name?.trim() || "",
    role: item.role?.trim() || "",
    linkedin_url: item.linkedin?.trim() || "",
    ...(item._githubSchema || item.github?.trim() ? { github_url: item.github?.trim() || "" } : {}),
    ...(item._behanceSchema || item.behance?.trim() ? { behance_url: item.behance?.trim() || "" } : {}),
    image_url: item.image?.trim() || "",
    ...(item._displaySchema || Object.keys(normalizeImageDisplay(item.image_display)).length ? {image_display:normalizeImageDisplay(item.image_display)} : {}),
    group_type: "core",
    sort_order: index,
    is_active: item.is_active ?? true,
  }));

  return runQuery(supabase.from("team_members").upsert(payload, { defaultToNull: false }).select("*"));
}

export async function deleteCoreTeamMembers(ids) {
  if (!ids.length) return;
  await runQuery(supabase.from("team_members").delete().in("id", ids));
}

export async function fetchTestimonials({ admin = false } = {}) {
  let query = supabase.from("testimonials").select("*");

  if (!admin) {
    query = query.eq("is_published", true);
  }

  const data = await runQuery(sortByOrder(query));
  return data.map(mapTestimonial);
}

export async function saveTestimonials(items) {
  const payload = withSortOrder(items, (item, index) => ({
    id: item.id,
    name: item.name?.trim() || "",
    role: item.role?.trim() || "",
    text: item.text?.trim() || "",
    avatar_url: item.avatar?.trim() || "",
    ...(item._displaySchema || Object.keys(normalizeImageDisplay(item.image_display)).length ? {image_display:normalizeImageDisplay(item.image_display)} : {}),
    sort_order: index,
    is_published: item.is_published ?? true,
  }));

  return runQuery(supabase.from("testimonials").upsert(payload, { defaultToNull: false }).select("*"));
}

export async function deleteTestimonials(ids) {
  if (!ids.length) return;
  await runQuery(supabase.from("testimonials").delete().in("id", ids));
}

export async function fetchPastEventAlbums({ admin = false } = {}) {
  let query = supabase.from("past_event_albums").select("*");

  if (!admin) {
    query = query.eq("is_published", true);
  }

  const data = await runQuery(sortByOrder(query));
  return data.map(mapPastEventAlbum);
}

export async function savePastEventAlbums(items) {
  const payload = withSortOrder(items, (item, index) => ({
    id: item.id,
    title: item.title?.trim() || "",
    event_date: item.date?.trim() || "",
    description: item.description?.trim() || "",
    cover_image_url: item.coverImage?.trim() || "",
    ...(item._displaySchema || Object.keys(normalizeImageDisplay(item.cover_display)).length ? {cover_display:normalizeImageDisplay(item.cover_display)} : {}),
    ...(item._displaySchema || Object.keys(normalizePhotoDisplays(item.photo_display,item.photos)).length ? {photo_display:normalizePhotoDisplays(item.photo_display,item.photos)} : {}),
    event_id: item.event_id || null,
    photo_captions: Object.fromEntries((item.photos || []).filter(Boolean).map((url) => [url, String(item.photo_captions?.[url] || "")])),
    photos: Array.isArray(item.photos) ? item.photos : [],
    sort_order: index,
    is_published: item.is_published ?? true,
  }));

  return runQuery(
    supabase.from("past_event_albums").upsert(payload, { defaultToNull: false }).select("*"),
  );
}

export async function deletePastEventAlbums(ids) {
  if (!ids.length) return;
  await runQuery(supabase.from("past_event_albums").delete().in("id", ids));
}

// The historical table name is retained to preserve existing IDs and RLS.
export const fetchEvents = fetchUpcomingEvents;
