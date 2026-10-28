import { supabase } from "./supabase";
import {
  pageSchemas,
  normalizePageContent,
  validatePageContent,
} from "./pageContentSchema";
export const PAGE_CONTENT_EVENT = "cc-page-content-updated";
function contentError(error) {
  if (["42P01", "PGRST205"].includes(error.code))
    return new Error(
      "Page editing needs its database table. Run supabase/page-content.sql in the Supabase SQL Editor, then retry.",
    );
  return new Error(
    error.message || "Page content could not be loaded. Please try again.",
  );
}
export async function fetchPageContents() {
  const { data, error } = await supabase
    .from("site_page_content")
    .select("page,content");
  if (error) throw contentError(error);
  return Object.fromEntries(
    (data || [])
      .filter((row) => pageSchemas[row.page])
      .map((row) => [row.page, normalizePageContent(row.page, row.content)]),
  );
}
export async function fetchPageContent(page) {
  const { data, error } = await supabase
    .from("site_page_content")
    .select("page,content")
    .eq("page", page)
    .maybeSingle();
  if (error) throw contentError(error);
  return normalizePageContent(page, data?.content);
}
export async function savePageContent(page, content) {
  const normalized = validatePageContent(page, content);
  const { data, error } = await supabase
    .from("site_page_content")
    .upsert({ page, content: normalized, updated_at: new Date().toISOString() })
    .select("page,content")
    .single();
  if (error) throw contentError(error);
  const saved = normalizePageContent(page, data.content);
  window.dispatchEvent(
    new CustomEvent(PAGE_CONTENT_EVENT, { detail: { page, content: saved } }),
  );
  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("cc-page-content")
      : null;
  channel?.postMessage("saved");
  channel?.close();
  return saved;
}
