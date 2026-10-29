import DisplayImage from "./DisplayImage";
import { usePageContent } from "../hooks/usePageContent";
import { Link } from "react-router-dom";
import { useState } from "react";
import AlbumViewer from "./AlbumViewer";
import { usePublicCollection } from "../hooks/usePublicCollection";
import { fetchPastEventAlbums } from "../lib/contentApi";
import { motion as Motion } from "framer-motion";
import SectionWrapper, { SectionHeader } from "./SectionWrapper";

export default function ClubLife() {
  const content = usePageContent("home").albums;
  const [selected,setSelected] = useState(null);
  const collection = usePublicCollection('albums', fetchPastEventAlbums);
  const albums = collection.data;
  const status = collection.loading ? 'Loading community photos...' : collection.error ? 'Community photos could not be loaded. Please try again later.' : albums.length ? '' : 'Community photos will appear here when an album is published.';
  return (
    <SectionWrapper>
      <SectionHeader
        tagline={content.eyebrow}
        title={content.title}
        description={content.description}
      />

      <div className="text-center mb-8"><Link to={content.buttonLink} className="inline-block border-2 border-black bg-white px-5 py-3 font-bold">{content.buttonLabel}</Link></div>
      {status && <p role="status" className="text-center text-sm font-semibold py-8">{status}</p>}
      {selected && <AlbumViewer album={selected} onClose={() => setSelected(null)} />}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {albums.slice(0, 6).map((album, i) => (
          <Motion.button
            type="button" onClick={() => setSelected(album)} aria-label={`View ${album.title} photo album`}
            key={album.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            whileHover={{ scale: 1.03 }}
            className="w-full text-left mb-4 break-inside-avoid overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0px_#2b2a27] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[0px_0px_0px_#2b2a27] transition-all duration-300"
          >
            {(album.coverImage || album.photos[0]) && <DisplayImage
              src={album.coverImage || album.photos[0]} settings={album.cover_display} placement="albumHome"
              loading="lazy"
              alt={album.title}
              className="w-full h-auto object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />}
            <span className="block p-4 font-bold">{album.title}</span>
          </Motion.button>
        ))}
      </div>
    </SectionWrapper>
  );
}
