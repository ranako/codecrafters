import DisplayImage from './DisplayImage';
import { useId, useRef, useState, useSyncExternalStore } from 'react';
import { useInView } from 'framer-motion';
import { FaArrowUp, FaPause, FaPlay } from 'react-icons/fa';
import { defaultPresentation, selectReelPhotos } from '../lib/presentationSettings';
import './GalleryReel.css';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;
const getServerReducedMotion = () => true;
function subscribeReducedMotion(callback) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

export default function GalleryReel({ photos, onSelect, settings = defaultPresentation.gallery_reel }) {
  const ref = useRef(null);
  const headingId = useId();
  const inView = useInView(ref);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);
  const [paused, setPaused] = useState(false);
  const items = selectReelPhotos(photos, settings);
  const moving = items.length > 1 && !reducedMotion;
  const rows = moving ? [items, [...items].reverse()] : [items];
  if (!settings.enabled || !items.length) return null;
  return <section ref={ref} className={`gallery-reel ${settings.pauseOnHover ? 'gallery-reel-hover-pause' : ''} ${moving ? 'gallery-reel-moving' : 'gallery-reel-still'}`} aria-label="Community photo reel">
    <div className="gallery-reel-heading">
      <div className="gallery-reel-title"><span className="gallery-reel-mark" aria-hidden="true">CC /</span><h2 id={headingId}>{settings.title}</h2></div>
      <div className="gallery-reel-tools"><span className="gallery-reel-count">{String(items.length).padStart(2, '0')} {items.length === 1 ? 'frame' : 'frames'}</span>
        {moving && <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? <FaPlay aria-hidden="true" /> : <FaPause aria-hidden="true" />}{paused ? 'Resume reel' : 'Pause reel'}</button>}
      </div>
    </div>
    {rows.map((row, rowIndex) => <div key={rowIndex} className="gallery-reel-window" role="group" aria-labelledby={headingId} aria-hidden={rowIndex ? true : undefined}>
      <div className={`gallery-reel-track ${(settings.direction === 'right') !== Boolean(rowIndex) ? 'gallery-reel-reverse' : ''}`} style={{ animationPlayState: paused || !inView ? 'paused' : 'running', animationDuration: `${(Number(settings.speedSeconds) || 48) + rowIndex * 6}s` }}>
        {(moving ? [0, 1] : [0]).map(copy => <div className="gallery-reel-group" key={copy} aria-hidden={copy ? true : undefined}>
          {Array.from({ length: moving ? Math.ceil(6 / row.length) : 1 }, () => row).flat().map((photo, index) => <button type="button" key={`${photo.album.id}-${photo.url}-${index}`} aria-hidden={index >= row.length ? true : undefined} tabIndex={copy || rowIndex || index >= row.length ? -1 : 0} onClick={() => onSelect(photo)} className="gallery-reel-frame" aria-label={`View ${photo.caption || photo.album.title}`}>
            <span className="gallery-reel-image"><DisplayImage src={photo.url} settings={photo.album.photo_display?.[photo.url]} placement="photoReel" alt={copy ? '' : photo.caption || photo.album.title} loading="lazy" /><span className="gallery-reel-open" aria-hidden="true"><FaArrowUp /></span></span>
            <span className="gallery-reel-caption"><span className="gallery-reel-number" aria-hidden="true">{String(index % row.length + 1).padStart(2, '0')}</span><span className="gallery-reel-description"><strong>{photo.caption || photo.album.title}</strong><small>{photo.album.date || photo.album.title}</small></span></span>
          </button>)}
        </div>)}
      </div>
    </div>)}
  </section>;
}
