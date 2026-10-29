import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { supabase, isSupabaseConfigured } from '../supabase';
import { Wrench, Eye, EyeOff, ShieldAlert, Check } from 'lucide-react';
import { useMainframe } from '../context/MainframeContext';
import SectionLabels from './SectionLabels';
import MobileNav from './MobileNav';
import KeyboardHints from './KeyboardHints';
import MaintenanceOverlay from './MaintenanceOverlay';
import PullToRefresh from './PullToRefresh';

// Sections
import HomeHero from './HomeHero';
import AboutSection from '../sections/AboutSection';
import ProjectsSection from '../sections/ProjectsSection';
import CertificationsSection from '../sections/CertificationsSection';
import ContactSection from '../sections/ContactSection';

const SECTION_COUNT = 5;

// ─── Default config (used before Firebase loads) ─────────────────────────────────
export const DEFAULT_CONFIG = {
  heroGreeting: "Hi, I'm Christopher Lamera.",
  heroHeadline1: 'PRECISION IN EVERY PIXEL.',
  heroHeadline2: 'PERFORMANCE IN EVERY DEPLOYMENT.',
  heroHighlightedWords: ['PRECISION', 'PERFORMANCE'],
  heroSub: 'Full-stack developer specializing in React, React Native, and Supabase. I deliver rapid, pixel-perfect web and mobile solutions with interactive graphics and robust cloud architectures.',
  heroProfileImage: '/assets/recovered/profile/hero-profile.webp',
  heroFrameAnimation: 'orbit',
  heroBtnPrimaryText: 'View Projects',
  heroBtnSecondaryText: 'Download CV',
  heroCvUrl: '/assets/recovered/resumes/Lamera_Resume.pdf',
  heroCvData: null,
  isMaintenanceMode: false,
  heroSocials: [
    { id: '1', url: 'https://github.com/Qualestrom', label: 'GitHub Profile' },
    { id: '2', url: 'https://linkedin.com', label: 'LinkedIn Profile' }
  ],
  aboutTitle: 'Software Developer & Architect',
  aboutText1: 'I am a Computer Engineering graduate specializing in Full-Stack Web and Cross-Platform Mobile Development. I architect high-performance React front-ends, interactive Three.js and Konva.js experiences, React Native mobile apps, and scalable Supabase backends.',
  aboutText2: '',
  aboutStatus: 'Open to Work',
  aboutSoftwareSkills: ['React', 'TypeScript', 'Three.js', 'Konva.js', 'Tailwind CSS', 'Vite'],
  aboutMobileSkills: ['React Native', 'Expo', 'Flutter', 'Dart', 'Cross-Platform Architecture', 'PWA'],
  aboutCloudSkills: ['Supabase', 'PostgreSQL', 'Firebase', 'Row Level Security', 'Vercel', 'Realtime Sync'],
  aboutDesignSkills: ['Figma', 'UI/UX Design', 'Framer Motion', 'Design Systems', 'Git / CI/CD'],
};

