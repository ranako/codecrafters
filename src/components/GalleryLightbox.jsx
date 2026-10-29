import DisplayImage from "./DisplayImage";
import { useEffect, useRef, useState } from 'react';

export default function GalleryLightbox({ photos, initialIndex, events, onClose }) {
  const dialog = useRef(null);
  const closeButton = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const [shareState, setShareState] = useState('');
  const active = photos[index];
  const event = events.find((item) => item.id === active.album.event_id);
  useEffect(() => {
    const node = dialog.current;
    const document = node.ownerDocument;
    const previous = document.activeElement;
    node.showModal();
    closeButton.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { node.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const advance = (direction) => { setIndex((current) => (current + direction + photos.length) % photos.length); setShareState(''); };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(active.url); setShareState('Image link copied'); }
    catch { setShareState('Could not copy. Use Open original instead.'); }
  };
  return <dialog ref={dialog} className="gallery-cinema" aria-labelledby="gallery-photo-title"
    onCancel={(e) => { e.preventDefault(); onClose(); }}
    onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); advance(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); advance(-1); } }}>
    <header className="gallery-cinema-header">
      <div><span className="gallery-frame-counter" aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span><span className="gallery-cinema-date">{active.album.date}</span></div>
      <div className="gallery-cinema-actions">
        <button onClick={copyLink}>Copy image link</button>
        <a href={active.url} target="_blank" rel="noopener noreferrer">Open original ↗</a>
        <button ref={closeButton} autoFocus onClick={onClose} aria-label="Close gallery viewer" className="gallery-cinema-close">✕</button>
      </div>
    </header>
    <div className="gallery-cinema-stage">
      <button className="gallery-photo-prev" onClick={() => advance(-1)} disabled={photos.length < 2} aria-label="Previous photo">←</button>
      <DisplayImage src={active.url} settings={active.album.photo_display?.[active.url]} placement="photoViewer" alt={active.caption || `${active.album.title}, photo ${active.index + 1}`} />
      <button className="gallery-photo-next" onClick={() => advance(1)} disabled={photos.length < 2} aria-label="Next photo">→</button>
    </div>
    <footer className="gallery-cinema-footer">
      <div><p className="gallery-eyebrow">{event?.category || 'Community archive'}</p><h2 id="gallery-photo-title">{active.caption || active.album.title}</h2><p>{active.caption ? active.album.title : active.album.description}</p><p role="status">{shareState}</p></div>
      {event && <details className="gallery-event-context"><summary>Event details</summary><strong>{event.title}</strong><p>{event.date} · {event.time}</p><p>{event.location}</p><p>{event.description}</p></details>}
    </footer>
  </dialog>;
}
