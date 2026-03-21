import { motion } from "framer-motion";
import SectionWrapper, { SectionHeader } from "./SectionWrapper";

const galleryImages = [
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800", // students
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800", // teamwork
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800", // coding
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800", // presentation
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=800", // hackathon
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"  // group discussion
];

export default function ClubLife() {
  return (
    <SectionWrapper>
      <SectionHeader
        tagline="Inside CodeCrafters"
        title="Club Life & Culture"
        description="Experience the energy of our community. From intense 24-hour hackathons to casual weekend meetups, we're building more than just code."
      />

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {galleryImages.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            whileHover={{ scale: 1.03 }}
            className="break-inside-avoid overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_#2b2a27] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[0px_0px_0px_#2b2a27] transition-all duration-300"
          >
            <img 
              src={src} 
              alt={`Club life moment ${i + 1}`} 
              className="w-full h-auto object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
