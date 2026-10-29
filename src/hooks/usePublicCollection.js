import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
export const PublicPreviewContext = createContext(null);
export function usePublicPreview() {
  return useContext(PublicPreviewContext);
}
export function usePublicCollection(name, loader) {
  const preview = usePublicPreview();
  const isPreview = Boolean(preview);
  const [state, setState] = useState({ data: [], loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);
  const refresh = useCallback(() => {
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    setAttempt((value) => value + 1);
  }, []);
  useEffect(() => {
    if (isPreview) return;
    let active = true;
    let revision = 0;
    const load = async () => {
      const current = ++revision;
      try {
        const data = await loader();
        if (active && current === revision)
          setState({ data, loading: false, error: "" });
      } catch (error) {
        if (active && current === revision)
          setState((previous) => ({
            ...previous,
            loading: false,
            error: error.message || "Content could not be loaded.",
          }));
      }
    };
    load();
    window.addEventListener("focus", load);
    window.addEventListener("cc-collections-saved", load);
    return () => {
      active = false;
      window.removeEventListener("focus", load);
      window.removeEventListener("cc-collections-saved", load);
    };
  }, [isPreview, name, loader, attempt]);
  return isPreview
    ? {
        data: preview.collections[name] || [],
        loading: false,
        error: "",
        refresh: () => {},
      }
    : { ...state, refresh };
}
