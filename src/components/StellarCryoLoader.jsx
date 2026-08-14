import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Circle, Shape, Line, Group } from 'react-konva';
import './StellarCryoLoader.css';

// ─── Color Palettes ─────────────────────────────────────────────────────────────
const PALETTES = {
  dark: [
    { fill: '#E8F4FD', glow: 'rgba(232, 244, 253, 0.35)' }, // Pale glacier
    { fill: '#B8DFF0', glow: 'rgba(184, 223, 240, 0.30)' }, // Soft frost
    { fill: '#D6EEF8', glow: 'rgba(214, 238, 248, 0.28)' }, // Light ice
    { fill: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.40)' },  // Luminous white
    { fill: '#A8D8EA', glow: 'rgba(168, 216, 234, 0.25)' }, // Deep glacier
    { fill: '#C5E8F7', glow: 'rgba(197, 232, 247, 0.30)' }, // Mid ice
  ],
  light: [
    { fill: '#5BA4CF', glow: 'rgba(91, 164, 207, 0.30)' },  // Steel glacier
    { fill: '#3B82A0', glow: 'rgba(59, 130, 160, 0.25)' },  // Deep teal frost
    { fill: '#7BC4E8', glow: 'rgba(123, 196, 232, 0.28)' }, // Bright ice
    { fill: '#4A90B8', glow: 'rgba(74, 144, 184, 0.30)' },  // Ocean frost
    { fill: '#6DB3D6', glow: 'rgba(109, 179, 214, 0.22)' }, // Muted glacier
    { fill: '#89CFF0', glow: 'rgba(137, 207, 240, 0.25)' }, // Baby blue frost
  ],
};

// ─── Shape types ─────────────────────────────────────────────────────────────────
const SHAPE_DUST    = 0; // Tiny glowing circle (diamond dust)
const SHAPE_STAR    = 1; // Four-pointed starburst
const SHAPE_CRYSTAL = 2; // Six-armed frost crystal

// ─── Utility: Random in range ────────────────────────────────────────────────────
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[randInt(0, arr.length - 1)];

// ─── Particle Factory ────────────────────────────────────────────────────────────
function createParticle(canvasW, canvasH, palette, spawnAtBottom = false) {
  // Weighted distribution: 60% dust, 35% star, 5% crystal (stellar, not snowy)
  const roll = Math.random();
  const shape = roll < 0.60 ? SHAPE_DUST : roll < 0.95 ? SHAPE_STAR : SHAPE_CRYSTAL;

  const color = pick(palette);
  const size = shape === SHAPE_DUST
    ? rand(1.5, 4.5)
    : shape === SHAPE_STAR
      ? rand(5, 14)
      : rand(7, 16);

  return {
    // Position
    x: rand(0, canvasW),
    y: spawnAtBottom ? canvasH + rand(10, 60) : rand(-20, canvasH + 40),
    baseX: 0, // set after x

    // Motion
    vy: -(rand(0.15, 0.8)),          // Upward velocity (negative Y)
    oscAmp: rand(8, 25),             // Sine oscillation amplitude (px)
    oscFreq: rand(0.005, 0.02),      // Sine oscillation frequency
    oscPhase: rand(0, Math.PI * 2),  // Random phase offset

    // Visual
    shape,
    size,
    baseOpacity: rand(0.25, 0.85),
    opacityPhase: rand(0, Math.PI * 2),
    rotation: rand(0, 360),
    rotationSpeed: shape === SHAPE_DUST ? 0 : rand(0.1, 0.5) * (Math.random() > 0.5 ? 1 : -1),
    fill: color.fill,
    glow: color.glow,
  };
}

// ─── Drawing helpers (for Konva Shape sceneFunc) ─────────────────────────────────

/** Four-pointed star: two overlapping diamonds */
function drawFourPointedStar(ctx, size) {
  const outer = size;
  const inner = size * 0.28;

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
}

/** Six-armed snowflake / frost crystal */
function drawFrostCrystal(ctx, size) {
  const arms = 6;
  const armLen = size;
  const branchLen = size * 0.35;
  const branchAngle = Math.PI / 6; // 30°

  for (let i = 0; i < arms; i++) {
    const angle = (Math.PI * 2 / arms) * i - Math.PI / 2;
    const ex = Math.cos(angle) * armLen;
    const ey = Math.sin(angle) * armLen;

    // Main arm
    ctx.moveTo(0, 0);
    ctx.lineTo(ex, ey);

    // Two branches at 60% along the arm
    const bx = Math.cos(angle) * armLen * 0.6;
    const by = Math.sin(angle) * armLen * 0.6;

    const b1x = bx + Math.cos(angle + branchAngle) * branchLen;
    const b1y = by + Math.sin(angle + branchAngle) * branchLen;
    const b2x = bx + Math.cos(angle - branchAngle) * branchLen;
    const b2y = by + Math.sin(angle - branchAngle) * branchLen;

    ctx.moveTo(bx, by);
    ctx.lineTo(b1x, b1y);
    ctx.moveTo(bx, by);
    ctx.lineTo(b2x, b2y);
  }
}

