import { motion } from "framer-motion";
import { teamData } from "../data/siteData";
import { FaLinkedin } from "react-icons/fa";

export default function Team() {
  const rotations = [
    "-rotate-3",
    "rotate-2",
    "-rotate-6",
    "rotate-4",
    "-rotate-2",
    "rotate-5",
    "-rotate-4",
    "rotate-3",
    "-rotate-1"
  ];

  return (
    <div className="pt-40 pb-32 min-h-[90vh] w-full bg-[#fafafa] relative overflow-hidden flex flex-col items-center justify-center">
      
      {/* Subtle Polka-dot Desk Texture */}
      <div 
         className="absolute inset-0 opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-16 md:gap-24 items-center">
        
        {/* THE FOUNDRY / OG CLUSTER (Vintage Scrapbook Style) */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 items-center">
          {teamData.og.map((member, index) => {
            const rotationClass = rotations[index % rotations.length];

            return (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 90 }}
                key={member.name}
                // unified size and white paper
                className={`relative group bg-white p-4 md:p-5 pb-10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_45px_65px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out flex-shrink-0 w-[200px] sm:w-[240px] lg:w-[280px] cursor-pointer ${rotationClass} hover:rotate-0 hover:-translate-y-6 hover:scale-105 hover:z-50 border border-black/5 rounded-sm`}
              >
                
                {/* Yellowish Masking Tape for OG */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-7 bg-black/10 backdrop-blur-md shadow-sm border border-black/20 -rotate-[3deg] opacity-90 pointer-events-none z-20" />

                {/* Polaroid Photo Frame - Unified Slightly Desaturated Style */}
                <div className="w-full aspect-square bg-[#eaeaea] overflow-hidden filter saturate-[0.6] contrast-110 group-hover:saturate-100 group-hover:contrast-100 transition-all duration-700 relative">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#eaeaea]">
                      <span className="text-black/10 font-bold text-4xl shadow-sm">
                        {member.name.split(" ").map((w) => w[0]).join("")}
                      </span>
                    </div>
                  )}
                  {/* Vignette */}
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none" />
                </div>

                <div className="pt-5 pb-2 text-center flex flex-col items-center">
                  {/* Distinctive OG Badge */}
                  <span className="inline-block px-3 py-1 mb-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] bg-black text-white rounded-sm -rotate-2 group-hover:rotate-0 transition-transform shadow-md border border-white/20">
                    The Founders
                  </span>
                  
                  <h3 className="text-xl md:text-2xl font-black text-black tracking-tight leading-none mb-1 font-serif mt-2">
                    {member.name}
                  </h3>
                  
                  <p className="text-xs font-bold text-black/50">
                    {member.role}
                  </p>

                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                           <FaLinkedin size={14} />
                        </a>
                     )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
        
        {/* DESK SEPARATOR */}
        <div className="w-full max-w-sm border-t-2 border-dotted border-black/10" />

        {/* CORE CLUSTER (Modern Clean Style) */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 items-center">
          {teamData.core.map((member, index) => {
            const rotationClass = rotations[(index + 4) % rotations.length];

            return (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 90 }}
                key={member.name}
                // MODERN STYLE POLAROID: Pure White
                className={`relative group bg-white p-4 md:p-5 pb-10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_45px_65px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out flex-shrink-0 w-[200px] sm:w-[240px] lg:w-[280px] cursor-pointer ${rotationClass} hover:rotate-0 hover:-translate-y-6 hover:scale-105 hover:z-50 border border-black/5 rounded-sm`}
              >
                
                {/* Clear Glossy Tape */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-7 bg-black/5 backdrop-blur-md shadow-sm border border-black/10 -rotate-[2deg] opacity-70 pointer-events-none z-20" />

                {/* Polaroid Photo Frame - Unified Slightly Desaturated Style */}
                <div className="w-full aspect-square bg-[#f0f0f0] overflow-hidden filter saturate-[0.6] contrast-110 group-hover:saturate-100 group-hover:contrast-100 transition-all duration-700 relative">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#eaeaea]">
                      <span className="text-black/10 font-bold text-4xl shadow-sm">
                        {member.name.split(" ").map((w) => w[0]).join("")}
                      </span>
                    </div>
                  )}
                  {/* Clean Vignette */}
                  <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.1)] pointer-events-none" />
                </div>

                <div className="pt-5 pb-2 text-center flex flex-col items-center">
                  {/* Distinctive Core Badge */}
                  <span className="inline-block px-3 py-1 mb-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] bg-white text-black rounded-sm -rotate-2 group-hover:rotate-0 transition-transform border border-black shadow-sm">
                    Core Team
                  </span>
                  
                  <h3 className="text-xl md:text-2xl font-black text-black tracking-tight leading-none mb-1 font-sans mt-2">
                    {member.name}
                  </h3>
                  
                  <p className="text-xs font-bold text-black/40 font-sans">
                    {member.role}
                  </p>

                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                           <FaLinkedin size={14} />
                        </a>
                     )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
