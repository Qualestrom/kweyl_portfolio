import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './SectionLabels.css';

const SECTIONS = [
  { id: 0, label: 'Home' },
  { id: 1, label: 'About' },
  { id: 2, label: 'Projects' },
  { id: 3, label: 'Certifications' },
  { id: 4, label: 'Contact' },
];

/**
 * SectionLabels — Invisible-background floating navigation
 * Displays all section names vertically along the left edge.
 * The active section word is highlighted and aligned with a glowing indicator bar.
 * Clicking a label navigates to that section.
 */
export default function SectionLabels({ activeSection, onNavigate, isAdmin = false, onLogout }) {
  return (
    <>
      {/* Section name labels — floating on the left */}
      <div className="section-labels">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              className={`section-label${isActive ? ' active' : ''}`}
              onClick={() => onNavigate(section.id)}
              aria-label={`Go to ${section.label}`}
            >
              {isActive && (
                <motion.span
                  className="section-label-indicator"
                  layoutId="section-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="section-label-text">{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section counter — bottom-left */}
      <div className="section-counter">
        <span className="section-counter-current">
          {String(activeSection + 1).padStart(2, '0')}
        </span>
        <span className="section-counter-separator">/</span>
        <span className="section-counter-total">
          {String(SECTIONS.length).padStart(2, '0')}
        </span>
      </div>

      {/* Top right: Admin status & Theme toggle */}
      <div className="section-top-actions">
        {isAdmin && (
          <button 
            onClick={onLogout} 
            className="admin-logout-badge"
            title="Exit Admin Mode"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        )}
        <div className="section-theme-toggle">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}
