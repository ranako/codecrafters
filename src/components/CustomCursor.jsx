import { useEffect, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const cursor = useRef(null);
  useEffect(() => {
    const node = cursor.current;
    const eligible = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const follower = node.querySelector('.cc-cursor-follow');
    let frame = 0;
    let previousTime = 0;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    const draw = (time) => {
      const elapsed = Math.min(64, previousTime ? time - previousTime : 16);
      previousTime = time;
      const blend = reduced.matches ? 1 : 1 - Math.exp(-elapsed / 65);
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < .1;
      if (settled) { x = targetX; y = targetY; }
      follower.style.transform = `translate3d(${x - targetX}px, ${y - targetY}px, 0)`;
      frame = settled ? 0 : requestAnimationFrame(draw);
      if (settled) previousTime = 0;
    };
    let activeDialog = null;

    const hide = () => {
      cancelAnimationFrame(frame); frame = 0; previousTime = 0;
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
      targetX = event.clientX; targetY = event.clientY;
      if (node.dataset.visible !== 'true' || reduced.matches) { x = targetX; y = targetY; }
      follower.style.transform = `translate3d(${x - targetX}px, ${y - targetY}px, 0)`;
      if (!frame) frame = requestAnimationFrame(draw);
      node.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      node.dataset.visible = 'true';
      const target = event.target instanceof Element ? event.target : null;
      const text = target?.closest('textarea, [contenteditable="true"], input:not([type]), input:is([type="text"], [type="email"], [type="password"], [type="search"], [type="url"], [type="tel"], [type="number"])');
      const range = target?.closest('input[type="range"]');
      const grip = target?.closest('[draggable="true"], .image-focal');
      const interactive = target?.closest('a[href], button:not(:disabled), input, textarea, select, summary, [role="button"], [contenteditable="true"]');
      node.dataset.mode = text ? 'text' : range ? 'range' : grip ? 'grab' : 'pointer';
      node.dataset.interactive = String(Boolean(interactive || grip));
      document.documentElement.classList.add('cc-cursor-enabled');
    };
    const down = (event) => { move(event); node.dataset.pressed = 'true'; };
    const up = () => {
      node.dataset.pressed = 'false';

    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', hide);
    window.addEventListener('blur', hide);
    document.addEventListener('pointerleave', hide);
    eligible.addEventListener('change', hide);
    return () => {
      hide();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', hide);
      window.removeEventListener('blur', hide);
      document.removeEventListener('pointerleave', hide);
      eligible.removeEventListener('change', hide);
    };
  }, []);
  return <div ref={cursor} popover="manual" className="cc-cursor" aria-hidden="true">
    <span className="cc-cursor-follow"><svg className="cc-cursor-circle" width="32" height="32" viewBox="0 0 24 24" fill="none"><circle className="cc-cursor-outline" cx="12" cy="12" r="9" /></svg></span>
    <span className="cc-cursor-dot" />
    <svg className="cc-cursor-text" width="18" height="24" viewBox="0 0 18 24" fill="none"><path d="M6 3h6M9 3v18M6 21h6" /></svg>
    <svg className="cc-cursor-range" width="28" height="20" viewBox="0 0 28 20" fill="none"><path d="m7 5-5 5 5 5m14-10 5 5-5 5M3 10h22" /></svg>
    <svg className="cc-cursor-grab" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18M9 6l3-3 3 3m-6 12 3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3" /></svg>
  </div>;
}
