import { useSyncExternalStore } from 'react';
const query = '(prefers-reduced-motion: reduce)';
const getSnapshot = () => window.matchMedia(query).matches;
const getServerSnapshot = () => true;
function subscribe(callback) {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
export function useReducedMotionPreference() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
