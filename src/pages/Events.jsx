import { useState } from "react";
import { upcomingEventsData } from "../data/siteData";
// Omitted SectionWrapper to allow physical layout
import EventCard from "../components/EventCard";
import PastEvents from "../components/PastEvents";

export default function Events() {
  const [openEventId, setOpenEventId] = useState(null);
  const rotations = ["-rotate-3", "rotate-2", "-rotate-[5deg]", "rotate-4", "-rotate-2", "rotate-6", "-rotate-4"];

  return (
    <div className="w-full bg-[#e6e4dc] relative">
      {/* Desk Texture */}
      <div 
         className="fixed inset-0 opacity-[0.05] pointer-events-none z-0" 
         style={{ backgroundImage: 'radial-gradient(#2b2a27 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} 
      />

      {/* ──── UPCOMING TICKETS ──── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 z-10 pt-32 pb-32 text-center">
         <div className="mb-16 inline-block">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-2 block border-b-2 border-dashed border-black/10 pb-2">Schedule</span>
             <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif text-black uppercase tracking-tighter">
               Upcoming Tickets
             </h2>
         </div>
         
         <div className="flex flex-wrap justify-center gap-12 md:gap-16">
           {upcomingEventsData.map((event, i) => {
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
      </section>

      {/* Paper Divider */}
      <div className="w-full max-w-5xl mx-auto border-t-[3px] border-double border-black/10 my-16 relative z-10" />

      {/* ──── PAST EVENTS ALBUM ──── */}
      <PastEvents />

    </div>
  );
}
