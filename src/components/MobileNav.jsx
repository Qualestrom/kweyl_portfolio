import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  User, 
  FolderGit2, 
  Award, 
  Mail, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import './MobileNav.css';

export const SECTIONS = [
  { id: 0, label: 'Home', icon: Home, shortLabel: 'Home' },
  { id: 1, label: 'About', icon: User, shortLabel: 'About' },
  { id: 2, label: 'Projects', icon: FolderGit2, shortLabel: 'Works' },
  { id: 3, label: 'Certifications', icon: Award, shortLabel: 'Certs' },
  { id: 4, label: 'Contact', icon: Mail, shortLabel: 'Contact' },
];

export const NAV_VARIANTS = [
  { id: 'floating-pill', label: 'Floating Pill' },
  { id: 'bottom-tab', label: 'Bottom Tab' },
  { id: 'minimal-dots', label: 'Minimal Dots' },
];

/**
 * MobileNav — Touch-friendly bottom navigation supporting multiple design approaches:
 * 1. 'floating-pill' (Floating glass capsule with animated active badge)
 * 2. 'bottom-tab' (Edge-to-edge docked native-style tab bar with micro-labels)
 * 3. 'minimal-dots' (Ultra-clean compact dots & title capsule)
 *
 * Persists selected style to localStorage so Chris can inspect and evaluate all 3.
 */
export default function MobileNav({
  activeSection,
  onNavigate,
  showStyleSwitcher = true,
}) {
  const [navStyle, setNavStyle] = useState(() => {
    try {
      return localStorage.getItem('portfolio_mobile_nav_style') || 'floating-pill';
    } catch (_) {
      return 'floating-pill';
    }
  });

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const handleSelectStyle = (styleId) => {
    setNavStyle(styleId);
    try {
      localStorage.setItem('portfolio_mobile_nav_style', styleId);
    } catch (_) {}
    setIsSwitcherOpen(false);
  };

  const currentSectionMeta = SECTIONS[activeSection] || SECTIONS[0];

  return (
    <div className={`mobile-nav-root mobile-nav-root--${navStyle}`}>
      {/* ─── APPROACH 1: Floating Pill ───────────────────────────────────────── */}
      {navStyle === 'floating-pill' && (
        <nav className="mobile-nav-pill" aria-label="Mobile Navigation">
          <div className="mobile-nav-pill-inner">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onNavigate(sec.id)}
                  className={`mobile-nav-pill-btn ${isActive ? 'is-active' : ''}`}
                  aria-label={sec.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-pill-active"
                      className="mobile-nav-pill-highlight"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="mobile-nav-icon-wrap">
                    <Icon size={17} className="mobile-nav-icon" />
                  </span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="mobile-nav-pill-label"
                    >
                      {sec.shortLabel}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ─── APPROACH 2: Bottom Tab Bar (Edge-to-Edge) ───────────────────────── */}
      {navStyle === 'bottom-tab' && (
        <nav className="mobile-nav-dock" aria-label="Mobile Navigation">
          <div className="mobile-nav-dock-grid">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onNavigate(sec.id)}
                  className={`mobile-nav-dock-item ${isActive ? 'is-active' : ''}`}
                  aria-label={sec.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-dock-active"
                      className="mobile-nav-dock-top-indicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon size={18} className="mobile-nav-dock-icon" />
                  <span className="mobile-nav-dock-label">{sec.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ─── APPROACH 3: Minimal Dots Capsule ───────────────────────────────── */}
      {navStyle === 'minimal-dots' && (
        <nav className="mobile-nav-minimal" aria-label="Mobile Navigation">
          <div className="mobile-nav-minimal-inner">
            <button
              type="button"
              onClick={() => onNavigate(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              className="mobile-nav-minimal-arrow"
              aria-label="Previous section"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="mobile-nav-minimal-center">
              <span className="mobile-nav-minimal-title">
                {currentSectionMeta.label}
              </span>
              <div className="mobile-nav-minimal-dots">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => onNavigate(sec.id)}
                    className={`mobile-nav-dot ${activeSection === sec.id ? 'is-active' : ''}`}
                    aria-label={`Go to ${sec.label}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(Math.min(SECTIONS.length - 1, activeSection + 1))}
              disabled={activeSection === SECTIONS.length - 1}
              className="mobile-nav-minimal-arrow"
              aria-label="Next section"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      )}

      {/* ─── Live Style Switcher (Allows comparing all 3 approaches) ─────────── */}
      {showStyleSwitcher && (
        <div className="mobile-nav-style-switcher">
          <AnimatePresence>
            {isSwitcherOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.92 }}
                transition={{ duration: 0.18 }}
                className="mobile-nav-switcher-popover"
              >
                <div className="mobile-nav-switcher-header">
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>Nav Bar Style</span>
                </div>
                {NAV_VARIANTS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectStyle(v.id)}
                    className={`mobile-nav-switcher-option ${navStyle === v.id ? 'is-selected' : ''}`}
                  >
                    <span>{v.label}</span>
                    {navStyle === v.id && <span className="mobile-nav-switcher-check">●</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setIsSwitcherOpen((prev) => !prev)}
            className="mobile-nav-switcher-toggle"
            title="Switch mobile navigation style (Pill / Tab Bar / Minimal Dots)"
            aria-label="Switch mobile navigation layout"
          >
            <Layers size={13} />
            <span className="mobile-nav-switcher-btn-label">Style</span>
          </button>
        </div>
      )}
    </div>
  );
}
