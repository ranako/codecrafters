export const imagePlacements = {
  eventCard: { label: "Events card cover", fit: "cover" },
  eventHome: { label: "Home event spotlight", fit: "cover" },
  eventDetail: { label: "Event details", fit: "cover" },
  albumHome: {
    label: "Home album cover",
    fit: "cover",
    sizable: true,
    ratio: "4/3",
  },
  albumHanging: { label: "Events hanging album", fit: "cover" },
  photoGrid: { label: "Gallery photo", fit: "cover" },
  photoReel: { label: "Gallery reel", fit: "cover" },
  photoViewer: {
    label: "Full-size photo viewer",
    fit: "contain",
    sizable: true,
  },
  member: { label: "Team portrait", fit: "cover" },
  avatar: { label: "Testimonial avatar", fit: "cover" },
  about: { label: "About pillar photo", fit: "cover" },
  logo: { label: "Navigation logo", fit: "contain", sizable: true },
};
const number = (value, fallback, min, max) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : fallback;
export function imageDefaults(placement) {
  return {
    fit: imagePlacements[placement]?.fit || "cover",
    focalX: 50,
    focalY: 50,
    zoom: 1,
    width: 100,
    height: null,
    lock: true,
    ratio: "original",
    align: "center",
  };
}
export function normalizeImageDisplay(input) {
  const result = {};
  if (!input || typeof input !== "object" || Array.isArray(input))
    return result;
  for (const [placement, value] of Object.entries(input)) {
    if (
      !Object.hasOwn(imagePlacements, placement) ||
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    )
      continue;
    const fallback = imageDefaults(placement);
    result[placement] = {
      fit: ["cover", "contain"].includes(value.fit) ? value.fit : fallback.fit,
      focalX: number(value.focalX, 50, 0, 100),
      focalY: number(value.focalY, 50, 0, 100),
      zoom: number(value.zoom, 1, 1, 3),
      width: number(value.width, 100, 10, 100),
      height:
        value.height === null || value.height === undefined
          ? null
          : number(value.height, null, 32, 900),
      lock: value.lock !== false,
      ratio: ["original", "1/1", "4/3", "3/4", "16/9", "3/2"].includes(
        value.ratio,
      )
        ? value.ratio
        : "original",
      align: ["left", "center", "right"].includes(value.align)
        ? value.align
        : "center",
    };
  }
  return result;
}
export function normalizePhotoDisplays(input, photos) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return Object.fromEntries(
    [...new Set(Array.isArray(photos) ? photos : [])]
      .filter((url) => typeof url === "string" && url)
      .map((url) => [url, normalizeImageDisplay(input[url])])
      .filter(([, settings]) => Object.keys(settings).length),
  );
}
export function replaceAlbumPhoto(album,index,url) {
  const photos=[...(album.photos || [])];const old=photos[index];
  if(old===url)return album;
  if(url && photos.some((photo,i)=>i!==index && photo===url))throw new Error('This photo is already in the album. Choose a different image.');
  const captions={...album.photo_captions};const displays={...album.photo_display};
  const pending=[...(album._photoDrafts || [])];const draft=pending[index] || {};
  const caption=Object.hasOwn(captions,old)?captions[old]:draft.caption;
  const display=Object.hasOwn(displays,old)?displays[old]:draft.display;
  photos[index]=url;
  if(url){
    if(caption!==undefined)Object.defineProperty(captions,url,{value:caption,writable:true,enumerable:true,configurable:true});
    if(display!==undefined)Object.defineProperty(displays,url,{value:display,writable:true,enumerable:true,configurable:true});
    pending[index]=undefined;
  }else pending[index]={caption,display};
  if(old && !photos.includes(old)){delete captions[old];delete displays[old];}
  const result={...album,photos,photo_captions:captions,photo_display:displays};
  // Clearing an input before typing a replacement must not lose its framing.
  // This row-local cache is never serialized by the API or projected to previews.
  if(pending.some(Boolean))result._photoDrafts=pending;else delete result._photoDrafts;
  return result;
}
export function removeAlbumPhoto(album,index){
  const photos=(album.photos || []).filter((_,i)=>i!==index);
  const result={...album,photos,photo_captions:Object.fromEntries(Object.entries(album.photo_captions || {}).filter(([url])=>photos.includes(url))),photo_display:normalizePhotoDisplays(album.photo_display,photos)};
  const pending=album._photoDrafts?.filter((_,i)=>i!==index);
  if(pending?.some(Boolean))result._photoDrafts=pending;else delete result._photoDrafts;
  return result;
}
export function imageStyles(settings, placement, naturalRatio) {
  const value = normalizeImageDisplay(settings)[placement];
  if (!value) return null;
  const sizable = imagePlacements[placement].sizable;
  let ratio = value.ratio === "original" ? naturalRatio : value.ratio;
  // Fixed frames only accept framing controls, never dimensions that change the layout.
  const frame = {
    display: "block",
    position: "relative",
    overflow: "hidden",
    maxWidth: "100%",
    minWidth: 0,
  };
  if (sizable) {
    frame.width = `${value.width}%`;
    frame.marginLeft =
      value.align === "right"
        ? "auto"
        : value.align === "center"
          ? "auto"
          : "0";
    frame.marginRight =
      value.align === "left" ? "auto" : value.align === "center" ? "auto" : "0";
    if (value.lock) {
      if (ratio) frame.aspectRatio = String(ratio);
      frame.height = "auto";
    } else if (value.height !== null)
      frame.height = `min(${value.height}px, 70vh)`;
  } else {
    frame.width = "100%";
    frame.height = "100%";
  }
  return {
    frame,
    image: {
      display: "block",
      width: "100%",
      height: sizable && value.lock && !ratio ? "auto" : "100%",
      objectFit: value.fit,
      objectPosition: `${value.focalX}% ${value.focalY}%`,
      transformOrigin: `${value.focalX}% ${value.focalY}%`,
      transform: `scale(${value.zoom})`,
    },
  };
}
