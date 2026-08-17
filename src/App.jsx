import React, { useEffect, useState, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ThemeProvider } from './context/ThemeContext';
import StellarCryoLoader from './components/StellarCryoLoader';
import StellarBackground from './components/StellarBackground';
import InteractiveBackground from './components/InteractiveBackground';
import SectionLabels from './components/SectionLabels';
import KeyboardHints from './components/KeyboardHints';

// Sections
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ProjectsSection from './sections/ProjectsSection';
import CertificationsSection from './sections/CertificationsSection';
import ContactSection from './sections/ContactSection';

// Admin
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
export function PortfolioSPA({ isAdmin = false, onLogout }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [direction, setDirection] = useState(0);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const konamiIndexRef = useRef(0);
  const navigate = useNavigate();

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

  // ── Keyboard navigation & Konami code ──────────────────────────────────────────
  useEffect(() => {
    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a', 'enter'];

    const handleKeyDown = (e) => {
      // Check Konami Code
      if (!isAdmin) {
        const pressedKey = e.key.toLowerCase();
        const expectedKey = konamiCode[konamiIndexRef.current];

        if (pressedKey === expectedKey) {
          konamiIndexRef.current++;
          if (konamiIndexRef.current === konamiCode.length) {
            setIsRedirecting(true);
            setTimeout(() => {
              navigate('/admin');
            }, 1200);
            konamiIndexRef.current = 0;
            return;
          }
        } else {
          konamiIndexRef.current = 0;
          if (pressedKey === konamiCode[0]) {
            konamiIndexRef.current = 1;
          }
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
  }, [currentSection, navigateTo, isAdmin, navigate]);

  // ── Render current section ───────────────────────────────────────────────────
  const renderSection = () => {
    const props = { config, isAdmin, onUpdateConfig: handleUpdateConfig };
    switch (currentSection) {
      case 0: return <HeroSection {...props} />;
      case 1: return <AboutSection {...props} onNavigateContact={() => navigateTo(4)} />;
      case 2: return <ProjectsSection isAdmin={isAdmin} />;
      case 3: return <CertificationsSection />;
      case 4: return <ContactSection />;
      default: return <HeroSection {...props} />;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isRedirecting && (
          <motion.div 
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: 0, 
              left: 0, 
              width: '100vw', 
              height: '100vh',
              background: 'var(--cryo-accent, var(--accent))',
              zIndex: 999999,
              transformOrigin: 'bottom',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{ 
                color: '#0A0F1C', 
                fontFamily: 'Outfit, sans-serif', 
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 700,
                letterSpacing: '1px'
              }}
            >
              Accessing Mainframe...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionLabels 
        activeSection={currentSection} 
        onNavigate={navigateTo} 
        isAdmin={isAdmin}
        onLogout={onLogout}
      />

      <div className="stellar-main stellar-main--full">
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
    </>
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

      {/* Persistent backgrounds — starfield + circuit constellation grid */}
      <StellarBackground />
      <InteractiveBackground />

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
