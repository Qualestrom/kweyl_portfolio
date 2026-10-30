import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Compass, User, FolderGit2, Award, Send, Moon, Sparkles } from 'lucide-react';
import { useDataLoaderState } from '../context/DataLoaderContext';
import './StellarCryoLoader.css';

/**
 * StellarCryoLoader — Full-screen loading overlay inspired by Genshin Impact
 * 
 * Features:
 * - Centered bottom-anchored HUD (pure Genshin Impact spatial hierarchy)
 * - Ultra-dynamic Canvas Starfield & 3D Relativistic Hyperspace Tunnel on enter
 * - 5 Sleek Elemental Section Glyphs (Icon-only with elemental aura pulses & progressive ignition)
 * - True Simultaneous Data Loading:
 *   - Runs actively from t=0 without freezing
 *   - Advances dynamically as real database milestones (fonts, config, projects, certs) arrive
 *   - Progressively awakens background celestial details (Frostmoon glow, star tiers, meteors)
 *   - 60 FPS GPU-accelerated CSS custom property updates via direct node refs (Zero React 19 churn)
 * - Genshin-style "CLICK ANYWHERE TO ENTER" prompt strictly presented once all data is loaded
 * - Seamless hyper-space warp flight forward into the pre-hydrated Hero page
 */

// ─── Section Glyphs Config (Genshin Elemental Style) ─────────────────────────
const SECTION_GLYPHS = [
  {
    id: 'home',
    label: 'Home',
    elementName: 'ORIGIN',
    icon: Compass,
    threshold: 12,
  },
  {
    id: 'about',
    label: 'About',
    elementName: 'PERSONA',
    icon: User,
    threshold: 32,
  },
  {
    id: 'projects',
    label: 'Projects',
    elementName: 'CREATIONS',
    icon: FolderGit2,
    threshold: 52,
  },
  {
    id: 'certs',
    label: 'Credentials',
    elementName: 'MASTERY',
    icon: Award,
    threshold: 72,
  },
  {
    id: 'contact',
    label: 'Contact',
    elementName: 'SIGNAL',
    icon: Send,
    threshold: 92,
  },
];

// ─── Rotating Tips & Lore ───────────────────────────────────────────────────
const LORE_TIPS = [
  { tag: "SYSTEM TIP", text: "Precision front-ends engineered with React & Framer Motion for 60 FPS fluidity." },
  { tag: "NAVIGATION", text: "Use arrow keys, scroll wheel, or left labels to glide across sections." },
  { tag: "ARCHITECTURE", text: "Full-stack cloud synchronization powered by Supabase & PostgreSQL." },
  { tag: "CROSS-PLATFORM", text: "Delivering rapid, pixel-perfect experiences across Web and Mobile." },
  { tag: "PORTFOLIO TIP", text: "Adapts automatically to your device theme, or toggle anytime in the top-right corner." },
];

// ─── Canvas Color Palettes ──────────────────────────────────────────────────
const PALETTES = {
  dark: {
    bg: '#050811',
    nebulaColors: [
      'rgba(14, 116, 144, 0.12)',
      'rgba(88, 28, 135, 0.08)',
      'rgba(30, 58, 138, 0.10)',
    ],
    dust: ['rgba(232,244,253,0.18)', 'rgba(184,223,240,0.14)', 'rgba(255,255,255,0.22)'],
    star: ['rgba(232,244,253,0.65)', 'rgba(255,255,255,0.85)', 'rgba(197,232,247,0.70)'],
    starGlow: 'rgba(34, 211, 238, ',
    constellationLine: 'rgba(56, 189, 248, ',
    constellationPulse: '#ffffff',
    meteorHead: '#ffffff',
    meteorTail: 'rgba(34, 211, 238, ',
    warpFlash: '#ffffff',
    coreColor: '#ffffff',
  },
  light: {
    bg: '#F4F7FB',
    nebulaColors: [
      'rgba(186, 230, 253, 0.35)',
      'rgba(233, 213, 255, 0.25)',
      'rgba(191, 219, 254, 0.30)',
    ],
    dust: ['rgba(91,164,207,0.20)', 'rgba(59,130,160,0.18)', 'rgba(74,144,184,0.22)'],
    star: ['rgba(14, 116, 144, 0.70)', 'rgba(2, 132, 199, 0.85)', 'rgba(79, 70, 229, 0.65)'],
    starGlow: 'rgba(8, 145, 178, ',
    constellationLine: 'rgba(8, 145, 178, ',
    constellationPulse: '#0891B2',
    meteorHead: '#0891B2',
    meteorTail: 'rgba(8, 145, 178, ',
    warpFlash: '#E0F2FE',
    coreColor: '#0891B2',
  },
};

