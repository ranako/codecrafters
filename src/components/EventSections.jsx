import { usePageContent } from '../hooks/usePageContent';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents, fetchPastEventAlbums } from '../lib/contentApi';
import { eventStart, eventStatus } from '../lib/eventUtils';
import HomeEventSpotlight from "./HomeEventSpotlight";
import { usePresentationSettings } from "../hooks/usePresentationSettings";
import EventCard from './EventCard';

export default function EventSections({ preview = false }) {
  const content = usePageContent("events").intro;
  const homeContent = usePageContent("home").events;
  const presentation = usePresentationSettings();
  const [events, setEvents] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let active = true;
    const load = () => {
      Promise.all([fetchEvents(), fetchPastEventAlbums()]).then(([nextEvents, nextAlbums]) => {
        if (active) { setEvents(nextEvents); setAlbums(nextAlbums); setError(''); }
      }).catch(() => { if (active) setError('Events could not be loaded. Please try again.'); })
        .finally(() => { if (active) setLoading(false); });
    };
    load();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    window.addEventListener('focus', load);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', load); };
  }, []);
  const statuses = preview ? ['live', 'upcoming'] : ['live', 'upcoming', 'past', 'unscheduled'];
  return <div className={`w-full relative z-10 ${preview ? 'py-12' : 'pt-28 pb-8'}`}>
    {!preview && <h1 className="text-4xl md:text-5xl font-black font-serif text-center mb-12">{content.title}</h1>}
    {loading && <p role="status" className="text-center py-8">Loading events…</p>}
    {error && <p role="alert" className="text-center text-red-700 py-8">{error}</p>}
    {!loading && !error && statuses.map((status) => {
      const matching = events.filter((event) => eventStatus(event, now) === status)
        .sort((a, b) => status === 'past' ? (eventStart(b) || 0) - (eventStart(a) || 0) : (eventStart(a) || 0) - (eventStart(b) || 0));
      if (!matching.length && status !== 'upcoming') return null;
      if (preview && status === "upcoming" && matching.length) return <HomeEventSpotlight key={status} event={matching[0]} />;
      return <section key={status} aria-labelledby={`events-${status}`} className="max-w-7xl mx-auto px-6 mb-12">
        <h2 id={`events-${status}`} className="text-3xl font-black font-serif text-center mb-8">{status === 'live' ? content.live : status === 'past' ? content.past : status === 'unscheduled' ? content.unscheduled : content.upcoming}</h2>
        {!matching.length && <p className="text-center font-semibold text-black/60">{content.empty}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {matching.slice(0, preview ? 2 : matching.length).map((event, index) => <div key={event.id}>
            <EventCard appearance={presentation.event_cards} event={event} index={index} status={status} isOpen={openId === event.id} onToggle={(open) => setOpenId(open ? event.id : null)} />
            {albums.some((album) => album.event_id === event.id) && <Link className="inline-block mt-4 font-bold underline" to={`/gallery?event=${encodeURIComponent(event.id)}`}>{content.eventPhotosLabel}</Link>}
          </div>)}
        </div>
      </section>;
    })}
    {preview && <div className="text-center"><Link to={homeContent.buttonLink} className="inline-block border-2 border-black bg-white px-6 py-3 font-bold hover:bg-black hover:text-white">{homeContent.buttonLabel}</Link></div>}
  </div>;
}
