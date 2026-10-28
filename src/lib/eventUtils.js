export function registrationUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

// Existing event_date / event_time fields remain text. Require an unambiguous
// calendar date and start time; legacy prose is displayed without a countdown.
export function eventTimestamp(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null;
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?(?:\s*(Z|[+-]\d{2}:\d{2}))?$/.exec(time || '');
  if (!match || +match[1] > 23 || +match[2] > 59 || +(match[3] || 0) > 59) return null;
  const day = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== date) return null;
  // Club events use India time unless an explicit UTC offset is supplied.
  const timestamp = Date.parse(`${date}T${match[1]}:${match[2]}:${match[3] || '00'}${match[4] || '+05:30'}`);
  return Number.isFinite(timestamp) ? timestamp : null;
}


export function eventStart(event) {
  const value = Date.parse(event.starts_at || "");
  return Number.isFinite(value) ? value : eventTimestamp(event.date, event.time);
}

export function eventStatus(event, now = Date.now()) {
  if (["upcoming", "live", "past"].includes(event.status_override)) return event.status_override;
  const start = eventStart(event);
  const end = Date.parse(event.ends_at || "");
  if (start === null) return "unscheduled";
  if (now < start) return "upcoming";
  // Legacy events with no end cannot be claimed to be live indefinitely.
  if (!Number.isFinite(end)) return "past";
  return now < end ? "live" : "past";
}

export function indiaDateTime(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? new Date(timestamp + 330 * 60000).toISOString().slice(0, 16) : "";
}

export function fromIndiaDateTime(value) {
  const timestamp = Date.parse(value ? `${value}:00+05:30` : "");
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

export function galleryPhotos(albums, events, query = "", eventId = "") {
  const eventNames = new Map(events.map((event) => [event.id, event.title]));
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return albums.filter((album) => !eventId || album.event_id === eventId).flatMap((album) => {
    const photos = [...new Set(album.photos?.filter(Boolean).length ? album.photos.filter(Boolean) : album.coverImage ? [album.coverImage] : [])];
    return photos.map((url, index) => {
      const caption = String(album.photo_captions?.[url] || "");
      const search = [album.title, album.description, album.date, eventNames.get(album.event_id) || "", caption, url.split('/').pop()].join(" ").toLocaleLowerCase();
      return { album, url, index, caption, search };
    }).filter((photo) => words.every((word) => photo.search.includes(word)));
  });
}
