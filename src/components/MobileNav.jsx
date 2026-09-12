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
  { id: 2, label: 'Projects', icon: FolderGit2, shortLabel: 'Works' },
  { id: 3, label: 'Certifications', icon: Award, shortLabel: 'Certs' },
  { id: 4, label: 'Contact', icon: Mail, shortLabel: 'Contact' },
];

/**
 * MobileNav — Touch-friendly floating pill bottom navigation (Stellar-Cryo Glass)
 */
export default function MobileNav({ activeSection, onNavigate }) {
  return (
    <div className="mobile-nav-root">
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
    </div>
  );
}
