import { useEffect, useMemo, useState } from 'react';
import { usePageContent } from '../hooks/usePageContent';
import { useSearchParams } from 'react-router-dom';
import { fetchEvents, fetchPastEventAlbums } from '../lib/contentApi';
import { galleryPhotos } from '../lib/eventUtils';
import { usePresentationSettings } from "../hooks/usePresentationSettings";
import GalleryReel from "../components/GalleryReel";
import GalleryLightbox from "../components/GalleryLightbox";

export default function Gallery() {
  const content = usePageContent("gallery").intro;
  const presentation = usePresentationSettings();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const eventId = params.get('event') || '';
  const albumId = params.get('album') || '';
  const category = params.get('category') || '';
  const [albums, setAlbums] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([fetchPastEventAlbums(), fetchEvents()]).then(([nextAlbums, nextEvents]) => {
      if (active) { setAlbums(nextAlbums); setEvents(nextEvents); setError(''); }
    }).catch(() => { if (active) setError('The gallery could not be loaded. Please try again later.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  const allPhotos = useMemo(() => galleryPhotos(albums, events), [albums, events]);
  const eventMap = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);
  const categories = [...new Set(allPhotos.map((photo) => eventMap.get(photo.album.event_id)?.category).filter(Boolean))];
  const photos = useMemo(() => galleryPhotos(albums, events, query, eventId).filter((photo) =>
    (!albumId || photo.album.id === albumId) && (!category || eventMap.get(photo.album.event_id)?.category === category)
  ), [albums, events, query, eventId, albumId, category, eventMap]);
  const change = (key, value) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next, { replace: true }); };
  const openPhoto = (photo, collection = photos) => setSelected({ photos: collection, index: collection.findIndex((item) => item.album.id === photo.album.id && item.url === photo.url) });
  const clearFilters = () => setParams({}, { replace: true });
  return <div className="cc-gallery">
    <section className="gallery-archive-hero gallery-shell">
      <div>
        <p className="gallery-eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="gallery-hero-copy">{content.description}</p>
      </div>
      <dl className="gallery-archive-stats" aria-label="Published archive counts">
        <div><dt>Photos</dt><dd>{loading ? '…' : allPhotos.length}</dd></div>
        <div><dt>Albums</dt><dd>{loading ? '…' : albums.length}</dd></div>
        <div><dt>Linked events</dt><dd>{loading ? '…' : new Set(albums.map((album) => album.event_id).filter((id) => id && eventMap.has(id))).size}</dd></div>
      </dl>
    </section>
    {!loading && !error && <GalleryReel settings={presentation.gallery_reel} photos={allPhotos} onSelect={(photo) => openPhoto(photo, allPhotos)} />}
    <section className="gallery-shell gallery-archives" aria-labelledby="archive-heading">
      <div className="gallery-archive-intro"><div><p className="gallery-eyebrow">{content.archiveEyebrow}</p><h2 id="archive-heading">{content.archiveTitle}</h2></div><span className="gallery-eyebrow">{content.hint}</span></div>
      <div className="gallery-chapters" aria-label="Filter by album">
        <button aria-pressed={!albumId} onClick={() => change('album', '')}>All archives <span>{allPhotos.length}</span></button>
        {albums.map((album) => <button key={album.id} aria-pressed={albumId === album.id} onClick={() => change('album', album.id)}>{album.title}<span>{allPhotos.filter((photo) => photo.album.id === album.id).length}</span></button>)}
      </div>
      {categories.length > 0 && <div className="gallery-chapters" aria-label="Filter by event category"><button aria-pressed={!category} onClick={() => change('category', '')}>All categories</button>{categories.map((name) => <button key={name} aria-pressed={category === name} onClick={() => change('category', name)}>{name}</button>)}</div>}
      <div className="gallery-search-bar">
        <label className="gallery-search-label">{content.searchLabel}<input type="search" value={query} onChange={(e) => change('q', e.target.value)} placeholder={content.searchPlaceholder} /></label>
        <label>Event<select value={eventId} onChange={(e) => change('event', e.target.value)}>
          <option value="">All events</option>
          {eventId && !eventMap.has(eventId) && <option value={eventId}>Selected event</option>}
          {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
        </select></label>
      </div>
      {loading ? <div className="gallery-loading" role="status"><span className="sr-only">Loading the archive</span>{[0,1,2].map(item => <div key={item} aria-hidden="true"><div /><span /></div>)}</div> : error ? <div role="alert" className="gallery-empty"><h3>The gallery couldn’t load.</h3><p>Please try again to see the community albums.</p><button className="gallery-retry" onClick={() => { setLoading(true); setError(''); setAttempt(value => value + 1); }}>Try again</button></div> : <>
        <div className="gallery-results"><p role="status">{photos.length} {photos.length === 1 ? 'frame' : 'frames'}{query ? ` matching “${query}”` : ' in view'}</p>{(query || eventId || albumId || category) && <button onClick={clearFilters}>Clear filters</button>}</div>
        {!photos.length && <div className="gallery-empty"><h3>{content.emptyTitle}</h3><p>{query || eventId || albumId || category ? 'Try a different search or clear the filters.' : content.emptyDescription}</p>{(query || eventId || albumId || category) && <button className="gallery-retry" onClick={clearFilters}>Clear filters</button>}</div>}
        <div className="gallery-archive-grid">
          {photos.map((photo, index) => {
            const event = eventMap.get(photo.album.event_id);
            return <button key={`${photo.album.id}-${photo.url}`} onClick={() => openPhoto(photo)} className={`gallery-archive-frame ${photos.length >= 4 && index % 7 === 0 ? 'gallery-archive-feature' : ''}`} aria-label={`View ${photo.caption || photo.album.title}, photo ${photo.index + 1}`}>
              <img loading="lazy" decoding="async" width="1200" height="900" src={photo.url} alt={photo.caption || `${photo.album.title}, photo ${photo.index + 1}`} />
              <span className="gallery-frame-top"><span>{event?.category || photo.album.date || 'Community'}</span><span className="gallery-expand" aria-hidden="true">↗</span></span>
              <span className="gallery-frame-info"><small>{event?.location || photo.album.date}</small><strong>{photo.caption || photo.album.title}</strong>{photo.caption && <span>{photo.album.title}</span>}<span className="gallery-frame-bottom"><span>Frame {String(photo.index + 1).padStart(2, '0')}</span><span>View frame →</span></span></span>
            </button>;
          })}
        </div>
      </>}
    </section>
    {selected && <GalleryLightbox photos={selected.photos} initialIndex={selected.index} events={events} onClose={() => setSelected(null)} />}
  </div>;
}
