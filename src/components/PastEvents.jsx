import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pastEventsData } from "../data/siteData";
import { FaTimes, FaCameraRetro, FaCalendarAlt } from "react-icons/fa";

export default function PastEvents() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const rotations = ["-rotate-3", "rotate-2", "-rotate-[5deg]", "rotate-4", "-rotate-2", "rotate-6", "-rotate-4"];

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = "hidden";
      setCurrentImageIndex(0);
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (!selectedEvent || !selectedEvent.photos || selectedEvent.photos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % selectedEvent.photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedEvent]);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 text-center">
      
      <div className="mb-20 inline-block relative">
         <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif text-black tracking-tighter">
           The Photo Album
         </h2>
         <div className="absolute -bottom-6 -right-12 text-black/20 transform -rotate-12">
            <FaCameraRetro size={48} />
         </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8 md:gap-12 px-4 md:px-12">
        {pastEventsData.map((event, i) => {
          const rotationClass = rotations[i % rotations.length];
          const isSelected = selectedEvent?.id === event.id;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, type: "spring" }}
              onClick={() => setSelectedEvent(event)}
              className={`group relative bg-white shadow-[0_15px_35px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_45px_65px_-15px_rgba(0,0,0,0.3)] flex-shrink-0 w-[300px] sm:w-[340px] md:w-[380px] h-[380px] sm:h-[420px] md:h-[460px] cursor-pointer ${rotationClass} hover:rotate-0 hover:-translate-y-6 hover:scale-105 border border-black/5 transition-all duration-500 overflow-hidden ${isSelected ? 'z-50' : 'z-10'}`}
            >
              {/* DEFAULT CARD COVER */}
              <div className={`absolute inset-0 p-4 md:p-5 pb-12 flex flex-col transition-opacity duration-300 pointer-events-none ${isSelected ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/40 backdrop-blur-md shadow-sm border border-black/10 -rotate-[3deg] opacity-90 z-20" />

                <div className="w-full aspect-square bg-[#eaeaea] overflow-hidden filter grayscale contrast-125 saturate-50 group-hover:grayscale-0 group-hover:saturate-100 transition-all duration-700 relative border border-black/5 flex items-center justify-center text-4xl font-bold text-black/10">
                  {event.coverImage ? (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    event.title.charAt(0)
                  )}
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
                </div>
                
                <div className="pt-6 pb-2 text-center flex flex-col items-center">
                  <span className="inline-block mb-3 text-[10px] font-black uppercase tracking-[0.2em] bg-black text-white px-2 py-1 shadow-sm font-mono">
                    {event.date}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-black leading-[1.1] font-serif uppercase tracking-tight">
                    {event.title}
                  </h3>
                </div>
              </div>

              {/* IN-CARD OVERLAY */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 z-50 bg-[#f8f9fa] flex flex-col p-4 overflow-y-auto hide-scrollbar border-[4px] border-black text-left cursor-default pointer-events-auto"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                  >
                      {/* Header */}
                     <div className="border-b-[3px] border-black pb-3 mb-3 sticky top-0 bg-[#f8f9fa] z-10 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase font-mono shadow-[2px_2px_0px_#000] w-fit">
                            <FaCalendarAlt className="text-black/50" /> {event.date}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(null); }}
                            className="w-8 h-8 shrink-0 bg-white border-2 border-black hover:bg-black hover:text-white flex items-center justify-center transition-colors text-black font-black text-lg shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                          >
                            <FaTimes />
                          </button>
                        </div>
                        <h3 className="text-xl font-black text-black leading-none tracking-tight uppercase font-serif line-clamp-2">
                          {event.title}
                        </h3>
                     </div>

                     {/* Content */}
                     <div className="flex flex-col gap-4 flex-1">
                        <p className="text-sm font-bold text-black border-l-[3px] border-black pl-3 leading-relaxed">
                           {event.description}
                        </p>
                        
                        {/* Auto Photo Slider */}
                        <div className="mt-auto flex flex-col pt-2 border-t-[3px] border-black/10">
                           <span className="text-[10px] font-black uppercase tracking-widest text-black/50 block mb-2">
                             Event Gallery <span className="text-black bg-black/10 px-1 ml-1">{currentImageIndex + 1}/{event.photos.length}</span>
                           </span>
                           
                           {/* Slider Container */}
                           <div className="w-full relative aspect-[4/3] bg-white border-[3px] border-black shadow-[4px_4px_0px_#000] overflow-hidden flex flex-col group mt-1">
                             
                             <div className="flex-1 w-full bg-black relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                  <motion.img
                                    key={currentImageIndex}
                                    src={event.photos[currentImageIndex]}
                                    alt={`${event.title} photo ${currentImageIndex + 1}`}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                                  />
                                </AnimatePresence>
                             </div>
                             
                             {/* Pagination & Frame details */}
                             <div className="h-8 bg-black/5 border-t-[3px] border-black flex items-center justify-between px-3 relative z-10 shrink-0">
                                <span className="font-mono font-bold text-[10px] uppercase">IMG_00{currentImageIndex + 1}</span>
                                
                                <div className="flex gap-1.5">
                                  {event.photos.map((_, dotIdx) => (
                                    <button 
                                      key={dotIdx}
                                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(dotIdx); }}
                                      className={`w-2 h-2 rounded-full border border-black transition-all ${dotIdx === currentImageIndex ? 'bg-black scale-125' : 'bg-transparent hover:bg-black/50'}`}
                                      aria-label={`Go to slide ${dotIdx + 1}`}
                                    />
                                  ))}
                                </div>
                             </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
