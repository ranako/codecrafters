import { motion } from "framer-motion";
import { FaLinkedin } from "react-icons/fa";

export default function TeamCard({ member, index }) {
  // Use a sleek vertical portrait aspect ratio for modern, premium look.
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative overflow-hidden aspect-[3/4] cursor-pointer bg-white border-2 border-black shadow-[6px_6px_0px_#2b2a27] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#2b2a27] transition-all duration-300"
    >
      {/* Background Image */}
      {member.image ? (
         <img
           src={member.image}
           alt={member.name}
           className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 grayscale group-hover:grayscale-0"
         />
      ) : (
         <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/5">
             {/* Fallback pattern / Icon */}
             <span className="text-black/10 font-bold text-6xl px-1 text-center leading-none">
                 {member.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
             </span>
         </div>
      )}

      {/* Solid Contrast Box Instead of Gradient */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />

      {/* Content Layer */}
      <div className="absolute bottom-4 left-4 right-4 bg-white border-2 border-black p-4 flex flex-col justify-end shadow-[4px_4px_0px_#2b2a27] transition-transform duration-300 group-hover:-translate-y-2 pointer-events-none">
        <h3 className="text-xl md:text-2xl font-black text-black mb-1 uppercase tracking-tight">
          {member.name}
        </h3>
        <p className="text-xs font-bold font-mono text-black/60 uppercase tracking-widest mb-0">
          {member.role}
        </p>

        {/* LinkedIn Button - Slides in on hover entirely (pointer-events-auto overriding the parent lock) */}
        {member.linkedin && (
          <div className="overflow-hidden h-0 group-hover:h-12 transition-all duration-300 mt-0 group-hover:mt-4 pointer-events-auto border-t-2 border-dashed border-black/20 pt-3 group-hover:pt-4">
            <motion.a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex flex-1 w-full items-center justify-center gap-2 px-5 py-2 bg-black text-white text-xs tracking-widest uppercase font-black transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
            >
              <FaLinkedin size={16} /> Connect
            </motion.a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
