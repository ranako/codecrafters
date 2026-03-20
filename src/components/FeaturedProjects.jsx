import { motion } from "framer-motion";
import { projectsData } from "../data/siteData";
import SectionWrapper, { SectionHeader } from "./SectionWrapper";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

export default function FeaturedProjects() {
  const theme = "light";

  return (
    <SectionWrapper>
      <SectionHeader
        tagline="Our Work"
        title="Featured Projects"
        description="Explore some of the cutting-edge applications and platforms built by our community members."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projectsData.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
            whileHover={{ y: -10 }}
            className={`group rounded-2xl overflow-hidden transition-all duration-500 glass-light hover:shadow-2xl border border-black/5 flex flex-col`}
          >
            {/* Image Container with Hover Scale */}
            <div className="relative h-48 sm:h-56 overflow-hidden bg-black/5">
              <motion.img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold"
                >
                  <FaGithub size={18} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold"
                >
                  <FaExternalLinkAlt size={14} />
                </motion.button>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-black mb-3 group-hover:text-black transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-light-text-secondary leading-relaxed mb-6 flex-1">
                {project.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="px-3 py-1 bg-black/5 text-black text-[10px] font-bold uppercase tracking-wider rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
