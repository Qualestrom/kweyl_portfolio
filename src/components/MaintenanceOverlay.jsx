import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, ShieldAlert, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DynamicSocialIcon } from './HomeHero';
import './MaintenanceOverlay.css';

export default function MaintenanceOverlay({ config = {} }) {
  const socials = Array.isArray(config.heroSocials) && config.heroSocials.length > 0 
    ? config.heroSocials 
    : [
        { id: '1', url: 'https://github.com', label: 'GitHub' },
        { id: '2', url: 'https://linkedin.com', label: 'LinkedIn' }
      ];

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
                href={link.url}
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

        {/* Footer info & Admin login link */}
        <div className="maintenance-footer">
          <span className="maintenance-footer-credit">&bull; Christopher Lamera &bull;</span>
          <Link to="/admin" className="maintenance-admin-link">
            <Lock size={12} /> Admin Access
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
