import { useEffect, useState } from 'react';
import { fetchPastEventAlbums } from '../lib/contentApi';
import { galleryPhotos } from '../lib/eventUtils';
import { defaultPresentation, fetchPresentation, savePresentation, reelPhotoKey, selectReelPhotos } from '../lib/presentationSettings';

export default function PresentationManager({ onDirtyChange, onBusyChange }) {
  const [snapshot, setSnapshot] = useState(defaultPresentation);
  const [settings, setSettings] = useState(defaultPresentation);
  const [albums, setAlbums] = useState([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([fetchPresentation(), fetchPastEventAlbums()]).then(([value, nextAlbums]) => {
      if (active) { setSettings(value); setSnapshot(value); setAlbums(nextAlbums); setReady(true); }
    }).catch((reason) => { if (active) setError(reason.message || 'Could not load appearance settings.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const dirty = JSON.stringify(settings) !== JSON.stringify(snapshot);
  useEffect(() => { onDirtyChange?.(dirty); return () => onDirtyChange?.(false); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange?.(saving); return () => onBusyChange?.(false); }, [saving, onBusyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const update = (section, key, value) => { setSettings((current) => ({ ...current, [section]: { ...current[section], [key]: value } })); setMessage(''); };
  const reel = settings.gallery_reel;
  const photos = galleryPhotos(albums, []);
  const selected = selectReelPhotos(photos, reel);
  const toggle = (key, value) => update('gallery_reel', key, reel[key].includes(value) ? reel[key].filter((item) => item !== value) : [...reel[key], value]);
  const submit = async (e) => {
    e.preventDefault(); if (!ready) return; setError(''); setMessage('');
    if (reel.enabled && (!reel.title.trim() || !selected.length)) { setError('An enabled carousel needs a title and at least one published photo.'); return; }
    setSaving(true);
    try {
      await savePresentation(settings);
      const saved = await fetchPresentation();
      setSettings(saved); setSnapshot(saved);
      const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cc-presentation') : null;
      channel?.postMessage('saved'); channel?.close();
      setMessage('Appearance saved to Supabase. Public pages use these settings.');
    } catch (reason) { setError(reason.message || 'Could not save appearance settings.'); }
    finally { setSaving(false); }
  };
  if (loading) return <p role="status" className="p-8">Loading appearance settings…</p>;
  return <div className="admin-editor-single"><form onSubmit={submit} className="appearance-manager">
    <h2>Appearance</h2><p>Manage the gallery carousel and event cards. Save changes to update the public pages.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {message && <p role="status" className="text-green-800">{message}</p>}
    <fieldset disabled={saving || !ready}>
      <legend>Gallery carousel</legend>
      <label className="appearance-check"><input type="checkbox" checked={reel.enabled} onChange={(e) => update('gallery_reel', 'enabled', e.target.checked)} />Show carousel on Gallery</label>
      <label>Carousel title<input maxLength={100} value={reel.title} onChange={(e) => update('gallery_reel', 'title', e.target.value)} /></label>
      <div className="appearance-columns">
        <label>Loop duration (seconds)<input type="number" min="15" max="120" required value={reel.speedSeconds} onChange={(e) => update('gallery_reel', 'speedSeconds', e.target.value)} /><small>A shorter duration moves faster.</small></label>
        <label>First row direction<select value={reel.direction} onChange={(e) => update('gallery_reel', 'direction', e.target.value)}><option value="left">Left</option><option value="right">Right</option></select></label>
      </div>
      <label className="appearance-check"><input type="checkbox" checked={reel.pauseOnHover} onChange={(e) => update('gallery_reel', 'pauseOnHover', e.target.checked)} />Pause when hovered</label>
      <h3>Albums included</h3><p>Leave all albums unchecked to use every published album.</p>
      {albums.map((album) => <label key={album.id} className="appearance-check"><input type="checkbox" checked={reel.albumIds.includes(album.id)} onChange={() => toggle('albumIds', album.id)} />{album.title}</label>)}
      <h3>Choose individual photos</h3><p>Leave photos unchecked to use all eligible photos. Selected photos play in selection order.</p>
      <div className="appearance-photo-picker">{photos.map((photo) => <label key={reelPhotoKey(photo)}><img src={photo.url} alt={photo.caption || photo.album.title} loading="lazy" /><span><input type="checkbox" checked={reel.photoKeys.includes(reelPhotoKey(photo))} onChange={() => toggle('photoKeys', reelPhotoKey(photo))} />{photo.caption || photo.album.title}</span></label>)}</div>
      {reel.photoKeys.length > 0 && <button type="button" onClick={() => update('gallery_reel', 'photoKeys', [])}>Use all eligible photos</button>}
      <p>{selected.length} eligible photos. Photos remain managed in Photo Album.</p>
    </fieldset>
    <fieldset disabled={saving || !ready}><legend>Event cards</legend>
      <div className="appearance-columns"><label>Card style<select value={settings.event_cards.style} onChange={(e) => update('event_cards', 'style', e.target.value)}><option value="ticket">Scrapbook ticket</option><option value="editorial">Editorial card</option><option value="minimal">Minimal card</option></select></label>
      <label>Animation<select value={settings.event_cards.animation} onChange={(e) => update('event_cards', 'animation', e.target.value)}><option value="tilt">Tilt and lift</option><option value="lift">Gentle lift</option><option value="none">No animation</option></select></label></div>
      <p>Reduced-motion preferences always take priority. The homepage spotlight keeps its own layout.</p>
    </fieldset>
    <button className="appearance-save" disabled={saving || loading || !ready} type="submit">{saving ? 'Saving appearance…' : 'Save appearance'}</button>
  </form></div>;
}
