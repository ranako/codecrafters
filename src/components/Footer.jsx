import { usePublicPreview } from "../hooks/usePublicCollection";
import { Link, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { usePageContent } from "../hooks/usePageContent";
import { withContentIcons } from "../lib/contentIcons";

export default function Footer() {
  const shared = usePageContent("shared");
  const content = shared.footer;
  const socialLinks = withContentIcons(shared.social.items);
  const currentYear = new Date().getFullYear();
  const routerLocation = useLocation();
  const preview = usePublicPreview();
  const location = preview ? { ...routerLocation, pathname: preview.path } : routerLocation;

  const handleSamePageClick = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pastelColors = [
    "hover:bg-[#e3ebd5]", // Sage
    "hover:bg-[#dce4f0]", // Slate
    "hover:bg-[#f0e3dc]", // Peach
  ];

  return (
    <footer hidden={!content.enabled} className={`site-footer w-full bg-[#f5f3eb] border-t-2 border-dashed border-black ${location.pathname === "/events" ? "mt-8" : "mt-32"} relative overflow-hidden`}>
      
      {/* Tape Decoration */}
      <div className="absolute top-0 right-12 w-24 h-8 bg-[#e6dcf0]/90 border border-black/10 -translate-y-4 rotate-3 pointer-events-none" />
      <div className="absolute top-0 left-24 w-16 h-8 bg-[#e3ebd5]/90 border border-black/10 -translate-y-5 -rotate-6 pointer-events-none hidden md:block" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8">
          
          {/* Brand & Mission (Left) */}
          <div className="w-full md:w-5/12 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1 mb-6">
                 {content.eyebrow}
              </div>
              <Link
                to="/"
                onClick={() => handleSamePageClick("/")}
                className="inline-block mb-4 group"
              >
                <span className="footer-brand text-3xl md:text-5xl font-black text-black font-serif uppercase tracking-tighter transition-colors duration-200">
                  {content.brand}
                </span>
              </Link>
              <p className="text-sm md:text-base leading-relaxed text-black/80 font-mono font-medium max-w-sm pl-4 border-l-[3px] border-black/20">
                {content.description}
              </p>
            </div>
            
            <div className="mt-10">
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-black/30">
                {content.stamp}
              </span>
            </div>
          </div>

          {/* Directory & Network (Right) */}
          <div className="w-full md:w-6/12 flex flex-col sm:flex-row gap-12 justify-end">
            
            {/* Links */}
            <div className="w-full sm:w-1/2 flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-black border-b-[3px] border-black inline-block pb-2 w-fit">
                {content.directoryTitle}
              </h3>
              <ul className="flex flex-col gap-4">
                {shared.navigation.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      onClick={() => handleSamePageClick(link.path)}
                      className="group flex items-center gap-2 text-sm font-bold text-black/60 hover:text-black transition-all duration-200 w-fit"
                    >
                      <span className="font-mono text-xl leading-none opacity-0 group-hover:opacity-100 transition-opacity text-black/30 translate-y-[-1px]">{">"}</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comms */}
            <div className="w-full sm:w-1/2 flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-black border-b-[3px] border-black inline-block pb-2 w-fit">
                {content.networkTitle}
              </h3>
              
              {/* Social Grid */}
              <div className="footer-social grid grid-cols-4 gap-3 mb-8 w-fit">
                {socialLinks.map((social, index) => (
                  <Motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 4 : -4, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 bg-white border-2 border-black text-black flex items-center justify-center transition-all duration-300 hover:text-black hover:shadow-[3px_3px_0px_rgba(0,0,0,0.2)] ${pastelColors[index % pastelColors.length]}`}
                    aria-label={social.name}
                  >
                    <social.icon size={18} />
                  </Motion.a>
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
                    <span className="text-black">{content.members}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-20 pt-6 border-t-2 border-black flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-black/50">
          <span>© {currentYear} {content.copyright}</span>
          <span>{content.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
