import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMainframe } from '../context/MainframeContext';
import { DynamicSocialIcon } from './HomeHero';
import { ensureAbsoluteUrl } from '../utils/imageUtils';
import './MaintenanceOverlay.css';

export default function MaintenanceOverlay({ config = {} }) {
  const { triggerMainframeAccess } = useMainframe();
  const konamiIndexRef = useRef(0);
  const navigate = useNavigate();

  const socials = Array.isArray(config.heroSocials) && config.heroSocials.length > 0 
    ? config.heroSocials 
    : [
        { id: '1', url: 'https://github.com', label: 'GitHub' },
        { id: '2', url: 'https://linkedin.com', label: 'LinkedIn' }
      ];

  // Secret Konami Code Handler (↑ ↑ ↓ ↓ ← → ← → B A Enter)
  useEffect(() => {
    const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a', 'enter'];

    const handleKeyDown = (e) => {
      const pressedKey = e.key.toLowerCase();
      const expectedKey = konamiCode[konamiIndexRef.current];

      if (pressedKey === expectedKey) {
        konamiIndexRef.current++;
        if (konamiIndexRef.current === konamiCode.length) {
          triggerMainframeAccess();
          konamiIndexRef.current = 0;
          return;
        }
      } else {
        konamiIndexRef.current = 0;
        if (pressedKey === konamiCode[0]) {
          konamiIndexRef.current = 1;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="maintenance-viewport">
      {/* Background ambient lighting */}
      <div className="maintenance-ambient-glow" />
      <div className="maintenance-ambient-grid" />

      <motion.div 
        className="maintenance-panel"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Status Badge */}
        <div className="maintenance-beacon-badge">
          <span className="maintenance-beacon-dot" />
          <span className="maintenance-beacon-text">System Calibration Active</span>
        </div>

        {/* Animated Cyber Core Icon */}
        <div className="maintenance-graphic-wrapper">
          <div className="maintenance-pulse-ring-1" />
          <div className="maintenance-pulse-ring-2" />
          <div className="maintenance-core-circle">
            <Wrench size={32} className="maintenance-core-icon" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="maintenance-headline">
          PORTFOLIO UNDER <span className="maintenance-highlight">MAINTENANCE</span>
        </h1>

        {/* Description */}
        <p className="maintenance-desc">
          I am currently deploying new features, optimizing architecture, and updating project case studies. The portfolio will be back online shortly.
        </p>

        {/* Social / Contact Direct Links */}
        <div className="maintenance-contact-section">
          <div className="maintenance-contact-label">Get in touch while systems update:</div>
          <div className="maintenance-socials-row">
            {socials.map((link) => (
              <a
                key={link.id || link.url}
                href={ensureAbsoluteUrl(link.url)}
                target="_blank"
                rel="noreferrer"
                className="maintenance-social-btn"
                aria-label={link.label || link.url}
                title={link.label || link.url}
              >
                <DynamicSocialIcon url={link.url} size={18} />
                <span>{link.label || 'Profile'}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Clean Centered Footer */}
        <div className="maintenance-footer">
          <span className="maintenance-footer-credit">&bull; Christopher Lamera &bull;</span>
        </div>
      </motion.div>
    </div>
  );
}
