export const defaultPresentation = {
  gallery_reel: { enabled: true, title: 'Community in frames', speedSeconds: 48, direction: 'left', pauseOnHover: true, albumIds: [], photoKeys: [] },
  event_cards: { style: 'ticket', animation: 'tilt' },
};

export function normalizePresentation(input = {}) {
  const reel = input.gallery_reel || {};
  const cards = input.event_cards || {};
  return {
    gallery_reel: {
      enabled: reel.enabled !== false,
      title: typeof reel.title === 'string' ? reel.title.slice(0, 100) : defaultPresentation.gallery_reel.title,
      speedSeconds: Math.min(120, Math.max(15, Number(reel.speedSeconds) || 48)),
      direction: reel.direction === 'right' ? 'right' : 'left',
      pauseOnHover: reel.pauseOnHover !== false,
      albumIds: Array.isArray(reel.albumIds) ? reel.albumIds.filter((id) => typeof id === 'string') : [],
      photoKeys: Array.isArray(reel.photoKeys) ? reel.photoKeys.filter((key) => typeof key === 'string') : [],
    },
    event_cards: {
      style: ['ticket', 'editorial', 'minimal'].includes(cards.style) ? cards.style : 'ticket',
      animation: ['tilt', 'lift', 'none'].includes(cards.animation) ? cards.animation : 'tilt',
    },
  };
}

export function reelPhotoKey(photo) { return `${photo.album.id}:${photo.url}`; }

export function selectReelPhotos(photos, settings) {
  const filtered = photos.filter((photo) => !settings.albumIds.length || settings.albumIds.includes(photo.album.id));
  if (!settings.photoKeys.length) return filtered;
  const byKey = new Map(filtered.map((photo) => [reelPhotoKey(photo), photo]));
  return settings.photoKeys.map((key) => byKey.get(key)).filter(Boolean);
}
