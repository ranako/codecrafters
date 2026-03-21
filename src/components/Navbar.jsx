import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { navLinks } from "../data/siteData";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed z-50 transition-all duration-500 flex justify-center w-full px-4 sm:px-6 lg:px-8 ${
          isScrolled ? "top-4" : "top-6"
        }`}
      >
         <div 
           className={`w-full max-w-6xl rounded-2xl md:rounded-full transition-all duration-500 backdrop-blur-2xl border ${
             isScrolled 
               ? "bg-white/70 border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-3 px-6 md:px-8" 
               : "bg-white/40 border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.05)] py-4 px-6 md:px-8"
           }`}
         >
          <div className="flex items-center justify-between">
            {/* Minimalist Logo */}
            <Link to="/" className="group flex items-center gap-3">
              <span className="text-xl md:text-2xl font-black tracking-[-0.03em] text-black font-serif transition-opacity group-hover:opacity-70">
                CodeCrafters
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              <div className="flex items-center gap-2 bg-black/5 p-1 rounded-full border border-black/5">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="relative group px-5 py-2 flex items-center rounded-full transition-colors duration-300 overflow-hidden"
                    >
                      <span className={`relative z-10 text-[13px] font-bold tracking-wide transition-colors duration-300 ${
                        isActive ? "text-white" : "text-black/60 hover:text-black"
                      }`}>
                        {link.name}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-indicator-desktop"
                          className="absolute inset-0 bg-black rounded-full"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
              
              {/* Minimal Action Button */}
              <Link 
                to="/contact" 
                className="ml-4 px-6 py-2.5 bg-white text-black text-[13px] font-black uppercase tracking-widest rounded-full border border-black hover:bg-black hover:text-white transition-all duration-300 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                 Join Us
              </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="w-10 h-10 flex items-center justify-center text-black/70 hover:text-black transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="md:hidden absolute top-[calc(100%+0.5rem)] left-4 right-4 bg-white/90 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-4">
                {navLinks.map((link, i) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className={`block text-lg font-bold tracking-wide transition-colors duration-200 px-4 py-3 rounded-xl ${
                          isActive ? "bg-black/5 text-black" : "text-black/50 hover:text-black hover:bg-black/5"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
                
                <motion.div
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: navLinks.length * 0.05 }}
                   className="mt-6 pt-6 border-t border-black/10"
                >
                   <Link
                      to="/contact"
                      className="inline-flex items-center justify-center w-full px-6 py-4 bg-black text-white font-black uppercase tracking-widest text-sm rounded-xl active:scale-95 transition-transform"
                   >
                     Join Us
                   </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
