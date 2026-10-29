import "../components/AdminControls.css";
import ImageControls from "../components/ImageControls";
import { replaceAlbumPhoto, removeAlbumPhoto } from "../lib/imageDisplay";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaUsers,
  FaQuoteLeft,
  FaCameraRetro,
  FaSave,
  FaUndo,
  FaPlus,
  FaTrash,
  FaCheck,
  FaLock,
  FaSignOutAlt,
  FaCog,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaGripVertical,
  FaUpload,
  FaLink,
} from "react-icons/fa";
import {
  deleteCoreTeamMembers,
  deletePastEventAlbums,
  deleteTestimonials,
  deleteUpcomingEvents,
  fetchCoreTeamMembers,
  fetchPastEventAlbums,
  fetchTestimonials,
  fetchUpcomingEvents,
  saveCoreTeamMembers,
  savePastEventAlbums,
  saveTestimonials,
  saveUpcomingEvents,
} from "../lib/contentApi";
import {
  deleteStorageFilesByUrls,
  getStorageBucketName,
  getStoragePathFromUrl,
  uploadImageFile,
  uploadImageFiles,
} from "../lib/storageApi";
import {
  isSupabaseConfigured,
  missingSupabaseEnvMessage,
  supabase,
} from "../lib/supabase";

import PageContentEditor from "../components/PageContentEditor";
import { pageSchemas } from "../lib/pageContentSchema";
import PresentationManager from "../components/PresentationManager";
import { registrationUrl, eventStatus, indiaDateTime, fromIndiaDateTime } from "../lib/eventUtils";

const TABS = [
  { id: "upcoming", label: "Events", icon: FaCalendarAlt },
  { id: "team", label: "Core Members", icon: FaUsers },
  { id: "album", label: "Photo Album", icon: FaCameraRetro },
  { id: "testimonials", label: "Testimonials", icon: FaQuoteLeft },
];

const EMPTY_ITEMS = {
  upcoming: {
    title: "New Event",
    description: "",
    date: "",
    category: "",
    registration_url: "",
    starts_at: "",
    ends_at: "",
    status_override: "",
    image: "",
    location: "",
    time: "",
    speakers: [],
    gradient: "from-gray-500 to-gray-700",
    is_published: true,
  },
  team: {
    name: "New Member",
    role: "",
    linkedin: "",
    github: "",
    behance: "",
    image: "",
    is_active: true,
  },
  album: {
    title: "New Album",
    date: "",
    description: "",
    coverImage: "",
    event_id: "",
    photo_captions: {},
    photos: [],
    is_published: true,
  },
  testimonials: {
    name: "New Person",
    role: "",
    text: "",
    avatar: "",
    is_published: true,
  },
};

function createTempId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `temp-${crypto.randomUUID()}`;
  }

  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function moveArrayItem(items, fromIndex, toIndex) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

function getPersistedIds(items) {
  return items
    .map((item) => item.id)
    .filter((id) => typeof id === "string" && !id.startsWith("temp-"));
}

function getManagedImageUrlsForTab(tabId, items) {
  const urls = [];

  items.forEach((item) => {
    if (tabId === "upcoming" && item.image) {
      urls.push(item.image);
    }

    if (tabId === "team" && item.image) {
      urls.push(item.image);
    }

    if (tabId === "testimonials" && item.avatar) {
      urls.push(item.avatar);
    }

    if (tabId === "album") {
      if (item.coverImage) {
        urls.push(item.coverImage);
      }

      if (Array.isArray(item.photos)) {
        urls.push(...item.photos.filter(Boolean));
      }
    }
  });

  return urls.filter(Boolean);
}

async function fetchByTab(tabId) {
  switch (tabId) {
    case "upcoming":
      return fetchUpcomingEvents({ admin: true });
    case "team":
      return fetchCoreTeamMembers({ admin: true });
    case "album":
      return fetchPastEventAlbums({ admin: true });
    case "testimonials":
      return fetchTestimonials({ admin: true });
    default:
      return [];
  }
}

async function saveByTab(tabId, items) {
  switch (tabId) {
    case "upcoming":
      return saveUpcomingEvents(items);
    case "team":
      return saveCoreTeamMembers(items);
    case "album":
      return savePastEventAlbums(items);
    case "testimonials":
      return saveTestimonials(items);
    default:
      return [];
  }
}

