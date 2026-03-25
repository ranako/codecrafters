import { supabase } from "./supabase";

function isTemporaryId(id) {
  return !id || typeof id !== "string" || id.startsWith("temp-");
}

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
    date: row.event_date || "",
    time: row.event_time || "",
    location: row.location || "",
    image: row.image_url || "",
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
    image: row.image_url || "",
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
    photos: Array.isArray(row.photos) ? row.photos : [],
    sort_order: row.sort_order ?? 0,
    is_published: row.is_published ?? true,
  };
}

async function runQuery(query) {
  const { data, error } = await query;

  if (error) {
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
    event_date: item.date?.trim() || "",
    event_time: item.time?.trim() || "",
    location: item.location?.trim() || "",
    image_url: item.image?.trim() || "",
    gradient: item.gradient?.trim() || "",
    speakers: Array.isArray(item.speakers) ? item.speakers : [],
    sort_order: index,
    is_published: item.is_published ?? true,
  }));

  return runQuery(
    supabase.from("upcoming_events").upsert(payload).select("*"),
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
    image_url: item.image?.trim() || "",
    group_type: "core",
    sort_order: index,
    is_active: item.is_active ?? true,
  }));

  return runQuery(supabase.from("team_members").upsert(payload).select("*"));
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
    sort_order: index,
    is_published: item.is_published ?? true,
  }));

  return runQuery(supabase.from("testimonials").upsert(payload).select("*"));
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
    photos: Array.isArray(item.photos) ? item.photos : [],
    sort_order: index,
    is_published: item.is_published ?? true,
  }));

  return runQuery(
    supabase.from("past_event_albums").upsert(payload).select("*"),
  );
}

export async function deletePastEventAlbums(ids) {
  if (!ids.length) return;
  await runQuery(supabase.from("past_event_albums").delete().in("id", ids));
}
