import { usePageContent } from "../hooks/usePageContent";
import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import SectionWrapper, { SectionHeader } from "./SectionWrapper";
import { FaQuoteLeft } from "react-icons/fa";
import { fetchTestimonials } from "../lib/contentApi";

export default function TestimonialsMarquee() {
  const content = usePageContent("home").testimonials;
  const track = useRef(null);
  const inView = useInView(track);
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const pastelColors = [
    "bg-[#e3ebd5]", // Sage
    "bg-[#dce4f0]", // Slate
    "bg-[#f0e3dc]", // Peach
    "bg-[#e6dcf0]", // Lilac
    "bg-[#f0ecd5]", // Pale Yellow
  ];

  useEffect(() => {
    let isMounted = true;

    async function loadTestimonials() {
      try {
        const data = await fetchTestimonials();
        if (!isMounted) return;
        setTestimonials(data);
        setError("");
      } catch (fetchError) {
        if (!isMounted) return;
        setTestimonials([]);
        setError(fetchError.message || "Unable to load testimonials.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  const looping = testimonials.length > 1 && !reducedMotion;
  const repeatedTestimonials = looping ? [...testimonials, ...testimonials] : testimonials;

  return (
    <SectionWrapper className="overflow-hidden">
      <SectionHeader
        tagline={content.eyebrow}
        title={content.title}
        description={content.description}
      />

      {looping && <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)} className="border-2 border-black px-4 py-2 text-sm font-bold">{paused ? "Resume testimonials" : "Pause testimonials"}</button>}
      <div ref={track} className={`testimonial-window relative flex py-10 ${looping ? "overflow-hidden" : "overflow-x-auto"}`}>
        {isLoading && (
          <p className="w-full text-center text-xs font-black uppercase tracking-[0.3em] text-black/40">
            Loading testimonials...
          </p>
        )}
        {error && (
          <p className="w-full text-center text-sm font-bold text-red-600">
            {error}
          </p>
        )}
        {!isLoading && !error && testimonials.length === 0 && (
          <p className="w-full text-center text-sm font-bold text-black/50">
            Testimonials will appear here soon.
          </p>
        )}
        {!isLoading && !error && testimonials.length > 0 && (
          <>
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-light-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-light-bg to-transparent z-10 pointer-events-none" />

            <div className={`testimonial-track flex gap-6 md:gap-8 w-max ${looping ? "is-looping" : ""}`}
              style={{ animationPlayState: paused || !inView ? "paused" : "running" }}>
              {repeatedTestimonials.map((testimonial, i) => (
                <div
                  key={`${testimonial.id}-${i}`}
                  aria-hidden={looping && i >= testimonials.length ? true : undefined}
                  className={`w-[300px] md:w-[400px] ${pastelColors[(i % testimonials.length) % pastelColors.length]} p-8 border-2 border-black shadow-[6px_6px_0px_#2b2a27] flex flex-col justify-between whitespace-normal`}
                >
                  <div>
                    <FaQuoteLeft className="text-black/10 text-3xl mb-4" />
                    <p className="text-sm md:text-base text-light-text-secondary leading-relaxed mb-6 font-medium italic">
                      "{testimonial.text}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      {testimonial.avatar && <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />}
                      {!testimonial.avatar && <span aria-hidden="true" className="text-sm font-black">{testimonial.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span>}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black">
                        {testimonial.name}
                      </h4>
                      <p className="text-xs text-light-text-secondary">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