async function deleteByTab(tabId, ids) {
  if (!ids.length) return;

  switch (tabId) {
    case "upcoming":
      return deleteUpcomingEvents(ids);
    case "team":
      return deleteCoreTeamMembers(ids);
    case "album":
      return deletePastEventAlbums(ids);
    case "testimonials":
      return deleteTestimonials(ids);
    default:
      return undefined;
  }
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const sessionUserId = session?.user?.id;
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const pendingAlbumEvent = useRef("");
  const [clock, setClock] = useState(Date.now);
  const [eventOptions, setEventOptions] = useState([]);
  const [activePage, setActivePage] = useState("home");
  const [activeTab, setActiveTab] = useState({ id: "page", label: "Page content" });
  const [hasLoadedTab, setHasLoadedTab] = useState(false);
  const pageDirty = useRef(false);
  const pageBusy = useRef(false);
  const onPageBusyChange = useCallback((busy) => { pageBusy.current = busy; }, []);
  const onPageDirtyChange = useCallback((dirty) => { pageDirty.current = dirty; }, []);
  const [formData, setFormData] = useState([]);
  const [initialSnapshot, setInitialSnapshot] = useState([]);
  const [initialIds, setInitialIds] = useState([]);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [tabError, setTabError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [draggedPhoto, setDraggedPhoto] = useState(null);
  const [uploadingTarget, setUploadingTarget] = useState("");

  const recordDirty = TABS.some(tab=>tab.id===activeTab.id) && JSON.stringify(formData)!==JSON.stringify(initialSnapshot);
  useEffect(()=>{
    if(!recordDirty && !isSaving && !uploadingTarget)return;
    const warn=event=>{event.preventDefault();event.returnValue='';};
    const guard=event=>{const anchor=event.target.closest?.('a[href]');if(!anchor || anchor.target==='_blank' || event.metaKey || event.ctrlKey)return;const url=new URL(anchor.href,location.href);if(url.origin===location.origin && url.pathname!==location.pathname && (isSaving || uploadingTarget || !window.confirm('Discard unsaved record changes and leave the editor?'))){event.preventDefault();event.stopPropagation();}};
    window.addEventListener('beforeunload',warn);document.addEventListener('click',guard,true);
    return()=>{window.removeEventListener('beforeunload',warn);document.removeEventListener('click',guard,true);};
  },[recordDirty,isSaving,uploadingTarget]);
  const selectEditor = (tab, page = activePage) => {
    if (isSaving || uploadingTarget || pageBusy.current) return;
    if (tab.id === activeTab.id && page === activePage) return;
    const dirty = pageDirty.current || (TABS.some(item => item.id === activeTab.id) && JSON.stringify(formData) !== JSON.stringify(initialSnapshot));
    if (dirty && !window.confirm("You have unsaved changes. Discard them and switch sections?")) return;
    pageDirty.current = false;
    setHasLoadedTab(false);setIsLoadingTab(TABS.some(item=>item.id===tab.id));setFormData([]);setInitialSnapshot([]);setInitialIds([]);setSuccess("");setTabError("");
    setActivePage(page);
    setActiveTab(tab);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsCheckingAuth(false);
      setLoginError(missingSupabaseEnvMessage);
      return undefined;
    }

    let isMounted = true;

    async function loadSession() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        setLoginError(error.message);
      }

      setSession(currentSession);
      setIsCheckingAuth(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setLoginError("");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionUserId) return;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [sessionUserId]);

  useEffect(() => {
    if (!sessionUserId) return;
    let active = true;
    fetchUpcomingEvents({ admin: true }).then((events) => { if (active) setEventOptions(events); })
      .catch(() => { if (active) setEventOptions([]); });
    return () => { active = false; };
  }, [sessionUserId, activeTab]);

  useEffect(() => {
    if (!sessionUserId) {
      setFormData([]);
      setInitialSnapshot([]);
      setInitialIds([]);
      return;
    }

    if (!TABS.some(tab => tab.id === activeTab.id)) return;
    let isMounted = true;

    async function loadTab() {
      setIsLoadingTab(true);
      setHasLoadedTab(false);
      setTabError("");
      setSuccess("");

      try {
        const data = await fetchByTab(activeTab.id);
        if (!isMounted) return;
        const pendingEventId = activeTab.id === "album" ? pendingAlbumEvent.current : "";
        if (pendingEventId) {
          setFormData([...cloneData(data), { ...EMPTY_ITEMS.album, id: createTempId(), event_id: pendingEventId }]);
          pendingAlbumEvent.current = "";
        } else {
          setFormData(cloneData(data));
        }
        setInitialSnapshot(cloneData(data));
        setInitialIds(getPersistedIds(data));
        setHasLoadedTab(true);
        setDraggedCardIndex(null);
        setDraggedPhoto(null);
      } catch (error) {
        if (!isMounted) return;
        setFormData([]);
        setInitialSnapshot([]);
        setInitialIds([]);
        setTabError(error.message || "Unable to load this section.");
      } finally {
        if (isMounted) {
          setIsLoadingTab(false);
        }
      }
    }

    loadTab();

    return () => {
      isMounted = false;
    };
  }, [activeTab, sessionUserId]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setLoginError(missingSupabaseEnvMessage);
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password: passwordInput,
    });

    if (error) {
      setLoginError(error.message);
    } else {
      setPasswordInput("");
    }

    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    if (isSaving || uploadingTarget || pageBusy.current) return;
    if (pageDirty.current || JSON.stringify(formData) !== JSON.stringify(initialSnapshot)) { if (!window.confirm("Discard unsaved changes and sign out?")) return; }
    await supabase.auth.signOut();
    setSuccess("");
    setTabError("");
  };

  const handleSave = async () => {
    if (!hasLoadedTab || isSaving || uploadingTarget) return;
    setIsSaving(true);
    setTabError("");
    setSuccess("");

    let recordsAcknowledged = false;
    try {
      for (const item of formData) {
        if (!(activeTab.id === "team" ? item.name : activeTab.id === "testimonials" ? item.name : item.title)?.trim()) {
          throw new Error("Each item needs a name or title before saving.");
        }
        if (activeTab.id === "upcoming") {
          const start = Date.parse(item.starts_at || "");
          const end = Date.parse(item.ends_at || "");
          if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
            throw new Error(`Set a start and end date/time for "${item.title}". The end must be after the start.`);
          }
        }
        if (activeTab.id === "upcoming" && item.registration_url?.trim() && !registrationUrl(item.registration_url.trim())) {
          throw new Error("Registration URL must be a complete http:// or https:// link.");
        }
      }
      const deletedIds = initialIds.filter(
        (id) =>
          !formData.some(
            (item) =>
              typeof item.id === "string" &&
              !item.id.startsWith("temp-") &&
              item.id === id,
          ),
      );

      const originalUrls = getManagedImageUrlsForTab(activeTab.id, initialSnapshot);
      const nextUrls = getManagedImageUrlsForTab(activeTab.id, formData);
      const removedStorageUrls = originalUrls.filter(
        (url) => getStoragePathFromUrl(url) && !nextUrls.includes(url),
      );

      await saveByTab(activeTab.id, formData);
      recordsAcknowledged = true;
      await deleteByTab(activeTab.id, deletedIds);

      const refreshed = await fetchByTab(activeTab.id);
      setFormData(cloneData(refreshed));
      setInitialSnapshot(cloneData(refreshed));
      setInitialIds(getPersistedIds(refreshed));
      setSuccess("Saved to Supabase.");
      window.dispatchEvent(new Event("cc-collections-saved"));
      // File cleanup is secondary to the confirmed record save. A storage failure
      // must not falsely report that persisted page content failed to save.
      try { await deleteStorageFilesByUrls(removedStorageUrls); }
      catch { setTabError("Content saved. Some unused image files could not be cleaned up; the files have been kept."); }
    } catch (error) {
      setTabError(recordsAcknowledged ? `Some changes may already be saved. Your draft has been kept; reload only after checking the saved page. ${error.message || "The remaining operation failed."}` : error.message || "Unable to publish changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        `Reset ${activeTab.label} to the latest Supabase data? Unsaved changes will be lost.`,
      )
    ) {
      return;
    }

    setIsLoadingTab(true);
    setTabError("");
    setSuccess("");

    try {
      const data = await fetchByTab(activeTab.id);
      setFormData(cloneData(data));
      setInitialSnapshot(cloneData(data));
      setInitialIds(getPersistedIds(data));
      setHasLoadedTab(true);
    } catch (error) {
      setTabError(error.message || "Unable to reset this section.");
    } finally {
      setIsLoadingTab(false);
    }
  };

  const updateItem = (index, field, value) => {
    if (isSaving) return;
    setFormData((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const deleteItem = (index) => {
    if (isSaving || uploadingTarget) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setFormData((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = (tabId) => {
    if (isSaving || uploadingTarget) return;
    setFormData((current) => [
      ...current,
      { ...EMPTY_ITEMS[tabId], id: createTempId() },
    ]);
  };

  const moveCard = (fromIndex, toIndex) => {
    if (isSaving || uploadingTarget) return;
    if (fromIndex === toIndex || fromIndex == null || toIndex == null) return;
    setFormData((current) => moveArrayItem(current, fromIndex, toIndex));
  };

  const updatePhoto = (itemIndex, photoIndex, value) => {
    const item = formData[itemIndex];
    try {
      const next = replaceAlbumPhoto(item,photoIndex,value);
      setFormData(current=>current.map((entry,index)=>index===itemIndex?next:entry));
    } catch(error) { setTabError(error.message); }
  };

  const addPhoto = (itemIndex) => {
    if (isSaving || uploadingTarget) return;
    setFormData((current) =>
      current.map((item, index) =>
        index === itemIndex
          ? { ...item, photos: [...(item.photos || []), ""] }
          : item,
      ),
    );
  };

  const removePhoto = (itemIndex, photoIndex) => setFormData(current=>current.map((item,index)=>index===itemIndex?removeAlbumPhoto(item,photoIndex):item));

  const movePhoto = (itemIndex, fromIndex, toIndex) => {
    if (isSaving || uploadingTarget) return;
    if (fromIndex === toIndex || fromIndex == null || toIndex == null) return;

    setFormData((current) =>
      current.map((item, index) => {
        if (index !== itemIndex) return item;
        return { ...item, photos: moveArrayItem(item.photos || [], fromIndex, toIndex), ...(item._photoDrafts ? {_photoDrafts: moveArrayItem((item.photos || []).map((_,position)=>item._photoDrafts[position]),fromIndex,toIndex)} : {}) };
      }),
    );
  };

  const handleImageUpload = async (file, targetKey, onComplete) => {
    if (!file) return;

    setUploadingTarget(targetKey);
    setTabError("");
    setSuccess("");

    try {
      const publicUrl = await uploadImageFile(file, { folder: activeTab.id });
      onComplete(publicUrl);
    } catch (error) {
      setTabError(
        error.message ||
          `Image upload failed. Check the "${getStorageBucketName()}" Supabase storage bucket.`,
      );
    } finally {
      setUploadingTarget("");
    }
  };

  const handleImageUploads = async (files, targetKey, onComplete) => {
    const validFiles = Array.from(files || []).filter(Boolean);
    if (!validFiles.length) return;

    setUploadingTarget(targetKey);
    setTabError("");
    setSuccess("");

    try {
      const publicUrls = await uploadImageFiles(validFiles, {
        folder: activeTab.id,
      });
      onComplete(publicUrls);
    } catch (error) {
      setTabError(
        error.message ||
          `Image upload failed. Check the "${getStorageBucketName()}" Supabase storage bucket.`,
      );
    } finally {
      setUploadingTarget("");
    }
  };

  const renderInput = (label, value, onChange, isTextArea = false) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold uppercase tracking-widest text-black/50">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          aria-label={label}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-lg px-4 py-3 text-sm text-black transition-colors min-h-[100px] resize-y outline-none"
        />
      ) : (
        <input
          type="text"
          aria-label={label}
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-lg px-4 py-2 text-sm text-black transition-colors outline-none"
        />
      )}
    </div>
  );

  const renderImageField = (label, value, onChange, uploadKey) => (
    <div className="flex flex-col gap-3 w-full">
      <label className="text-[11px] font-bold uppercase tracking-widest text-black/50">
        {label}
      </label>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const file = event.dataTransfer?.files?.[0];
          handleImageUpload(file, uploadKey, onChange);
        }}
        className="rounded-xl border-2 border-dashed border-black/15 bg-black/[0.03] p-4"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-28 shrink-0">
            <div className="aspect-square overflow-hidden rounded-lg border border-black/10 bg-white flex items-center justify-center">
              {value ? (
                <img src={value} alt={label} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 text-center px-2">
                  No Image
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
              <FaUpload size={12} />
              Drag image here or upload a file
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold text-xs tracking-[0.2em] uppercase cursor-pointer hover:scale-[1.01] transition-transform">
                <FaUpload size={12} />
                {uploadingTarget === uploadKey ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    handleImageUpload(file, uploadKey, onChange);
                    event.target.value = "";
                  }}
                />
              </label>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                <FaLink size={11} />
                or paste an image URL below
              </div>
            </div>
            <input
              type="text"
              value={value || ""}
              onChange={(event) => onChange(event.target.value)}
              className="w-full bg-white border-2 border-transparent focus:border-black rounded-lg px-4 py-2 text-sm text-black transition-colors outline-none"
              aria-label={`${label} URL`}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCard = (item, index, titleField, fields) => (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      key={item.id || index}
      draggable={!isSaving && !uploadingTarget}
      onDragStart={() => setDraggedCardIndex(index)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        moveCard(draggedCardIndex, index);
        setDraggedCardIndex(null);
      }}
      onDragEnd={() => setDraggedCardIndex(null)}
      className="bg-white border-2 border-black/10 rounded-2xl p-6 mb-6 shadow-sm relative group overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-black/10 transition-colors group-hover:bg-black"></div>

      <div className="flex justify-between items-center mb-6 pl-2">
        <div className="flex items-center gap-3">
          <span
            className="cursor-grab text-black/30 group-hover:text-black/60 transition-colors"
            title="Drag to reorder"
          >
            <FaGripVertical size={16} />
          </span>
          <h3 className="font-bold text-lg text-black">
            {item[titleField] || "New Item"}
          </h3>
        </div>
        <button
          onClick={() => deleteItem(index)}
          className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          title="Delete item"
        >
          <FaTrash size={14} />
        </button>
      </div>

      {activeTab.id === "upcoming" && <div className="flex flex-wrap items-center gap-4 mb-4 pl-2">
        <span className="text-xs font-bold uppercase">{eventStatus(item, clock)}{item.status_override ? " (manual)" : " (automatic)"}</span>
        <button type="button" disabled={!item.id || item.id.startsWith("temp-")} title={item.id?.startsWith("temp-") ? "Save the event before linking an album" : "Create an album for this event"}
          onClick={() => { if (JSON.stringify(formData) !== JSON.stringify(initialSnapshot)) { setTabError("Save your event changes before creating an album."); return; } pendingAlbumEvent.current = item.id; selectEditor(TABS.find((tab) => tab.id === "album")); }}
          className="border-2 border-black px-3 py-2 text-sm font-bold disabled:opacity-40">Add event album</button>
      </div>}
      <label className="flex items-center gap-3 mb-6 pl-2 font-bold text-sm">
        <input type="checkbox" checked={Boolean(activeTab.id === "team" ? item.is_active : item.is_published)}
          onChange={(event) => updateItem(index, activeTab.id === "team" ? "is_active" : "is_published", event.target.checked)} />
        {activeTab.id === "team" ? "Active member" : "Published on website"}
      </label>
      <fieldset disabled={isSaving || Boolean(uploadingTarget)} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-2">
        {fields.map((field) => {
          if (field.type === "schedule") {
            return <label key={field.key} className="text-sm font-bold">{field.label}
              <input type="datetime-local" required value={indiaDateTime(item[field.key])}
                onChange={(event) => {
                  const value = fromIndiaDateTime(event.target.value);
                  setFormData((current) => current.map((entry, position) => position !== index ? entry : {
                    ...entry, [field.key]: value,
                    ...(field.key === "starts_at" ? { date: event.target.value.slice(0, 10), time: event.target.value.slice(11, 16) } : {}),
                  }));
                }} className="block w-full mt-2 border-2 border-black/20 rounded-lg px-4 py-3" />
            </label>;
          }
          if (field.type === "status" || field.type === "eventLink") {
            return <label key={field.key} className="text-sm font-bold">{field.label}
              <select value={item[field.key] || ""} onChange={(event) => updateItem(index, field.key, event.target.value)} className="block w-full mt-2 border-2 border-black/20 rounded-lg px-4 py-3">
                {field.type === "status" ? <><option value="">Automatic from schedule</option><option value="upcoming">Upcoming (manual)</option><option value="live">Live (manual)</option><option value="past">Past (manual)</option></> : <>
                  <option value="">Standalone album</option>
                  {item.event_id && !eventOptions.some((event) => event.id === item.event_id) && <option value={item.event_id}>Linked event (unavailable)</option>}
                  {eventOptions.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
                </>}
              </select>
              {field.type === "status" && <span className="block text-xs font-normal mt-2">Automatic follows the start and end times. A manual status stays selected until you change it back.</span>}
            </label>;
          }
          if (field.type === "stringList") {
            const value = Array.isArray(item[field.key])
              ? item[field.key].join(", ")
              : item[field.key] || "";

            return (
              <div key={field.key} className="md:col-span-2">
                {renderInput(field.label, value, (nextValue) => {
                  updateItem(
                    index,
                    field.key,
                    nextValue
                      .split(",")
                      .map((entry) => entry.trim())
                      .filter(Boolean),
                  );
                })}
              </div>
            );
          }

          if (field.type === "image") {
            return (
              <div key={field.key} className="md:col-span-2">
                {renderImageField(
                  field.label,
                  item[field.key],
                  (nextValue) => updateItem(index, field.key, nextValue),
                  `${activeTab.id}-${index}-${field.key}`,
                )}
                <ImageControls src={item[field.key]} value={item[field.key==='coverImage'?'cover_display':'image_display']} onChange={value=>updateItem(index,field.key==='coverImage'?'cover_display':'image_display',value)} placements={activeTab.id==='upcoming'?['eventCard','eventHome','eventDetail']:activeTab.id==='team'?['member']:activeTab.id==='testimonials'?['avatar']:['albumHome','albumHanging']} disabled={isSaving || Boolean(uploadingTarget)} />
              </div>
            );
          }

          if (field.type === "photoList") {
            const photos = Array.isArray(item[field.key]) ? item[field.key] : [];

            return (
              <div key={field.key} className="md:col-span-2">
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-black/50">
                    {field.label}
                  </label>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleImageUploads(
                        event.dataTransfer?.files,
                        `${activeTab.id}-${index}-${field.key}-batch`,
                        (publicUrls) =>
                          updateItem(index, field.key, [...photos, ...publicUrls]),
                      );
                    }}
                    className="rounded-xl border-2 border-dashed border-black/15 bg-black/[0.03] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
                          Drop multiple gallery images here
                        </p>
                        <p className="text-xs font-bold text-black/40 mt-2">
                          Uploaded images are appended to this album and can be reordered below.
                        </p>
                      </div>
                      <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold text-xs tracking-[0.2em] uppercase cursor-pointer">
                        <FaUpload size={12} />
                        {uploadingTarget === `${activeTab.id}-${index}-${field.key}-batch`
                          ? "Uploading..."
                          : "Upload Many"}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(event) => {
                            handleImageUploads(
                              event.target.files,
                              `${activeTab.id}-${index}-${field.key}-batch`,
                              (publicUrls) =>
                                updateItem(index, field.key, [...photos, ...publicUrls]),
                            );
                            event.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  {photos.map((photo, photoIndex) => (
                    <div
                      key={`${item.id || index}-photo-${photoIndex}`}
                      draggable={!isSaving && !uploadingTarget}
                      onDragStart={() =>
                        setDraggedPhoto({ itemIndex: index, photoIndex })
                      }
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        const file = event.dataTransfer?.files?.[0];
                        if (file) {
                          handleImageUpload(
                            file,
                            `${activeTab.id}-${index}-photo-${photoIndex}`,
                            (publicUrl) => updatePhoto(index, photoIndex, publicUrl),
                          );
                          setDraggedPhoto(null);
                          return;
                        }

                        if (!draggedPhoto || draggedPhoto.itemIndex !== index) return;
                        movePhoto(index, draggedPhoto.photoIndex, photoIndex);
                        setDraggedPhoto(null);
                      }}
                      onDragEnd={() => setDraggedPhoto(null)}
                      className="grid grid-cols-1 md:grid-cols-[72px_1fr_auto] gap-3 items-center rounded-xl border-2 border-black/10 bg-black/[0.03] p-3"
                    >
                      <div className="aspect-square overflow-hidden rounded-lg bg-black/5 border border-black/10 flex items-center justify-center">
                        {photo ? (
                          <img
                            src={photo}
                            alt={`Photo ${photoIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                            Empty
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="cursor-grab text-black/30 group-hover:text-black/60 transition-colors"
                          title="Drag to reorder photo"
                        >
                          <FaGripVertical size={16} />
                        </span>
                        <input
                          type="text"
                          value={photo || ""}
                          onChange={(event) =>
                            updatePhoto(index, photoIndex, event.target.value)
                          }
                          className="w-full bg-white border-2 border-transparent focus:border-black rounded-lg px-4 py-2 text-sm text-black transition-colors outline-none"
                          placeholder="Paste photo URL"
                        />
                        <label className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg font-bold text-[10px] tracking-[0.2em] uppercase cursor-pointer">
                          <FaUpload size={10} />
                          {uploadingTarget === `${activeTab.id}-${index}-photo-${photoIndex}`
                            ? "Uploading..."
                            : "Upload"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              handleImageUpload(
                                file,
                                `${activeTab.id}-${index}-photo-${photoIndex}`,
                                (publicUrl) =>
                                  updatePhoto(index, photoIndex, publicUrl),
                              );
                              event.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <label className="md:col-span-3 text-xs font-bold">Photo caption (searchable)
                        <input type="text" value={item.photo_captions?.[photo] || ""}
                          onChange={(event) => updateItem(index, "photo_captions", { ...item.photo_captions, [photo]: event.target.value })}
                          className="block w-full mt-2 bg-white border-2 border-black/20 rounded-lg px-4 py-2" />
                      </label>
                      <div className="md:col-span-3"><ImageControls src={photo} value={item.photo_display?.[photo]} onChange={value=>updateItem(index,'photo_display',{...item.photo_display,[photo]:value})} placements={['photoGrid','photoReel','photoViewer']} disabled={isSaving || Boolean(uploadingTarget)} /></div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index, photoIndex)}
                        className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete photo"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPhoto(index)}
                    className="self-start px-4 py-2 bg-black/5 hover:bg-black/10 text-black rounded-xl font-bold text-xs tracking-[0.2em] uppercase transition-colors"
                  >
                    Add Photo
                  </button>
                </div>
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.key} className="md:col-span-2">
                {renderInput(
                  field.label,
                  item[field.key],
                  (nextValue) => updateItem(index, field.key, nextValue),
                  true,
                )}
              </div>
            );
          }

          return (
            <div
              key={field.key}
              className={field.fullWidth ? "md:col-span-2" : ""}
            >
              {renderInput(field.label, item[field.key], (nextValue) => {
                updateItem(index, field.key, nextValue);
              })}
            </div>
          );
        })}
      </fieldset>
    </Motion.div>
  );

  if (isCheckingAuth) {
    return (
      <div className="min-h-[80vh] py-20 bg-[#e6e4dc] flex items-center justify-center">
        <div className="flex items-center gap-3 text-black/60 font-bold uppercase tracking-[0.2em] text-xs">
          <FaSpinner className="animate-spin" />
          Checking access
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] py-20 bg-[#e6e4dc] flex flex-col justify-center items-center p-6 font-sans">
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-10 rounded-2xl max-w-md w-full border-2 border-black/10 shadow-[12px_12px_0px_rgba(0,0,0,0.1)] relative"
        >
          <div className="absolute -top-6 -right-6 text-black/10 rotate-12 pointer-events-none">
            <FaLock size={80} />
          </div>

          <h1 className="text-3xl font-black font-serif text-black tracking-tighter mb-2 relative z-10">
            Admin Access
          </h1>
          <p className="text-black/60 mb-8 font-medium">
            Sign in with your Supabase admin credentials.
          </p>

          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              {missingSupabaseEnvMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
            <input
              type="email"
              placeholder="Enter email..."
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 text-black outline-none transition-colors"
              autoFocus
              autoComplete="email"
              disabled={!isSupabaseConfigured}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-xl pl-4 pr-14 py-3 text-black outline-none transition-colors"
                autoComplete="current-password"
                disabled={!isSupabaseConfigured}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-4 text-black/50 hover:text-black transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={!isSupabaseConfigured}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            {loginError && (
              <p className="text-red-500 font-bold text-xs ml-1">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !isSupabaseConfigured}
              className="w-full bg-black text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 font-black tracking-widest uppercase rounded-xl px-4 py-3 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.2)] mt-2"
            >
              {isLoggingIn ? "Signing In..." : "Unlock"}
            </button>
          </form>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="admin-panel min-h-[80vh] bg-[#e6e4dc] pt-24 pb-16 px-6 md:px-12 lg:px-20 font-sans overflow-x-clip">
      <div className="max-w-[1680px] mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b-2 border-black/10"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-black font-serif text-black tracking-tighter inline-flex items-center gap-4">
              <Motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <FaCog size={40} className="text-black/20" />
              </Motion.div>
              Page manager
            </h1>
            <p className="text-black/50 text-xl font-bold font-mono tracking-widest uppercase mt-4">
              Choose a page, then edit its content
            </p>
          </div>
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-black/50 hover:text-black hover:bg-black/5 border-2 border-transparent hover:border-black/10 px-4 py-2 rounded-xl transition-all w-fit md:w-auto"
          >
            <FaSignOutAlt /> Lock Portal
          </Motion.button>
        </Motion.div>

        <nav className="admin-page-nav" aria-label="Website pages">{Object.entries(pageSchemas).map(([page,schema]) => <button key={page} type="button" aria-current={activePage === page ? "page" : undefined} onClick={() => selectEditor({ id: "page", label: "Page content" }, page)}>{schema.label}</button>)}</nav>
        <div className="flex flex-col lg:flex-row gap-8 relative items-start">
          <Motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-64 shrink-0 flex flex-col gap-2 lg:sticky lg:top-32 z-20"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2 pl-2">
              {pageSchemas[activePage].label}
            </h3>
            <button type="button" aria-current={activeTab.id === "page" ? "page" : undefined} onClick={() => selectEditor({ id: "page", label: "Page content" })} className={`px-5 py-4 rounded-xl font-bold text-left ${activeTab.id === "page" ? "bg-black text-white" : "bg-white text-black/60"}`}>Page content</button>
            {TABS.filter(tab => pageSchemas[activePage].modules.includes(tab.id)).map((tab, index) => {
              const isActive = activeTab.id === tab.id;
              const Icon = tab.icon;

              return (
                <Motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  key={tab.id}
                  onClick={() => selectEditor(tab)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold tracking-wide text-left transition-all duration-300 ${
                    isActive
                      ? "bg-black text-white shadow-[6px_6px_0px_rgba(0,0,0,0.1)] -translate-y-1"
                      : "bg-white text-black/60 hover:text-black hover:bg-black/5 border-2 border-transparent relative overflow-hidden group"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "opacity-100" : "opacity-40"}
                  />
                  {tab.label}
                  {!isActive && (
                    <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  )}
                </Motion.button>
              );
            })}
            {["home", "events", "gallery"].includes(activePage) && <button type="button" onClick={() => selectEditor({ id: "presentation", label: "Appearance" })} className={`px-5 py-4 rounded-xl font-bold text-left ${activeTab.id === "presentation" ? "bg-black text-white" : "bg-white text-black/60"}`}>Appearance</button>}
          </Motion.div>

          {activeTab.id === "page" ? <div className="flex-1 min-w-0 w-full"><PageContentEditor key={activePage} page={activePage} onDirtyChange={onPageDirtyChange} onBusyChange={onPageBusyChange} /></div> : activeTab.id === "presentation" ? <div className="flex-1 min-w-0 w-full"><PresentationManager onDirtyChange={onPageDirtyChange} onBusyChange={onPageBusyChange} /></div> : <div className="flex-1 min-w-0 w-full admin-editor-single"><div className="min-w-0 w-full">
            <div className="admin-record-toolbar flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border-2 border-black/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-full -translate-y-12 translate-x-8 pointer-events-none"></div>
              <div>
                <h2 className="text-2xl font-black text-black">{activeTab.label}</h2>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 mt-2">
                  Shared content: changes also appear wherever this collection is used.
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <button
                  onClick={handleReset}
                  disabled={isLoadingTab || isSaving || Boolean(uploadingTarget)}
                  className="px-4 py-3 bg-black/5 hover:bg-black/10 disabled:opacity-60 text-black rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center gap-2"
                >
                  <FaUndo size={14} /> Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoadingTab || isSaving || !hasLoadedTab || Boolean(uploadingTarget)}
                  className="px-6 py-3 bg-black text-white hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 rounded-xl font-bold text-sm tracking-wide transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.2)] flex items-center gap-2"
                >
                  {isSaving ? (
                    <FaSpinner size={14} className="animate-spin" />
                  ) : success ? (
                    <FaCheck size={14} />
                  ) : (
                    <FaSave size={14} />
                  )}{" "}
                  {isSaving ? "Saving..." : success && !recordDirty ? "Saved!" : "Publish Changes"}
                </button>
              </div>
            </div>

            {success && !recordDirty && <p role="status" className="mb-4 text-sm text-green-800 font-semibold">{success}</p>}
            {tabError && (
              <div role="alert" className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
                {tabError}
              </div>
            )}

            {isLoadingTab ? (
              <div className="bg-white border-2 border-black/10 rounded-2xl p-8 flex items-center justify-center gap-3 text-black/50 font-bold uppercase tracking-[0.2em] text-xs">
                <FaSpinner className="animate-spin" />
                Loading module data
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab.id === "upcoming" && (
                  <AnimatePresence>
                    {formData.map((event, index) =>
                      renderCard(event, index, "title", [
                        { key: "title", label: "Event Title" },
                        { key: "starts_at", label: "Start date and time (India time)", type: "schedule" },
                        { key: "ends_at", label: "End date and time (India time)", type: "schedule" },
                        { key: "status_override", label: "Event status", type: "status" },
                        { key: "category", label: "Category" },
                        { key: "location", label: "Location" },
                        { key: "registration_url", label: "Registration URL (optional)" },
                        { key: "gradient", label: "CSS Gradient Class" },
                        {
                          key: "image",
                          label: "Event Image",
                          type: "image",
                          fullWidth: true,
                        },
                        {
                          key: "speakers",
                          label: "Speakers (comma separated)",
                          type: "stringList",
                        },
                        {
                          key: "description",
                          label: "Description",
                          type: "textarea",
                        },
                      ]),
                    )}
                    <button
                      onClick={() => addItem("upcoming")}
                      className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-[3px] border-dashed border-black/10 hover:border-black text-black/40 hover:text-black rounded-2xl font-bold transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                        <FaPlus size={16} />
                      </div>
                      <span className="tracking-widest uppercase text-xs">
                        Add New Event
                      </span>
                    </button>
                  </AnimatePresence>
                )}

                {activeTab.id === "team" && (
                  <>
                    {formData.map((member, index) =>
                      renderCard(member, index, "name", [
                        { key: "name", label: "Name" },
                        { key: "role", label: "Role" },
                        { key: "github", label: "GitHub URL (optional)", fullWidth: true },
                        { key: "behance", label: "Behance URL (optional)", fullWidth: true },
                        {
                          key: "linkedin",
                          label: "LinkedIn URL",
                          fullWidth: true,
                        },
                        {
                          key: "image",
                          label: "Member Image",
                          type: "image",
                          fullWidth: true,
                        },
                      ]),
                    )}
                    <button
                      onClick={() => addItem("team")}
                      className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-[3px] border-dashed border-black/10 hover:border-black text-black/40 hover:text-black rounded-2xl font-bold transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                        <FaPlus size={14} />
                      </div>
                      <span className="tracking-widest uppercase text-xs">
                        Add Core Member
                      </span>
                    </button>
                  </>
                )}

                {activeTab.id === "album" && (
                  <>
                    {formData.map((album, index) =>
                      renderCard(album, index, "title", [
                        { key: "title", label: "Event Title" },
                        { key: "date", label: "Date (YYYY-MM-DD)" },
                        { key: "event_id", label: "Linked event", type: "eventLink" },
                        {
                          key: "coverImage",
                          label: "Cover Image",
                          type: "image",
                          fullWidth: true,
                        },
                        {
                          key: "photos",
                          label: "Gallery Photos",
                          type: "photoList",
                        },
                        {
                          key: "description",
                          label: "Description",
                          type: "textarea",
                        },
                      ]),
                    )}
                    <button
                      onClick={() => addItem("album")}
                      className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-[3px] border-dashed border-black/10 hover:border-black text-black/40 hover:text-black rounded-2xl font-bold transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                        <FaPlus size={16} />
                      </div>
                      <span className="tracking-widest uppercase text-xs">
                        Add New Album
                      </span>
                    </button>
                  </>
                )}

                {activeTab.id === "testimonials" && (
                  <>
                    {formData.map((testimonial, index) =>
                      renderCard(testimonial, index, "name", [
                        { key: "name", label: "Person Name" },
                        { key: "role", label: "Role / Title" },
                        {
                          key: "avatar",
                          label: "Avatar Image",
                          type: "image",
                          fullWidth: true,
                        },
                        {
                          key: "text",
                          label: "Testimonial Quote",
                          type: "textarea",
                        },
                      ]),
                    )}
                    <button
                      onClick={() => addItem("testimonials")}
                      className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-[3px] border-dashed border-black/10 hover:border-black text-black/40 hover:text-black rounded-2xl font-bold transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                        <FaPlus size={16} />
                      </div>
                      <span className="tracking-widest uppercase text-xs">
                        Add New Testimonial
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div></div>}
        </div>
      </div>
    </div>
  );
}
