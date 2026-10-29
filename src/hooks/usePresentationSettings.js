import { usePublicPreview } from './usePublicCollection';
import { useEffect, useState } from 'react';
import { defaultPresentation, fetchPresentation } from '../lib/presentationSettings';

export function usePresentationSettings() {
  const preview = usePublicPreview();
  const isPreview = Boolean(preview);
  const [settings, setSettings] = useState(defaultPresentation);
  useEffect(() => {
    if (isPreview) return;
    let active = true;
    const load = () => { fetchPresentation().then((next) => { if (active) setSettings(next); }).catch(() => { /* Keep the established appearance when settings cannot be read. */ }); };
    load();
    window.addEventListener('focus', load);
    window.addEventListener('cc-presentation-updated', load);
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('cc-presentation') : null;
    if (channel) channel.onmessage = load;
    return () => { active = false; window.removeEventListener('focus', load); window.removeEventListener('cc-presentation-updated', load); channel?.close(); };
  }, [isPreview]);
  return preview?.presentation || settings;
}