// ─── Single High-Performance Particle Renderer ─────────────────────────────────
// React-Konva batchDraw() won't automatically sync prop mutations if we use individual 
// React components without refs. Drawing them natively inside a single Shape's sceneFunc 
// is the standard way to achieve 60fps with pure object mutation in React-Konva.
const ParticlesSystem = ({ particles }) => {
  return (
    <Shape
      sceneFunc={(ctx, shape) => {
        const ps = particles.current;
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          
          ctx.save();
          // Apply particle position and global opacity
          ctx.translate(p.x, p.y);
          ctx.globalAlpha = p.opacity;

          if (p.shape === SHAPE_DUST) {
            // Glow halo
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = p.glow;
            ctx.fill();
            // Core
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.fill;
            ctx.fill();
          } 
          else if (p.shape === SHAPE_STAR) {
            ctx.rotate((p.rotation * Math.PI) / 180);
            // Glow halo
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = p.glow;
            ctx.fill();
            // Star
            ctx.beginPath();
            drawFourPointedStar(ctx, p.size);
            ctx.fillStyle = p.fill;
            ctx.fill();
          } 
          else if (p.shape === SHAPE_CRYSTAL) {
            ctx.rotate((p.rotation * Math.PI) / 180);
            // Center glow
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = p.glow;
            ctx.fill();
            // Crystal arms
            ctx.beginPath();
            drawFrostCrystal(ctx, p.size);
            ctx.strokeStyle = p.fill;
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.stroke();
            // Arm tips
            for (let j = 0; j < 6; j++) {
              const angle = (Math.PI * 2 / 6) * j - Math.PI / 2;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * p.size, Math.sin(angle) * p.size, 1.2, 0, Math.PI * 2);
              ctx.fillStyle = p.fill;
              ctx.fill();
            }
          }
          ctx.restore();
        }
      }}
      listening={false}
    />
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────────

/**
 * StellarCryoLoader
 *
 * Props:
 *   isLoading  (boolean)  — When true, shows the overlay. When false, triggers fade-out then unmounts.
 *   onExited   (function) — Called after the fade-out animation completes. Use this to fully remove the loader from the DOM.
 *   particleCount (number) — Total particle count. Default: 70.
 */
export default function StellarCryoLoader({
  isLoading = true,
  onExited,
  particleCount = 70,
}) {
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [fadingOut, setFadingOut] = useState(false);
  const [exited, setExited] = useState(false);
  const layerRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(0);
  const rafRef = useRef(null);

  // ── Detect theme ───────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() =>
    document.documentElement.getAttribute('data-theme') || 'dark'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(t);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const palette = useMemo(() => PALETTES[theme] || PALETTES.dark, [theme]);

  // ── Handle resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Initialize particles ───────────────────────────────────────────────────
  useEffect(() => {
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(dimensions.w, dimensions.h, palette)
    );
    // Store baseX for sine oscillation reference
    particlesRef.current.forEach(p => { p.baseX = p.x; });
  }, [particleCount, dimensions.w, dimensions.h, palette]);

  // ── Animation loop ─────────────────────────────────────────────────────────
  const animate = useCallback(() => {
    frameRef.current++;
    const t = frameRef.current;
    const { w, h } = dimensions;
    const ps = particlesRef.current;
    const currentPalette = PALETTES[document.documentElement.getAttribute('data-theme') || 'dark'] || PALETTES.dark;

    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];

      // Update Y (float upward)
      p.y += p.vy;

      // Update X (sine oscillation)
      p.x = p.baseX + p.oscAmp * Math.sin(p.oscFreq * t + p.oscPhase);

      // Update rotation
      p.rotation += p.rotationSpeed;

      // Breathing opacity
      p.opacity = Math.max(0.05, Math.min(1,
        p.baseOpacity + 0.12 * Math.sin(0.03 * t + p.opacityPhase)
      ));

      // Respawn when above viewport
      if (p.y < -(p.size * 3)) {
        const newP = createParticle(w, h, currentPalette, true);
        newP.baseX = newP.x;
        // Preserve array slot
        Object.assign(p, newP);
      }
    }

    // Force re-render via batchDraw (no React state updates)
    if (layerRef.current) {
      layerRef.current.batchDraw();
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [dimensions]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  // ── Fade-out when loading is done ──────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !fadingOut && !exited) {
      setFadingOut(true);
      const timer = setTimeout(() => {
        setExited(true);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onExited?.();
      }, 850); // Match CSS transition duration + small buffer
      return () => clearTimeout(timer);
    }
  }, [isLoading, fadingOut, exited, onExited]);

  // Don't render anything after exit
  if (exited) return null;

  const overlayClass = `stellar-cryo-overlay${fadingOut ? ' fade-out' : ''}`;

  return (
    <div className={overlayClass} id="stellar-cryo-loader">
      <div className="stellar-cryo-canvas">
        <Stage width={dimensions.w} height={dimensions.h}>
          <Layer ref={layerRef}>
            <ParticlesSystem particles={particlesRef} />
          </Layer>
        </Stage>
      </div>
      <div className="loading-ui-container">
        <div className="element-row">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="element-diamond" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
        <span className="stellar-cryo-text">Loading...</span>
      </div>
    </div>
  );
}
