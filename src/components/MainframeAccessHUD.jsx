import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, Cpu } from 'lucide-react';
import { useMainframe } from '../context/MainframeContext';
import './MainframeAccessHUD.css';

const RANDOM_HEX = [
  '0x7E4A9F', '0x88CE12', '0x91F0B4', '0x0284C7',
  '0x00F0FF', '0x38BDF8', '0xE0F2FE', '0x10B981'
];

export default function MainframeAccessHUD() {
  const { isAccessingMainframe, mainframeProgress } = useMainframe();
  const [hexToken, setHexToken] = useState('0x7E4A9F');

  // Cycle rapid cryptographic tokens
  useEffect(() => {
    if (!isAccessingMainframe) return;
    const interval = setInterval(() => {
      setHexToken(RANDOM_HEX[Math.floor(Math.random() * RANDOM_HEX.length)]);
    }, 120);
    return () => clearInterval(interval);
  }, [isAccessingMainframe]);

  if (!isAccessingMainframe && mainframeProgress <= 0) return null;

  const pct = Math.round(mainframeProgress * 100);

  const hudContent = (
    <AnimatePresence>
      {isAccessingMainframe && (
        <motion.div
          className="mainframe-hud-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          {/* Holographic grid and tech brackets */}
          <div className="mainframe-hud-grid" />
          <div className="mainframe-hud-bracket mainframe-hud-bracket--tl" />
          <div className="mainframe-hud-bracket mainframe-hud-bracket--tr" />
          <div className="mainframe-hud-bracket mainframe-hud-bracket--bl" />
          <div className="mainframe-hud-bracket mainframe-hud-bracket--br" />

          {/* Top Telemetry Header */}
          <div className="mainframe-hud-header">
            <div className="mainframe-hud-header-badge">
              <span className="mainframe-hud-header-dot" />
              <span>PROJECT MOONGAZER</span>
            </div>
            <span>// CELESTIAL LOGIC BUS: ACTIVE</span>
          </div>

          {/* Centered Holographic Targeting Reticle */}
          <div className="mainframe-hud-reticle">
            <div className="mainframe-hud-reticle-ring" />
            <div className="mainframe-hud-reticle-ring--outer" />
            <div className="mainframe-hud-reticle-crosshair-h" />
            <div className="mainframe-hud-reticle-crosshair-v" />
            <div className="mainframe-hud-reticle-lock-text">
              {pct < 28 && "ORBITAL FLY-BY // APPROACHING..."}
              {pct >= 28 && pct < 62 && "CELESTIAL AXIS SHIFT // 180°"}
              {pct >= 62 && pct < 82 && "IN FRONT OF DARK SIDE // TARGET LOCKED"}
              {pct >= 82 && "TERMINAL DOCKING // SNEZHNAYA SECURE"}
            </div>
          </div>

          {/* Bottom Telemetry Card */}
          <motion.div
            className="mainframe-hud-card"
            initial={{ scale: 0.94, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mainframe-hud-title-row">
              <div className="mainframe-hud-title">
                <Cpu className="mainframe-hud-title-icon" size={20} />
                <span>Accessing Mainframe...</span>
              </div>
              <div style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 600 }}>
                AXIS ROTATION: 180°
              </div>
            </div>

            <div className="mainframe-hud-code-block">
              <div className="mainframe-hud-line">
                <span style={{ color: '#64748B' }}>[0.1s]</span>
                <span>HYPER-SPATIAL ORBITAL APPROACH ENGAGED</span>
              </div>
              <div className={`mainframe-hud-line ${pct >= 28 ? 'mainframe-hud-line--active' : ''}`}>
                <span style={{ color: '#64748B' }}>[0.6s]</span>
                <span>ROTATING CELESTIAL AXIS -&gt; HEMISPHERE: DARK SIDE</span>
              </div>
              <div className={`mainframe-hud-line ${pct >= 62 ? 'mainframe-hud-line--active' : ''}`}>
                <span style={{ color: '#64748B' }}>[1.4s]</span>
                <span>APPROACH COMPLETE: IN FRONT OF ARCHEOLUNAR LOGIC CORE</span>
              </div>
              <div className={`mainframe-hud-line ${pct >= 82 ? 'mainframe-hud-line--success' : ''}`}>
                <span style={{ color: '#64748B' }}>[1.9s]</span>
                <span>CIPHER DECRYPTED: WELCOME, ADMINISTRATOR</span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="mainframe-hud-progress-wrap">
              <div className="mainframe-hud-progress-bar-bg">
                <div
                  className="mainframe-hud-progress-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mainframe-hud-meta-row">
                <span>SECURITY LEVEL: FATUI MAINFRAME // LEVEL 5</span>
                <span className="mainframe-hud-hex-stream">{hexToken} : {pct}%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(hudContent, document.body) : null;
}
