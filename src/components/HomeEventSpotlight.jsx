import { usePageContent } from '../hooks/usePageContent';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registrationUrl } from '../lib/eventUtils';
import Countdown from './Countdown';
import EventModal from './EventModal';

export default function HomeEventSpotlight({ event }) {
  const content = usePageContent("home").events;
  const [open, setOpen] = useState(false);
  const url = registrationUrl(event.registration_url);
  return <section className="home-event-spotlight" aria-labelledby="home-next-event">
    <div className="home-event-heading"><p className="gallery-eyebrow">{content.spotlightLabel}</p><Link to="/events">{content.allLabel} →</Link></div>
    <div className="home-event-paper">
      <div className="home-event-copy">
        <span className="home-event-label">{content.nextLabel}</span>
        <h2 id="home-next-event"><button onClick={() => setOpen(true)}>{event.title}</button></h2>
        <p>{event.description}</p>
        <div className="home-event-facts"><span>{event.date}</span><span>{event.time} IST</span>{event.location && <span>{event.location}</span>}</div>
        <Countdown startsAt={event.starts_at} targetDate={event.date} targetTime={event.time} small />
        <div className="home-event-actions"><button onClick={() => setOpen(true)}>{content.exploreLabel} →</button>{url && <a href={url} target="_blank" rel="noopener noreferrer">{content.registerLabel} ↗</a>}</div>
      </div>
      {event.image && <button className="home-event-photo" onClick={() => setOpen(true)} aria-label={`Explore ${event.title}`}><img src={event.image} alt={event.title} /></button>}
    </div>
    {open && <EventModal event={event} status="upcoming" onClose={() => setOpen(false)} />}
  </section>;
}
