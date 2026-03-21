import { motion } from "framer-motion";
import { testimonialsData } from "../data/siteData";
import SectionWrapper, { SectionHeader } from "./SectionWrapper";
import { FaQuoteLeft } from "react-icons/fa";

export default function TestimonialsMarquee() {
  const repeatedTestimonials = [...testimonialsData, ...testimonialsData];

  return (
    <SectionWrapper className="overflow-hidden">
      <SectionHeader
        tagline="Community Voice"
        title="What People Say"
        description="Hear from our members about how CodeCrafters has impacted their journey in tech."
      />

      <div className="relative flex overflow-hidden py-10">
        {/* Left/Right Fade Masks */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-light-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-light-bg to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="flex gap-6 md:gap-8 min-w-max hover:[animation-play-state:paused] px-4"
        >
          {repeatedTestimonials.map((testimonial, i) => (
            <div
              key={`${testimonial.id}-${i}`}
              className="w-[300px] md:w-[400px] bg-white p-8 border-2 border-black shadow-[6px_6px_0px_#2b2a27] flex flex-col justify-between whitespace-normal"
            >
              <div>
                <FaQuoteLeft className="text-black/10 text-3xl mb-4" />
                <p className="text-sm md:text-base text-light-text-secondary leading-relaxed mb-6 font-medium italic">
                  "{testimonial.text}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 overflow-hidden border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-black">{testimonial.name}</h4>
                  <p className="text-xs text-light-text-secondary">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
