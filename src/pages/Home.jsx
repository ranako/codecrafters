import { motion as Motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import { usePageContent } from "../hooks/usePageContent";
import { withContentIcons } from "../lib/contentIcons";
// Utilizing existing components but forcing them into physical metaphors where possible
import EventSections from "../components/EventSections";
import ClubLife from "../components/ClubLife";
import TestimonialsMarquee from "../components/TestimonialsMarquee";
import { FaArrowRight } from "react-icons/fa";


export default function Home() {
  const reduceMotion = useReducedMotion();
  const content = usePageContent("home");
  const heroData = { ...content.hero, subtitle: content.hero.description, cta: content.hero.primaryLabel, ctaSecondary: content.hero.secondaryLabel };
  const domains = withContentIcons(content.hero.domains);
  const aboutData = { values: withContentIcons(content.values.items) };
  const rotations = [
    "-rotate-3",
    "rotate-2",
    "-rotate-[5deg]",
    "rotate-4",
    "-rotate-2",
    "-rotate-6",
    "rotate-4",
    "-rotate-2",
    "rotate-6",
    "-rotate-4",
  ];

  /* Editorial Pastel Palette */
  const pastelBgs = [
    "bg-[#e3ebd5] border-[#b1c398]", // Sage
    "bg-[#dce4f0] border-[#a0b4d4]", // Slate
    "bg-[#f0e3dc] border-[#d6b7a5]", // Peach
    "bg-[#e6dcf0] border-[#ba9ed1]", // Lilac
    "bg-[#f0ecd5] border-[#cfc69b]", // Pale Yellow
  ];

  const coreValueAccents = ["bg-[#a3b18a]", "bg-[#8ea2c4]", "bg-[#c29f8a]"];
  const coreValueHovers = ["group-hover:bg-[#a3b18a]", "group-hover:bg-[#8ea2c4]", "group-hover:bg-[#c29f8a]"];
  const statColors = ["text-[#a3b18a] bg-[#e3ebd5]", "text-[#8ea2c4] bg-[#dce4f0]", "text-[#c29f8a] bg-[#f0e3dc]"];

  return (
    <div className="home-polish min-h-screen w-full bg-[#e6e4dc] relative overflow-hidden flex flex-col items-center">
      
      {/* Desk Texture */}
      <div 
         className="absolute inset-0 opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#2b2a27 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} 
      />

      {/* ──── HERO DESK ──── */}
      <section className="home-desk-hero relative w-full flex flex-col items-center justify-center z-10">
        
        <div className="home-hero-copy relative max-w-5xl mx-auto px-4 text-center">
           
           {/* Badge */}
           <Motion.div
             initial={reduceMotion ? false : { opacity: 0, scale: 0.98, rotate: -3 }}
             animate={{ opacity: 1, scale: 1, rotate: -3 }}
             transition={{ type: "spring", duration: .3, bounce: .1 }}
             className="inline-block px-4 py-2 bg-black text-white font-black uppercase tracking-widest text-xs md:text-sm shadow-sm relative z-20 mb-8 border border-white/20"
           >
             {heroData.badge}
             <div className="absolute -top-2 left-2 w-8 h-4 bg-white/20 blur-[1px] -rotate-6" />
           </Motion.div>

           {/* Giant Stamped Typography */}
           <Motion.h1
             initial={reduceMotion ? false : { opacity: 0, transform: "translateY(12px)" }}
             animate={{ opacity: 1, transform: "translateY(0)" }}
             transition={{ duration: .4, ease: [.23, 1, .32, 1] }}
             className="text-5xl sm:text-7xl md:text-8xl lg:text-8xl font-black text-black leading-[0.9] tracking-tighter uppercase mb-6"
           >
             {heroData.title} <br/>
             <span className="text-white bg-black px-4 inline-block transform -rotate-1 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] border-2 border-transparent ml-2 mt-2">
               {heroData.highlight}
             </span>
           </Motion.h1>

           <Motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.15 }}
             className="home-hero-description max-w-2xl mx-auto mt-6 text-lg md:text-xl font-bold text-black/50 font-sans leading-relaxed"
           >
             {heroData.subtitle}
           </Motion.p>
           
           <Motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.25 }}
             className="home-hero-actions mt-8 flex flex-col sm:flex-row items-center justify-center gap-6"
           >
             <Link to={content.hero.primaryLink} className="group flex items-center gap-2 px-8 py-4 bg-black text-white font-black uppercase tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.15)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
                {heroData.cta} <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link to={content.hero.secondaryLink} className="group flex items-center gap-2 px-8 py-4 bg-white border-2 border-solid border-black text-black font-black uppercase tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all outline-dashed outline-2 outline-offset-4 outline-black/30">
                {heroData.ctaSecondary}
             </Link>
           </Motion.div>
        </div>

        {/* Scattered Domain Stickers */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
           {domains.map((d, i) => {
              const isLeft = i % 2 === 0;
              const topPos = domains.length <= 5 ? 20 + (i * 15) : 16 + Math.floor(i / 2) * (64 / Math.max(1, Math.ceil(domains.length / 2) - 1));
              const leftPos = domains.length <= 5 ? (isLeft ? 10 + (i * 2) : 80 - (i * 2)) : (isLeft ? 6 : 78);
              const rotation = rotations[i % rotations.length];

              return (
                <Motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03, zIndex: 50, rotate: "0deg" }}
                  transition={{ type: "spring", delay: 0.8 + (i * 0.1) }}
                  key={d.name}
                  className={`pointer-events-auto absolute flex items-center gap-2 px-4 py-3 ${pastelBgs[i % pastelBgs.length]} shadow-[0_5px_15px_-5px_rgba(0,0,0,0.15)] text-black/80 font-bold text-sm tracking-wide ${rotation} cursor-pointer hover:shadow-2xl transition-all duration-300`}
                  style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                >
                  <d.icon size={16} className="text-black/60" />
                  {d.name}
                </Motion.div>
              );
           })}
        </div>
      </section>

      {/* ──── CORE VALUES (Editorial Grid Style) ──── */}
      <section hidden={!content.values.enabled} className="home-values relative w-full max-w-7xl mx-auto px-6 py-12 z-10">
         <div className="flex flex-col items-center mb-8 text-center">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-black/40 mb-4 inline-block">{content.values.eyebrow}</h2>
            <div className="w-12 h-[2px] bg-black/20" />
            <h3 className="text-3xl md:text-4xl font-serif font-black text-black mt-6 tracking-tight">{content.values.title}</h3>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
           {aboutData.values.map((v, i) => {
             return (
               <Motion.div
                 key={v.title}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: .3, delay: i * .05, ease: [.23, 1, .32, 1] }}
                 className="home-value-paper relative group bg-white border border-black/10 p-8 flex flex-col items-start shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out overflow-hidden"
               >
                 {/* Top Accent Line */}
                 <div className={`absolute top-0 left-0 w-full h-1 ${coreValueAccents[i % coreValueAccents.length]} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                 
                 {/* Icon Block */}
                 <div className={`w-16 h-16 bg-[#e6e4dc] border border-black/10 flex items-center justify-center mb-8 text-black ${coreValueHovers[i % coreValueHovers.length]} group-hover:text-white group-hover:border-transparent transition-all duration-500`}>
                   <v.icon size={24} />
                 </div>
                 
                 <h3 className="text-2xl font-black text-black tracking-tight mb-4 font-serif">
                   {v.title}
                 </h3>
                 
                 <p className="text-sm font-semibold text-black/60 leading-relaxed font-sans">
                   {v.description}
                 </p>
                 
               </Motion.div>
             )
           })}
         </div>
      </section>

      {/* ──── HIGHLIGHTS (Ripped Paper Stats) ──── */}
      <section hidden={!content.stats.enabled} className="home-paper-stats relative w-full py-8 z-10">
         <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-12">
            {withContentIcons(content.stats.items).map((stat, i) => {
               const rotationClass = rotations[(i+4) % rotations.length];
               return (
                  <Motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className={`relative bg-white border-2 border-black/5 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] p-8 w-[220px] md:w-[260px] flex flex-col items-center ${rotationClass} hover:rotate-0 transition-all duration-300 text-black`}
                  >
                     {/* Faux ripped tape on top */}
                     <div className="absolute -top-3 w-16 h-6 bg-white/60 backdrop-blur-sm border border-black/10 shadow-sm -rotate-2" />
                     
                     <div className={`mb-4 p-4 rounded-full ${statColors[i % statColors.length]}`}><stat.icon size={24} /></div>
                     <div className="text-4xl md:text-5xl font-black tracking-tighter mb-2 font-serif">{stat.value}</div>
                     <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-black/40 text-center">{stat.label}</div>
                  </Motion.div>
               )
            })}
         </div>
      </section>

      <div className="w-full max-w-4xl mx-auto border-t-2 border-dashed border-black/10 my-8" />

      {/* ──── CLUB LIFE GALLARY (Temporary Wrapper) ──── */}
      <div hidden={!content.albums.enabled} className="home-community-albums w-full max-w-7xl mx-auto">
         <ClubLife />
      </div>

      {/* ──── TESTIMONIALS (Temporary Wrapper) ──── */}
      <div hidden={!content.testimonials.enabled} className="home-feedback w-full py-8 my-8 border-y-2 border-black/5">
        <h2 className="sr-only">Club Feedback</h2>
        <TestimonialsMarquee />
      </div>

      {content.events.enabled && <EventSections preview />}
      <section hidden={!content.invitation.enabled} className="home-join-note w-full max-w-4xl mx-auto px-6 py-12 text-center relative z-10">
        <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[6px_6px_0px_#2b2a27]">
          <h2 className="text-3xl font-black font-serif mb-4">{content.invitation.title}</h2>
          <p className="text-black/60 font-semibold mb-6">{content.invitation.description}</p>
          <Link to={content.invitation.buttonLink} className="inline-block bg-black text-white border-2 border-black px-6 py-3 font-bold hover:bg-white hover:text-black">{content.invitation.buttonLabel}</Link>
          <Link to={content.invitation.teamLink} className="home-meet-team">{content.invitation.teamLabel} <FaArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
