import { useId, useRef, useState } from "react";
import {
  imageDefaults,
  imagePlacements,
  normalizeImageDisplay,
} from "../lib/imageDisplay";
import DisplayImage from "./DisplayImage";
import "./ImageControls.css";
export default function ImageControls({
  src,
  value,
  onChange,
  placements,
  disabled = false,
  placement,
  onPlacementChange,
  onActivate,
}) {
  const id = useId();
  const pointer = useRef(null);
  const [localPlacement, setLocalPlacement] = useState(placements[0]);
  const selected = placements.includes(placement) ? placement : localPlacement;
  const display = normalizeImageDisplay(value);
  const current = display[selected] || imageDefaults(selected);
  const profile = imagePlacements[selected];
  const change = (key, next) =>
    onChange({ ...display, [selected]: { ...current, [key]: next } });
  const point = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(
      Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
    );
    const y = Math.round(
      Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    );
    onChange({ ...display, [selected]: { ...current, focalX: x, focalY: y } });
  };
  return (
    <fieldset
      onFocusCapture={onActivate}
      onPointerDownCapture={onActivate}
      className="image-controls"
      disabled={disabled || !src}
    >
      <legend>Image display</legend>
      {!src && <p>Add an image to adjust its display.</p>}
      {placements.length > 1 && (
        <label htmlFor={`${id}-placement`}>
          Placement
          <select
            aria-label="Placement"
            id={`${id}-placement`}
            value={selected}
            onChange={(e) => {
              setLocalPlacement(e.target.value);
              onPlacementChange?.(e.target.value);
            }}
          >
            {placements.map((key) => (
              <option key={key} value={key}>
                {imagePlacements[key].label}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="image-control-hint">
        {profile.sizable
          ? "Size stays within the available space. The original file is preserved."
          : "This placement keeps its existing frame. Adjust the photo inside it."}
      </p>
      <div
        className="image-focal"
        role="group"
        aria-label="Image framing preview"
        onPointerDown={(e) => {
          if (disabled || !src || !e.isPrimary) return;
          pointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          point(e);
        }}
        onPointerMove={(e) => {
          if (pointer.current === e.pointerId) point(e);
        }}
        onPointerUp={() => {
          pointer.current = null;
        }}
        onPointerCancel={() => {
          pointer.current = null;
        }}
      >
        <DisplayImage
          src={src}
          alt="Image framing"
          settings={{
            [selected]: { ...current, width: 100, height: null, lock: false },
          }}
          placement={selected}
        />
        <span
          className="image-focal-marker"
          style={{ left: `${current.focalX}%`, top: `${current.focalY}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="image-control-grid">
        <label htmlFor={`${id}-fit`}>
          Fit
          <select
            aria-label="Fit"
            id={`${id}-fit`}
            value={current.fit}
            onChange={(e) => change("fit", e.target.value)}
          >
            <option value="cover">Cover (crop to fill)</option>
            <option value="contain">Contain (show whole image)</option>
          </select>
        </label>
        <label htmlFor={`${id}-zoom`}>
          Zoom ({current.zoom.toFixed(2)}×)
          <input
            id={`${id}-zoom`}
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={current.zoom}
            onChange={(e) => change("zoom", Number(e.target.value))}
          />
        </label>
        <label htmlFor={`${id}-x`}>
          Focal point left/right ({current.focalX}%)
          <input
            id={`${id}-x`}
            type="range"
            min="0"
            max="100"
            value={current.focalX}
            onChange={(e) => change("focalX", Number(e.target.value))}
          />
        </label>
        <label htmlFor={`${id}-y`}>
          Focal point up/down ({current.focalY}%)
          <input
            id={`${id}-y`}
            type="range"
            min="0"
            max="100"
            value={current.focalY}
            onChange={(e) => change("focalY", Number(e.target.value))}
          />
        </label>
        {profile.sizable && (
          <>
            <label htmlFor={`${id}-width`}>
              Width (% of available space)
              <input
                id={`${id}-width`}
                type="number"
                min="10"
                max="100"
                value={current.width}
                onChange={(e) =>
                  change(
                    "width",
                    Math.max(10, Math.min(100, Number(e.target.value) || 100)),
                  )
                }
              />
            </label>
            <label htmlFor={`${id}-align`}>
              Alignment
              <select
                aria-label="Alignment"
                id={`${id}-align`}
                value={current.align}
                onChange={(e) => change("align", e.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>
            <label className="image-ratio-lock">
              <input
                type="checkbox"
                checked={current.lock}
                onChange={(e) => change("lock", e.target.checked)}
              />
              Lock aspect ratio
            </label>
            {current.lock ? (
              <label htmlFor={`${id}-ratio`}>
                Aspect ratio
                <select
                  aria-label="Aspect ratio"
                  id={`${id}-ratio`}
                  value={current.ratio}
                  onChange={(e) => change("ratio", e.target.value)}
                >
                  <option value="original">Original image</option>
                  {["1/1", "4/3", "3/4", "16/9", "3/2"].map((r) => (
                    <option key={r} value={r}>
                      {r.replace("/", ":")}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label htmlFor={`${id}-height`}>
                Height (px, capped to viewport)
                <input
                  id={`${id}-height`}
                  type="number"
                  min="32"
                  max="900"
                  placeholder="Automatic"
                  value={current.height ?? ""}
                  onChange={(e) =>
                    change(
                      "height",
                      e.target.value === ""
                        ? null
                        : Math.max(
                            32,
                            Math.min(900, Number(e.target.value) || 32),
                          ),
                    )
                  }
                />
              </label>
            )}
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          const next = { ...display };
          delete next[selected];
          onChange(next);
        }}
      >
        Reset this placement
      </button>
    </fieldset>
  );
}
