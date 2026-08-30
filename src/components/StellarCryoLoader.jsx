import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Compass, User, FolderGit2, Award, Send, Sparkles } from 'lucide-react';
import './StellarCryoLoader.css';

/**
 * StellarCryoLoader — Full-screen loading overlay inspired by Genshin Impact
 * 
 * Features:
 * - 5 Celestial Section Glyphs (Home, About, Projects, Certs, Contact) in a Genshin-style elemental array
 * - Sequential ignition & elemental pulse as progress advances (0% → 100%)
 * - Sleek glowing progress bar with a guiding stellar spark head
 * - Genshin-style rotating portfolio tips & system lore
 * - Twinkling four-pointed stars (Primogem style) and ambient constellation canvas
 * - Responsive, theme-aware (dark & light), and 100% gapless exit transition
 */

// ─── Section Glyphs Config (Genshin Elemental Style) ─────────────────────────
const SECTION_GLYPHS = [
  {
    id: 'home',
    label: 'Home',
    elementName: 'Origin',
    icon: Compass,
    threshold: 15,
    color: '#22D3EE', // Cryo / Cyan
    glow: 'rgba(34, 211, 238, 0.6)',
    bgGlow: 'rgba(34, 211, 238, 0.12)',
  },
  {
    id: 'about',
    label: 'About',
    elementName: 'Persona',
    icon: User,
    threshold: 35,
    color: '#FBBF24', // Geo / Amber
    glow: 'rgba(251, 191, 36, 0.6)',
    bgGlow: 'rgba(251, 191, 36, 0.12)',
  },
  {
    id: 'projects',
    label: 'Projects',
    elementName: 'Creations',
    icon: FolderGit2,
    threshold: 55,
    color: '#34D399', // Dendro / Emerald
    glow: 'rgba(52, 211, 153, 0.6)',
    bgGlow: 'rgba(52, 211, 153, 0.12)',
  },
  {
    id: 'certs',
    label: 'Credentials',
    elementName: 'Mastery',
    icon: Award,
    threshold: 75,
    color: '#A78BFA', // Electro / Amethyst
    glow: 'rgba(167, 139, 250, 0.6)',
    bgGlow: 'rgba(167, 139, 250, 0.12)',
  },
  {
    id: 'contact',
    label: 'Contact',
    elementName: 'Signal',
    icon: Send,
    threshold: 95,
    color: '#38BDF8', // Hydro / Sky Blue
    glow: 'rgba(56, 189, 248, 0.6)',
    bgGlow: 'rgba(56, 189, 248, 0.12)',
  },
];

// ─── Rotating Tips & Lore ───────────────────────────────────────────────────
const LORE_TIPS = [
  { tag: "SYSTEM TIP", text: "Precision front-ends engineered with React & Framer Motion for 60 FPS fluidity." },
  { tag: "NAVIGATION", text: "Use arrow keys or left section labels to seamlessly warp through sections." },
  { tag: "ARCHITECTURE", text: "Full-stack cloud synchronization powered by real-time Firebase Firestore." },
  { tag: "CROSS-PLATFORM", text: "Delivering rapid, pixel-perfect experiences across Web and Flutter Mobile." },
  { tag: "PORTFOLIO TIP", text: "Toggle themes anytime using the stellar mode switch in the top-right corner." },
];