const rand = (min, max) => Math.random() * (max - min) + min;

export default function StellarCryoLoader({
  onExited,
  onWarpStart,
}) {
  const { milestones, allLoaded } = useDataLoaderState();
  const canvasRef = useRef(null);
  const iconsRowRef = useRef(null);
  const glowRef = useRef(null);

  const [tipIndex, setTipIndex] = useState(0);
  const [isReadyToEnter, setIsReadyToEnter] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const isWarpingRef = useRef(false);
  const warpProgressRef = useRef(0);
  const percentRef = useRef(0);
  const targetPercentRef = useRef(18);
  const milestonesRef = useRef(milestones);
  const allLoadedRef = useRef(allLoaded);

  useEffect(() => {
    milestonesRef.current = milestones;
    allLoadedRef.current = allLoaded;
  }, [milestones, allLoaded]);

  // Compute maximum target percent based on real data milestone arrival
  useEffect(() => {
    let target = 18; // Smooth baseline progression from frame 0
    if (milestones.fonts) target = Math.max(target, 25);
    if (milestones.config) target = Math.max(target, 45);
    if (milestones.projects) target = Math.max(target, 65);
    if (milestones.certificates) target = Math.max(target, 85);
    if (allLoaded) target = 100;

    targetPercentRef.current = target;
  }, [milestones, allLoaded]);

  // Direct GPU DOM update helper (Zero React 19 churn, 60 FPS buttery smooth)
  const applyVisualProgress = useCallback((val) => {
    if (typeof window !== 'undefined') {
      window.__stellarLoadProgress = Math.min(1.0, val / 100);
    }

    if (glowRef.current) {
      const prog = val / 100;
      glowRef.current.style.opacity = (0.35 + 0.65 * prog).toFixed(3);
      glowRef.current.style.transform = `translate(-50%, -50%) scale(${(0.75 + 0.45 * prog).toFixed(3)})`;
    }

    if (iconsRowRef.current) {
      const nodes = iconsRowRef.current.children;
      for (let index = 0; index < SECTION_GLYPHS.length; index++) {
        const node = nodes[index];
        if (!node) continue;
        const startP = index * 20;
        const ratio = Math.min(1, Math.max(0, (val - startP) / 20));
        node.style.setProperty('--node-ratio', ratio.toFixed(3));
        if (ratio >= 0.999) {
          if (!node.classList.contains('lit')) node.classList.add('lit');
        } else {
          if (node.classList.contains('lit')) node.classList.remove('lit');
        }
      }
    }
  }, []);

  // ─── 60 FPS Local Simultaneous Progress Engine ─────────────────────────────
  useEffect(() => {
    let raf;

    const tick = () => {
      const cur = percentRef.current;
      const target = targetPercentRef.current;

      if (cur < target) {
        // Dynamic easing: brisk on long distances, silky smooth into milestone stops
        const diff = target - cur;
        const step = Math.max(0.35, Math.min(1.6, diff * 0.085));
        const next = Math.min(target, cur + step);
        percentRef.current = next;
        applyVisualProgress(next);
      }

      // Check for full 100% data completion
      if (allLoadedRef.current && percentRef.current >= 99.0) {
        percentRef.current = 100;
        applyVisualProgress(100);
        setIsReadyToEnter(true);
        return; // Completed
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [applyVisualProgress]);

  // Cycling Tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LORE_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ─── True 3D Forward Hyperspace Flight Handler ─────────────────────────────
  const handleEnter = useCallback(() => {
    if (!isReadyToEnter || isWarpingRef.current) return;
    isWarpingRef.current = true;
    setIsWarping(true);
    onWarpStart?.();

    // True 3D Forward Hyperspace Flight Sequence:
    // 0ms–400ms: Camera plunges forward; HUD scales UP past the viewer.
    // 400ms–1150ms: Relativistic 3D star tunnel roars past; Hero Section hurtles forward from Z: -2500px to Z: 0px.
    // 1150ms–1650ms: Camera drops out of warp, inertial braking locks Hero at Z: 0px, crystalline frost wave disperses.
    // 1650ms: Unmount loader canvas once full 3D arrival is 100% complete.
    setTimeout(() => {
      setFadingOut(true);
    }, 1150);

    setTimeout(() => {
      onExited?.();
    }, 1650);
  }, [isReadyToEnter, onExited, onWarpStart]);

  // Global keydown listener for "Press any key to enter"
  useEffect(() => {
    if (!isReadyToEnter || isWarping) return;
    const handleKeyDown = (e) => {
      if (['Space', 'Enter', 'Escape', 'ArrowRight', 'ArrowDown'].includes(e.code) || !e.ctrlKey) {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadyToEnter, isWarping, handleEnter]);

  // ─── 3D Relativistic Hyperspace Tunnel Engine ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth;
    let h = window.innerHeight;
    let warpTunnelStars = [];
    let frame = 0;
    let raf;

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

    const createWarpTunnelStar = (initial = false) => {
      const angle = rand(0, Math.PI * 2);
      const radius = rand(55, Math.max(w || 1440, h || 900) * 0.95);
      return {
        x3d: Math.cos(angle) * radius,
        y3d: Math.sin(angle) * radius,
        z3d: initial ? rand(40, 1600) : rand(1050, 1600),
        size: rand(1.4, 3.4),
        isBrightCyan: Math.random() > 0.35,
      };
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // True 3D (x, y, z) Hyperspace Tunnel Star Pool
      warpTunnelStars = Array.from({ length: 240 }, () => createWarpTunnelStar(true));
    };

    const animate = () => {
      frame++;
      const theme = getTheme();

      // ── Render Hyperspace Warp Tunnel (ONLY when Warping) ──
      ctx.clearRect(0, 0, w, h);

      if (isWarpingRef.current) {
        warpProgressRef.current = Math.min(1, warpProgressRef.current + 0.0115);
        const p = warpProgressRef.current;

        let warpSpeed3D = 0;
        let streakFactor = 0;

        if (p < 0.20) {
          // Accelerate into warp
          const accel = p / 0.20;
          streakFactor = Math.sin(accel * (Math.PI / 2));
          warpSpeed3D = 8 + streakFactor * 52;
        } else if (p < 0.72) {
          // Cruise through 3D warp tunnel
          streakFactor = 1.0;
          warpSpeed3D = 60;
        } else {
          // Inertial braking upon arrival
          const decel = (p - 0.72) / 0.28;
          streakFactor = Math.pow(1 - decel, 1.8);
          warpSpeed3D = streakFactor * 55 + 1.5;
        }

        const cx = w * 0.5;
        const cy = h * 0.48;
        const fov = 460;

        ctx.save();
        for (let i = 0; i < warpTunnelStars.length; i++) {
          const ws = warpTunnelStars[i];
          ws.z3d -= warpSpeed3D;

          // Continuously respawn stars deep in tunnel
          if (ws.z3d <= 22) {
            const next = createWarpTunnelStar(false);
            ws.x3d = next.x3d;
            ws.y3d = next.y3d;
            ws.z3d = next.z3d;
            ws.size = next.size;
            ws.isBrightCyan = next.isBrightCyan;
          }

          const sx = cx + (ws.x3d / ws.z3d) * fov;
          const sy = cy + (ws.y3d / ws.z3d) * fov;

          if (sx < -150 || sx > w + 150 || sy < -150 || sy > h + 150) {
            continue;
          }

          const zTail = ws.z3d + warpSpeed3D * (2.6 + streakFactor * 4.2);
          const tx = cx + (ws.x3d / zTail) * fov;
          const ty = cy + (ws.y3d / zTail) * fov;

          const depthAlpha = Math.min(1, Math.max(0.08, (1 - ws.z3d / 1650) * (0.35 + streakFactor * 0.65)));
          const streakGrad = ctx.createLinearGradient(tx, ty, sx, sy);

          if (theme === 'light') {
            streakGrad.addColorStop(0, 'rgba(2, 132, 199, 0)');
            streakGrad.addColorStop(0.55, `rgba(14, 165, 233, ${(depthAlpha * 0.65).toFixed(3)})`);
            streakGrad.addColorStop(1, `rgba(2, 132, 199, ${depthAlpha.toFixed(3)})`);
          } else {
            streakGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            streakGrad.addColorStop(
              0.55,
              ws.isBrightCyan
                ? `rgba(56, 189, 248, ${(depthAlpha * 0.80).toFixed(3)})`
                : `rgba(186, 230, 253, ${(depthAlpha * 0.75).toFixed(3)})`
            );
            streakGrad.addColorStop(1, `rgba(255, 255, 255, ${depthAlpha.toFixed(3)})`);
          }

          const projScale = Math.min(2.8, Math.max(0.5, fov / ws.z3d));
          ctx.strokeStyle = streakGrad;
          ctx.lineWidth = Math.max(1.0, ws.size * projScale * (0.55 + streakFactor * 0.45));
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
        ctx.restore();

        // ── 3. Crystalline Frost Shockwave upon Arrival ──
        if (p > 0.52) {
          const shockProgress = (p - 0.52) / 0.48;
          const maxR = Math.hypot(w, h) * 0.95;
          const shockRadius = maxR * Math.pow(shockProgress, 0.78);
          const shockAlpha = Math.sin(shockProgress * Math.PI) * 0.55;

          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2);
          ctx.strokeStyle = theme === 'light'
            ? `rgba(2, 132, 199, ${shockAlpha.toFixed(3)})`
            : `rgba(125, 211, 252, ${shockAlpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(1.5, 5.0 * (1 - shockProgress));
          ctx.stroke();
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className={`genshin-loader-overlay ${isWarping ? 'is-warping' : ''} ${fadingOut ? 'fade-out' : ''} ${isReadyToEnter ? 'is-ready' : ''}`}
      id="stellar-cryo-loader"
      onClick={isReadyToEnter ? handleEnter : undefined}
      onTouchStart={isReadyToEnter ? handleEnter : undefined}
      role={isReadyToEnter ? 'button' : undefined}
      tabIndex={isReadyToEnter ? 0 : undefined}
      aria-label={isReadyToEnter ? 'Click to enter portfolio' : 'Loading portfolio'}
    >
      {/* ─── Immersive Living Celestial Canvas ─── */}
      <canvas ref={canvasRef} className="genshin-loader-canvas" />

      {/* Ambient background glow orb — breathes and expands with data load progress */}
      <div
        ref={glowRef}
        className="genshin-loader-ambient-glow"
      />

      {/* ─── Bottom-Centered HUD (Strict 3-Row Spatial Hierarchy) ─── */}
      <div className={`genshin-bottom-hud ${isWarping ? 'hud-warp-exit' : ''}`}>
        
        {/* Row 1: The Icons (Progressive Loading Indicator) */}
        <div ref={iconsRowRef} className="genshin-elemental-row" id="hud-icons">
          {SECTION_GLYPHS.map((glyph) => {
            const Icon = glyph.icon;

            return (
              <div
                key={glyph.id}
                className="genshin-element-node"
                title={glyph.label}
              >
                <Icon size={24} className="genshin-element-svg" />
              </div>
            );
          })}
        </div>

        {/* Row 2: Tip Title (loading) OR Click Anywhere Prompt (ready) */}
        <div className="genshin-hud-row-mid" id="hud-mid-row">
          {!isReadyToEnter ? (
            <div className="genshin-tip-title" id="hud-tip-title">
              <span className="genshin-tip-tag">[{LORE_TIPS[tipIndex].tag}]</span>
            </div>
          ) : (
            <div className="genshin-enter-prompt" onClick={handleEnter} id="hud-click-prompt">
              <div className="genshin-enter-banner">
                <Moon size={14} className="genshin-enter-star left" />
                <span className="genshin-enter-text">CLICK ANYWHERE TO ENTER</span>
                <Sparkles size={14} className="genshin-enter-star right" />
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Tip Text (loading) OR Tap Screen Subtext (ready) */}
        <div className="genshin-hud-row-bottom" id="hud-bottom-row">
          {!isReadyToEnter ? (
            <div className="genshin-tip-text-wrap" id="hud-tip-text">
              <p className="genshin-tip-text" key={tipIndex}>
                {LORE_TIPS[tipIndex].text}
              </p>
            </div>
          ) : (
            <div className="genshin-enter-subtext-wrap" id="hud-tap-screen">
              <span className="genshin-enter-subtext">Tap screen or press any key to enter</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
