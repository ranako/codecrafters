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
      className="group relative rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer bg-black/5"
    >
      {/* Background Image */}
      {member.image ? (
         <img
           src={member.image}
           alt={member.name}
           className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
         />
      ) : (
         <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/5">
             {/* Fallback pattern / Icon */}
             <span className="text-black/10 font-bold text-6xl px-1 text-center leading-none">
                 {member.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
             </span>
         </div>
      )}

      {/* Gradient Overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content Layer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end pointer-events-none">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-md">
          {member.name}
        </h3>
        <p className="text-sm font-medium text-white/80 mb-0 drop-shadow-md">
          {member.role}
        </p>

        {/* LinkedIn Button - Slides in on hover entirely (pointer-events-auto overriding the parent lock) */}
        {member.linkedin && (
          <div className="overflow-hidden h-0 group-hover:h-12 transition-all duration-300 mt-0 group-hover:mt-4 pointer-events-auto">
            <motion.a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-accent transition-colors shadow-lg"
            >
              <FaLinkedin size={16} /> Connect
            </motion.a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
