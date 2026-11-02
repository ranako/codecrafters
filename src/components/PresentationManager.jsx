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
  const [choosingPhotos, setChoosingPhotos] = useState(false);
  const [photoSearch, setPhotoSearch] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([fetchPresentation(), fetchPastEventAlbums()]).then(([value, nextAlbums]) => {
      if (active) { setSettings(value); setSnapshot(value); setChoosingPhotos(value.gallery_reel.photoKeys.length > 0); setAlbums(nextAlbums); setReady(true); }
    }).catch((reason) => { if (active) setError(reason.message || 'Could not load appearance settings.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const dirty = JSON.stringify(settings) !== JSON.stringify(snapshot) || (choosingPhotos && !settings.gallery_reel.photoKeys.length);
  useEffect(() => { onDirtyChange?.(dirty); return () => onDirtyChange?.(false); }, [dirty, onDirtyChange]);
  useEffect(() => { onBusyChange?.(saving); return () => onBusyChange?.(false); }, [saving, onBusyChange]);
  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    const guard = event => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor || anchor.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const next = new URL(anchor.href, window.location.href);
      if (next.origin === window.location.origin && next.pathname !== window.location.pathname && (saving || !window.confirm('Discard unsaved appearance settings and leave the editor?'))) {
        event.preventDefault(); event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', guard, true);
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', guard, true); };
  }, [dirty, saving]);
  const update = (section, key, value) => { setSettings((current) => ({ ...current, [section]: { ...current[section], [key]: value } })); setMessage(''); };
  const reel = settings.gallery_reel;
  const photos = galleryPhotos(albums, []);
  const selected = choosingPhotos && !reel.photoKeys.length ? [] : selectReelPhotos(photos, reel);
  const eligible = photos.filter(photo => !reel.albumIds.length || reel.albumIds.includes(photo.album.id));
  const filtered = eligible.filter(photo => `${photo.caption || ''} ${photo.album.title}`.toLowerCase().includes(photoSearch.toLowerCase()));
  const photoLabel = photo => photo.caption || `${photo.album.title} · Photo ${photo.index + 1}`;
  const moveSelected = (key, direction) => {
    const keys = [...reel.photoKeys]; const from = keys.indexOf(key); const to = from + direction;
    if (from < 0 || to < 0 || to >= keys.length) return;
    keys.splice(to, 0, keys.splice(from, 1)[0]); update('gallery_reel', 'photoKeys', keys);
  };
  const toggle = (key, value) => update('gallery_reel', key, reel[key].includes(value) ? reel[key].filter((item) => item !== value) : [...reel[key], value]);
  const submit = async (e) => {
    e.preventDefault(); if (!ready) return; setError(''); setMessage('');
    if (reel.enabled && choosingPhotos && !selected.length) { setError('Select at least one photo, or switch to all photos from the selected albums.'); return; }
    if (reel.enabled && (!reel.title.trim() || !selected.length)) { setError('An enabled carousel needs a title and at least one published photo.'); return; }
    setSaving(true);
    try {
      await savePresentation(settings);
      const saved = await fetchPresentation();
      setSettings(saved); setSnapshot(saved); setChoosingPhotos(saved.gallery_reel.photoKeys.length > 0);
      const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cc-presentation') : null;
      channel?.postMessage('saved'); channel?.close();
      setMessage('Appearance saved to Supabase. Public pages use these settings.');
    } catch (reason) { setError(reason.message || 'Could not save appearance settings.'); }
    finally { setSaving(false); }
  };
  if (loading) return <p role="status" className="p-8">Loading appearance settings…</p>;
  return <div className="admin-editor-single"><form onSubmit={submit} className="appearance-manager">
    <h2>Gallery reel & appearance</h2><p>Control the two scrolling photo rows: their speed, direction, and which published photos appear. Changes reach the public pages only after saving.</p>
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
      <div className="reel-speed-control"><label>Reel loop duration<input aria-label="Reel loop duration" type="range" min="15" max="120" value={Number(reel.speedSeconds) || 48} onChange={e=>update('gallery_reel','speedSeconds',Number(e.target.value))} /></label><div className="reel-speed-labels"><span>Fast · 15 seconds</span><span>Slow · 120 seconds</span></div><div className="reel-speed-presets">{[['Fast',24],['Balanced',48],['Relaxed',96]].map(([label,seconds])=><button type="button" key={label} aria-pressed={Number(reel.speedSeconds)===seconds} onClick={()=>update('gallery_reel','speedSeconds',seconds)}>{label}</button>)}</div><p>The first row completes a loop in {reel.speedSeconds || 48} seconds; the opposite row is slightly slower.</p></div>
      <label className="appearance-check"><input type="checkbox" checked={reel.pauseOnHover} onChange={(e) => update('gallery_reel', 'pauseOnHover', e.target.checked)} />Pause when hovered</label>
      <h3>Albums included</h3><p>Leave all albums unchecked to use every published album.</p>
      {albums.map((album) => <label key={album.id} className="appearance-check"><input type="checkbox" checked={reel.albumIds.includes(album.id)} onChange={() => toggle('albumIds', album.id)} />{album.title}</label>)}
      <h3>Which photos appear?</h3>
      <label className="appearance-check"><input type="radio" name="reel-photo-mode" checked={!choosingPhotos} onChange={()=>{setChoosingPhotos(false);update('gallery_reel','photoKeys',[]);}} />All photos from the selected albums</label>
      <label className="appearance-check"><input type="radio" name="reel-photo-mode" checked={choosingPhotos} onChange={()=>{setChoosingPhotos(true);setMessage('');}} />Choose specific photos</label>
      {choosingPhotos && <><label>Find reel photos<input type="search" value={photoSearch} onChange={e=>setPhotoSearch(e.target.value)} placeholder="Search album names or captions" /></label>
        <div className="appearance-photo-picker">{filtered.map(photo=><label key={reelPhotoKey(photo)} data-selected={reel.photoKeys.includes(reelPhotoKey(photo))}><img src={photo.url} alt={photoLabel(photo)} loading="lazy" decoding="async" /><span><input aria-label={`Include ${photoLabel(photo)}`} type="checkbox" checked={reel.photoKeys.includes(reelPhotoKey(photo))} onChange={()=>toggle('photoKeys',reelPhotoKey(photo))} />{photoLabel(photo)}</span></label>)}</div>
        {!filtered.length && <p>No published photos match this selection. Change the album filters or search.</p>}
        <h3>Selected order · {selected.length} photos</h3><ol className="reel-selected-order">{selected.map((photo,index)=><li key={reelPhotoKey(photo)}><span>{index+1}. {photoLabel(photo)}</span><div><button type="button" disabled={index===0} aria-label={`Move ${photoLabel(photo)} earlier`} onClick={()=>moveSelected(reelPhotoKey(photo),-1)}>↑</button><button type="button" disabled={index===selected.length-1} aria-label={`Move ${photoLabel(photo)} later`} onClick={()=>moveSelected(reelPhotoKey(photo),1)}>↓</button></div></li>)}</ol>
      </>}
      <p>{selected.length} photos will appear. Only published albums are eligible. Add or replace images in Photo Album.</p>
    </fieldset>
    <fieldset disabled={saving || !ready}><legend>Event cards</legend>
      <div className="appearance-columns"><label>Card style<select value={settings.event_cards.style} onChange={(e) => update('event_cards', 'style', e.target.value)}><option value="ticket">Scrapbook ticket</option><option value="editorial">Editorial card</option><option value="minimal">Minimal card</option></select></label>
      <label>Animation<select value={settings.event_cards.animation} onChange={(e) => update('event_cards', 'animation', e.target.value)}><option value="tilt">Tilt and lift</option><option value="lift">Gentle lift</option><option value="none">No animation</option></select></label></div>
      <p>Reduced-motion preferences always take priority. The homepage spotlight keeps its own layout.</p>
    </fieldset>
    <button className="appearance-save" disabled={saving || loading || !ready} type="submit">{saving ? 'Saving appearance…' : 'Save appearance'}</button>
  </form></div>;
}
