import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ThemeProvider } from './context/ThemeContext';
import StellarCryoLoader from './components/StellarCryoLoader';
import StellarBackground from './components/StellarBackground';
import StellarNav from './components/StellarNav';
import KeyboardHints from './components/KeyboardHints';

// Sections
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import ContactSection from './sections/ContactSection';

// Admin (kept as a route)
import AdminDashboard from './pages/AdminDashboard.jsx';

// ─── Section transition variants ─────────────────────────────────────────────────
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '80%' : '-80%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? '-80%' : '80%',
    opacity: 0,
  }),
};

const slideTransition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

const SECTION_COUNT = 5;

// ─── Default config (used before Firebase loads) ─────────────────────────────────
const DEFAULT_CONFIG = {
  hero1: 'Engineering',
  hero2: 'Digital',
  hero3: 'Experiences.',
  heroSub: 'Software Engineer & Front-End Developer crafting high-performance, scalable web and mobile applications.',
  aboutTitle: 'The Architect.',
  aboutText1: 'I am a Computer Engineering graduate specializing in Software Development.',
  aboutText2: 'My philosophy is simple: complex problems require elegant, scalable software solutions. From architecting robust React front-ends to building cross-platform Flutter applications, I build end-to-end digital systems that perform flawlessly.',
};

// ─── Portfolio SPA (state-based navigation) ──────────────────────────────────────
function PortfolioSPA() {
  const [currentSection, setCurrentSection] = useState(0);
  const [direction, setDirection] = useState(0);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Fetch config from Firebase
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };
    fetchConfig();
  }, []);

  const handleUpdateConfig = useCallback(async (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    try {
      await setDoc(doc(db, 'config', 'main'), newConfig, { merge: true });
    } catch (err) {
      console.error('Error updating config:', err);
    }
  }, [config]);

  // Navigate to a section
  const navigateTo = useCallback((index) => {
    if (index === currentSection) return;
    if (index < 0 || index >= SECTION_COUNT) return;
    setDirection(index > currentSection ? 1 : -1);
    setCurrentSection(index);
  }, [currentSection]);

  // ── Keyboard navigation ──────────────────────────────────────────────────────
  useEffect(() => {
    // Konami code
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];
    let konamiIndex = 0;

    const handleKeyDown = (e) => {
      // Konami code check (takes priority)
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          window.location.href = '/admin';
          konamiIndex = 0;
          return;
        }
      } else {
        konamiIndex = 0;
        if (e.key === konamiCode[0]) {
          konamiIndex = 1;
        }
      }

      // Arrow key navigation (only if not in an input/textarea)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateTo(Math.min(currentSection + 1, SECTION_COUNT - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateTo(Math.max(currentSection - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, navigateTo]);

  // ── Render current section ───────────────────────────────────────────────────
  const renderSection = () => {
    const props = { config, isAdmin: false, onUpdateConfig: handleUpdateConfig };
    switch (currentSection) {
      case 0: return <HeroSection {...props} />;
      case 1: return <AboutSection {...props} onNavigateContact={() => navigateTo(4)} />;
      case 2: return <ProjectsSection isAdmin={false} />;
      case 3: return <CertificationsSection />;
      case 4: return <ContactSection />;
      default: return <HeroSection {...props} />;
    }
  };

  return (
    <div className="stellar-layout">
      <StellarNav activeSection={currentSection} onNavigate={navigateTo} />

      <div className="stellar-main">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSection}
            className="section-transition-wrapper"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>

        <KeyboardHints currentSection={currentSection} />
      </div>
    </div>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────────
function App() {
  const [appReady, setAppReady] = useState(false);
  const [loaderExited, setLoaderExited] = useState(false);

  useEffect(() => {
    const minDelay = new Promise(resolve => setTimeout(resolve, 5000));
    Promise.all([
      document.fonts.ready,
      minDelay,
    ]).then(() => setAppReady(true));
  }, []);

  return (
    <>
      {/* Loading screen */}
      {!loaderExited && (
        <StellarCryoLoader
          isLoading={!appReady}
          onExited={() => setLoaderExited(true)}
        />
      )}

      {/* Persistent particle background */}
      <StellarBackground />

      {/* Theme + Router shell */}
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PortfolioSPA />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
