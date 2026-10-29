import ImageControls from "./ImageControls";
import { useEffect, useId, useState, useCallback } from "react";
import {
  pageSchemas,
  fieldDefaults,
  defaultPageContent,
} from "../lib/pageContentSchema";
import { contentIcons } from "../lib/contentIcons";
import { fetchPageContent, savePageContent } from "../lib/pageContentApi";
import { uploadImageFile } from "../lib/storageApi";
import "./PageContentEditor.css";

function ContentField({
  field,
  value,
  onChange,
  path,
  busy,
  onUploadChange,
  displayValue,
  onDisplayChange,
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  if (field.type === "list") {
    const items = value || [];
    const move = (index, direction) => {
      const next = [...items];
      [next[index], next[index + direction]] = [
        next[index + direction],
        next[index],
      ];
      onChange(next);
    };
    return (
      <fieldset className="cms-list" disabled={busy}>
        <legend>
          {field.label} <span>({items.length})</span>
        </legend>
        {!items.length && (
          <p className="cms-hint">
            No items. Add one below to show it on the page.
          </p>
        )}
        {items.map((item, index) => (
          <div className="cms-list-item" key={index}>
            <div className="cms-item-toolbar">
              <h4>
                {item.title || item.name || item.label || `Item ${index + 1}`}
              </h4>
              <div>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`Move ${field.label} item ${index + 1} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Move ${field.label} item ${index + 1} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="cms-remove"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Remove this item from ${field.label}? It will be removed from the public page when you save.`,
                      )
                    )
                      onChange(items.filter((_, i) => i !== index));
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="cms-field-grid">
              {Object.entries(field.fields).map(([key, child]) => (
                <ContentField
                  key={key}
                  field={child}
                  value={item[key]}
                  displayValue={item[`${key}_display`]}
                  onDisplayChange={(next) =>
                    onChange(
                      items.map((entry, i) =>
                        i === index
                          ? { ...entry, [`${key}_display`]: next }
                          : entry,
                      ),
                    )
                  }
                  busy={busy}
                  onUploadChange={onUploadChange}
                  path={`${path}/${index}/${key}`}
                  onChange={(next) =>
                    onChange(
                      items.map((entry, i) =>
                        i === index ? { ...entry, [key]: next } : entry,
                      ),
                    )
                  }
                />
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="cms-secondary"
          disabled={items.length >= 100}
          onClick={() => onChange([...items, fieldDefaults(field.fields)])}
        >
          + Add {field.label.toLowerCase()} item
        </button>
      </fieldset>
    );
  }
  if (field.type === "boolean")
    return (
      <label className="cms-toggle" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={busy}
        />
        {field.label}
      </label>
    );
  return (
    <div
      className={`cms-field ${["textarea", "image", "icon"].includes(field.type) ? "cms-wide" : ""}`}
    >
      <label htmlFor={id}>{field.label}</label>
      {field.type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          maxLength={12000}
          rows={3}
          disabled={busy}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "icon" ? (
        <div className="cms-icon-select">
          <select
            id={id}
            value={value}
            disabled={busy}
            onChange={(e) => onChange(e.target.value)}
          >
            {(field.options || Object.keys(contentIcons)).map((key) => (
              <option key={key} value={key}>
                {key.replace(/^Fa/, "").replace(/([a-z])([A-Z])/g, "$1 $2")}
              </option>
            ))}
          </select>
          {(() => {
            const Icon = contentIcons[value];
            return Icon ? <Icon aria-hidden="true" /> : null;
          })()}
        </div>
      ) : (
        <input
          id={id}
          type={field.type === "email" ? "email" : "text"}
          value={value}
          maxLength={12000}
          disabled={busy || uploading}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.type === "link" && (
        <small>
          Use a site path such as /events or a complete https:// URL.
        </small>
      )}
      {field.type === "image" && (
        <div className="cms-image-field">
          {value && (
            <img src={value} alt={`${field.label} preview`} loading="lazy" />
          )}
          <label className="cms-upload">
            {uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              disabled={busy || uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setUploading(true);
                onUploadChange(1);
                setUploadError("");
                try {
                  onChange(
                    await uploadImageFile(file, {
                      folder: `pages/${path.split("/")[0]}`,
                    }),
                  );
                } catch (reason) {
                  setUploadError(reason.message || "Image upload failed.");
                } finally {
                  setUploading(false);
                  onUploadChange(-1);
                }
              }}
            />
          </label>
          <small>
            Upload an image or paste its URL above. Save the page to publish it.
          </small>
          {uploadError && <p role="alert">{uploadError}</p>}
          <ImageControls
            src={value}
            value={displayValue}
            onChange={onDisplayChange}
            placements={
              path.startsWith("shared/")
                ? ["logo"]
                : path.startsWith("team/")
                  ? ["member"]
                  : ["about"]
            }
            disabled={busy || uploading}
          />
        </div>
      )}
    </div>
  );
}

export default function PageContentEditor({
  page,
  onDirtyChange,
  onBusyChange,
}) {
  const schema = pageSchemas[page];
  const [draft, setDraft] = useState(defaultPageContent[page]);
  const [snapshot, setSnapshot] = useState(defaultPageContent[page]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const uploadChange = useCallback(
    (delta) => setUploads((count) => Math.max(0, count + delta)),
    [],
  );
  const busy = saving || uploads > 0;
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const dirty = JSON.stringify(draft) !== JSON.stringify(snapshot);
  useEffect(() => {
    let active = true;
    fetchPageContent(page)
      .then((content) => {
        if (active) {
          setDraft(content);
          setSnapshot(content);
          setReady(true);
        }
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, attempt]);
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  useEffect(() => {
    if (!dirty && !busy) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const guard = (e) => {
      const anchor = e.target.closest?.("a[href]");
      if (!anchor || anchor.target === "_blank" || e.metaKey || e.ctrlKey)
        return;
      const url = new URL(anchor.href, location.href);
      if (
        url.origin === location.origin &&
        url.pathname !== location.pathname
      ) {
        if (
          busy ||
          !window.confirm("Discard unsaved page changes and leave the editor?")
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guard, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", guard, true);
    };
  }, [dirty, busy]);
  const change = (section, key, value) => {
    setDraft((current) => ({
      ...current,
      [section]: { ...current[section], [key]: value },
    }));
    setMessage("");
  };
  const submit = async (e) => {
    e.preventDefault();
    if (!ready || busy) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await savePageContent(page, draft);
      setDraft(saved);
      setSnapshot(saved);
      setMessage(
        `${schema.label} page saved. Public pages now use this content.`,
      );
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="cms-page-editor" role="status">
        Loading {schema.label.toLowerCase()} content…
      </div>
    );
  return (
    <div className="admin-editor-single">
      <form className="cms-page-editor" onSubmit={submit}>
        <div className="cms-editor-heading">
          <div>
            <h2>{schema.label}</h2>
            <p>
              Edit the page content below. The existing layout and animations
              stay the same.
            </p>
          </div>
          <a href={schema.path} target="_blank" rel="noopener noreferrer">
            View saved page ↗
          </a>
        </div>
        {error && (
          <div className="cms-error" role="alert">
            {error}
            {!ready && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setLoading(true);
                  setAttempt((v) => v + 1);
                }}
              >
                Retry loading
              </button>
            )}
          </div>
        )}
        {message && (
          <p className="cms-success" role="status">
            {message}
          </p>
        )}
        {!ready ? (
          <p className="cms-hint">
            Editing is disabled until the saved content can be read. Your
            current website remains available.
          </p>
        ) : (
          <>
            <div className="cms-save-bar">
              <span role="status">
                {dirty ? "Unsaved changes" : "All changes saved"}
              </span>
              <div>
                <button
                  type="button"
                  className="cms-secondary"
                  disabled={busy || !dirty}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Discard the unsaved changes to this page?",
                      )
                    ) {
                      setDraft(structuredClone(snapshot));
                      setError("");
                      setMessage("");
                    }
                  }}
                >
                  Discard changes
                </button>
                <button
                  type="submit"
                  className="cms-primary"
                  disabled={busy || !dirty}
                >
                  {saving ? "Saving…" : "Save page"}
                </button>
              </div>
            </div>
            <fieldset disabled={busy} className="cms-sections">
              {Object.entries(schema.sections).map(
                ([section, definition], index) => (
                  <details
                    key={section}
                    open={index === 0}
                    className="cms-section"
                  >
                    <summary>{definition.label}</summary>
                    <div className="cms-field-grid">
                      {Object.entries(definition.fields).map(([key, field]) => (
                        <ContentField
                          key={key}
                          field={field}
                          value={draft[section][key]}
                          displayValue={draft[section][`${key}_display`]}
                          onDisplayChange={(value) =>
                            change(section, `${key}_display`, value)
                          }
                          path={`${page}/${section}/${key}`}
                          busy={busy}
                          onUploadChange={uploadChange}
                          onChange={(value) => change(section, key, value)}
                        />
                      ))}
                    </div>
                  </details>
                ),
              )}
            </fieldset>
            <button
              type="button"
              className="cms-restore"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Load the original page content into this draft? This replaces the current draft. Nothing is published until you save.",
                  )
                ) {
                  setDraft(structuredClone(defaultPageContent[page]));
                  setMessage("");
                }
              }}
            >
              Load original content into draft
            </button>
          </>
        )}
      </form>

    </div>
  );
}
