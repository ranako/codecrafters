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
    let x = 0, y = 0, targetX = 0, targetY = 0, pointerX = 0, pointerY = 0;
    const draw = (time) => {
      const elapsed = Math.min(64, previousTime ? time - previousTime : 16);
      previousTime = time;
      const blend = reduced.matches ? 1 : 1 - Math.exp(-elapsed / 65);
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      const settled = Math.abs(targetX - x) + Math.abs(targetY - y) < .1;
      if (settled) { x = targetX; y = targetY; }
      follower.style.transform = `translate3d(${x - pointerX}px, ${y - pointerY}px, 0)`;
      frame = settled ? 0 : requestAnimationFrame(draw);
      if (settled) previousTime = 0;
    };
    let activeDialog = null;
    let ripple;

    const hide = () => {
      ripple?.cancel();
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
      const target = event.target instanceof Element ? event.target : null;
      pointerX = event.clientX; pointerY = event.clientY;
      targetX = pointerX;
      targetY = pointerY;
      if (node.dataset.visible !== 'true' || reduced.matches) { x = targetX; y = targetY; }
      follower.style.transform = `translate3d(${x - pointerX}px, ${y - pointerY}px, 0)`;
      if (!frame) frame = requestAnimationFrame(draw);
      node.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      node.dataset.visible = 'true';
      const interactive = target?.closest('a[href], button:not(:disabled), input, textarea, select, summary, [role="button"], [draggable="true"], .image-focal');
      node.dataset.mode = 'pointer';
      node.dataset.interactive = String(Boolean(interactive && !interactive.matches(':disabled, [aria-disabled="true"]')));
      document.documentElement.classList.add('cc-cursor-enabled');
    };
    const down = (event) => {
      if (event.button !== 0) return;
      move(event);
      if (node.dataset.visible === 'true') node.dataset.pressed = 'true';
    };
    const up = () => {
      const pressed = node.dataset.pressed === 'true';
      node.dataset.pressed = 'false';
      if (!pressed || reduced.matches || node.dataset.visible !== 'true') return;
      ripple?.cancel();
      ripple = node.querySelector('.cc-cursor-ripple').animate([
        { transform: 'scale(.9)', opacity: .45 },
        { transform: 'scale(1.8)', opacity: 0 },
      ], { duration: 240, easing: 'cubic-bezier(.23,1,.32,1)' });
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
    <span className="cc-cursor-follow"><svg className="cc-cursor-circle" width="32" height="32" viewBox="0 0 24 24" fill="none"><circle className="cc-cursor-outline" cx="12" cy="12" r="9" vectorEffect="non-scaling-stroke" /></svg></span>
    <span className="cc-cursor-dot" />
    <span className="cc-cursor-ripple" />
  </div>;
}
