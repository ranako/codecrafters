import { motion } from "framer-motion";
import { aboutData } from "../data/siteData";
// Omitted SectionWrappers to rely on physical desk placements
import ClubPillars from "../components/ClubPillars";
import { FaCheckCircle, FaRocket, FaEye, FaQuoteLeft } from "react-icons/fa";

export default function About() {
  const rotations = ["-rotate-3", "rotate-2", "-rotate-[5deg]", "rotate-4", "-rotate-2", "rotate-6", "-rotate-4"];

  return (
    <div className="pt-32 pb-40 min-h-screen w-full bg-[#e6e4dc] relative overflow-hidden flex flex-col items-center">
      
      {/* Desk Texture */}
      <div 
         className="absolute inset-0 opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#2b2a27 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} 
      />

      {/* ──── ORIGIN LETTER ──── */}
      <section className="relative w-full max-w-4xl mx-auto px-4 z-10 mb-32">
        <motion.div
           initial={{ opacity: 0, y: 50, rotate: "2deg" }}
           animate={{ opacity: 1, y: 0, rotate: "-1deg" }}
           transition={{ duration: 0.8, type: "spring" }}
           className="bg-[#fffefaa6] backdrop-blur-md border border-black/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-8 md:p-16 lg:p-24 relative"
        >
           {/* Paper Clip */}
           <div className="absolute -top-6 left-16 w-8 h-16 border-4 border-gray-400 rounded-full bg-transparent z-20 shadow-sm transform rotate-[15deg]">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-12 border-4 border-gray-400 rounded-full" />
           </div>

           <div className="text-center mb-12">
             <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-[0.4em] mb-6">
               Our Origin Story
             </span>
             <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-black leading-[0.9] tracking-tighter uppercase font-serif mb-6">
               The Story Behind <br/> CodeCrafters
             </h1>
             <p className="text-lg md:text-xl font-bold text-black/50 font-sans tracking-tight">
               {aboutData.description}
             </p>
           </div>
           
          <div className="relative">
              <FaQuoteLeft className="absolute -top-4 -left-6 text-black/5 text-6xl pointer-events-none" />
              <p className="text-base md:text-lg text-black/70 leading-relaxed font-serif relative z-10 columns-1 md:columns-2 gap-8 text-justify">
                {aboutData.longDescription} 
                <br/><br/>
                We started with a vision to build something greater than just a club. We wanted a community. A space where students don't just consume knowledge, but actively forge it. Today, we are proud to host <span className="font-bold underline decoration-wavy decoration-black/30">{aboutData.communitySize} {aboutData.communitySizeLabel}</span>, growing every single day.
              </p>
           </div>
           
           {/* Signed Signature */}
           <div className="mt-16 text-right">
              <p className="text-sm font-bold text-black/40 uppercase tracking-widest mb-2">Signed,</p>
              <h2 className="text-4xl text-black font-serif italic -rotate-2">The Foundry</h2>
           </div>
        </motion.div>
      </section>

      {/* ──── CLUB PILLARS ──── */}
      {/* We use ClubPillars but wrap it in a notebook boundary or let it flow. Wait, ClubPillars might be dark theme. We will skip or replace with static elements if needed, or wrap it in a div. */}
      <div className="w-full max-w-7xl mx-auto mb-32 z-10 relative">
         <ClubPillars />
      </div>

      {/* ──── MISSION & VISION (Index Cards) ──── */}
      <section className="relative w-full max-w-5xl mx-auto px-4 z-10 mb-32 flex flex-col md:flex-row justify-center gap-10 md:gap-16">
          {[
            { title: "Our Mission", text: aboutData.mission, icon: FaRocket, rotation: "-rotate-2" },
            { title: "Our Vision", text: aboutData.vision, icon: FaEye, rotation: "rotate-3" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.05, rotate: "0deg", zIndex: 20 }}
              className={`flex-1 p-8 md:p-12 bg-white shadow-[0_15px_30px_-10px_rgba(0,0,0,0.15)] border-t-[12px] border-black relative cursor-pointer ${item.rotation} transition-all duration-300`}
            >
              <div className="absolute top-4 right-4 text-black/10">
                <item.icon size={48} />
              </div>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-black">
                {item.title}
              </h3>
              <p className="text-sm md:text-base leading-relaxed text-black/70 font-semibold">
                {item.text}
              </p>
            </motion.div>
          ))}
      </section>

      {/* ──── CORE VALUES (Tags) ──── */}
      <section className="relative w-full max-w-7xl mx-auto px-4 z-10 mb-32 text-center">
         <h2 className="text-xs font-black uppercase tracking-[0.4em] text-black/30 mb-16 border-b-2 border-dashed border-black/10 pb-4 inline-block">Our Core Values</h2>
         <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {aboutData.values.map((v, i) => {
            const rotationClass = rotations[i % rotations.length];
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, type: "spring" }}
                whileHover={{ rotate: "0deg", translateY: -10, zIndex: 30 }}
                className={`relative bg-[#eaeaea] p-8 pb-12 w-[240px] md:w-[280px] text-center shadow-lg border border-black/5 ${rotationClass} cursor-pointer transition-all duration-300 flex flex-col items-center`}
              >
                {/* Hole punch and string */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#e6e4dc] shadow-[inset_0_3px_6px_rgba(0,0,0,0.1)] border border-black/10 z-20 flex items-center justify-center">
                   <div className="w-2 h-16 bg-black/40 absolute -top-12 -z-10 transform -rotate-12" />
                </div>
                
                <div className="text-4xl mb-6 text-black mt-4"><v.icon /></div>
                <h3 className="text-xl font-black mb-3 text-black tracking-tight">{v.title}</h3>
                <p className="text-xs font-bold leading-relaxed text-black/50">{v.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──── WHY JOIN (Checklist Notepad) ──── */}
      <section className="relative w-full max-w-2xl mx-auto px-4 z-10">
         <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] border-l-4 border-black rotate-1 relative"
            style={{ backgroundImage: 'linear-gradient(transparent 95%, #e2e8f0 95%)', backgroundSize: '100% 2rem', lineHeight: '2rem' }}
         >
            {/* Top red margin line */}
            <div className="absolute top-0 left-12 w-0.5 h-full bg-black/10" />
            
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-black mb-6 font-serif underline decoration-4 decoration-black/10 pl-16">
               Why Join Us?
            </h2>
            <div className="space-y-6 pl-16 relative z-10 mt-8">
              {aboutData.whyJoin.map((item, i) => (
                <div key={i} className="flex items-start gap-4 text-black font-semibold font-sans text-sm md:text-base">
                  <FaCheckCircle className="text-black mt-1 flex-shrink-0" size={16} />
                  <span className="bg-white inline-block">{item}</span>
                </div>
              ))}
            </div>
         </motion.div>
      </section>

    </div>
  );
}