// ─── Canvas Palette ──────────────────────────────────────────────────────────
const PALETTES = {
  dark: {
    dust: ['rgba(232,244,253,0.12)', 'rgba(184,223,240,0.10)', 'rgba(255,255,255,0.15)'],
    star: ['rgba(232,244,253,0.30)', 'rgba(255,255,255,0.40)', 'rgba(197,232,247,0.28)'],
    glowColor: 'rgba(34, 211, 238, ',
    lineColor: 'rgba(34, 211, 238, ',
    coreColor: '#ffffff',
  },
  light: {
    dust: ['rgba(91,164,207,0.10)', 'rgba(59,130,160,0.08)', 'rgba(74,144,184,0.10)'],
    star: ['rgba(91,164,207,0.22)', 'rgba(74,144,184,0.25)', 'rgba(109,179,214,0.20)'],
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

// ─── 4-Point Star Drawer (Genshin Primogem Motif) ────────────────────────────
function drawFourPointStar(ctx, x, y, size, rotation) {
  const outer = size;
  const inner = size * 0.22;
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

export default function StellarCryoLoader({
  isLoading = true,
  onExited,
}) {
  const canvasRef = useRef(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [exited, setExited] = useState(false);
  const [percent, setPercent] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const percentRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const loadingDoneRef = useRef(false);

  // Cycling Tips
  useEffect(() => {
    if (exited) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LORE_TIPS.length);
    }, 3600);
    return () => clearInterval(interval);
  }, [exited]);

  // Track when isLoading becomes false
  useEffect(() => {
    if (!isLoading) {
      loadingDoneRef.current = true;
    }
  }, [isLoading]);

  // ── Canvas Starfield & Constellations ──────────────────────────────────────
  useEffect(() => {
    if (exited) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let stars = [];
    let starIndices = [];
    let constellations = [];
    let frame = 0;
    let raf;
    let nextGlowFrame = 20;
    let nextConstellationFrame = 40;

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const palette = PALETTES[getTheme()] || PALETTES.dark;
      const count = Math.max(80, Math.floor((w * h) / 11000));
      
      stars = Array.from({ length: count }, () => {
        const isStar = Math.random() > 0.6;
        return {
          x: rand(0, w),
          y: rand(0, h),
          size: isStar ? rand(2.5, 6.5) : rand(0.8, 1.8),
          isStar,
          color: isStar ? pick(palette.star) : pick(palette.dust),
          rotation: rand(0, Math.PI * 2),
          rotationSpeed: isStar ? rand(0.001, 0.004) : 0,
          breathPhase: rand(0, Math.PI * 2),
          breathSpeed: rand(0.012, 0.025),
          breathDepth: rand(0.15, 0.3),
          baseOpacity: isStar ? rand(0.2, 0.45) : rand(0.06, 0.18),
          glowProgress: 0,
          glowPhase: 'idle',
        };
      });

      starIndices = stars.map((s, i) => s.isStar ? i : -1).filter((i) => i >= 0);
      constellations = [];
    };

    const triggerGlow = () => {
      const eligible = stars.filter((s) => s.isStar && s.glowPhase === 'idle');
      if (eligible.length === 0) return;
      const target = eligible[Math.floor(Math.random() * eligible.length)];
      target.glowPhase = 'rising';
      target.glowProgress = 0;
    };

    const spawnConstellation = () => {
      if (constellations.length >= 3 || starIndices.length < 4) return;
      const seedIdx = pick(starIndices);
      const seed = stars[seedIdx];
      if (!seed) return;

      const maxDist = Math.min(w, h) * 0.22;
      const nearby = starIndices
        .filter((i) => i !== seedIdx)
        .map((i) => ({ idx: i, dist: Math.hypot(stars[i].x - seed.x, stars[i].y - seed.y) }))
        .filter((n) => n.dist < maxDist)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, Math.floor(rand(2, 4)));

      if (nearby.length < 2) return;

      const nodes = [seedIdx, ...nearby.map((n) => n.idx)];
      const edges = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push([nodes[i], nodes[i + 1]]);
      }

      constellations.push({
        nodes,
        edges,
        progress: 0,
        phase: 'rising',
        holdTimer: 0,
        holdDuration: rand(60, 150),
        riseSpeed: rand(0.015, 0.028),
        fallSpeed: rand(0.008, 0.018),
      });
    };

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const theme = getTheme();
      const palette = PALETTES[theme] || PALETTES.dark;

      // ── Percentage Interpolation ──
      const elapsed = Date.now() - startTimeRef.current;
      let targetPercent;
      if (loadingDoneRef.current) {
        targetPercent = 100;
      } else {
        const tau = 2400;
        targetPercent = Math.min(88, 88 * (1 - Math.exp(-elapsed / tau)));
      }

      // Smooth step
      const stepSpeed = loadingDoneRef.current ? 0.08 : 0.035;
      percentRef.current += (targetPercent - percentRef.current) * stepSpeed;
      const displayPercent = Math.min(100, Math.round(percentRef.current));
      
      if (frame % 2 === 0) {
        setPercent(displayPercent);
      }

      // Glow triggers
      if (frame >= nextGlowFrame) {
        triggerGlow();
        nextGlowFrame = frame + rand(20, 60);
      }

      // Constellation triggers
      if (frame >= nextConstellationFrame) {
        spawnConstellation();
        nextConstellationFrame = frame + rand(80, 180);
      }

      // ── Draw Constellations ──
      for (let ci = constellations.length - 1; ci >= 0; ci--) {
        const c = constellations[ci];
        if (c.phase === 'rising') {
          c.progress += c.riseSpeed;
          if (c.progress >= 1) {
            c.progress = 1;
            c.phase = 'holding';
            c.holdTimer = 0;
          }
        } else if (c.phase === 'holding') {
          c.holdTimer++;
          if (c.holdTimer >= c.holdDuration) c.phase = 'falling';
        } else if (c.phase === 'falling') {
          c.progress -= c.fallSpeed;
          if (c.progress <= 0) {
            constellations.splice(ci, 1);
            continue;
          }
        }

        const alpha = easeInOutQuad(c.progress);
        ctx.strokeStyle = palette.lineColor + (alpha * 0.22).toFixed(3) + ')';
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

        for (const ni of c.nodes) {
          const s = stars[ni];
          if (!s) continue;
          const nodeGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
          nodeGlow.addColorStop(0, palette.glowColor + (alpha * 0.35).toFixed(3) + ')');
          nodeGlow.addColorStop(1, palette.glowColor + '0)');
          ctx.fillStyle = nodeGlow;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Draw Stars ──
      for (let i = 0; i < stars.length; i++) {
        const p = stars[i];
        p.rotation += p.rotationSpeed;
        const breath = p.breathDepth * Math.sin(p.breathSpeed * frame + p.breathPhase);
        let opacity = p.baseOpacity + breath;

        if (p.glowPhase === 'rising') {
          p.glowProgress += 0.035;
          if (p.glowProgress >= 1) { p.glowProgress = 1; p.glowPhase = 'falling'; }
        } else if (p.glowPhase === 'falling') {
          p.glowProgress -= 0.012;
          if (p.glowProgress <= 0) { p.glowProgress = 0; p.glowPhase = 'idle'; }
        }

        const glowEased = easeInOutQuad(p.glowProgress);
        const isGlowing = p.glowPhase !== 'idle' && p.glowProgress > 0.01;

        if (isGlowing) {
          const bloomSize = p.size * (3 + glowEased * 10);
          const outerGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloomSize);
          outerGrad.addColorStop(0, palette.glowColor + (glowEased * 0.45).toFixed(3) + ')');
          outerGrad.addColorStop(1, palette.glowColor + '0)');
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, bloomSize, 0, Math.PI * 2);
          ctx.fill();
          opacity = Math.min(1, opacity + glowEased * 0.8);
        }

        ctx.globalAlpha = Math.max(0.04, Math.min(1, opacity));

        if (p.isStar) {
          ctx.fillStyle = isGlowing ? palette.coreColor : p.color;
          drawFourPointStar(ctx, p.x, p.y, p.size * (isGlowing ? 1 + glowEased * 0.5 : 1), p.rotation);
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

  // ── Fade-out trigger when loaded ───────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && percent >= 100 && !fadingOut && !exited) {
      setFadingOut(true);
      const timer = setTimeout(() => {
        setExited(true);
        onExited?.();
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isLoading, percent, fadingOut, exited, onExited]);

  if (exited) return null;

  return (
    <div 
      className={`genshin-loader-overlay ${fadingOut ? 'fade-out' : ''}`}
      id="stellar-cryo-loader"
    >
      <canvas ref={canvasRef} className="genshin-loader-canvas" />

      {/* Ambient background glow orb */}
      <div className="genshin-loader-ambient-glow" />

      <div className="genshin-loader-container">
        {/* Top Header / Monomark */}
        <div className="genshin-loader-top">
          <div className="genshin-crest-badge">
            <Sparkles size={12} className="genshin-crest-star" />
            <span>STELLAR MAINFRAME &bull; INITIALIZING</span>
            <Sparkles size={12} className="genshin-crest-star" />
          </div>
          <h2 className="genshin-brand-title">CHRISTOPHER LAMERA</h2>
        </div>

        {/* ─── Center Elemental Glyph Array (Genshin Signature Style) ────────── */}
        <div className="genshin-glyphs-array">
          {/* Connector track line behind glyphs */}
          <div className="genshin-glyphs-track">
            <div 
              className="genshin-glyphs-track-fill" 
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} 
            />
          </div>

          {SECTION_GLYPHS.map((glyph, idx) => {
            const isLit = percent >= glyph.threshold;
            const Icon = glyph.icon;

            return (
              <div 
                key={glyph.id}
                className={`genshin-glyph-node ${isLit ? 'lit' : ''}`}
                style={{
                  '--glyph-color': glyph.color,
                  '--glyph-glow': glyph.glow,
                  '--glyph-bg': glyph.bgGlow,
                }}
              >
                {/* Outer decorative diamond frame */}
                <div className="genshin-glyph-diamond">
                  <div className="genshin-glyph-inner-card">
                    <Icon size={22} className="genshin-glyph-icon" />
                  </div>
                </div>

                {/* Glyph elemental title under badge */}
                <div className="genshin-glyph-label">
                  <span className="genshin-glyph-name">{glyph.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Glowing Progress Bar with Leading Star ─────────────────────── */}
        <div className="genshin-progress-section">
          <div className="genshin-progress-bar-track">
            <div 
              className="genshin-progress-bar-fill"
              style={{ width: `${percent}%` }}
            >
              {/* Primogem spark head */}
              <div className="genshin-progress-head-spark" />
            </div>
          </div>

          {/* Progress Percent Text */}
          <div className="genshin-percent-row">
            <span className="genshin-percent-num">{percent}</span>
            <span className="genshin-percent-unit">%</span>
          </div>
        </div>

        {/* ─── Rotating Tips / System Lore Box ────────────────────────────── */}
        <div className="genshin-lore-card">
          <div className="genshin-lore-badge">
            {LORE_TIPS[tipIndex].tag}
          </div>
          <p className="genshin-lore-text" key={tipIndex}>
            {LORE_TIPS[tipIndex].text}
          </p>
        </div>
      </div>
    </div>
  );
}
