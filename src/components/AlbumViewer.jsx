import { useEffect, useRef, useState } from 'react';

export default function AlbumViewer({ album, onClose, initialIndex = 0 }) {
  const dialog = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const photos = [...new Set(album.photos?.filter(Boolean).length ? album.photos.filter(Boolean) : album.coverImage ? [album.coverImage] : [])];
  useEffect(() => {
    const previous = document.activeElement;
    const node = dialog.current;
    node.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { node.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const advance = (amount) => setIndex((current) => (current + amount + photos.length) % photos.length);
  return (
    <dialog ref={dialog} onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) { const box = e.currentTarget.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) onClose(); } }}
      onKeyDown={(e) => { if (photos.length > 1 && e.key === 'ArrowRight') advance(1); if (photos.length > 1 && e.key === 'ArrowLeft') advance(-1); }}
      aria-labelledby="album-viewer-title" className="album-viewer bg-[#f5f3eb] text-black border-2 border-black p-5 md:p-8 shadow-xl">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div><p className="text-xs font-bold mb-2">{album.date}</p><h2 id="album-viewer-title" className="text-2xl font-black font-serif">{album.title}</h2></div>
        <button autoFocus onClick={onClose} aria-label="Close photo album" className="border-2 border-black px-3 py-2 font-bold hover:bg-black hover:text-white">✕</button>
      </div>
      <p className="text-sm mb-4">{album.description}</p>
      {photos.length ? <img src={photos[index]} alt={album.photo_captions?.[photos[index]] || `${album.title}, photo ${index + 1}`} className="w-full max-h-[60vh] object-contain bg-black/5" /> : <p>No photos have been added to this album.</p>}
      {album.photo_captions?.[photos[index]] && <p className="text-sm mt-3">{album.photo_captions[photos[index]]}</p>}
      {photos.length > 0 && <div className="flex items-center justify-between gap-4 mt-5">
        <button disabled={photos.length < 2} onClick={() => advance(-1)} className="border-2 border-black px-4 py-2 disabled:opacity-40">Previous</button>
        <span aria-live="polite" className="text-sm">{index + 1} / {photos.length}</span>
        <button disabled={photos.length < 2} onClick={() => advance(1)} className="border-2 border-black px-4 py-2 disabled:opacity-40">Next</button>
      </div>}
    </dialog>
  );
}
