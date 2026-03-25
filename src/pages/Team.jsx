import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaLinkedin } from "react-icons/fa";
import { ogTeamMembers } from "../data/siteData";
import { fetchCoreTeamMembers } from "../lib/contentApi";

export default function Team() {
  const [coreTeamMembers, setCoreTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const rotations = [-3, 2, -6, 4, -2, 5, -4, 3, -1];
  
  const pastelBgs = [
    "bg-[#e3ebd5]/90", // Sage
    "bg-[#dce4f0]/90", // Slate
    "bg-[#f0e3dc]/90", // Peach
    "bg-[#e6dcf0]/90", // Lilac
    "bg-[#f0ecd5]/90", // Pale Yellow
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadCoreTeamMembers() {
      try {
        const data = await fetchCoreTeamMembers();
        if (!isMounted) return;
        setCoreTeamMembers(data);
        setError("");
      } catch (fetchError) {
        if (!isMounted) return;
        setCoreTeamMembers([]);
        setError(fetchError.message || "Unable to load core members.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCoreTeamMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="pt-28 pb-20 min-h-[80vh] w-full bg-[#e6e4dc] relative overflow-hidden flex flex-col items-center">
      
      {/* Subtle Polka-dot Desk Texture */}
      <div 
         className="absolute inset-0 opacity-[0.05] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#2b2a27 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col gap-12 md:gap-16 items-center">
        
        {/* THE FOUNDRY / OG CLUSTER (Enhanced Vintage Scrapbook Style) */}
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center w-full">
          {ogTeamMembers.map((member, index) => {
            const rot = rotations[index % rotations.length];

            return (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.8, rotate: rot }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotate: rot }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100, bounce: 0.4 }}
                whileHover={{ y: -6, scale: 1.02, rotate: 0, zIndex: 50, transition: { duration: 0.2 } }}
                key={member.name}
                // restored size and dynamic rotations defined via framer motion
                className="relative group bg-white p-4 md:p-5 pb-10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.15)] transition-shadow duration-300 ease-out flex-shrink-0 w-[200px] sm:w-[240px] lg:w-[280px] cursor-pointer border border-black/5 rounded-sm z-10"
              >
                
                {/* Pastel Masking Tape for OG */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-7 ${pastelBgs[index % pastelBgs.length]} backdrop-blur-md shadow-sm border border-black/10 -rotate-[2deg] pointer-events-none z-20`} />

                {/* Polaroid Photo Frame - Unified Slightly Desaturated Style */}
                <div className="w-full aspect-square bg-[#eaeaea] overflow-hidden filter saturate-[0.8] transition-all duration-700 relative">
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
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] pointer-events-none" />
                </div>

                <div className="pt-5 pb-2 text-center flex flex-col items-center">
                  {/* Distinctive OG Badge */}
                  <span className="inline-block px-3 py-1 mb-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] bg-black text-white rounded-sm shadow-md border border-white/20">
                    The Founders
                  </span>
                  
                  <h3 className="text-xl font-black text-black tracking-tight leading-none mb-1 font-serif mt-2">
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

        {/* CORE CLUSTER (Enhanced Clean Scrapbook Style) */}
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center w-full">
          {coreTeamMembers.map((member, index) => {
            const rot = rotations[(index + 4) % rotations.length];

            return (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.8, rotate: rot }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotate: rot }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100, bounce: 0.4 }}
                whileHover={{ y: -6, scale: 1.02, rotate: 0, zIndex: 50, transition: { duration: 0.2 } }}
                key={member.name}
                // MODERN STYLE POLAROID
                className="relative group bg-white p-4 md:p-5 pb-10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.15)] transition-shadow duration-300 ease-out flex-shrink-0 w-[200px] sm:w-[240px] lg:w-[280px] cursor-pointer border border-black/5 rounded-sm z-10"
              >
                
                {/* Pastel Glossy Tape */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-7 ${pastelBgs[(index + 4) % pastelBgs.length]} backdrop-blur-md shadow-sm border border-black/10 pointer-events-none z-20`} />

                {/* Polaroid Photo Frame - Unified Slightly Desaturated Style */}
                <div className="w-full aspect-square bg-[#f0f0f0] overflow-hidden filter saturate-[0.8] transition-all duration-700 relative">
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
                  <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.05)] pointer-events-none" />
                </div>

                <div className="pt-5 pb-2 text-center flex flex-col items-center">
                  {/* Distinctive Core Badge */}
                  <span className="inline-block px-3 py-1 mb-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] bg-white text-black rounded-sm border border-black shadow-sm">
                    Core Team
                  </span>
                  
                  <h3 className="text-xl font-black text-black tracking-tight leading-none mb-1 font-sans mt-2">
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
        {isLoading && (
          <p className="text-xs font-black uppercase tracking-[0.3em] text-black/40">
            Loading core members...
          </p>
        )}
        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      </div>
    </div>
  );
}
