import { supabase } from './supabase';

import { normalizePresentation } from "./presentationUtils";
export { defaultPresentation, normalizePresentation, reelPhotoKey, selectReelPhotos } from "./presentationUtils";

export async function fetchPresentation() {
  const { data, error } = await supabase.from('site_presentation_settings').select('key,value');
  if (error) throw error;
  return normalizePresentation(Object.fromEntries(data.map((row) => [row.key, row.value])));
}

export async function savePresentation(settings) {
  const normalized = normalizePresentation(settings);
  const { error } = await supabase.from('site_presentation_settings').upsert(Object.entries(normalized).map(([key, value]) => ({ key, value })));
  if (error) throw error;
  window.dispatchEvent(new Event('cc-presentation-updated'));
}

