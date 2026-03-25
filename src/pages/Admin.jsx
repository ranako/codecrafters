import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { supabase } from "../lib/supabase";

const TABS = [
  { id: "upcoming", label: "Upcoming Events", icon: FaCalendarAlt },
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
    image: "",
    is_active: true,
  },
  album: {
    title: "New Album",
    date: "",
    description: "",
    coverImage: "",
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

function getPersistedIds(items) {
  return items
    .map((item) => item.id)
    .filter((id) => typeof id === "string" && !id.startsWith("temp-"));
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
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState([]);
  const [initialIds, setInitialIds] = useState([]);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [tabError, setTabError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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
    if (!session) {
      setFormData([]);
      setInitialIds([]);
      return;
    }

    let isMounted = true;

    async function loadTab() {
      setIsLoadingTab(true);
      setTabError("");
      setSuccess("");

      try {
        const data = await fetchByTab(activeTab.id);
        if (!isMounted) return;
        setFormData(cloneData(data));
        setInitialIds(getPersistedIds(data));
      } catch (error) {
        if (!isMounted) return;
        setFormData([]);
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
  }, [activeTab, session]);

  const handleLogin = async (event) => {
    event.preventDefault();
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
    await supabase.auth.signOut();
    setSuccess("");
    setTabError("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTabError("");
    setSuccess("");

    try {
      const deletedIds = initialIds.filter(
        (id) =>
          !formData.some(
            (item) =>
              typeof item.id === "string" &&
              !item.id.startsWith("temp-") &&
              item.id === id,
          ),
      );

      await saveByTab(activeTab.id, formData);
      await deleteByTab(activeTab.id, deletedIds);

      const refreshed = await fetchByTab(activeTab.id);
      setFormData(cloneData(refreshed));
      setInitialIds(getPersistedIds(refreshed));
      setSuccess("Saved to Supabase.");
    } catch (error) {
      setTabError(error.message || "Unable to publish changes.");
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
      setInitialIds(getPersistedIds(data));
    } catch (error) {
      setTabError(error.message || "Unable to reset this section.");
    } finally {
      setIsLoadingTab(false);
    }
  };

  const updateItem = (index, field, value) => {
    setFormData((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const deleteItem = (index) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setFormData((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = (tabId) => {
    setFormData((current) => [
      ...current,
      { ...EMPTY_ITEMS[tabId], id: createTempId() },
    ]);
  };

  const renderInput = (label, value, onChange, isTextArea = false) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold uppercase tracking-widest text-black/50">
        {label}
      </label>
      {isTextArea ? (
        <textarea
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-lg px-4 py-3 text-sm text-black transition-colors min-h-[100px] resize-y outline-none"
        />
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-lg px-4 py-2 text-sm text-black transition-colors outline-none"
        />
      )}
    </div>
  );

  const renderCard = (item, index, titleField, fields) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      key={item.id || index}
      className="bg-white border-2 border-black/10 rounded-2xl p-6 mb-6 shadow-sm relative group overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-black/10 transition-colors group-hover:bg-black"></div>

      <div className="flex justify-between items-center mb-6 pl-2">
        <h3 className="font-bold text-lg text-black">
          {item[titleField] || "New Item"}
        </h3>
        <button
          onClick={() => deleteItem(index)}
          className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          title="Delete item"
        >
          <FaTrash size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-2">
        {fields.map((field) => {
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
      </div>
    </motion.div>
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
        <motion.div
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

          <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
            <input
              type="email"
              placeholder="Enter email..."
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 text-black outline-none transition-colors"
              autoFocus
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-xl pl-4 pr-14 py-3 text-black outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-4 text-black/50 hover:text-black transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>

            {loginError && (
              <p className="text-red-500 font-bold text-xs ml-1">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-black text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 font-black tracking-widest uppercase rounded-xl px-4 py-3 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.2)] mt-2"
            >
              {isLoggingIn ? "Signing In..." : "Unlock"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-[#e6e4dc] pt-24 pb-16 px-6 md:px-12 lg:px-20 font-sans overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b-2 border-black/10"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-black font-serif text-black tracking-tighter inline-flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <FaCog size={40} className="text-black/20" />
              </motion.div>
              ADMIN CONTROL.
            </h1>
            <p className="text-black/50 text-xl font-bold font-mono tracking-widest uppercase mt-4">
              SYSTEM // SUPABASE REGISTRY
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-black/50 hover:text-black hover:bg-black/5 border-2 border-transparent hover:border-black/10 px-4 py-2 rounded-xl transition-all w-fit md:w-auto"
          >
            <FaSignOutAlt /> Lock Portal
          </motion.button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 relative items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-64 shrink-0 flex flex-col gap-2 lg:sticky lg:top-32 z-20"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2 pl-2">
              Data Modules
            </h3>
            {TABS.map((tab, index) => {
              const isActive = activeTab.id === tab.id;
              const Icon = tab.icon;

              return (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  key={tab.id}
                  onClick={() => setActiveTab(tab)}
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
                </motion.button>
              );
            })}
          </motion.div>

          <div className="flex-1 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border-2 border-black/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-full -translate-y-12 translate-x-8 pointer-events-none"></div>
              <div>
                <h2 className="text-2xl font-black text-black">{activeTab.label}</h2>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/40 mt-2">
                  OG founders stay static in code and are not editable here.
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <button
                  onClick={handleReset}
                  disabled={isLoadingTab || isSaving}
                  className="px-4 py-3 bg-black/5 hover:bg-black/10 disabled:opacity-60 text-black rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center gap-2"
                >
                  <FaUndo size={14} /> Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoadingTab || isSaving}
                  className="px-6 py-3 bg-black text-white hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 rounded-xl font-bold text-sm tracking-wide transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.2)] flex items-center gap-2"
                >
                  {isSaving ? (
                    <FaSpinner size={14} className="animate-spin" />
                  ) : success ? (
                    <FaCheck size={14} />
                  ) : (
                    <FaSave size={14} />
                  )}{" "}
                  {isSaving ? "Saving..." : success ? "Saved!" : "Publish Changes"}
                </button>
              </div>
            </div>

            {tabError && (
              <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
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
                        { key: "date", label: "Date" },
                        { key: "category", label: "Category" },
                        { key: "location", label: "Location" },
                        { key: "time", label: "Time" },
                        { key: "gradient", label: "CSS Gradient Class" },
                        { key: "image", label: "Image URL", fullWidth: true },
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
                        {
                          key: "linkedin",
                          label: "LinkedIn URL",
                          fullWidth: true,
                        },
                        { key: "image", label: "Image URL", fullWidth: true },
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
                        { key: "date", label: "Date" },
                        {
                          key: "coverImage",
                          label: "Cover Image URL",
                          fullWidth: true,
                        },
                        {
                          key: "photos",
                          label: "Gallery Photo URLs (comma separated)",
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
                          label: "Avatar Image URL",
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
          </div>
        </div>
      </div>
    </div>
  );
}
