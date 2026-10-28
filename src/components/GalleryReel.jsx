import { useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { defaultPresentation, selectReelPhotos } from '../lib/presentationSettings';

export default function GalleryReel({ photos, onSelect, settings = defaultPresentation.gallery_reel }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const items = selectReelPhotos(photos, settings);
  if (!settings.enabled || !items.length) return null;
  return <section ref={ref} className={`gallery-reel ${settings.pauseOnHover ? "gallery-reel-hover-pause" : ""}`} aria-label="Community photo reel">
    <div className="gallery-reel-heading">
      <span><span className="gallery-live-dot" /> {settings.title}</span>
      {!reducedMotion && items.length > 1 && <button onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? 'Resume reel' : 'Pause reel'}</button>}
    </div>
    {[items, [...items].reverse()].map((row, rowIndex) => <div className="gallery-reel-window" key={rowIndex}>
      <div className={`gallery-reel-track ${(settings.direction === 'right') !== Boolean(rowIndex) ? 'gallery-reel-reverse' : ''} ${reducedMotion || items.length < 2 ? 'gallery-reel-static' : ''}`} style={{ animationPlayState: paused || !inView ? 'paused' : 'running', animationDuration: `${(Number(settings.speedSeconds) || 48) + rowIndex * 6}s` }}>
        {[0, 1].map((copy) => <div className="gallery-reel-group" key={copy} aria-hidden={copy ? true : undefined}>
          {row.map((photo) => <button key={`${photo.album.id}-${photo.url}`} tabIndex={copy ? -1 : 0} onClick={() => onSelect(photo)} className="gallery-reel-frame" aria-label={`View ${photo.caption || photo.album.title}`}>
            <img src={photo.url} alt={copy ? '' : photo.caption || photo.album.title} loading="lazy" />
            <span className="gallery-reel-caption"><small>{photo.album.date}</small><strong>{photo.caption || photo.album.title}</strong></span>
          </button>)}
        </div>)}
      </div>
    </div>)}
  </section>;
}
