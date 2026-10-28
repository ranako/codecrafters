import { usePageContent } from "../hooks/usePageContent";
import EventSections from "../components/EventSections";
import PastEvents from "../components/PastEvents";
import { Link } from "react-router-dom";

export default function Events() {
  const content = usePageContent("events").intro;
  return <div className="events-polish w-full bg-[#e6e4dc] relative">
    <EventSections />
    <div className="text-center mb-8"><Link to={content.galleryLink} className="inline-block border-2 border-black bg-white px-6 py-3 font-bold hover:bg-black hover:text-white">{content.galleryLabel}</Link></div>
    <PastEvents />
  </div>;
}