// ─── Portfolio SPA (continuous spatial camera navigation) ────────────────────────
export default function PortfolioSPA({ isAdmin = false, onLogout, loaderExited = true, isWarping = false, onSectionChange }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [direction, setDirection] = useState(0);
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio_config');
      if (!cached) return DEFAULT_CONFIG;
      const parsed = JSON.parse(cached);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        heroProfileImage: parsed.heroProfileImage || DEFAULT_CONFIG.heroProfileImage,
      };
    } catch (_) {
      return DEFAULT_CONFIG;
    }
  });
  const [saveStatus, setSaveStatus] = useState('');
  const { triggerMainframeAccess } = useMainframe();
  const konamiIndexRef = useRef(0);
  const navigate = useNavigate();

  // Real-time Supabase / Firestore sync
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('config')
        .select('data')
        .eq('id', 'main')
        .single()
        .then(({ data, error }) => {
          if (!error && data?.data) {
            setConfig((prev) => {
              const merged = {
                ...prev,
                ...data.data,
                heroProfileImage: data.data.heroProfileImage || prev.heroProfileImage || DEFAULT_CONFIG.heroProfileImage,
              };
              try {
                localStorage.setItem('portfolio_config', JSON.stringify(merged));
              } catch (_) {}
              return merged;
            });
          }
        });
      return;
    }

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

  // Update config in state, local cache, and Supabase / Firestore
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

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: current } = await supabase.from('config').select('data').eq('id', 'main').single();
        const mergedData = { ...(current?.data || {}), ...patch };
        await supabase.from('config').upsert({ id: 'main', data: mergedData });
        setSaveStatus('Saved to Supabase');
        setTimeout(() => setSaveStatus(''), 2500);
        return;
      } catch (supErr) {
        console.warn('Supabase config update error:', supErr);
      }
    }

    // 3. Fallback to Firestore
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
    onSectionChange?.(index);
  }, [currentSection, onSectionChange]);

  // ── Touch swipe & wheel navigation refs ───────────────────────────────────────
  const touchStartRef = useRef({ x: 0, y: 0, time: 0, target: null });
  const wheelCooldownRef = useRef(0);

  // ── Keyboard, Touch Swipe & Wheel Navigation ──────────────────────────────────
  useEffect(() => {
    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a', 'enter'];

    const handleKeyDown = (e) => {
      // Check Konami Code
      if (!isAdmin) {
        const pressedKey = (e.key || '').toLowerCase();
        const pressedCode = (e.code || '').toLowerCase();
        const expectedKey = konamiCode[konamiIndexRef.current];

        const isMatch = pressedKey === expectedKey ||
          (expectedKey === 'b' && pressedCode === 'keyb') ||
          (expectedKey === 'a' && pressedCode === 'keya') ||
          (expectedKey === 'enter' && pressedCode === 'enter');

        if (isMatch) {
          konamiIndexRef.current++;
          if (konamiIndexRef.current === konamiCode.length) {
            triggerMainframeAccess();
            konamiIndexRef.current = 0;
            return;
          }
        } else {
          konamiIndexRef.current = 0;
          if (pressedKey === konamiCode[0] || pressedCode === 'arrowup') {
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

    // Touch Swipe handling (horizontal section page switching)
    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        target: e.target,
      };
    };

    const handleTouchEnd = (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;
      const startTarget = touchStartRef.current.target;

      // Ignore swipes inside inner carousels, inputs, buttons, modals, or mobile nav
      const isInnerInteractive = startTarget && startTarget.closest && (
        startTarget.closest('.project-media-slider') ||
        startTarget.closest('.projects-carousel') ||
        startTarget.closest('.certificates-carousel') ||
        startTarget.closest('[data-no-swipe]') ||
        startTarget.closest('input') ||
        startTarget.closest('textarea') ||
        startTarget.closest('.mobile-nav-root') ||
        startTarget.closest('.stellar-modal-backdrop') ||
        startTarget.closest('.admin-floating-toolbar')
      );

      if (isInnerInteractive) return;

      // 80px horizontal travel threshold with horizontal dominance check
      const isDeliberateSwipe = Math.abs(dx) >= 80 && Math.abs(dx) > Math.abs(dy) * 1.35;
      const isFlick = Math.abs(dx) >= 45 && dt < 280 && Math.abs(dx) > Math.abs(dy) * 1.5;

      if (isDeliberateSwipe || isFlick) {
        if (dx < 0) {
          // Swipe left -> advance to next section
          navigateTo(Math.min(currentSection + 1, SECTION_COUNT - 1));
        } else {
          // Swipe right -> return to previous section
          navigateTo(Math.max(currentSection - 1, 0));
        }
      }
    };

    // Wheel navigation (smooth section change with cooldown)
    const handleWheel = (e) => {
      if (Date.now() < wheelCooldownRef.current) return;
      if (e.target.closest('input, textarea, .stellar-modal-backdrop, .mobile-nav-root, [data-prevent-wheel]')) return;

      // Check if user is scrolling inside a vertically scrollable element
      const scrollable = e.target.closest('.section-scrollable, .overflow-y-auto, [data-scrollable]');
      if (scrollable) {
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 8;
        const atTop = scrollable.scrollTop <= 8;

        if (isScrollingDown && !atBottom) return;
        if (isScrollingUp && !atTop) return;
      }

      const absY = Math.abs(e.deltaY);
      const absX = Math.abs(e.deltaX);
      if (absY > 35 || absX > 35) {
        const delta = absY >= absX ? e.deltaY : e.deltaX;
        if (delta > 35) {
          wheelCooldownRef.current = Date.now() + 650;
          navigateTo(Math.min(currentSection + 1, SECTION_COUNT - 1));
        } else if (delta < -35) {
          wheelCooldownRef.current = Date.now() + 650;
          navigateTo(Math.max(currentSection - 1, 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentSection, navigateTo, isAdmin, navigate]);

  // ── If Maintenance Mode is Active & Viewer is NOT Admin ───────────────────────
  if (config.isMaintenanceMode && !isAdmin) {
    return <MaintenanceOverlay config={config} />;
  }

  const toggleMaintenanceMode = () => {
    handleUpdateConfig('isMaintenanceMode', !config.isMaintenanceMode);
  };

  const sharedProps = { config, isAdmin, onUpdateConfig: handleUpdateConfig };

  return (
    <>
      <div 
        className="stellar-viewport-stage"
        style={{
          position: 'fixed',
          inset: 0,
          perspective: 1200,
          perspectiveOrigin: '50% 50%',
          overflow: 'hidden',
          width: '100vw',
          height: '100vh',
          pointerEvents: loaderExited ? 'auto' : 'none',
        }}
      >
        <motion.div 
          className="stellar-main stellar-main--full" 
          style={{ 
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            transformOrigin: '50% 50%',
          }}
          initial={false}
          animate={
            loaderExited
              ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
              : isWarping
              ? {
                  opacity: [0, 0.72, 0.96, 1, 1],
                  scale: [0.08, 0.24, 0.62, 1.032, 1],
                  filter: ['blur(12px)', 'blur(5px)', 'blur(1.5px)', 'blur(0px)', 'blur(0px)'],
                }
              : { opacity: 0, scale: 0.08, filter: 'blur(12px)' }
          }
          transition={
            isWarping
              ? {
                  duration: 1.52,
                  times: [0, 0.22, 0.54, 0.84, 1.0],
                  ease: 'easeInOut',
                }
              : { duration: 0.35, ease: 'easeOut' }
          }
        >
        <SectionLabels 
          activeSection={currentSection} 
          onNavigate={navigateTo} 
          isAdmin={isAdmin}
          onLogout={onLogout}
        />
        <motion.div
          className="stellar-camera-track"
          animate={{ x: `${-currentSection * 100}vw` }}
          transition={{
            type: 'spring',
            stiffness: 170,
            damping: 26,
            mass: 0.9,
          }}
        >
          <div className="stellar-camera-panel" aria-hidden={currentSection !== 0}>
            <HomeHero {...sharedProps} onNavigateProjects={() => navigateTo(2)} />
          </div>
          <div className="stellar-camera-panel" aria-hidden={currentSection !== 1}>
            <AboutSection {...sharedProps} onNavigateContact={() => navigateTo(4)} />
          </div>
          <div className="stellar-camera-panel" aria-hidden={currentSection !== 2}>
            <ProjectsSection isAdmin={isAdmin} />
          </div>
          <div className="stellar-camera-panel" aria-hidden={currentSection !== 3}>
            <CertificationsSection isAdmin={isAdmin} />
          </div>
          <div className="stellar-camera-panel" aria-hidden={currentSection !== 4}>
            <ContactSection {...sharedProps} />
          </div>
        </motion.div>

        <KeyboardHints currentSection={currentSection} />

        {/* ─── Pull Down to Refresh (Mobile / Touch) ───────────────────── */}
        <PullToRefresh />

        {/* ─── Mobile / Touch Bottom Navigation Bar ─────────────────────── */}
        <MobileNav 
          activeSection={currentSection} 
          onNavigate={navigateTo} 
        />

        {/* ─── Admin Floating Control Toolbar ─────────────────────────────── */}
        {isAdmin && (
          <div 
            className="admin-floating-toolbar"
            style={{
              position: 'fixed',
              bottom: 'var(--admin-toolbar-bottom, 24px)',
              right: '24px',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--cryo-glass-border)',
              borderRadius: '40px',
              padding: '8px 18px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.3)',
              fontFamily: 'Inter',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Live Mode Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: config.isMaintenanceMode ? '#eab308' : '#22c55e', 
                boxShadow: config.isMaintenanceMode ? '0 0 8px #eab308' : '0 0 8px #22c55e' 
              }} />
              <span style={{ fontWeight: 700 }}>
                {config.isMaintenanceMode ? 'Maintenance Mode' : 'Live Site'}
              </span>
            </div>

            {/* Maintenance Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleMaintenanceMode}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                background: config.isMaintenanceMode ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: config.isMaintenanceMode ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid var(--cryo-glass-border)',
                color: config.isMaintenanceMode ? '#eab308' : 'var(--text-muted)',
                fontFamily: 'Inter',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title={config.isMaintenanceMode ? "Click to disable maintenance mode and show portfolio to visitors" : "Click to activate maintenance overlay for all visitors"}
            >
              {config.isMaintenanceMode ? (
                <>
                  <Wrench size={13} /> Viewers Blocked (Click to Set Live)
                </>
              ) : (
                <>
                  <Wrench size={13} /> Activate Maintenance Screen
                </>
              )}
            </button>

            {/* Save Status Toast */}
            {saveStatus && (
              <span style={{ color: 'var(--cryo-accent)', fontWeight: 500, borderLeft: '1px solid var(--cryo-glass-border)', paddingLeft: '10px' }}>
                {saveStatus}
              </span>
            )}
          </div>
        )}
      </motion.div>
      </div>
    </>
  );
}
