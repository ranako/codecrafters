import { useEffect, useState } from "react";
// Omitted SectionWrapper to allow physical layout
import EventCard from "../components/EventCard";
import PastEvents from "../components/PastEvents";
import { fetchUpcomingEvents } from "../lib/contentApi";

export default function Events() {
  const [openEventId, setOpenEventId] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const rotations = ["-rotate-3", "rotate-2", "-rotate-[5deg]", "rotate-4", "-rotate-2", "rotate-6", "-rotate-4"];

  useEffect(() => {
    let isMounted = true;

    async function loadUpcomingEvents() {
      try {
        const data = await fetchUpcomingEvents();
        if (!isMounted) return;
        setUpcomingEvents(data);
        setError("");
      } catch (fetchError) {
        if (!isMounted) return;
        setUpcomingEvents([]);
        setError(fetchError.message || "Unable to load upcoming events.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUpcomingEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasUpcomingEvents =
    Array.isArray(upcomingEvents) && upcomingEvents.length > 0;
  const showUpcomingSection =
    hasUpcomingEvents || isLoading || Boolean(error);

  return (
    <div className="w-full bg-[#e6e4dc] relative">
      {/* Desk Texture */}
      <div 
         className="fixed inset-0 opacity-[0.05] pointer-events-none z-0" 
         style={{ backgroundImage: 'radial-gradient(#2b2a27 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} 
      />

      {/* ──── UPCOMING TICKETS ──── */}
      {showUpcomingSection && (
        <>
          <section className="relative w-full max-w-7xl mx-auto px-4 z-10 pt-24 pb-20 text-center">
             <div className="mb-10 inline-block">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-2 block border-b-2 border-dashed border-black/10 pb-2">Schedule</span>
                 <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif text-black uppercase tracking-tighter">
                   Upcoming Tickets
                 </h2>
             </div>
             
             <div className="flex flex-wrap justify-center gap-12 md:gap-16">
               {upcomingEvents.map((event, i) => {
                 const rotationClass = rotations[i % rotations.length];
                 return (
                   <div key={event.id} className={`w-full max-w-lg transition-all duration-300 ${openEventId === event.id ? 'rotate-0 z-50 scale-105' : `${rotationClass} hover:rotate-0 hover:z-50 hover:scale-105`}`}>
                     <EventCard 
                       event={event} 
                       index={i} 
                       isOpen={openEventId === event.id} 
                       onToggle={(open) => setOpenEventId(open ? event.id : null)} 
                     />
                   </div>
                 );
               })}
             </div>
             {isLoading && (
               <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-black/40">
                 Loading upcoming events...
               </p>
             )}
             {error && (
               <p className="mt-8 text-sm font-bold text-red-600">{error}</p>
             )}
          </section>

          {/* Paper Divider */}
          <div className="w-full max-w-5xl mx-auto border-t-[3px] border-double border-black/10 my-16 relative z-10" />
        </>
      )}

      {/* ──── PAST EVENTS ALBUM ──── */}
      <PastEvents />

    </div>
  );
}
