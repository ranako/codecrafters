import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingScreen from "./components/LoadingScreen";
import CustomCursor from "./components/CustomCursor";
import LenisScroll from "./components/LenisScroll";
import ParticleBackground from "./components/ParticleBackground";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Events = lazy(() => import("./pages/Events"));
const Team = lazy(() => import("./pages/Team"));
const Contact = lazy(() => import("./pages/Contact"));

const Gallery = lazy(() => import("./pages/Gallery"));

const Admin = lazy(() => import("./pages/Admin"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: "easeInOut" },
};

function AnimatedPage({ children }) {
  return <Motion.div {...pageTransition}>{children}</Motion.div>;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen relative bg-light-bg text-black">
      <ParticleBackground />
      <CustomCursor />
      <Navbar />
      <ScrollToTop />
      <LenisScroll />

      <main className="relative z-10">
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
              <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
              <Route path="/events" element={<AnimatedPage><Events /></AnimatedPage>} />
              <Route path="/team" element={<AnimatedPage><Team /></AnimatedPage>} />
              <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
              <Route path="/gallery" element={<AnimatedPage><Gallery /></AnimatedPage>} />
              <Route path="/admin" element={<AnimatedPage><Admin /></AnimatedPage>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
