import { usePublicPreview } from '../hooks/usePublicCollection';
import DisplayImage from './DisplayImage';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX, HiOutlineHome, HiOutlineCalendar, HiOutlinePhotograph, HiOutlineUsers, HiOutlineInformationCircle, HiArrowNarrowRight } from 'react-icons/hi';
import { usePageContent } from '../hooks/usePageContent';
import './Navbar.css';

const icons = { '/': HiOutlineHome, '/about': HiOutlineInformationCircle, '/events': HiOutlineCalendar, '/gallery': HiOutlinePhotograph, '/team': HiOutlineUsers };

export default function Navbar() {
  const content = usePageContent('shared').navigation;
  const navLinks = content.links.filter(link => link.path !== '/contact');
  const [mobilePath, setMobilePath] = useState(null);
  const routerLocation = useLocation();
  const preview = usePublicPreview();
  const location = preview ? { ...routerLocation, pathname: preview.path } : routerLocation;
  const isMobileOpen = mobilePath === location.pathname;
  const view = preview?.document?.defaultView || window;
  const navigate = (path) => {
    setMobilePath(null);
    if (location.pathname === path) view.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const links = (mobile = false) => navLinks.map(link => {
    const Icon = icons[link.path] || HiOutlineInformationCircle;
    const active = location.pathname === link.path;
    return <Link key={link.name} to={link.path} onClick={() => navigate(link.path)} aria-current={active ? 'page' : undefined} className={`dock-link ${active ? 'dock-link-active' : ''}`}>
      <Icon aria-hidden="true" /><span>{link.name}</span>
      {active && !mobile && <Motion.span className="dock-active-pill" layoutId="nav-indicator-desktop" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
    </Link>;
  });
  return <Motion.nav aria-label="Main navigation" initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .5, ease: [.23, 1, .32, 1] }} className="site-nav site-dock">
    <div className="dock-shell">
      <Link to="/" onClick={() => navigate('/')} className="dock-logo" aria-label="CodeCrafters home">
        <DisplayImage src={content.logo} settings={content.logo_display} placement="logo" alt={content.logoAlt} />
      </Link>
      <div className="dock-divider" aria-hidden="true" />
      <div className="site-nav-desktop"><div className="site-nav-links">{links()}</div></div>
      <Link to={content.joinLink} onClick={() => navigate(content.joinLink)} className="dock-join">{content.joinLabel}<HiArrowNarrowRight aria-hidden="true" /></Link>
      <button type="button" className="dock-menu-toggle" onClick={() => setMobilePath(isMobileOpen ? null : location.pathname)} aria-label="Toggle menu" aria-expanded={isMobileOpen} aria-controls="site-mobile-menu">{isMobileOpen ? <HiX /> : <HiMenuAlt3 />}</button>
    </div>
    <AnimatePresence>{isMobileOpen && <Motion.div id="site-mobile-menu" className="site-nav-menu dock-mobile-menu" initial={{ opacity: 0, y: 8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} transition={{ duration: .18, ease: [.23, 1, .32, 1] }} onKeyDown={event => { if (event.key === 'Escape') { setMobilePath(null); event.currentTarget.ownerDocument.querySelector('.dock-menu-toggle')?.focus(); } }}>
      {links(true)}
    </Motion.div>}</AnimatePresence>
  </Motion.nav>;
}
