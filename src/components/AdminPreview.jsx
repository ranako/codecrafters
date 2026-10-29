import { projectPreviewRecord } from "../lib/previewData";
import {
  Component,
  Suspense,
  lazy,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { MotionConfig } from "framer-motion";
import { PageContentContext } from "../hooks/usePageContent";
import { PublicPreviewContext } from "../hooks/usePublicCollection";
import { normalizePageContent, pageSchemas } from "../lib/pageContentSchema";
import {
  fetchCoreTeamMembers,
  fetchPastEventAlbums,
  fetchTestimonials,
  fetchEvents,
} from "../lib/contentApi";
import {
  defaultPresentation,
  fetchPresentation,
} from "../lib/presentationSettings";
import { eventStatus } from "../lib/eventUtils";
import Navbar from "./Navbar";
import Footer from "./Footer";
import EventSections from "./EventSections";
import HomeEventSpotlight from "./HomeEventSpotlight";
import EventModal from "./EventModal";
import GalleryReel from "./GalleryReel";
import AlbumViewer from "./AlbumViewer";
import { TestimonialCard } from "./TestimonialsMarquee";
import { galleryPhotos } from "../lib/eventUtils";
import "./AdminPreview.css";
const pages = {
  home: lazy(() => import("../pages/Home")),
  about: lazy(() => import("../pages/About")),
  events: lazy(() => import("../pages/Events")),
  gallery: lazy(() => import("../pages/Gallery")),
  team: lazy(() => import("../pages/Team")),
  contact: lazy(() => import("../pages/Contact")),
};
const widths = { desktop: 1280, tablet: 768, mobile: 390 };
class PreviewBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidUpdate(previous) {
    if (this.state.error && previous.reset !== this.props.reset)
      this.setState({ error: false });
  }
  render() {
    return this.state.error ? (
      <p className="preview-empty" role="status">
        This draft cannot be displayed yet. Complete its fields to update the
        preview.
      </p>
    ) : (
      this.props.children
    );
  }
}
function PreviewScene({ page, collection, record, placement, presentation }) {
  const [open, setOpen] = useState(
    placement === "eventDetail" || placement === "photoViewer",
  );
  const [photoIndex, setPhotoIndex] = useState(0);
  if (collection && !record)
    return (
      <p className="preview-empty">Select or add an item to preview it.</p>
    );
  if (collection === "upcoming")
    return (
      <div className="preview-component preview-page-component">
        <p className="preview-placement-label">
          {placement === "eventHome"
            ? "Home spotlight"
            : placement === "eventDetail"
              ? "Event details"
              : "Events card"}{" "}
          preview
        </p>
        {placement === "eventHome" ? (
          <HomeEventSpotlight event={record} />
        ) : placement === "eventDetail" ? (
          <>
            <button onClick={() => setOpen(true)}>Open event details</button>
            {open && (
              <EventModal
                event={record}
                status={eventStatus(record)}
                onClose={() => setOpen(false)}
              />
            )}
          </>
        ) : (
          <div className="events-polish w-full bg-[#e6e4dc] relative">
            <EventSections />
          </div>
        )}
      </div>
    );
  if (collection === "team") {
    const TeamPage = pages.team;
    return <TeamPage />;
  }
  if (collection === "testimonials")
    return (
      <div className="home-polish preview-component">
        <TestimonialCard testimonial={record} />
      </div>
    );
  if (collection === "album" && placement === "photoViewer")
    return (
      <div className="preview-component">
        <button onClick={() => setOpen(true)}>Open photo viewer</button>
        {open && (
          <AlbumViewer
            album={record}
            initialIndex={Math.max(
              0,
              record.photos?.indexOf(record.previewPhoto) || 0,
            )}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    );
  if (collection === "album" && placement === "photoReel")
    return (
      <>
        <GalleryReel
          photos={galleryPhotos([record], [])}
          settings={presentation.gallery_reel}
          onSelect={(photo) => {
            setPhotoIndex(photo.index);
            setOpen(true);
          }}
        />
        {open && (
          <AlbumViewer
            album={record}
            initialIndex={photoIndex}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    );
  const scenePage =
    collection === "album"
      ? placement === "albumHome"
        ? "home"
        : placement === "albumHanging"
          ? "events"
          : "gallery"
      : page;
  const Page = pages[scenePage === "shared" ? "home" : scenePage] || pages.home;
  return (
    <>
      <Navbar />
      <main className="relative z-10">
        <Page />
      </main>
      <Footer />
    </>
  );
}
export default function AdminPreview({
  page = "home",
  draft,
  collection,
  records,
  selectedIndex = 0,
  placement,
  presentation: presentationDraft,
  dirty = false,
}) {
  const publishedPages = useContext(PageContentContext);
  const [published, setPublished] = useState({
    events: [],
    albums: [],
    team: [],
    testimonials: [],
  });
  const [appearance, setAppearance] = useState(defaultPresentation);
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState("desktop");
  const [show, setShow] = useState(false);
  const [actualSize, setActualSize] = useState(false);
  const [mount, setMount] = useState(null);
  const [available, setAvailable] = useState(500);
  const holder = useRef(null);
  const frame = useRef(null);
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetchEvents(),
      fetchPastEventAlbums(),
      fetchCoreTeamMembers(),
      fetchTestimonials(),
      fetchPresentation(),
    ]).then((results) => {
      if (!active) return;
      const names = ["events", "albums", "team", "testimonials"];
      setPublished(
        Object.fromEntries(
          names.map((name, i) => [
            name,
            results[i].status === "fulfilled" ? results[i].value : [],
          ]),
        ),
      );
      if (results[4].status === "fulfilled") setAppearance(results[4].value);
      if (results.some((result) => result.status === "rejected"))
        setLoadError(
          "Some published context could not load. Your local draft is still shown.",
        );
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!holder.current) return;
    const observer = new ResizeObserver((entries) =>
      setAvailable(entries[0].contentRect.width),
    );
    observer.observe(holder.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!mount) return;
    const head = mount.ownerDocument.head;
    const copy = () => {
      head
        .querySelectorAll("[data-preview-style]")
        .forEach((node) => node.remove());
      document.head
        .querySelectorAll('style,link[rel="stylesheet"]')
        .forEach((node) => {
          const cloned = node.cloneNode(true);
          cloned.setAttribute("data-preview-style", "");
          head.appendChild(cloned);
        });
      const settled = mount.ownerDocument.createElement("style");
      settled.setAttribute("data-preview-style", "");
      settled.textContent =
        'html,body{margin:0;background:#e6e4dc;}[data-preview-root] [style*="opacity: 0"]{opacity:1!important;}[data-preview-root] *{animation-duration:0s!important;transition-duration:0s!important;}';
      head.appendChild(settled);
    };
    copy();
    const observer = new MutationObserver(copy);
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [mount]);
  const pageContent = useMemo(
    () => ({
      ...publishedPages,
      ...(draft ? { [page]: normalizePageContent(page, draft) } : {}),
      ...(collection === "team"
        ? {
            team: {
              ...publishedPages.team,
              originals: { ...publishedPages.team.originals, enabled: false },
            },
          }
        : {}),
    }),
    [publishedPages, page, draft, collection],
  );
  const selected = projectPreviewRecord(
    collection,
    records?.[Math.min(selectedIndex, Math.max(0, records.length - 1))],
  );
  // Only public-facing content is passed into this subtree; no sessions, tokens or admin form state.
  const collections = {
    ...published,
    ...(collection
      ? {
          [{
            upcoming: "events",
            album: "albums",
            team: "team",
            testimonials: "testimonials",
          }[collection]]: selected ? [selected] : [],
        }
      : {}),
  };
  const previewPage =
    collection === "album"
      ? placement === "albumHome"
        ? "home"
        : placement === "albumHanging"
          ? "events"
          : "gallery"
      : page;
  const path = pageSchemas[previewPage]?.path || "/";
  const scale = actualSize ? 1 : Math.min(1, available / widths[mode]);
  const payload = {
    collections,
    presentation: presentationDraft || appearance,
    document: mount?.ownerDocument,
    path,
  };
  const handleLoad = () => {
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    doc.title = "CodeCrafters private draft preview";
    const root = doc.createElement("div");
    root.setAttribute("data-preview-root", "");
    doc.body.replaceChildren(root);
    setMount(root);
  };
  return (
    <aside
      className={`admin-preview ${show ? "preview-mobile-visible" : ""}`}
      aria-label="Live website preview"
    >
      <div className="admin-preview-toolbar">
        <div>
          <h3>Live preview</h3>
          <p role="status">
            {dirty ? "Unsaved draft" : "Saved content"} · Only visible here
          </p>
        </div>
        <button
          type="button"
          className="preview-small-toggle"
          aria-expanded={show}
          onClick={() => setShow(!show)}
        >
          {show ? "Back to editor" : "Show preview"}
        </button>
      </div>
      <div className="preview-modes" role="group" aria-label="Preview viewport">
        {Object.keys(widths).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
          >
            {value[0].toUpperCase() + value.slice(1)}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={actualSize}
          onClick={() => setActualSize(!actualSize)}
        >
          {actualSize ? "Fit preview" : "Actual size"}
        </button>
      </div>
      {selected && (selected.is_published === false || selected.is_active === false) && <p className="preview-note">This item is unpublished. It is shown only in this preview.</p>}
      {loadError && (
        <p className="preview-load-error" role="status">
          {loadError}
        </p>
      )}
      <p className="preview-note">
        Links and submissions are disabled. Website dialogs can be inspected.
      </p>
      <div
        className="preview-frame-holder"
        ref={holder}
        style={{ height: Math.round(820 * scale) }}
      >
        <iframe
          ref={frame}
          title={`${mode} website preview`}
          sandbox="allow-same-origin"
          srcDoc="<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head><body></body></html>"
          onLoad={handleLoad}
          style={{
            width: widths[mode],
            height: 820,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
        {mount &&
          createPortal(
            <PageContentContext.Provider value={pageContent}>
              <PublicPreviewContext.Provider value={payload}>
                <MotionConfig reducedMotion="always">
                  <div
                    className="min-h-screen relative bg-light-bg text-black"
                    onClickCapture={(e) => {
                      if (e.target.closest?.("a[href]")) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    onSubmitCapture={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <PreviewBoundary
                      reset={JSON.stringify([
                        draft,
                        selected,
                        placement,
                        presentationDraft,
                      ])}
                    >
                      <Suspense
                        fallback={
                          <p className="preview-empty">Loading preview…</p>
                        }
                      >
                        <PreviewScene
                          key={`${page}-${collection}-${placement}`}
                          page={page}
                          collection={collection}
                          record={selected}
                          placement={placement}
                          presentation={payload.presentation}
                        />
                      </Suspense>
                    </PreviewBoundary>
                  </div>
                </MotionConfig>
              </PublicPreviewContext.Provider>
            </PageContentContext.Provider>,
            mount,
          )}
      </div>
    </aside>
  );
}
