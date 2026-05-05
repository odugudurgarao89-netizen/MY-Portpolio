import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import PortfolioGrid from "./components/PortfolioGrid";
import AboutSection from "./components/AboutSection";
import Testimonials from "./components/Testimonials";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import ben10IntroAudio from "./audio/ben_10.mp3";
import omnitrixAudio from "./audio/omnitrix.mp3";

const BASE_OPEN_DURATION_MS = 2500;
const FADE_OUT_DURATION_MS = 450;
const THEME_STORAGE_KEY = "theme-preference";

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [openingDurationMs, setOpeningDurationMs] = useState(BASE_OPEN_DURATION_MS);
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "light" ? "light" : "dark";
  });
  const introLoopAudioRef = useRef(null);
  const transformAudioRef = useRef(null);
  const hasStartedIntroLoopRef = useRef(false);

  useEffect(() => {
    const introLoopAudio = new Audio(ben10IntroAudio);
    introLoopAudio.preload = "auto";
    introLoopAudio.loop = true;
    introLoopAudioRef.current = introLoopAudio;

    const transformAudio = new Audio(omnitrixAudio);
    transformAudio.preload = "auto";
    const handleTransformMetadata = () => {
      if (!Number.isFinite(transformAudio.duration) || transformAudio.duration <= 0) {
        return;
      }

      setOpeningDurationMs(Math.round(transformAudio.duration * 1000));
    };
    transformAudio.addEventListener("loadedmetadata", handleTransformMetadata);
    transformAudioRef.current = transformAudio;

    return () => {
      introLoopAudio.pause();
      transformAudio.pause();
      transformAudio.removeEventListener("loadedmetadata", handleTransformMetadata);
      introLoopAudioRef.current = null;
      transformAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!showIntro || isOpening) {
      return undefined;
    }

    const introLoopAudio = introLoopAudioRef.current;
    if (!introLoopAudio) {
      return undefined;
    }

    const tryStartLoop = () => {
      if (hasStartedIntroLoopRef.current) {
        return;
      }

      if (introLoopAudio.paused && introLoopAudio.currentTime !== 0) {
        introLoopAudio.currentTime = 0;
      }

      introLoopAudio.play().then(() => {
        hasStartedIntroLoopRef.current = true;
      }).catch(() => {});
    };

    tryStartLoop();

    const handleWindowLoad = () => {
      tryStartLoop();
    };

    const handleWindowFocus = () => {
      tryStartLoop();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tryStartLoop();
      }
    };

    const handleCanPlay = () => {
      tryStartLoop();
    };

    window.addEventListener("load", handleWindowLoad);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    introLoopAudio.addEventListener("canplay", handleCanPlay);
    introLoopAudio.addEventListener("loadeddata", handleCanPlay);
    window.addEventListener("pointerdown", tryStartLoop);
    window.addEventListener("keydown", tryStartLoop);
    window.addEventListener("touchstart", tryStartLoop);

    return () => {
      window.removeEventListener("load", handleWindowLoad);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      introLoopAudio.removeEventListener("canplay", handleCanPlay);
      introLoopAudio.removeEventListener("loadeddata", handleCanPlay);
      window.removeEventListener("pointerdown", tryStartLoop);
      window.removeEventListener("keydown", tryStartLoop);
      window.removeEventListener("touchstart", tryStartLoop);
    };
  }, [showIntro, isOpening]);

  const handleTransformClick = () => {
    hasStartedIntroLoopRef.current = false;

    const introLoopAudio = introLoopAudioRef.current;
    if (introLoopAudio) {
      introLoopAudio.pause();
      introLoopAudio.currentTime = 0;
    }

    const transformAudio = transformAudioRef.current;
    if (transformAudio) {
      transformAudio.currentTime = 0;
      transformAudio.play().catch(() => {});
    }

    setIsOpening(true);
  };

  useEffect(() => {
    if (!isOpening) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowIntro(false);
    }, openingDurationMs + FADE_OUT_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [isOpening, openingDurationMs]);

  useEffect(() => {
    document.body.classList.toggle("intro-lock", showIntro);
    return () => document.body.classList.remove("intro-lock");
  }, [showIntro]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const introMotionScale = Math.max(0.75, Math.min(2.5, openingDurationMs / BASE_OPEN_DURATION_MS));
  const introLoaderStyle = {
    "--intro-open-ms": `${openingDurationMs}ms`,
    "--intro-fade-ms": `${FADE_OUT_DURATION_MS}ms`,
    "--intro-motion-scale": introMotionScale
  };

  return (
    <>
      {showIntro && (
        <div className={`intro-loader${isOpening ? " opening" : ""}`} style={introLoaderStyle}>
          <div className="intro-ambient" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className={`watch-scene${isOpening ? " active" : ""}`} aria-hidden="true">
            <span className="watch-orbit watch-orbit-1" />
            <span className="watch-orbit watch-orbit-2" />
            <span className="watch-orbit watch-orbit-3" />
            <div className="watch-body">
              <span className="watch-bezel" />
              <span className="watch-core" />
              <span className="watch-symbol" />
            </div>
            <span className="watch-flash" />
          </div>
          <div className={`intro-copy${isOpening ? " intro-copy-hidden" : ""}`}>
            <p className="intro-kicker">Personal Blog</p>
            <h1></h1>
            <p className="intro-note">
              Stories on product, code, and thoughtful design.
            </p>
            <button
              type="button"
              className={`intro-cta${isOpening ? " intro-cta-hidden" : ""}`}
              onClick={handleTransformClick}
              disabled={isOpening}
            >
              Transform
            </button>
          </div>
        </div>
      )}

      <div className={`app-shell${showIntro ? " app-shell-hidden" : ""}`}>
        <Header theme={theme} onThemeToggle={handleThemeToggle} />
        <Hero />
        <PortfolioGrid />
        <AboutSection />
        <Testimonials />
        <ContactForm />
        <Footer />
      </div>
    </>
  );
}

export default App;
