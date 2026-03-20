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
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full ${
          isScrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-black/[0.04] py-3 shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
            : "py-5 bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
          
          {/* Minimalist Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <span className="text-xl md:text-2xl font-semibold tracking-[-0.03em] text-black font-sans transition-opacity group-hover:opacity-70">
              CodeCrafters
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
                    className="relative group py-2 flex items-center"
                  >
                    <span className={`text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                      isActive ? "text-black" : "text-black/40 hover:text-black"
                    }`}>
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator-desktop"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
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
              className="ml-4 px-5 py-2 bg-black text-white text-[12px] font-medium tracking-wide rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] active:scale-95"
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-black/[0.04] shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
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
                        className={`block text-lg font-medium tracking-wide transition-colors duration-200 ${
                          isActive ? "text-black" : "text-black/40 hover:text-black"
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
                   className="mt-6 pt-6 border-t border-black/5"
                >
                   <Link
                      to="/contact"
                      className="inline-flex items-center justify-center w-full px-6 py-4 bg-black text-white font-medium text-sm tracking-wide rounded-2xl active:scale-95 transition-transform"
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
