import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper, { SectionHeader } from "./SectionWrapper";
import { FaLaptopCode, FaHandsHelping, FaLaptopHouse, FaNetworkWired, FaTools } from "react-icons/fa";

const pillarsData = [
  {
    id: 1,
    title: "Hackathons",
    description: "Intense, thrilling 24-hour coding sprints where our members form teams, brainstorm wild ideas, and build fully-functional prototypes overnight.",
    icon: FaLaptopCode,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Open Source",
    description: "Contributing to the global tech ecosystem. We host bootcamps that teach members how to navigate GitHub, understand codebases, and make their first PRs.",
    icon: FaHandsHelping,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "Workshops",
    description: "Weekly deep dives into modern frameworks, cybersecurity, AI, and UI/UX design led by our own experienced members and guest industry speakers.",
    icon: FaTools,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Mentorship",
    description: "Pairing enthusiastic freshmen with senior developers to bridge the gap between academic theory and practical, industry-ready skills.",
    icon: FaLaptopHouse,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    title: "Networking",
    description: "Building lifelong connections. From casual Friday pizza nights to formal tech symposiums, our community is all about the people you meet.",
    icon: FaNetworkWired,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
  }
];

export default function ClubPillars() {
  const [active, setActive] = useState(0);

  const pastelBgs = ["bg-[#e3ebd5]", "bg-[#dce4f0]", "bg-[#f0e3dc]", "bg-[#e6dcf0]", "bg-[#f0ecd5]"];
  const pastelText = ["text-[#6f8252]", "text-[#5b739e]", "text-[#a67a63]", "text-[#8767a1]", "text-[#91864a]"];

  return (
    <SectionWrapper>
      <SectionHeader
        tagline="What We Build On"
        title="Our Core Pillars"
        description="The foundation of our club experience. Hover over each pillar to explore the initiatives driving our community forward."
      />

      <div className="flex flex-col md:flex-row gap-4 h-[60vh] min-h-[400px] w-full mt-6">
        {pillarsData.map((pillar, index) => {
          const isActive = active === index;

          return (
            <motion.div
              key={pillar.id}
              layout
              onHoverStart={() => setActive(index)}
              onClick={() => setActive(index)}
              initial={{ flex: 1 }}
              animate={{ flex: isActive ? 5 : 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl overflow-hidden cursor-pointer group bg-black/5"
            >
              {/* Background Image */}
              <img 
                src={pillar.image} 
                alt={pillar.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div 
                className={`absolute inset-0 transition-opacity duration-500 bg-gradient-to-t from-black/80 via-black/40 to-transparent ${isActive ? "opacity-100" : "opacity-70 md:opacity-50"}`}
              />

              {/* Inactive State: Rotated Title (Desktop) or Normal (Mobile) */}
              <div 
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isActive ? "opacity-0" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"}`}
              >
                <div className="md:-rotate-90 whitespace-nowrap text-white font-bold tracking-widest uppercase text-sm md:text-xl drop-shadow-md">
                  {pillar.title}
                </div>
              </div>

              {/* Active State Content */}
              <div 
                className={`absolute bottom-0 left-0 p-6 md:p-10 w-[90vw] md:w-[450px] pointer-events-none text-white hidden md:flex flex-col justify-end transition-all duration-500 ease-out ${
                  isActive ? "opacity-100 translate-y-0 delay-100" : "opacity-0 translate-y-8"
                }`}
              >
                <div className={`w-14 h-14 rounded-full ${pastelBgs[index % pastelBgs.length]} ${pastelText[index % pastelText.length]} flex items-center justify-center mb-6 border-[3px] border-black/20 shadow-xl transition-transform duration-500`}>
                  <pillar.icon size={24} />
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold mb-4 drop-shadow-lg whitespace-nowrap">
                  {pillar.title}
                </h3>
                <p className="text-sm md:text-base text-white/90 leading-relaxed drop-shadow-md" style={{ minWidth: "300px" }}>
                  {pillar.description}
                </p>
              </div>

              {/* Mobile Active Content */}
              <div className={`absolute bottom-0 left-0 right-0 p-6 flex flex-col md:hidden transition-all duration-500 ease-out ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                 <h3 className="text-2xl font-bold text-white mb-2 whitespace-nowrap">{pillar.title}</h3>
                 <p className="text-sm text-white/90 line-clamp-2">{pillar.description}</p>
              </div>

            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
