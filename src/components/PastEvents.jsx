import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { pastEventsData } from "../data/siteData";
import { FaTimes, FaCameraRetro, FaCalendarAlt } from "react-icons/fa";

export default function PastEvents() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const rotations = ["-rotate-3", "rotate-2", "-rotate-[5deg]", "rotate-4", "-rotate-2", "rotate-6", "-rotate-4"];

  useEffect(() => {
    if (selectedEvent) {
      setCurrentImageIndex(0);
      
      const handleScroll = () => {
        setSelectedEvent(null);
      };
      
      const timeoutId = setTimeout(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (!selectedEvent || !selectedEvent.photos || selectedEvent.photos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % selectedEvent.photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedEvent]);

  const targetRef = useRef(null);
  const contentRef = useRef(null);
  const [scrollRange, setScrollRange] = useState(0);

  // Measure the total scrollable width of the content
  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        setScrollRange(contentRef.current.scrollWidth - window.innerWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange]);

  const dropHeights = ["h-4 sm:h-6", "h-8 sm:h-12", "h-5 sm:h-8", "h-10 sm:h-16", "h-6 sm:h-10", "h-4 sm:h-6", "h-8 sm:h-14"];

  // Section height = content overflow + one viewport (for the sticky screen)
  const sectionHeight = scrollRange + window.innerHeight;

  return (
    <section ref={targetRef} className="relative w-full" style={{ height: `${sectionHeight}px` }}>
      <div className="sticky top-0 h-screen w-full flex flex-col overflow-hidden bg-[#fafafa]">
        
        {/* Page Title - above the wire, below the navbar */}
        <div className="absolute top-24 sm:top-28 md:top-28 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none w-full px-4">
           <div className="inline-block relative">
             <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-serif text-black tracking-tighter bg-white/50 backdrop-blur-md px-4 sm:px-6 py-2 border-2 border-black/10 shadow-sm">
               The Photo Album
             </h2>
             <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 text-black/40 transform -rotate-12">
                <FaCameraRetro className="w-8 h-8 sm:w-12 sm:h-12" />
             </div>
           </div>
        </div>

        {/* The Fixed Horizontal Wire — positioned below the heading */}
        <div className="absolute top-[28vh] sm:top-[28vh] md:top-[28vh] left-0 w-full h-[2px] sm:h-[3px] bg-[#1a1a1a] shadow-[0_3px_8px_rgba(0,0,0,0.25)] z-0" />

        <motion.div 
          ref={contentRef}
          style={{ x }} 
          className="flex items-start gap-6 sm:gap-10 md:gap-14 w-max pl-[5vw] sm:pl-[10vw] pr-[5vw] sm:pr-[10vw] mt-[28vh]"
        >
          {pastEventsData.map((event, i) => {
            const rotationClass = rotations[i % rotations.length];
            const isSelected = selectedEvent?.id === event.id;
            const stringDrop = dropHeights[i % dropHeights.length];

            return (
              <div key={event.id} className="relative flex flex-col items-center shrink-0">
                
                {/* The String hanging from the fixed wire */}
                <div className={`w-[3px] bg-[#333] origin-top shadow-sm ${stringDrop}`} />
                
                {/* The Clip */}
                <div className="w-5 h-8 border-[3px] border-[#222] bg-[#e0e0e0] rounded-sm -mt-2 mb-2 z-10 shadow-md relative" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #b0b0b0 100%)' }}>
                   <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#222] rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
                  onClick={() => setSelectedEvent(event)}
                  className={`group relative bg-white flex-shrink-0 w-[200px] sm:w-[260px] md:w-[300px] lg:w-[340px] h-[260px] sm:h-[320px] md:h-[360px] lg:h-[400px] cursor-pointer transition-all duration-500 overflow-hidden border-[2px] sm:border-[3px] border-black/10 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,0.1)] ${
                    isSelected 
                      ? 'z-50 rotate-0 -translate-y-6 scale-105 shadow-[15px_15px_30px_rgba(0,0,0,0.3)]' 
                      : `z-10 ${rotationClass} hover:shadow-[12px_12px_20px_rgba(0,0,0,0.2)] hover:rotate-0 hover:-translate-y-6 hover:scale-105`
                  }`}
                >
                  {/* DEFAULT CARD COVER */}
                  <div className={`absolute inset-0 p-4 md:p-5 pb-12 flex flex-col transition-opacity duration-300 pointer-events-none ${isSelected ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-full aspect-square bg-[#eaeaea] border-[3px] border-black/10 overflow-hidden filter grayscale contrast-125 saturate-50 group-hover:grayscale-[0.2] transition-all duration-700 relative flex items-center justify-center text-4xl font-bold text-black/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
                      {event.coverImage ? (
                        <img
                          src={event.coverImage}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        event.title.charAt(0)
                      )}
                    </div>
                    
                    <div className="pt-6 pb-2 text-center flex flex-col items-center">
                      <span className="inline-block mb-3 text-[10px] font-black uppercase tracking-[0.2em] bg-black text-white px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,0.2)] font-mono">
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
                        className="absolute inset-0 z-50 bg-[#fffdf5] flex flex-col p-5 overflow-y-auto hide-scrollbar border-[4px] border-black text-left cursor-default pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                          {/* Header */}
                         <div className="border-b-[3px] border-black pb-4 mb-4 sticky top-0 bg-[#fffdf5] z-10 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                              <span className="inline-flex items-center gap-1.5 bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase font-mono shadow-[2px_2px_0px_#000] w-fit">
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
                         <div className="flex flex-col gap-5 flex-1">
                            <p className="text-sm font-bold text-black border-l-[3px] border-black/20 pl-3 leading-relaxed">
                               {event.description}
                            </p>
                            
                            {/* Auto Photo Slider */}
                            <div className="mt-auto flex flex-col pt-4 border-t-[3px] border-black/10">
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
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
