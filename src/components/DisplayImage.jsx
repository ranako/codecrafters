import { useState } from "react";
import { imageStyles } from "../lib/imageDisplay";
import "./DisplayImage.css";
export default function DisplayImage({
  src,
  alt = "",
  settings,
  placement,
  className = "",
  style,
  onError,
  onLoad,
  ...props
}) {
  const [failed, setFailed] = useState("");
  const [natural, setNatural] = useState(null);
  const styles = imageStyles(
    settings,
    placement,
    natural && natural.src === src ? natural.ratio : undefined,
  );
  if (!src || failed === src)
    return (
      <span
        className={`cc-image-fallback ${className}`}
        role="img"
        aria-label={alt ? `${alt}: image unavailable` : "Image unavailable"}
        style={{ ...style, ...styles?.frame }}
      >
        Image unavailable
      </span>
    );
  const load = (e) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight)
      setNatural({ src, ratio: img.naturalWidth / img.naturalHeight });
    onLoad?.(e);
  };
  const fail = (e) => {
    setFailed(src);
    onError?.(e);
  };
  if (!styles)
    return (
      <img
        {...props}
        src={src}
        alt={alt}
        className={className}
        style={style}
        onLoad={load}
        onError={fail}
      />
    );
  return (
    <span
      className={`cc-display-image ${className}`}
      style={{
        ...style,
        ...styles.frame,
        position: className.split(" ").includes("absolute")
          ? "absolute"
          : styles.frame.position,
      }}
      data-image-placement={placement}
    >
      <img
        {...props}
        src={src}
        alt={alt}
        style={styles.image}
        onLoad={load}
        onError={fail}
      />
    </span>
  );
}
