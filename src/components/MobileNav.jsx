import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  User, 
  FolderGit2, 
  Award, 
  Mail
} from 'lucide-react';
import './MobileNav.css';

export const SECTIONS = [
  { id: 0, label: 'Home', icon: Home, shortLabel: 'Home' },
  { id: 1, label: 'About', icon: User, shortLabel: 'About' },
  { id: 2, label: 'Projects', icon: FolderGit2, shortLabel: 'Projects' },
  { id: 3, label: 'Certifications', icon: Award, shortLabel: 'Certs' },
  { id: 4, label: 'Contact', icon: Mail, shortLabel: 'Contact' },
];

/**
 * MobileNav — Full-Width Edge-to-Edge Frosted Glass Bottom Navigation Bar
 * Built with Genshin Cryo HUD aesthetics, responsive touch targets (>= 48px),
 * and dynamic safe-area-inset-bottom support.
 */
export default function MobileNav({ activeSection, onNavigate }) {
  return (
    <nav className="mobile-nav-root" aria-label="Mobile Navigation">
      {/* Top Ambient Cryo Horizon Glow Line */}
      <div className="mobile-nav-top-rim" />

      <div className="mobile-nav-grid">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onNavigate(sec.id)}
              className={`mobile-nav-item ${isActive ? 'is-active' : ''}`}
              aria-label={sec.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Crystalline Glow Bloom */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active-bloom"
                  className="mobile-nav-item-bloom"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Active Diamond Gem Pip */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-active-gem"
                  className="mobile-nav-active-gem"
                  transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                />
              )}

              <span className="mobile-nav-icon-container">
                <Icon size={19} className="mobile-nav-icon" />
              </span>

              <span className="mobile-nav-item-label">
                {sec.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
