import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import './LenisScroll.css';

// One page-scroll owner; the two reel tracks keep their independent CSS loops.
export default function LenisScroll() {
  const { pathname } = useLocation();
  const reducedMotion = useReducedMotionPreference();
  useEffect(() => {
    if (reducedMotion || !['/gallery', '/events'].includes(pathname)) return;
    const root = document.documentElement;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: .1,
      smoothWheel: true,
      syncTouch: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      anchors: true,
      stopInertiaOnNavigate: true,
      prevent: node => node instanceof Element && Boolean(node.closest('dialog, [data-lenis-prevent], .site-nav-menu, .album-natural .album-hanging-track')),
    });
    root.dataset.lenisScope = pathname;
    let lockedScroll = null;
    const syncLock = () => {
      const locked = Boolean(document.querySelector('dialog[open]')) || document.body.style.overflow === 'hidden' || document.body.style.position === 'fixed';
      if (locked) {
        if (lockedScroll === null) {
          const fixedTop = Number.parseFloat(document.body.style.top);
          lockedScroll = document.body.style.position === 'fixed' && Number.isFinite(fixedTop) ? -fixedTop : window.scrollY;
        }
        lenis.stop();
      } else {
        if (lockedScroll !== null) lenis.resize();
        lenis.start();
        if (lockedScroll !== null) {
          const restore = lockedScroll; lockedScroll = null;
          lenis.scrollTo(restore, { immediate: true, force: true });
        }
      }
    };
    syncLock();
    // Dialogs already own body locking; mirror that without observing cursor styles.
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    return () => {
      observer.disconnect();
      lenis.destroy();
      delete root.dataset.lenisScope;
    };
  }, [pathname, reducedMotion]);
  return null;
}
