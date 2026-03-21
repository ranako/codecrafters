import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { socialLinks } from "../data/siteData";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#fffdf5] border-t-2 border-dashed border-black mt-32 relative overflow-hidden">
      
      {/* Tape Decoration */}
      <div className="absolute top-0 right-12 w-24 h-8 bg-black/5 -translate-y-4 rotate-3 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8">
          
          {/* Brand & Mission (Left) */}
          <div className="w-full md:w-5/12 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1 mb-6">
                 SYS.FOOTER // REGISTRY
              </div>
              <Link to="/" className="inline-block mb-4 group">
                <span className="text-3xl md:text-5xl font-black text-black font-serif uppercase tracking-tighter transition-colors duration-200">
                  CodeCrafters.
                </span>
              </Link>
              <p className="text-sm md:text-base leading-relaxed text-black/80 font-mono font-medium max-w-sm pl-4 border-l-[3px] border-black/20">
                Building a culture of code & collaboration. A vibrant club of 1500+ members forging the future of software.
              </p>
            </div>
            
            <div className="mt-10">
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-black/30">
                [CC-EST-202X]
              </span>
            </div>
          </div>

          {/* Directory & Network (Right) */}
          <div className="w-full md:w-6/12 flex flex-col sm:flex-row gap-12 justify-end">
            
            {/* Links */}
            <div className="w-full sm:w-1/2 flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-black border-b-[3px] border-black inline-block pb-2 w-fit">
                Directory
              </h3>
              <ul className="flex flex-col gap-4">
                {["About", "Events", "Team", "Contact", "Admin"].map((name) => (
                  <li key={name}>
                    <Link
                      to={`/${name.toLowerCase()}`}
                      className="group flex items-center gap-2 text-sm font-bold text-black/60 hover:text-black transition-all duration-200 w-fit"
                    >
                      <span className="font-mono text-xl leading-none opacity-0 group-hover:opacity-100 transition-opacity text-black/30 translate-y-[-1px]">{">"}</span>
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comms */}
            <div className="w-full sm:w-1/2 flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-black border-b-[3px] border-black inline-block pb-2 w-fit">
                Network
              </h3>
              
              {/* Social Grid */}
              <div className="grid grid-cols-4 gap-3 mb-8 w-fit">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, rotate: (Math.random() > 0.5 ? 4 : -4), y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-white border-2 border-black text-black flex items-center justify-center transition-all duration-300 hover:bg-black hover:text-white hover:shadow-[3px_3px_0px_rgba(0,0,0,0.2)]"
                    aria-label={social.name}
                  >
                    <social.icon size={18} />
                  </motion.a>
                ))}
              </div>

              {/* Minimal Status Block */}
              <div className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_rgba(0,0,0,0.1)] w-full max-w-[200px]">
                <div className="flex flex-col gap-1.5 font-mono text-[10px] uppercase font-bold text-black/60 tracking-widest">
                  <div className="flex justify-between items-center pb-1.5 border-b border-black/10">
                    <span>SYS:</span>
                    <span className="flex items-center gap-1.5 text-black">
                       <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" /> ONLINE
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span>MEMBERS:</span>
                    <span className="text-black">1.5K+</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-20 pt-6 border-t-2 border-black flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-black/50">
          <span>© {currentYear} CodeCrafters.</span>
          <span>Engineered with intent.</span>
        </div>
      </div>
    </footer>
  );
}
