import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaMapMarkerAlt, FaClock, FaUserTie } from "react-icons/fa";

function Countdown({ targetDate, small, theme="light" }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    // Append a time if missing, to ensure accurate countdown
    const target = new Date(`${targetDate} 23:59:59`).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      } else {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isDark = theme === "dark";

  const boxClasses = small 
    ? isDark
      ? "bg-white/10 text-white p-1 min-w-[2rem] rounded border border-white/20"
      : "bg-black text-white p-1 min-w-[2rem] shadow-[1px_1px_0px_rgba(0,0,0,0.3)] border border-black/20"
    : isDark
      ? "bg-white/10 text-white p-2 min-w-[4rem] rounded-xl border border-white/20 backdrop-blur-sm"
      : "bg-black text-white p-2 min-w-[3rem] shadow-[2px_2px_0px_rgba(0,0,0,0.3)] border border-black/20";
      
  const numClasses = small ? "text-base font-black leading-none" : "text-2xl md:text-3xl font-black";
  
  const labelClasses = small 
    ? "text-[8px] mt-0.5 uppercase tracking-widest text-white/50" 
    : isDark 
      ? "text-[9px] md:text-[11px] mt-1 uppercase tracking-widest text-white/50"
      : "text-[8px] md:text-[10px] mt-0.5 uppercase tracking-widest text-white/50";

  return (
    <div className={`flex ${small ? 'gap-1' : 'gap-3'} font-mono text-center`}>
      <div className={boxClasses}>
        <div className={numClasses}>{timeLeft.d}</div>
        <div className={labelClasses}>Days</div>
      </div>
      <div className={boxClasses}>
        <div className={numClasses}>{timeLeft.h}</div>
        <div className={labelClasses}>Hrs</div>
      </div>
      <div className={boxClasses}>
        <div className={numClasses}>{timeLeft.m}</div>
        <div className={labelClasses}>Min</div>
      </div>
      <div className={boxClasses}>
        <div className={numClasses}>{timeLeft.s}</div>
        <div className={labelClasses}>Sec</div>
      </div>
    </div>
  );
}

export default function EventCard({ event, index, isOpen, onToggle }) {
  const isModalOpen = isOpen;
  const setIsModalOpen = onToggle;
  const [isRegistered, setIsRegistered] = useState(false);

  // Close modal on scroll instead of preventing background scrolling
  useEffect(() => {
    if (isModalOpen) {
      const handleScroll = () => {
        setIsModalOpen(false);
      };
      
      const timeoutId = setTimeout(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isModalOpen, setIsModalOpen]);

  const handleRegister = () => {
     setIsRegistered(true);
     // Auto reset visual for demonstration purposes
     setTimeout(() => setIsRegistered(false), 5000);
  }

  return (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -6, rotate: "-1deg" }}
        className={`group relative bg-[#fffdf5] border-2 border-dashed border-black/30 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_40px_-10px_rgba(0,0,0,0.2)] transition-all duration-300 flex flex-col h-full cursor-pointer overflow-hidden ${isModalOpen ? 'z-50' : 'z-10'}`}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Ticket Perforation Holes */}
        <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#fafafa] border-r-2 border-dashed border-black/30 transform -translate-y-1/2 z-10" />
        <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#fafafa] border-l-2 border-dashed border-black/30 transform -translate-y-1/2 z-10" />
        
        {/* Top Section - Image */}
        {event.image && (
          <div className="relative h-48 w-full overflow-hidden bg-[#e0e0e0] filter grayscale contrast-125 saturate-50 group-hover:grayscale-0 group-hover:saturate-100 transition-all duration-700 border-b-2 border-black/10">
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
            />
            {/* Stamp Overlay */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-4 border-black/30 text-black/30 rounded-full flex items-center justify-center -rotate-12 font-black text-2xl tracking-widest uppercase pointer-events-none">
              Admit
            </div>
          </div>
        )}

        {/* Bottom Section - Details */}
        <div className="p-6 md:p-8 flex-1 flex flex-col relative z-20">
          <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-black text-white">
              {event.category}
            </span>
            <span className="text-xs font-bold text-black/60 font-mono uppercase">
              {event.date}
            </span>
          </div>

          <h3 className="text-2xl font-black mb-3 transition-colors duration-300 text-black leading-tight tracking-tight font-serif">
            {event.title}
          </h3>

          <p className="text-sm leading-relaxed text-black/60 line-clamp-2 flex-1 font-sans font-medium">
            {event.description}
          </p>

          <div 
            className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-black w-full border-t border-black/10 pt-4 gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">Starts In</span>
               <Countdown targetDate={event.date} small={true} />
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleRegister();
              }}
              className={`px-5 py-2.5 font-black uppercase tracking-[0.1em] text-xs shadow-[3px_3px_0px_#000] border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all w-full sm:w-auto text-center flex items-center justify-center ${
                 isRegistered ? "bg-white text-black font-bold outline-dashed outline-2 outline-offset-[-4px]" : "bg-black text-white"
              }`}
            >
              {isRegistered ? "Registered ✓" : "RSVP Now"}
            </button>
          </div>
        </div>

        {/* IN-CARD OVERLAY */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-50 bg-[#fffdf5] flex flex-col p-5 overflow-y-auto hide-scrollbar border-[4px] border-black"
            >
               {/* Header */}
               <div className="flex justify-between items-start mb-4 border-b-[3px] border-black pb-4 sticky top-0 bg-[#fffdf5] z-10">
                  <h3 className="text-xl font-black font-serif uppercase leading-tight line-clamp-3 pr-2">
                    {event.title}
                  </h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                    className="w-8 h-8 shrink-0 bg-white border-2 border-black hover:bg-black hover:text-white flex items-center justify-center transition-colors text-black font-black text-lg shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  >
                    <FaTimes />
                  </button>
               </div>

               {/* Content */}
               <div className="flex flex-col gap-4 flex-1">
                  <p className="text-sm font-bold text-black border-l-[3px] border-black/20 pl-3 leading-relaxed">
                     {event.description}
                  </p>
                  
                  {event.speakers && event.speakers.length > 0 && (
                     <div className="font-mono text-[10px] font-bold uppercase bg-white border-2 border-black p-2 shadow-[2px_2px_0px_#000]">
                        <span className="opacity-50 block mb-1">Speakers:</span>
                        {event.speakers.join(", ")}
                     </div>
                  )}

                  <div className="mt-auto border-t-[3px] border-black/10 pt-4 flex flex-col gap-3">
                     <div className="flex justify-between items-center w-full bg-white border-2 border-black px-2 py-1.5 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
                        <span className="font-mono text-[10px] font-black uppercase text-black/50">T-MINUS</span>
                        <Countdown targetDate={event.date} small={true} theme="light" />
                     </div>
                     
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleRegister(); }}
                       className={`w-full py-3 font-black uppercase tracking-widest shadow-[3px_3px_0px_#000] border-[3px] border-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xs ${
                          isRegistered ? "bg-white text-black border-dashed" : "bg-black hover:bg-white hover:text-black text-white shadow-[inset_0_0_0_0_#000] hover:shadow-[inset_0_0_0_2px_#000]"
                       }`}
                     >
                       {isRegistered ? "Ticket Secured ✓" : "Confirm RSVP ->"}
                     </button>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
}
