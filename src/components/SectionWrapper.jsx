import { motion } from "framer-motion";

export default function SectionWrapper({ children, className = "", id }) {
  return (
    <section
      id={id}
      className={`relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

export function SectionHeader({ tagline, title, description }) {
  const theme = "light";

  return (
    <div className="text-center mb-16">
      {tagline && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block text-[10px] md:text-xs font-black uppercase font-mono tracking-[0.2em] bg-black text-white px-2 py-1 mb-6 shadow-[2px_2px_0px_#2b2a27]"
        >
          {tagline}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`text-3xl md:text-4xl lg:text-5xl font-black font-serif uppercase tracking-tighter mb-4 ${
          theme === "dark" ? "text-white" : "text-black"
        }`}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`max-w-2xl mx-auto text-sm md:text-base font-bold leading-relaxed border-l-4 border-black/20 pl-4 py-1 flex-1 ${
            theme === "dark" ? "text-text-secondary" : "text-black/60"
          }`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
