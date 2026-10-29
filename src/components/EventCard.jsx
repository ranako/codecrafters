import DisplayImage from "./DisplayImage";

import { motion as Motion, useReducedMotion } from "framer-motion";
import Countdown from "./Countdown";
import EventModal from "./EventModal";
import { registrationUrl, eventStatus } from "../lib/eventUtils";

export default function EventCard({ event, index, isOpen, onToggle, status = eventStatus(event), appearance = { style: "ticket", animation: "tilt" } }) {
  const reducedMotion = useReducedMotion();
  const noMotion = reducedMotion || appearance.animation === "none";
  const isModalOpen = isOpen;
  const setIsModalOpen = onToggle;
  const url = registrationUrl(event.registration_url);
  const registration = (className) => status === "past" ? <span className="text-xs font-bold">Event ended</span> : url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
      className={className} aria-label={`Register for ${event.title} (opens in a new tab)`}>RSVP Now</a>
  ) : <span className="text-xs font-bold text-black/60">Registration not open</span>;

  return (
    <>
    <Motion.div
        initial={noMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: noMotion ? 0 : 0.5, delay: noMotion ? 0 : index * 0.1 }}
        whileHover={noMotion ? undefined : { y: -6, rotate: appearance.animation === "tilt" ? -1 : 0 }}
        className={`event-card event-card-${appearance.style} ${noMotion ? "event-card-no-motion" : ""} group relative bg-[#f5f3eb] border-2 border-dashed border-black/30 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_40px_-10px_rgba(0,0,0,0.2)] transition-all duration-300 flex flex-col h-full cursor-pointer overflow-hidden ${isModalOpen ? 'z-50' : 'z-10'}`}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Ticket Perforation Holes */}
        <div className="event-ticket-hole absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#e6e4dc] border-r-2 border-dashed border-black/30 transform -translate-y-1/2 z-10" />
        <div className="event-ticket-hole absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#e6e4dc] border-l-2 border-dashed border-black/30 transform -translate-y-1/2 z-10" />
        
        {/* Top Section - Image */}
        {event.image && (
          <div className="event-card-image relative h-48 w-full overflow-hidden bg-[#e0e0e0] filter grayscale contrast-125 saturate-50 group-hover:grayscale-0 group-hover:saturate-100 transition-all duration-700 border-b-2 border-black/10">
            <DisplayImage
              src={event.image} settings={event.image_display} placement="eventCard"
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
            />
            {/* Stamp Overlay */}
            <div className="event-ticket-stamp absolute -bottom-4 -right-4 w-24 h-24 border-4 border-black/30 text-black/30 rounded-full flex items-center justify-center -rotate-12 font-black text-2xl tracking-widest uppercase pointer-events-none">
              Admit
            </div>
          </div>
        )}

        {/* Bottom Section - Details */}
        <div className="p-6 md:p-8 flex-1 flex flex-col relative z-20">
          <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-black text-white">
              {status === "live" ? "LIVE NOW" : status === "past" ? "PAST EVENT" : event.category}
            </span>
            <span className="text-xs font-bold text-black/60 font-mono uppercase">
              {event.date}
            </span>
          </div>

          <h3 className="text-2xl font-black mb-3 transition-colors duration-300 text-black leading-tight tracking-tight font-serif">
            <button type="button" aria-expanded={Boolean(isModalOpen)} onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} className="text-left">{event.title}</button>
          </h3>

          <p className="text-sm leading-relaxed text-black/60 line-clamp-2 flex-1 font-sans font-medium">
            {event.description}
          </p>
          <p className="text-xs font-bold mt-3">{event.time}{event.time ? " · India time" : ""}</p>

          <div 
            className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-black w-full border-t border-black/10 pt-4 gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">Starts In</span>
               {status === "live" ? <span className="text-sm font-black">Live now</span> : status === "past" ? <span className="text-xs font-bold">Event ended</span> : <Countdown startsAt={event.starts_at} targetDate={event.date} targetTime={event.time} small={true} />}
            </div>
            {registration("px-5 py-3 bg-black text-white border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#2b2a27] hover:bg-white hover:text-black text-center")}

          </div>
        </div>


      </Motion.div>
      {isModalOpen && <EventModal event={event} status={status} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
