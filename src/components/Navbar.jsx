import { usePublicPreview } from "../hooks/usePublicCollection";
import DisplayImage from "./DisplayImage";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { usePageContent } from "../hooks/usePageContent";




export default function Navbar() {
  const content = usePageContent("shared").navigation;
  const navLinks = content.links.filter(link => link.path !== "/contact");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobilePath, setMobilePath] = useState(null);
  const routerLocation = useLocation();
  const preview = usePublicPreview();
  const view = preview?.document?.defaultView || window;
  const location = preview ? { ...routerLocation, pathname: preview.path } : routerLocation;
  const isMobileOpen = mobilePath === location.pathname;

  const handleNavClick = (isActive) => {
    if (isActive) {
      view.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(view.scrollY > 20);
    view.addEventListener("scroll", handleScroll);
    return () => view.removeEventListener("scroll", handleScroll);
  }, [view]);


  return (
    <>
      <Motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed z-50 transition-all duration-300 flex justify-center w-full top-0 left-0 right-0 ${
          isScrolled ? "bg-[#e6e4dc] border-b-1 border-black" : "bg-transparent border-b-1 border-transparent"
        }`}
      >
         <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
            {/* Minimalist Logo */}
            <Link
              to="/"
              onClick={() => handleNavClick(location.pathname === "/")}
              className="group flex items-center gap-3"
            >
              <span style={{width:128,display:"block"}} className="text-xl md:text-2xl font-black tracking-[-0.03em] text-black font-serif transition-opacity group-hover:opacity-70">
                <DisplayImage src={content.logo} settings={content.logo_display} placement="logo" alt={content.logoAlt} className="w-32" />
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-8">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => handleNavClick(isActive)}
                      className="relative group py-2 flex flex-col justify-center transition-colors duration-300"
                    >
                      <span className={`relative z-10 text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                        isActive ? "text-black" : "text-black/50 hover:text-black"
                      }`}>
                        {link.name}
                      </span>
                      {isActive && (
                        <Motion.div
                          layoutId="nav-indicator-desktop"
                          className="absolute -bottom-[6px] left-0 right-0 h-[3px] bg-[#a0b4d4]"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
              
              {/* Minimal Action Button */}
              <Link 
                to={content.joinLink}
                className="ml-4 px-5 py-2 bg-transparent text-black text-[11px] font-black uppercase tracking-widest border-2 border-black hover:bg-[#f0e3dc] transition-all shadow-[2px_2px_0px_#2b2a27] hover:shadow-[0px_0px_0px_#2b2a27] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                 {content.joinLabel}
              </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobilePath(isMobileOpen ? null : location.pathname)}
                className="w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
              </button>
            </div>
          </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="md:hidden absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-white border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-4">
                {navLinks.map((link, i) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => handleNavClick(isActive)}
                        className={`block text-lg font-bold tracking-wide transition-colors duration-200 px-4 py-3 border-2 border-transparent ${
                          isActive ? "bg-[#e3ebd5] text-black border-black/10" : "text-black/50 hover:text-black hover:bg-black hover:text-white hover:border-black"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </Motion.div>
                  );
                })}
                
                <Motion.div
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: navLinks.length * 0.05 }}
                   className="mt-6 pt-6 border-t border-black/10"
                >
                   <Link
                      to={content.joinLink}
                      className="inline-flex items-center justify-center w-full px-6 py-4 bg-white border-2 border-black text-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_#2b2a27] active:scale-95 transition-transform"
                   >
                     {content.joinLabel}
                   </Link>
                </Motion.div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </Motion.nav>
    </>
  );
}
