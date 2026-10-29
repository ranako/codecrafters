import { useEffect, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const cursor = useRef(null);
  useEffect(() => {
    const node = cursor.current;
    const eligible = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let activeDialog = null;
    let pulse;
    const hide = () => {
      document.documentElement.classList.remove('cc-cursor-enabled');
      node.dataset.visible = 'false';
      node.dataset.pressed = 'false';
      if (node.matches(':popover-open')) node.hidePopover();
    };
    const move = (event) => {
      if (!eligible.matches || event.pointerType === 'touch') { hide(); return; }
      const dialog = document.querySelector('dialog[open]');
      if (dialog !== activeDialog && node.matches(':popover-open')) node.hidePopover();
      activeDialog = dialog;
      // A top-layer cursor stays visible over native dialogs as well as page content.
      if (node.showPopover && !node.matches(':popover-open')) node.showPopover();
      node.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      node.dataset.visible = 'true';
      node.dataset.interactive = String(Boolean(event.target.closest?.('a[href], button:not(:disabled), input, textarea, select, summary, [role="button"], [contenteditable="true"]')));
      document.documentElement.classList.add('cc-cursor-enabled');
    };
    const down = (event) => { move(event); node.dataset.pressed = 'true'; };
    const up = () => {
      node.dataset.pressed = 'false';
      if (reduced.matches || node.dataset.visible !== 'true') return;
      pulse?.cancel();
      pulse = node.querySelector('.cc-cursor-pulse').animate([
        { transform: 'translate(-50%, -50%) scale(.5)', opacity: .65 },
        { transform: 'translate(-50%, -50%) scale(1.8)', opacity: 0 },
      ], { duration: 280, easing: 'cubic-bezier(.23,1,.32,1)' });
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', hide);
    window.addEventListener('blur', hide);
    document.addEventListener('pointerleave', hide);
    eligible.addEventListener('change', hide);
    return () => {
      hide(); pulse?.cancel();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', hide);
      window.removeEventListener('blur', hide);
      document.removeEventListener('pointerleave', hide);
      eligible.removeEventListener('change', hide);
    };
  }, []);
  return <div ref={cursor} popover="manual" className="cc-cursor" aria-hidden="true"><span className="cc-cursor-frame" /><span className="cc-cursor-dot" /><span className="cc-cursor-pulse" /></div>;
}
