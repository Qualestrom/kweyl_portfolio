import React, { useEffect, useRef, useState, useCallback } from 'react';
import './StellarCryoLoader.css';

/**
 * StellarCryoLoader — Full-screen loading overlay
 *
 * Features:
 * - Static glimmering stars with random glow pulses (matching main StellarBackground)
 * - Constellations that randomly form and fade between nearby stars
 * - A percentage counter (0 → 100) that fills as loading progresses
 *
 * Props:
 *   isLoading  (boolean)  — When true, shows the overlay.
 *   onExited   (function) — Called after fade-out completes.
 */

// ─── Palettes ────────────────────────────────────────────────────────────────
const PALETTES = {
  dark: {
    dust: ['rgba(232,244,253,0.10)', 'rgba(184,223,240,0.08)', 'rgba(255,255,255,0.12)'],
    star: ['rgba(232,244,253,0.22)', 'rgba(255,255,255,0.28)', 'rgba(197,232,247,0.20)'],
    glowColor: 'rgba(103, 232, 249, ',  // partial — alpha appended
    lineColor: 'rgba(103, 232, 249, ',
    coreColor: '#ffffff',
  },
  light: {
    dust: ['rgba(91,164,207,0.08)', 'rgba(59,130,160,0.06)', 'rgba(74,144,184,0.08)'],
    star: ['rgba(91,164,207,0.16)', 'rgba(74,144,184,0.18)', 'rgba(109,179,214,0.14)'],
    glowColor: 'rgba(8, 145, 178, ',
    lineColor: 'rgba(8, 145, 178, ',
    coreColor: '#0891B2',
  },
};

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ─── Star Factory ────────────────────────────────────────────────────────────
function createStar(w, h, palette) {
  const isStar = Math.random() > 0.65;
  return {
    x: rand(0, w),
    y: rand(0, h),
    size: isStar ? rand(2, 6.5) : rand(0.6, 2),
    isStar,
    color: isStar ? pick(palette.star) : pick(palette.dust),
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: isStar ? rand(0.001, 0.005) : 0,
    breathPhase: rand(0, Math.PI * 2),
    breathSpeed: rand(0.01, 0.025),
    breathDepth: rand(0.1, 0.25),
    baseOpacity: isStar ? rand(0.15, 0.35) : rand(0.05, 0.15),
    // Glow
    glowProgress: 0,
    glowPhase: 'idle',
  };
}

// ─── Constellation Factory ───────────────────────────────────────────────────
// A constellation is a set of star indices connected by lines.
// It fades in, holds, then fades out.
function createConstellation(starIndices, stars, maxDist) {
  // Pick 3-6 nearby stars to form a constellation
  const seedIdx = starIndices[Math.floor(Math.random() * starIndices.length)];
  const seed = stars[seedIdx];

  // Find nearby stars sorted by distance
  const nearby = starIndices
    .filter(i => i !== seedIdx)
    .map(i => ({ idx: i, dist: Math.hypot(stars[i].x - seed.x, stars[i].y - seed.y) }))
    .filter(n => n.dist < maxDist)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, Math.floor(rand(2, 5)));

  if (nearby.length < 2) return null;

  const nodes = [seedIdx, ...nearby.map(n => n.idx)];

  // Build edges: connect each node to the next (chain), plus 1-2 extra for variety
  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push([nodes[i], nodes[i + 1]]);
  }
  // Optional cross-link
  if (nodes.length >= 4 && Math.random() > 0.4) {
    edges.push([nodes[0], nodes[Math.floor(nodes.length / 2)]]);
  }

  return {
    nodes,
    edges,
    progress: 0,      // 0 → 1 → hold → 1 → 0
    phase: 'rising',   // 'rising' | 'holding' | 'falling'
    holdTimer: 0,
    holdDuration: rand(80, 200),  // frames to hold
    riseSpeed: rand(0.012, 0.025),
    fallSpeed: rand(0.006, 0.015),
  };
}

