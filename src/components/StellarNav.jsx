import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, User, FolderCode, Award, Mail } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './StellarNav.css';

const NAV_ITEMS = [
  { id: 0, label: 'Home', icon: Home },
  { id: 1, label: 'About', icon: User },
  { id: 2, label: 'Projects', icon: FolderCode },
  { id: 3, label: 'Certifications', icon: Award },
  { id: 4, label: 'Contact', icon: Mail },
];

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 200;

export default function StellarNav({ activeSection, onNavigate }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.nav
      className={`stellar-nav${isHovered ? ' expanded' : ''}`}
      initial={{ width: COLLAPSED_WIDTH }}
      animate={{ width: isHovered ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className="stellar-nav-logo">
        {isHovered ? 'CHRISTOPHER.' : 'C.'}
      </div>

      {/* Nav Items */}
      <div className="stellar-nav-items">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              className={`stellar-nav-item${isActive ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <span className="stellar-nav-icon">
                <Icon size={20} />
              </span>
              <span className="stellar-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="stellar-nav-divider" />

      {/* Section counter */}
      <div className="stellar-nav-counter">
        {String(activeSection + 1).padStart(2, '0')} / {String(NAV_ITEMS.length).padStart(2, '0')}
      </div>

      {/* Theme toggle */}
      <div className="stellar-nav-bottom">
        <ThemeToggle />
      </div>
    </motion.nav>
  );
}
