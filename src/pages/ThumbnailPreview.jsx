import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Code2, 
  Layers, 
  Cpu, 
  Globe, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Smartphone, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './ThumbnailPreview.css';

export default function ThumbnailPreview() {
  const [cleanView, setCleanView] = useState(false);

  return (
    <div className={`thumb-page-wrapper ${cleanView ? 'clean-mode' : ''}`}>
      {/* Top Toolbar (Hidden in clean mode for screenshots) */}
      {!cleanView && (
        <div className="thumb-toolbar">
          <Link to="/" className="thumb-toolbar-back">
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
          <div className="thumb-toolbar-title">
            <Sparkles size={14} style={{ color: 'var(--cryo-accent)' }} />
            <span>Thumbnail & Social Card Preview Mode</span>
          </div>
          <button 
            type="button" 
            onClick={() => setCleanView(true)} 
            className="thumb-toolbar-clean-btn"
            title="Hide this toolbar to take a clean screenshot"
          >
            <EyeOff size={15} /> Hide UI for Screenshot (Press Esc to restore)
          </button>
        </div>
      )}

      {/* Esc key listener to exit clean mode */}
      {cleanView && (
        <button 
          type="button" 
          onClick={() => setCleanView(false)} 
          className="thumb-exit-clean-btn"
          title="Restore toolbar"
        >
          <Eye size={14} /> Show Toolbar
        </button>
      )}

      {/* ─── The Main 16:9 Thumbnail Canvas ───────────────────────────────── */}
      <div className="thumb-canvas-container">
        <div className="thumb-ambient-sphere-1" />
        <div className="thumb-ambient-sphere-2" />
        <div className="thumb-grid-pattern" />

        <div className="thumb-frame">
          {/* Top Bar inside thumbnail */}
          <div className="thumb-header">
            <div className="thumb-badge">
              <span className="thumb-badge-dot" />
              <span>PORTFOLIO SHOWCASE &bull; 2026</span>
            </div>
            <div className="thumb-domain-pill">
              <Globe size={13} style={{ color: 'var(--cryo-accent)' }} />
              <span>kweyl-portfolio.me</span>
            </div>
          </div>

          {/* Hero Section of the Thumbnail */}
          <div className="thumb-main-content">
            <div className="thumb-hero-text">
              <div className="thumb-role-tag">
                <Cpu size={14} /> Software & Cross-Platform Developer
              </div>
              <h1 className="thumb-headline">
                CHRISTOPHER <span className="thumb-highlight">LAMERA</span>
              </h1>
              <p className="thumb-subheadline">
                <span className="thumb-sub-accent">PRECISION</span> IN EVERY PIXEL &bull; <span className="thumb-sub-accent">PERFORMANCE</span> IN EVERY DEPLOYMENT
              </p>
              <p className="thumb-bio">
                Building scalable web architectures with React and high-performance cross-platform applications with Flutter.
              </p>

              {/* Core Competencies Badges */}
              <div className="thumb-skills-row">
                <span className="thumb-skill-pill"><Code2 size={13} /> React.js</span>
                <span className="thumb-skill-pill"><Smartphone size={13} /> Flutter</span>
                <span className="thumb-skill-pill"><Zap size={13} /> Vite & Next.js</span>
                <span className="thumb-skill-pill"><Layers size={13} /> Firebase</span>
                <span className="thumb-skill-pill"><ShieldCheck size={13} /> TailwindCSS</span>
              </div>
            </div>

            {/* Interactive Visual Preview Cards Previewing Portfolio UI */}
            <div className="thumb-cards-showcase">
              {/* Preview Card 1: Mainframe UI */}
              <motion.div 
                className="thumb-card thumb-card--primary"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="thumb-card-header">
                  <div className="thumb-card-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <span className="thumb-card-title">Stellar-Cryo Mainframe</span>
                </div>
                <div className="thumb-card-body">
                  <div className="thumb-card-orbit-ring">
                    <div className="thumb-card-orbit-core" />
                  </div>
                  <div className="thumb-card-text">
                    <div className="thumb-card-line-1">Precision Front-End</div>
                    <div className="thumb-card-line-2">Framer Motion &bull; 60 FPS Fluidity</div>
                  </div>
                </div>
              </motion.div>

              {/* Preview Card 2: Systems & Cross-Platform */}
              <motion.div 
                className="thumb-card thumb-card--secondary"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <div className="thumb-card-header">
                  <span className="thumb-card-title">Full-Stack Architecture</span>
                  <span className="thumb-card-badge">Production</span>
                </div>
                <div className="thumb-card-stats">
                  <div className="thumb-stat">
                    <span className="thumb-stat-num">100%</span>
                    <span className="thumb-stat-lbl">Responsive</span>
                  </div>
                  <div className="thumb-stat">
                    <span className="thumb-stat-num">&lt; 1s</span>
                    <span className="thumb-stat-lbl">Fast Load</span>
                  </div>
                  <div className="thumb-stat">
                    <span className="thumb-stat-num">Live</span>
                    <span className="thumb-stat-lbl">Firestore Sync</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer Bar inside thumbnail */}
          <div className="thumb-footer">
            <span className="thumb-footer-text">Interactive Single Page Experience &bull; State-Driven Slides</span>
            <div className="thumb-footer-cta">
              <span>Explore Portfolio</span>
              <ExternalLink size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
