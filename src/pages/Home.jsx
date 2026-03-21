import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { heroData, domains, aboutData, upcomingEventsData } from "../data/siteData";
// Utilizing existing components but forcing them into physical metaphors where possible
import EventCard from "../components/EventCard";
import ClubLife from "../components/ClubLife";
import TestimonialsMarquee from "../components/TestimonialsMarquee";
import { FaArrowRight, FaUsers, FaCalendarAlt, FaLaptopCode } from "react-icons/fa";

export default function Home() {
  const [openEventId, setOpenEventId] = useState(null);
  const rotations = [
    "-rotate-3",
    "rotate-2",
    "-rotate-[5deg]",
    "rotate-4",
    "-rotate-2",
    "rotate-6",
    "-rotate-4",
  ];

  return (
    <div className="min-h-screen w-full bg-[#e6e4dc] relative overflow-hidden flex flex-col items-center">
      
      {/* Desk Texture */}
      <div 
         className="absolute inset-0 opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#2b2a27 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} 
      />

      {/* ──── HERO DESK ──── */}
      <section className="relative min-h-[90vh] w-full flex flex-col items-center justify-center pt-32 pb-20 z-10 overflow-hidden">
        
        <div className="relative max-w-5xl mx-auto px-4 text-center">
           
           {/* Badge */}
           <motion.div
             initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
             animate={{ opacity: 1, scale: 1, rotate: -3 }}
             transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
             className="inline-block px-4 py-2 bg-black text-white font-black uppercase tracking-widest text-xs md:text-sm shadow-sm relative z-20 mb-8 border border-white/20"
           >
             {heroData.badge}
             <div className="absolute -top-2 left-2 w-8 h-4 bg-white/20 blur-[1px] -rotate-6" />
           </motion.div>

           {/* Giant Stamped Typography */}
           <motion.h1
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black text-black leading-[0.9] tracking-tighter uppercase mb-6"
           >
             BUILDING A CULTURE OF <br/>
             <span className="text-white bg-black px-4 inline-block transform -rotate-1 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] border-2 border-transparent ml-2 mt-2">
               CODE & COLLAB
             </span>
           </motion.h1>

           <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.4 }}
             className="max-w-2xl mx-auto mt-10 text-lg md:text-xl font-bold text-black/50 font-sans leading-relaxed"
           >
             {heroData.subtitle}
           </motion.p>
           
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6"
           >
             <Link to="/about" className="group flex items-center gap-2 px-8 py-4 bg-black text-white font-black uppercase tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.15)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                {heroData.cta} <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link to="/contact" className="group flex items-center gap-2 px-8 py-4 bg-white border-2 border-solid border-black text-black font-black uppercase tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all outline-dashed outline-2 outline-offset-4 outline-black/30">
                {heroData.ctaSecondary}
             </Link>
           </motion.div>
        </div>

        {/* Scattered Domain Stickers */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
           {domains.map((d, i) => {
              const isLeft = i % 2 === 0;
              const topPos = 20 + (i * 15);
              const leftPos = isLeft ? 10 + (i * 2) : 80 - (i * 2);
              const rotation = rotations[i % rotations.length];

              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.15, zIndex: 50, rotate: "0deg" }}
                  transition={{ type: "spring", delay: 0.8 + (i * 0.1) }}
                  key={d.name}
                  className={`pointer-events-auto absolute flex items-center gap-2 px-4 py-3 bg-white border border-black shadow-[0_5px_15px_-5px_rgba(0,0,0,0.15)] text-black font-bold text-sm tracking-wide ${rotation} cursor-pointer hover:shadow-2xl transition-all duration-300`}
                  style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                >
                  <d.icon size={16} className="text-black/60" />
                  {d.name}
                </motion.div>
              );
           })}
        </div>
      </section>

      {/* ──── ABOUT PREVIEW (Scattered Post-its) ──── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 py-24 z-10 text-center">
         <h2 className="text-xs font-black uppercase tracking-[0.4em] text-black/20 mb-16 border-b-2 border-dashed border-black/10 pb-4 inline-block">Our Core Values</h2>
         
         <div className="flex flex-wrap justify-center gap-8 md:gap-16">
           {aboutData.values.map((v, i) => {
             const rotationClass = rotations[(i+2) % rotations.length];
             const color = "bg-white";

             return (
               <motion.div
                 key={v.title}
                 initial={{ opacity: 0, y: 50 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 className={`relative w-[280px] md:w-[320px] p-8 ${color} shadow-[0_15px_30px_-5px_rgba(0,0,0,0.15)] hover:shadow-2xl ${rotationClass} hover:rotate-0 hover:z-50 hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center text-center`}
               >
                 {/* Post it shadow/fold effect */}
                 <div className="absolute bottom-0 right-0 w-8 h-8 bg-black/5" style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} />

                 <div className="w-14 h-14 rounded-full border-2 border-black/10 flex items-center justify-center mb-6 bg-white/50 text-black shadow-sm">
                   <v.icon size={22} />
                 </div>
                 
                 <h3 className="text-xl md:text-2xl font-black text-black tracking-tight mb-4 font-serif">{v.title}</h3>
                 <p className="text-sm font-bold text-black/60 leading-relaxed font-sans">{v.description}</p>
                 
               </motion.div>
             )
           })}
         </div>
      </section>

      {/* ──── HIGHLIGHTS (Ripped Paper Stats) ──── */}
      <section className="relative w-full py-16 z-10">
         <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-12">
            {[
              { icon: <FaUsers size={24} />, value: "1500+", label: "Community Members" },
              { icon: <FaCalendarAlt size={24} />, value: "20+", label: "Events Conducted" },
              { icon: <FaLaptopCode size={24} />, value: "5+", label: "Tech Domains" },
            ].map((stat, i) => {
               const rotationClass = rotations[(i+4) % rotations.length];
               return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className={`relative bg-white border-2 border-black/5 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] p-8 w-[220px] md:w-[260px] flex flex-col items-center ${rotationClass} hover:rotate-0 hover:scale-110 transition-all duration-300 text-black`}
                  >
                     {/* Faux ripped tape on top */}
                     <div className="absolute -top-3 w-16 h-6 bg-white/60 backdrop-blur-sm border border-black/10 shadow-sm -rotate-2" />
                     
                     <div className="mb-4 text-black/30 bg-black/5 p-4 rounded-full">{stat.icon}</div>
                     <div className="text-4xl md:text-5xl font-black tracking-tighter mb-2 font-serif">{stat.value}</div>
                     <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-black/40 text-center">{stat.label}</div>
                  </motion.div>
               )
            })}
         </div>
      </section>

      <div className="w-full max-w-4xl mx-auto border-t-2 border-dashed border-black/10 my-16" />

      {/* ──── CLUB LIFE GALLARY (Temporary Wrapper) ──── */}
      <div className="w-full max-w-7xl mx-auto">
         <ClubLife />
      </div>

      {/* ──── TESTIMONIALS (Temporary Wrapper) ──── */}
      <div className="w-full py-16 my-20 border-y-2 border-black/5">
        <h2 className="text-center text-xs font-black uppercase tracking-[0.4em] text-black/30 mb-12">Club Feedback</h2>
        <TestimonialsMarquee />
      </div>

      {/* ──── EVENTS PREVIEW DESK ──── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 py-16 z-10 text-center mb-20">
         <h2 className="text-xs font-black uppercase tracking-[0.4em] text-black/30 mb-16 border-b-2 border-dashed border-black/10 pb-4 inline-block">Upcoming Tickets</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 place-items-center">
           {upcomingEventsData.slice(0, 2).map((e, i) => {
              // Wrap the standard event card in a rotated scrapbook aesthetic
              return (
                 <motion.div key={e.id} className={`cursor-pointer transition-all duration-300 w-full max-w-lg bg-white p-4 shadow-xl border border-black/5 ${openEventId === e.id ? 'rotate-0 scale-[1.03] z-50' : `${rotations[i % rotations.length]} hover:rotate-0 hover:scale-[1.03] hover:z-50`}`}>
                    <EventCard 
                      event={e} 
                      index={i} 
                      isOpen={openEventId === e.id} 
                      onToggle={(open) => setOpenEventId(open ? e.id : null)} 
                    />
                 </motion.div>
              )
           })}
         </div>
         <div className="mt-20">
           <Link to="/events" className="inline-block px-8 py-4 bg-white border-2 border-black text-black font-black text-xs tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-colors shadow-[6px_6px_0px_#2b2a27] hover:shadow-[2px_2px_0px_#2b2a27]">
             Explore All Events
           </Link>
         </div>
      </section>

    </div>
  );
}
