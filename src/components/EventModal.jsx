import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { registrationUrl } from '../lib/eventUtils';
import Countdown from './Countdown';

export default function EventModal({ event, status, onClose }) {
  const dialog = useRef(null);
  const close = useRef(null);
  const url = registrationUrl(event.registration_url);
  useEffect(() => {
    const previous = document.activeElement;
    const node = dialog.current;
    const scrollY = window.scrollY;
    const saved = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow };
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    node.showModal();
    close.current?.focus();
    return () => {
      node.close();
      Object.assign(document.body.style, saved);
      const behavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY);
      previous?.focus({ preventScroll: true });
      document.documentElement.style.scrollBehavior = behavior;
    };
  }, []);
  return createPortal(<dialog ref={dialog} className="event-detail-modal" aria-labelledby="event-detail-title"
    onCancel={(e) => { e.preventDefault(); onClose(); }}
    onClick={(e) => { if (e.target === e.currentTarget) { const box = e.currentTarget.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) onClose(); } }}>
    <button ref={close} type="button" onClick={onClose} className="event-modal-close" aria-label="Close event details">✕</button>
    <div className="event-modal-layout">
      {event.image && <div className="event-modal-image"><img src={event.image} alt={event.title} /></div>}
      <div className="event-modal-copy">
        <p className="gallery-eyebrow">{status === 'live' ? 'Live now' : status === 'past' ? 'Past event' : 'Upcoming event'}{event.category ? ` / ${event.category}` : ''}</p>
        <h2 id="event-detail-title">{event.title}</h2>
        <dl className="event-detail-facts">
          <div><dt>Date</dt><dd>{event.date || 'To be confirmed'}</dd></div>
          <div><dt>Time</dt><dd>{event.time ? `${event.time} IST` : 'To be confirmed'}</dd></div>
          <div><dt>Location</dt><dd>{event.location || 'To be confirmed'}</dd></div>
        </dl>
        <p className="event-modal-description">{event.description}</p>
        {event.speakers?.length > 0 && <div className="event-modal-speakers"><h3>Speakers</h3><ul>{event.speakers.map((speaker, index) => <li key={`${speaker}-${index}`}>{speaker}</li>)}</ul></div>}
        <div className="event-modal-countdown">{status === 'upcoming' ? <Countdown startsAt={event.starts_at} targetDate={event.date} targetTime={event.time} small /> : <strong>{status === 'live' ? 'This event is live' : status === 'past' ? 'This event has ended' : 'Schedule to be confirmed'}</strong>}</div>
        <div className="event-modal-actions">
          {url && status !== 'past' ? <a href={url} target="_blank" rel="noopener noreferrer">Register for this event ↗</a> : <span>{status === 'past' ? 'Registration closed' : 'Registration not open'}</span>}
          {event.id && !event.id.startsWith("temp-") && <Link to={`/gallery?event=${encodeURIComponent(event.id)}`} onClick={onClose}>Event gallery →</Link>}
        </div>
      </div>
    </div>
  </dialog>, document.body);
}