// ─── Draw four-pointed star shape ────────────────────────────────────────────
function drawFourPointStar(ctx, x, y, size, rotation) {
  const outer = size;
  const inner = size * 0.25;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 2) * i - Math.PI / 2;
    const nextAngle = angle + Math.PI / 4;
    const ox = Math.cos(angle) * outer;
    const oy = Math.sin(angle) * outer;
    const ix = Math.cos(nextAngle) * inner;
    const iy = Math.sin(nextAngle) * inner;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function StellarCryoLoader({
  isLoading = true,
  onExited,
}) {
  const canvasRef = useRef(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [exited, setExited] = useState(false);
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const loadingDoneRef = useRef(false);

  // Track when isLoading becomes false
  useEffect(() => {
    if (!isLoading) {
      loadingDoneRef.current = true;
    }
  }, [isLoading]);

  // ── Canvas animation ───────────────────────────────────────────────────────
  useEffect(() => {
    if (exited) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let stars = [];
    let starIndices = []; // indices of star-type particles (not dust)
    let constellations = [];
    let frame = 0;
    let raf;
    let nextGlowFrame = 20;
    let nextConstellationFrame = 60;

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const palette = PALETTES[getTheme()] || PALETTES.dark;
      const count = Math.max(100, Math.floor((w * h) / 10000));
      stars = Array.from({ length: count }, () => createStar(w, h, palette));
      starIndices = stars.map((s, i) => s.isStar ? i : -1).filter(i => i >= 0);
      constellations = [];
    };

    const triggerGlow = () => {
      const eligible = stars.filter(s => s.isStar && s.glowPhase === 'idle');
      if (eligible.length === 0) return;
      const glowing = stars.filter(s => s.glowPhase !== 'idle').length;
      if (glowing >= 8) return;
      const target = eligible[Math.floor(Math.random() * eligible.length)];
      target.glowPhase = 'rising';
      target.glowProgress = 0;
    };

    const spawnConstellation = () => {
      if (constellations.length >= 4) return;
      const maxDist = Math.min(w, h) * 0.2;
      const c = createConstellation(starIndices, stars, maxDist);
      if (c) constellations.push(c);
    };

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const theme = getTheme();
      const palette = PALETTES[theme] || PALETTES.dark;

      // ── Update percentage ──
      const elapsed = Date.now() - startTimeRef.current;
      let targetPercent;
      if (loadingDoneRef.current) {
        // Rush to 100
        targetPercent = 100;
      } else {
        // Slow asymptotic climb to ~85% over the loading period
        // Uses 1 - e^(-t/tau) curve to approach 85 but never reach it
        const tau = 2500; // ms
        targetPercent = Math.min(85, 85 * (1 - Math.exp(-elapsed / tau)));
      }
      // Smooth interpolation
      percentRef.current += (targetPercent - percentRef.current) * 0.04;
      const displayPercent = Math.min(100, Math.round(percentRef.current));
      // Only update React state when the displayed number changes
      if (displayPercent !== Math.round(percentRef.current - (targetPercent - percentRef.current) * 0.04)) {
        setPercent(displayPercent);
      }
      // Update state every few frames to avoid excessive re-renders
      if (frame % 3 === 0) {
        setPercent(displayPercent);
      }

      // ── Trigger glows ──
      if (frame >= nextGlowFrame) {
        triggerGlow();
        nextGlowFrame = frame + rand(25, 80);
      }

      // ── Spawn constellations ──
      if (frame >= nextConstellationFrame) {
        spawnConstellation();
        nextConstellationFrame = frame + rand(100, 250);
      }

      // ── Update & draw constellation lines ──
      for (let ci = constellations.length - 1; ci >= 0; ci--) {
        const c = constellations[ci];

        // Advance state machine
        if (c.phase === 'rising') {
          c.progress += c.riseSpeed;
          if (c.progress >= 1) {
            c.progress = 1;
            c.phase = 'holding';
            c.holdTimer = 0;
          }
        } else if (c.phase === 'holding') {
          c.holdTimer++;
          if (c.holdTimer >= c.holdDuration) {
            c.phase = 'falling';
          }
        } else if (c.phase === 'falling') {
          c.progress -= c.fallSpeed;
          if (c.progress <= 0) {
            constellations.splice(ci, 1);
            continue;
          }
        }

        const alpha = easeInOutQuad(c.progress);

        // Draw edges
        ctx.strokeStyle = palette.lineColor + (alpha * 0.25).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const [a, b] of c.edges) {
          const sa = stars[a];
          const sb = stars[b];
          if (sa && sb) {
            ctx.moveTo(sa.x, sa.y);
            ctx.lineTo(sb.x, sb.y);
          }
        }
        ctx.stroke();

        // Draw node highlights
        for (const ni of c.nodes) {
          const s = stars[ni];
          if (!s) continue;
          const nodeGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 5);
          nodeGlow.addColorStop(0, palette.glowColor + (alpha * 0.4).toFixed(3) + ')');
          nodeGlow.addColorStop(1, palette.glowColor + '0)');
          ctx.fillStyle = nodeGlow;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Draw stars ──
      for (let i = 0; i < stars.length; i++) {
        const p = stars[i];

        p.rotation += p.rotationSpeed;

        const breath = p.breathDepth * Math.sin(p.breathSpeed * frame + p.breathPhase);
        let opacity = p.baseOpacity + breath;

        // Glow state machine
        if (p.glowPhase === 'rising') {
          p.glowProgress += 0.03;
          if (p.glowProgress >= 1) { p.glowProgress = 1; p.glowPhase = 'falling'; }
        } else if (p.glowPhase === 'falling') {
          p.glowProgress -= 0.01;
          if (p.glowProgress <= 0) { p.glowProgress = 0; p.glowPhase = 'idle'; }
        }

        const glowEased = easeInOutQuad(p.glowProgress);
        const isGlowing = p.glowPhase !== 'idle' && p.glowProgress > 0.01;

        // Draw glow bloom
        if (isGlowing) {
          const bloomSize = p.size * (4 + glowEased * 14);
          const outerGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloomSize);
          outerGrad.addColorStop(0, palette.glowColor + (glowEased * 0.5).toFixed(3) + ')');
          outerGrad.addColorStop(0.3, palette.glowColor + (glowEased * 0.2).toFixed(3) + ')');
          outerGrad.addColorStop(1, palette.glowColor + '0)');
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, bloomSize, 0, Math.PI * 2);
          ctx.fill();

          // Bright core
          const coreGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          coreGrad.addColorStop(0, `rgba(255,255,255,${(glowEased * 0.8).toFixed(3)})`);
          coreGrad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();

          opacity = Math.min(1, opacity + glowEased * 0.85);
        }

        ctx.globalAlpha = Math.max(0.02, Math.min(1, opacity));

        if (p.isStar) {
          ctx.fillStyle = isGlowing ? palette.coreColor : p.color;
          drawFourPointStar(ctx, p.x, p.y, p.size * (isGlowing ? 1 + glowEased * 0.6 : 1), p.rotation);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [exited]);

  // ── Fade-out when loading is done AND counter reaches 100 ──────────────────
  useEffect(() => {
    if (!isLoading && percent >= 100 && !fadingOut && !exited) {
      setFadingOut(true);
      const timer = setTimeout(() => {
        setExited(true);
        onExited?.();
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [isLoading, percent, fadingOut, exited, onExited]);

  if (exited) return null;

  const overlayClass = `stellar-cryo-overlay${fadingOut ? ' fade-out' : ''}`;

  return (
    <div className={overlayClass} id="stellar-cryo-loader">
      <canvas
        ref={canvasRef}
        className="stellar-cryo-canvas"
      />
      <div className="loading-ui-container">
        <div className="loading-percent-display">
          <span className="loading-percent-number">{percent}</span>
          <span className="loading-percent-symbol">%</span>
        </div>
        <div className="loading-bar-track">
          <div
            className="loading-bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="stellar-cryo-text">INITIALIZING</span>
      </div>
    </div>
  );
}
