import { usePageContent } from "../hooks/usePageContent";
import { useState, useEffect, useRef } from "react";
import { motion as Motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { FaCameraRetro } from "react-icons/fa";
import AlbumViewer from "./AlbumViewer";
import { fetchPastEventAlbums } from "../lib/contentApi";

export default function PastEvents() {
  const content = usePageContent("events").intro;
  const [selectedEvent, setSelectedEvent] = useState(null);
  const reducedMotion = useReducedMotion();
  const [stageHeight, setStageHeight] = useState(680);
  const [compact, setCompact] = useState(window.innerWidth < 768);
  const [pastEvents, setPastEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const rotations = ["-rotate-3", "rotate-2", "-rotate-[5deg]", "rotate-4", "-rotate-2", "rotate-6", "-rotate-4"];

  useEffect(() => {
    let isMounted = true;

    async function loadPastEvents() {
      try {
        const data = await fetchPastEventAlbums();
        if (!isMounted) return;
        setPastEvents(data);
        setError("");
      } catch (fetchError) {
        if (!isMounted) return;
        setPastEvents([]);
        setError(fetchError.message || "Unable to load the photo album.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPastEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const targetRef = useRef(null);
  const contentRef = useRef(null);
  const [scrollRange, setScrollRange] = useState(0);

  // Measure the total scrollable width of the content
  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        setScrollRange(Math.max(0, contentRef.current.scrollWidth - window.innerWidth));
        setStageHeight(Math.ceil(window.innerHeight * 0.24 + contentRef.current.offsetHeight + 48));
        setCompact(window.innerWidth < 768);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (contentRef.current) observer.observe(contentRef.current);
    window.addEventListener("resize", measure);
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange]);

  const dropHeights = ["h-4 sm:h-6", "h-8 sm:h-12", "h-5 sm:h-8", "h-10 sm:h-16", "h-6 sm:h-10", "h-4 sm:h-6", "h-8 sm:h-14"];

  // Only reserve the height needed by the hanging cards and horizontal travel.
  const naturalScroll = compact || reducedMotion || !pastEvents.length;
  const sectionHeight = naturalScroll ? "auto" : `${scrollRange + stageHeight}px`;

  return (
    <section id="photo-albums" ref={targetRef} className={`relative w-full ${naturalScroll ? "album-natural" : ""}`} style={{ height: sectionHeight }}>
      {selectedEvent && <AlbumViewer album={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      <div className="sticky top-0 w-full flex flex-col overflow-hidden bg-[#e6e4dc]" style={{ height: naturalScroll ? undefined : stageHeight }}>

        {/* Page Title - above the wire, below the navbar */}
        <div className="absolute top-20 sm:top-24 md:top-24 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none w-full px-4">
           <div className="inline-block relative">
             <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-serif text-black tracking-tighter bg-white/50 backdrop-blur-md px-4 sm:px-6 py-2 border-2 border-black/10 shadow-sm">
               {content.pastTitle}
             </h2>
             <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 text-black/40 transform -rotate-12">
                <FaCameraRetro className="w-8 h-8 sm:w-12 sm:h-12" />
             </div>
           </div>
        </div>

        {/* The Fixed Horizontal Wire — positioned below the heading */}
        <div className="absolute top-[24vh] sm:top-[24vh] md:top-[24vh] left-0 w-full h-[2px] sm:h-[3px] bg-[#1a1a1a] shadow-[0_3px_8px_rgba(0,0,0,0.25)] z-0" />

        <Motion.div
          ref={contentRef}
          style={{ x: naturalScroll ? 0 : x }}
          className="flex items-start gap-6 sm:gap-10 md:gap-14 w-max pl-[5vw] sm:pl-[10vw] pr-[5vw] sm:pr-[10vw] mt-[24vh]"
        >
          {pastEvents.map((event, i) => {
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

                <Motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
                  role="button" tabIndex={0} aria-label={`View ${event.title} photo album`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedEvent(event); } }}
                  onClick={() => setSelectedEvent(event)}
                  className={`group relative bg-white flex-shrink-0 w-[200px] sm:w-[260px] md:w-[300px] lg:w-[340px] h-[260px] sm:h-[320px] md:h-[360px] lg:h-[400px] cursor-pointer transition-all duration-500 overflow-hidden border-[2px] sm:border-[3px] border-black/10 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,0.1)] ${
                    isSelected
                      ? 'z-50 rotate-0 -translate-y-6 scale-105 shadow-[15px_15px_30px_rgba(0,0,0,0.3)]'
                      : `z-10 ${rotationClass} hover:shadow-[12px_12px_20px_rgba(0,0,0,0.2)] hover:rotate-0 hover:-translate-y-6 hover:scale-105`
                  }`}
                >
                  {/* DEFAULT CARD COVER */}
                  <div className={`absolute inset-0 p-4 md:p-5 pb-12 flex flex-col transition-opacity duration-300 pointer-events-none opacity-100`}>
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

                </Motion.div>
              </div>
            );
          })}
        </Motion.div>
        {isLoading && (
          <div className="absolute inset-x-0 bottom-16 text-center z-20">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-black/40">
              Loading photo album...
            </p>
          </div>
        )}
        {error && (
          <div className="absolute inset-x-0 bottom-16 text-center z-20">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}
        {!isLoading && !error && pastEvents.length === 0 && (
          <div className="absolute inset-x-0 bottom-16 text-center z-20">
            <p className="text-sm font-bold text-black/50">
              Albums will appear here once they are published.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
