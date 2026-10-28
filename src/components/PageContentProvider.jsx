import { useEffect, useState } from "react";
import { PageContentContext } from "../hooks/usePageContent";
import { defaultPageContent } from "../lib/pageContentSchema";
import { fetchPageContents, PAGE_CONTENT_EVENT } from "../lib/pageContentApi";
export default function PageContentProvider({ children }) {
  const [pages, setPages] = useState(defaultPageContent);
  useEffect(() => {
    let active = true;
    let revision = 0;
    const load = async () => {
      const request = ++revision;
      try {
        const next = await fetchPageContents();
        if (active && request === revision)
          setPages({ ...defaultPageContent, ...next });
      } catch {
        /* Public pages keep their established content if the CMS is unavailable. */
      }
    };
    const update = (event) => {
      revision++;
      if (event.detail)
        setPages((current) => ({
          ...current,
          [event.detail.page]: event.detail.content,
        }));
      else load();
    };
    load();
    window.addEventListener("focus", load);
    window.addEventListener(PAGE_CONTENT_EVENT, update);
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("cc-page-content")
        : null;
    if (channel) channel.onmessage = load;
    return () => {
      active = false;
      window.removeEventListener("focus", load);
      window.removeEventListener(PAGE_CONTENT_EVENT, update);
      channel?.close();
    };
  }, []);
  return (
    <PageContentContext.Provider value={pages}>
      {children}
    </PageContentContext.Provider>
  );
}
