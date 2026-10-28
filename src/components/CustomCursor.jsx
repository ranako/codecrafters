import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursor = useRef(null);
  useEffect(() => {
    const eligible = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)');
    const node = cursor.current;
    let frame = 0;
    let x = 0, y = 0, nextX = 0, nextY = 0;
    let visible = false;
    const hide = () => { visible = false; node.style.opacity = '0'; };
    const draw = () => {
      frame = 0;
      if (!visible) return;
      x += (nextX - x) * 0.35; y += (nextY - y) * 0.35;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(nextX - x) + Math.abs(nextY - y) > 0.1) frame = requestAnimationFrame(draw);
    };
    const move = (event) => {
      if (!eligible.matches || event.pointerType === 'touch' || event.buttons || document.getSelection()?.toString()) { hide(); return; }
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-native-cursor]')) { hide(); return; }
      nextX = event.clientX; nextY = event.clientY;
      if (!visible) { x = nextX; y = nextY; }
      visible = true; node.style.opacity = '1';
      node.dataset.interactive = String(Boolean(target?.closest('a[href], button:not(:disabled), [role="button"], [data-cursor="pointer"]')));
      if (!frame) frame = requestAnimationFrame(draw);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', hide);
    window.addEventListener('blur', hide);
    document.addEventListener('pointerleave', hide);
    eligible.addEventListener('change', hide);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', hide);
      window.removeEventListener('blur', hide);
      document.removeEventListener('pointerleave', hide);
      eligible.removeEventListener('change', hide);
    };
  }, []);
  return <div ref={cursor} className="cc-cursor" aria-hidden="true"><span /></div>;
}
