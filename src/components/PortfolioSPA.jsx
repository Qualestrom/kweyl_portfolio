import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import SectionLabels from './SectionLabels';
import KeyboardHints from './KeyboardHints';

// Sections
import HomeHero from './HomeHero';
import AboutSection from '../sections/AboutSection';
import ProjectsSection from '../sections/ProjectsSection';
import CertificationsSection from '../sections/CertificationsSection';
import ContactSection from '../sections/ContactSection';

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
export const DEFAULT_CONFIG = {
  heroGreeting: "Hi, I'm Christopher Lamera.",
  heroHeadline1: 'PRECISION IN EVERY PIXEL.',
  heroHeadline2: 'PERFORMANCE IN EVERY DEPLOYMENT.',
  heroHighlightedWords: ['PRECISION', 'PERFORMANCE'],
  heroSub: 'Cross-platform developer specializing in React and Flutter. I deliver rapid, pixel-perfect web and mobile solutions while building scalable architectures that anticipate future needs.',
  heroProfileImage: '',
  heroFrameAnimation: 'orbit',
  heroBtnPrimaryText: 'View Projects',
  heroBtnSecondaryText: 'Download CV',
  heroCvUrl: '/cv.pdf',
  heroSocials: [
    { id: '1', url: 'https://github.com', label: 'GitHub Profile' },
    { id: '2', url: 'https://linkedin.com', label: 'LinkedIn Profile' }
  ],
  aboutTitle: 'The Architect.',
  aboutText1: 'I am a Computer Engineering graduate specializing in Software Development.',
  aboutText2: 'My philosophy is simple: complex problems require elegant, scalable software solutions. From architecting robust React front-ends to building cross-platform Flutter applications, I build end-to-end digital systems that perform flawlessly.',
};

// ─── Portfolio SPA (state-based navigation) ──────────────────────────────────────
export default function PortfolioSPA({ isAdmin = false, onLogout }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [direction, setDirection] = useState(0);
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio_config');
      return cached ? { ...DEFAULT_CONFIG, ...JSON.parse(cached) } : DEFAULT_CONFIG;
    } catch (_) {
      return DEFAULT_CONFIG;
    }
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const konamiIndexRef = useRef(0);
  const navigate = useNavigate();

  // Real-time Firestore sync with onSnapshot
  useEffect(() => {
    const docRef = doc(db, 'config', 'main');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          setConfig((prev) => {
            const merged = { ...prev, ...remoteData };
            try {
              localStorage.setItem('portfolio_config', JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      },
      (err) => {
        console.warn('Firestore real-time sync notice:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update config in state, local cache, and Firestore
  const handleUpdateConfig = useCallback(async (updatesOrKey, value) => {
    let patch = {};
    if (typeof updatesOrKey === 'string') {
      patch = { [updatesOrKey]: value };
    } else if (typeof updatesOrKey === 'object' && updatesOrKey !== null) {
      patch = updatesOrKey;
    }

    // 1. Optimistic state & local storage update
    setConfig((prev) => {
      const merged = { ...prev, ...patch };
      try {
        localStorage.setItem('portfolio_config', JSON.stringify(merged));
      } catch (_) {}
      return merged;
    });

    setSaveStatus('Saving changes...');

    // 2. Persist to Firestore
    try {
      const docRef = doc(db, 'config', 'main');
      await setDoc(docRef, patch, { merge: true });
      setSaveStatus('Saved to database');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      console.error('Error saving to Firestore:', err);
      setSaveStatus('Saved locally');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  }, []);

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
      case 0: return <HomeHero {...props} onNavigateProjects={() => navigateTo(2)} />;
      case 1: return <AboutSection {...props} onNavigateContact={() => navigateTo(4)} />;
      case 2: return <ProjectsSection isAdmin={isAdmin} />;
      case 3: return <CertificationsSection />;
      case 4: return <ContactSection />;
      default: return <HomeHero {...props} onNavigateProjects={() => navigateTo(2)} />;
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

        {/* Admin Mode Badge & Real-Time Save Indicator */}
        {isAdmin && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--cryo-glass-border)',
            borderRadius: '30px',
            padding: '8px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
            color: 'var(--text-main)',
            backdropFilter: 'blur(12px)',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontWeight: 600 }}>Admin Mode</span>
            {saveStatus && (
              <span style={{ color: 'var(--cryo-accent)', marginLeft: '6px', fontWeight: 500 }}>
                &bull; {saveStatus}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
