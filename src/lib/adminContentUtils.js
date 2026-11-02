import { safeImage } from './pageContentUtils.js';

export const pastEventDrafts = [
  {
    title: 'Coding Workshop at MSU', category: 'Workshop',
    location: 'MSU Computer Lab, Faculty of Science, The Maharaja Sayajirao University of Baroda',
    date: '2026-01-30', time: '10:15 AM – 5:30 PM',
    starts_at: '2026-01-30T04:45:00.000Z', ends_at: '2026-01-30T12:00:00.000Z',
    image: '/events/msu-ember-coding-workshop-2026.png',
    description: 'EMBER 2026 — Ignite the Future. A coding workshop at MSU Computer Lab, Faculty of Science, The Maharaja Sayajirao University of Baroda. The workshop was scheduled for 30 January 2026, from 10:15 AM to 5:30 PM IST.',
  },
  {
    title: 'Mini Hackathon at ITM', category: 'Hackathon',
    location: 'TBL Lab, ITM School of Fine Arts',
    date: '2025-09-28', time: '10:30 AM – 2:00 PM',
    starts_at: '2025-09-28T05:00:00.000Z', ends_at: '2025-09-28T08:30:00.000Z',
    image: '/events/itm-aakar-mini-hackathon-2025.png',
    description: 'AAKAR — Forming the Future. Mini Hackathon, Episode 01: build with AI and turn ideas into something real. Focus areas include AI, product design, and prototyping. Held at TBL Lab, ITM School of Fine Arts, on 28 September 2025, from 10:30 AM to 2:00 PM IST.',
  },
];
export function fillEventPosterDetails(event) {
  const preset = pastEventDrafts.find(item => item.title.toLowerCase() === event.title?.trim().toLowerCase());
  if (!preset) return event;
  const result = { ...event };
  const scheduleKeys = ['date', 'time', 'starts_at', 'ends_at'];
  const customSchedule = scheduleKeys.some(key => typeof event[key] === 'string' && event[key].trim() && event[key] !== preset[key]);
  for (const [key, value] of Object.entries(preset)) {
    if (customSchedule && scheduleKeys.includes(key)) continue;
    if (typeof result[key] !== 'string' || !result[key].trim()) result[key] = value;
  }
  return result;
}
const descriptions = {
  'coding with ai': 'Explore coding with AI tools, from working through ideas to building and refining code.',
  ideathon: 'Ideas, conversations, and creative problem-solving from the CodeCrafters community.',
  'data science playground': 'Explore data science through code, questions, and practical experimentation.',
  'launch event': 'A look at the beginning of the CodeCrafters community and its shared journey.',
};
export function albumDescription(album) {
  return album.description?.trim() || descriptions[album.title?.trim().toLowerCase()] || `Photos and moments from ${album.title || 'our community'}.`;
}
export function appendAlbumPhotos(album, urls) {
  const clean = urls.map(url => String(url).trim()).filter(Boolean);
  if (clean.some(url => !safeImage(url))) throw new Error('Use a complete HTTP/HTTPS image URL or a site image path.');
  const photos = [...new Set([...(album.photos || []).filter(Boolean), ...clean])];
  return { ...album, photos, coverImage: album.coverImage || photos[0] || '' };
}
export function reorderAlbumPhoto(album, from, to) {
  const photos = [...(album.photos || [])];
  if (from === to || from < 0 || to < 0 || from >= photos.length || to >= photos.length) return album;
  photos.splice(to, 0, photos.splice(from, 1)[0]);
  const next = { ...album, photos };
  if (album._photoDrafts) {
    const drafts = album.photos.map((_, i) => album._photoDrafts[i]);
    drafts.splice(to, 0, drafts.splice(from, 1)[0]);
    next._photoDrafts = drafts;
  }
  return next;
}
export function validateEventSchedule(item, previous) {
  // Preserve legacy records when their publication/status/schedule is unchanged.
  // A new record or an actual schedule/publication edit is still validated below.
  if (previous && ['is_published','status_override','starts_at','ends_at'].every(key => item[key] === previous[key])) return;
  const start = Date.parse(item.starts_at || '');
  const end = Date.parse(item.ends_at || '');
  if (item.starts_at || item.ends_at) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error(`Set a valid start and end for "${item.title}". The end must follow the start.`);
  } else if (item.is_published !== false && item.status_override !== 'past') {
    throw new Error(`Set a start and end date/time for "${item.title}" before publishing, or keep it as a draft.`);
  }
}
