import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Compass, User, FolderGit2, Award, Send, Sparkles } from 'lucide-react';
import { spawnRealConstellation } from '../utils/constellations';
import './StellarCryoLoader.css';

/**
 * StellarCryoLoader — Full-screen loading overlay inspired by Genshin Impact
 * 
 * Features:
 * - Centered bottom-anchored HUD (pure Genshin Impact spatial hierarchy)
 * - Ultra-dynamic Canvas Starfield: multi-layered drifting nebulae, twinkling 4-point Primogem stars,
 *   shooting meteors, and alive "connect-a-dot" constellations that actively draw laser starlight from node to node
 * - 5 Sleek Elemental Section Glyphs (Icon-only with elemental aura pulses & ignition)
 * - Dynamic descriptive status phrases replacing numeric % readout
 * - Genshin-style "CLICK ANYWHERE TO ENTER" / "PRESS TO START" prompt once ready
 * - Hyper-space Warp Zoom transition on click/tap/keypress: camera accelerates forward through stars into a celestial whiteout flash
 * - Theme-aware (dark & light) and 100% gapless exit into the homepage
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

// ─── Status Phrases (Replacing Raw Numeric Percentages) ──────────────────────
const STATUS_PHASES = [
  { threshold: 0, text: 'INITIALIZING STELLAR MAINFRAME...' },
  { threshold: 15, text: 'ALIGNING CELESTIAL COORDINATES...' },
  { threshold: 35, text: 'HARMONIZING ELEMENTAL NODES...' },
  { threshold: 55, text: 'RETRIEVING ARCHIVES & REPOSITORIES...' },
  { threshold: 75, text: 'SYNTHESIZING CREDENTIAL MATRICES...' },
  { threshold: 90, text: 'CALIBRATING NEURAL INTERFACE...' },
  { threshold: 100, text: 'CELESTIAL LINK ESTABLISHED' },
];

// ─── Rotating Tips & Lore ───────────────────────────────────────────────────
const LORE_TIPS = [
  { tag: "SYSTEM TIP", text: "Precision front-ends engineered with React & Framer Motion for 60 FPS fluidity." },
  { tag: "NAVIGATION", text: "Use arrow keys or left section labels to seamlessly warp through sections." },
  { tag: "ARCHITECTURE", text: "Full-stack cloud synchronization powered by real-time Firebase Firestore." },
  { tag: "CROSS-PLATFORM", text: "Delivering rapid, pixel-perfect experiences across Web and Flutter Mobile." },
  { tag: "PORTFOLIO TIP", text: "Toggle themes anytime using the stellar mode switch in the top-right corner." },
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
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ─── 4-Point Primogem Star Drawer ───────────────────────────────────────────
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
  const [percent, setPercent] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [isReadyToEnter, setIsReadyToEnter] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [exited, setExited] = useState(false);

  const percentRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const loadingDoneRef = useRef(false);
  const isWarpingRef = useRef(false);
  const warpProgressRef = useRef(0);

  // Cycling Tips
  useEffect(() => {
    if (exited) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % LORE_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [exited]);

  // Track when external isLoading becomes false
  useEffect(() => {
    if (!isLoading) {
      loadingDoneRef.current = true;
    }
  }, [isLoading]);

  // Check if loading reached 100% and assets ready -> transition to "Ready to Enter"
  useEffect(() => {
    if (percent >= 100 && !isLoading && !isReadyToEnter && !isWarping) {
      setIsReadyToEnter(true);
    }
  }, [percent, isLoading, isReadyToEnter, isWarping]);

  // Derive dynamic status phrase based on percent
  const currentStatus = useMemo(() => {
    const matching = STATUS_PHASES.slice().reverse().find((p) => percent >= p.threshold);
    return matching ? matching.text : STATUS_PHASES[0].text;
  }, [percent]);

  // ─── Warp Zoom Handler (Click Anywhere To Enter) ───────────────────────────
  const handleEnter = useCallback(() => {
    if (!isReadyToEnter || isWarpingRef.current) return;
    isWarpingRef.current = true;
    setIsWarping(true);

    // Let the canvas warp sequence execute for 2500ms, then trigger exit
    setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        setExited(true);
        onExited?.();
      }, 600);
    }, 2500);
  }, [isReadyToEnter, onExited]);

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

  // ─── Canvas Starfield & Live Connect-a-Dot Constellations Engine ───────────
  useEffect(() => {
    if (exited) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    let stars = [];
    let starIndices = [];
    let constellations = [];
    let meteors = [];
    let nebulae = [];
    let frame = 0;
    let raf;
    let nextGlowFrame = 25;
    let nextConstellationFrame = 35;
    let nextMeteorFrame = 80;

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const palette = PALETTES[getTheme()] || PALETTES.dark;

      // 1. Nebulae Clouds
      nebulae = [
        { x: w * 0.25, y: h * 0.35, radius: Math.min(w, h) * 0.45, colorIdx: 0, driftX: 0.08, driftY: 0.05 },
        { x: w * 0.75, y: h * 0.65, radius: Math.min(w, h) * 0.50, colorIdx: 1, driftX: -0.06, driftY: 0.07 },
        { x: w * 0.50, y: h * 0.45, radius: Math.min(w, h) * 0.40, colorIdx: 2, driftX: 0.05, driftY: -0.04 },
      ];

      // 2. Stars
      const count = Math.max(120, Math.floor((w * h) / 8500));
      stars = Array.from({ length: count }, () => {
        const isStar = Math.random() > 0.58;
        const x = rand(0, w);
        const y = rand(0, h);
        return {
          x,
          y,
          originX: x,
          originY: y,
          size: isStar ? rand(3.0, 7.5) : rand(1.0, 2.2),
          isStar,
          color: isStar ? pick(palette.star) : pick(palette.dust),
          rotation: rand(0, Math.PI * 2),
          rotationSpeed: isStar ? rand(0.0015, 0.005) : 0,
          breathPhase: rand(0, Math.PI * 2),
          breathSpeed: rand(0.015, 0.035),
          breathDepth: rand(0.2, 0.45),
          baseOpacity: isStar ? rand(0.35, 0.75) : rand(0.12, 0.32),
          glowProgress: 0,
          glowPhase: 'idle',
        };
      });

      starIndices = stars.map((s, i) => (s.isStar ? i : -1)).filter((i) => i >= 0);
      constellations = [];
      meteors = [];
    };

    const triggerStarGlow = () => {
      const eligible = stars.filter((s) => s.isStar && s.glowPhase === 'idle');
      if (eligible.length === 0) return;
      const target = eligible[Math.floor(Math.random() * eligible.length)];
      target.glowPhase = 'rising';
      target.glowProgress = 0;
    };

    const spawnMeteor = () => {
      if (meteors.length >= 3) return;
      const startX = rand(w * 0.1, w * 0.9);
      const startY = rand(0, h * 0.4);
      const angle = rand(Math.PI * 0.2, Math.PI * 0.35);
      const speed = rand(12, 22);
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: rand(80, 160),
        life: 0,
        maxLife: rand(35, 55),
        size: rand(1.8, 3.2),
      });
    };

    // ── Alive "Connect-a-Dot" Constellation Spawner ──
    const spawnConstellation = () => {
      if (constellations.length >= 4) return;
      const getStarColor = () => pick(PALETTES[getTheme()]?.star || PALETTES.dark.star);
      const c = spawnRealConstellation(w, h, rand, getStarColor);

      c.activeEdgeIdx = 0;
      c.phase = 'drawing'; // 'drawing' -> 'holding' -> 'fading'
      c.holdTimer = 0;
      c.holdDuration = rand(90, 180);
      c.drawSpeed = rand(0.04, 0.075);
      c.fadeAlpha = 1;
      c.nodeFlashes = []; // Shockwave ripples when connected
      c.energyPulses = []; // Pulsing starlight traveling along lines
      
      constellations.push(c);
    };

    const animate = () => {
      frame++;
      const theme = getTheme();
      const palette = PALETTES[theme] || PALETTES.dark;

      // ── Handle Warp Zoom Velocity ──
      if (isWarpingRef.current) {
        warpProgressRef.current = Math.min(1, warpProgressRef.current + 0.010);
      }

      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.48;
      const warp = warpProgressRef.current;
      const warpSpeedFactor = Math.pow(warp, 2.8) * 45;

      // ── 1. Draw Nebula Background Clouds ──
      for (const neb of nebulae) {
        neb.x += neb.driftX;
        neb.y += neb.driftY;
        if (neb.x < 0 || neb.x > w) neb.driftX *= -1;
        if (neb.y < 0 || neb.y > h) neb.driftY *= -1;

        const nebColor = palette.nebulaColors[neb.colorIdx] || palette.nebulaColors[0];
        const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius * (1 + warp * 1.5));
        grad.addColorStop(0, nebColor);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(neb.x, neb.y, neb.radius * (1 + warp * 1.5), 0, Math.PI * 2);
        ctx.fill();
      }

      // ── 2. Percentage Step Interpolation ──
      const elapsed = Date.now() - startTimeRef.current;
      let targetPercent;
      if (loadingDoneRef.current) {
        targetPercent = 100;
      } else {
        const tau = 2200;
        targetPercent = Math.min(96, 96 * (1 - Math.exp(-elapsed / tau)));
      }

      const stepSpeed = loadingDoneRef.current ? 0.09 : 0.038;
      percentRef.current += (targetPercent - percentRef.current) * stepSpeed;
      const displayPercent = Math.min(100, Math.round(percentRef.current));
      
      if (frame % 2 === 0) {
        setPercent(displayPercent);
      }

      // ── 3. Glow & Spawners ──
      if (frame >= nextGlowFrame) {
        triggerStarGlow();
        nextGlowFrame = frame + rand(20, 50);
      }
      if (frame >= nextConstellationFrame) {
        spawnConstellation();
        nextConstellationFrame = frame + rand(70, 150);
      }
      if (frame >= nextMeteorFrame && !isWarpingRef.current) {
        spawnMeteor();
        nextMeteorFrame = frame + rand(120, 240);
      }

      // ── 4. Draw Alive Connect-a-Dot Constellations ──
      for (let ci = constellations.length - 1; ci >= 0; ci--) {
        const c = constellations[ci];

        if (c.phase === 'drawing') {
          const currentEdge = c.edges[c.activeEdgeIdx];
          if (currentEdge) {
            currentEdge.drawn += c.drawSpeed;
            if (currentEdge.drawn >= 1) {
              currentEdge.drawn = 1;
              // Node ignition ripple at target star
              const targetStar = c.nodes[currentEdge.to];
              if (targetStar) {
                c.nodeFlashes.push({ x: targetStar.x, y: targetStar.y, r: 0, maxR: 24, alpha: 1 });
              }
              c.activeEdgeIdx++;
            }
          } else {
            c.phase = 'holding';
            c.holdTimer = 0;
            // Spawn an energy pulse
            c.energyPulses.push({ edgeIdx: 0, t: 0, speed: 0.03 });
          }
        } else if (c.phase === 'holding') {
          c.holdTimer++;
          if (c.holdTimer >= c.holdDuration || isWarpingRef.current) {
            c.phase = 'fading';
          }
        } else if (c.phase === 'fading') {
          c.fadeAlpha -= 0.02;
          if (c.fadeAlpha <= 0) {
            constellations.splice(ci, 1);
            continue;
          }
        }

        const masterAlpha = easeInOutQuad(Math.max(0, c.fadeAlpha));
        
        // Draw constellation nodes
        for (let ni = 0; ni < c.nodes.length; ni++) {
          const s = c.nodes[ni];
          ctx.globalAlpha = Math.max(0.02, Math.min(1, masterAlpha * 0.8));
          ctx.fillStyle = s.color;
          s.rotation += s.rotationSpeed;
          drawFourPointStar(ctx, s.x, s.y, s.size, s.rotation);
        }

        // Draw active connecting lines (Connect-a-Dot laser trace)
        for (let ei = 0; ei < c.edges.length; ei++) {
          const edge = c.edges[ei];
          if (edge.drawn <= 0) continue;

          const sa = c.nodes[edge.from];
          const sb = c.nodes[edge.to];
          if (!sa || !sb) continue;

          const targetX = sa.x + (sb.x - sa.x) * edge.drawn;
          const targetY = sa.y + (sb.y - sa.y) * edge.drawn;

          // Glowing laser beam
          ctx.strokeStyle = palette.constellationLine + (masterAlpha * 0.45).toFixed(3) + ')';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();

          // Leading starlight head while drawing
          if (edge.drawn < 1) {
            ctx.fillStyle = palette.constellationPulse;
            ctx.shadowColor = palette.constellationPulse;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Draw Node Ripples
        for (let fi = c.nodeFlashes.length - 1; fi >= 0; fi--) {
          const fl = c.nodeFlashes[fi];
          fl.r += 1.2;
          fl.alpha = Math.max(0, 1 - fl.r / fl.maxR);
          if (fl.alpha <= 0) {
            c.nodeFlashes.splice(fi, 1);
            continue;
          }
          ctx.strokeStyle = palette.starGlow + (fl.alpha * masterAlpha * 0.7).toFixed(3) + ')';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(fl.x, fl.y, fl.r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw Energy Pulses traveling along lines
        for (let pi = c.energyPulses.length - 1; pi >= 0; pi--) {
          const pulse = c.energyPulses[pi];
          pulse.t += pulse.speed;
          if (pulse.t >= 1) {
            pulse.t = 0;
            pulse.edgeIdx = (pulse.edgeIdx + 1) % c.edges.length;
          }
          const curEdge = c.edges[pulse.edgeIdx];
          if (curEdge && curEdge.drawn >= 1) {
            const sa = c.nodes[curEdge.from];
            const sb = c.nodes[curEdge.to];
            if (sa && sb) {
              const px = sa.x + (sb.x - sa.x) * pulse.t;
              const py = sa.y + (sb.y - sa.y) * pulse.t;
              ctx.fillStyle = palette.constellationPulse;
              ctx.shadowColor = palette.constellationPulse;
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // ── 5. Draw Meteors (Shooting Stars) ──
      for (let mi = meteors.length - 1; mi >= 0; mi--) {
        const m = meteors[mi];
        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        const progress = m.life / m.maxLife;
        if (progress >= 1) {
          meteors.splice(mi, 1);
          continue;
        }

        const alpha = Math.sin(progress * Math.PI);
        const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
        const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

        const meteorGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        meteorGrad.addColorStop(0, palette.meteorTail + '0)');
        meteorGrad.addColorStop(0.7, palette.meteorTail + (alpha * 0.6).toFixed(3) + ')');
        meteorGrad.addColorStop(1, palette.meteorHead);

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = m.size;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }

      // ── 6. Draw Stars with Warp Stretch ──
      for (let i = 0; i < stars.length; i++) {
        const p = stars[i];
        p.rotation += p.rotationSpeed;
        const breath = p.breathDepth * Math.sin(p.breathSpeed * frame + p.breathPhase);
        let opacity = p.baseOpacity + breath;

        // Individual star ignition glow cycle
        if (p.glowPhase === 'rising') {
          p.glowProgress += 0.04;
          if (p.glowProgress >= 1) {
            p.glowProgress = 1;
            p.glowPhase = 'falling';
          }
        } else if (p.glowPhase === 'falling') {
          p.glowProgress -= 0.015;
          if (p.glowProgress <= 0) {
            p.glowProgress = 0;
            p.glowPhase = 'idle';
          }
        }

        const glowEased = easeInOutQuad(p.glowProgress);
        const isGlowing = p.glowPhase !== 'idle' && p.glowProgress > 0.01;

        if (isGlowing) {
          const bloomSize = p.size * (3.5 + glowEased * 9);
          const outerGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloomSize);
          outerGrad.addColorStop(0, palette.starGlow + (glowEased * 0.6).toFixed(3) + ')');
          outerGrad.addColorStop(1, palette.starGlow + '0)');
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, bloomSize, 0, Math.PI * 2);
          ctx.fill();
          opacity = Math.min(1, opacity + glowEased * 0.85);
        }

        // ── If Warping: Stretch into Hyper-Speed Radial Light Beams ──
        if (isWarpingRef.current && warp > 0) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          const angle = Math.atan2(dy, dx);
          const stretchLength = (dist * 0.12 + 10) * warpSpeedFactor;

          const prevX = p.x;
          const prevY = p.y;
          p.x += Math.cos(angle) * (warpSpeedFactor * (dist / 200 + 0.5));
          p.y += Math.sin(angle) * (warpSpeedFactor * (dist / 200 + 0.5));

          const streakGrad = ctx.createLinearGradient(prevX, prevY, p.x, p.y);
          streakGrad.addColorStop(0, palette.starGlow + '0)');
          streakGrad.addColorStop(0.5, palette.coreColor);
          streakGrad.addColorStop(1, '#ffffff');

          ctx.strokeStyle = streakGrad;
          ctx.lineWidth = Math.max(1.5, p.size * (1 + warp * 0.8));
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(p.x + Math.cos(angle) * stretchLength, p.y + Math.sin(angle) * stretchLength);
          ctx.stroke();
        } else {
          // Standard Calm Ambient Star Rendering
          ctx.globalAlpha = Math.max(0.06, Math.min(1, opacity));

          if (p.isStar) {
            ctx.fillStyle = isGlowing ? palette.coreColor : p.color;
            drawFourPointStar(ctx, p.x, p.y, p.size * (isGlowing ? 1 + glowEased * 0.5 : 1), p.rotation);
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }

      // ── 7. Hyper-Space Warp Celestial Bloom / Flash ──
      if (isWarpingRef.current && warp > 0.3) {
        const flashProgress = (warp - 0.3) / 0.7; // 0 to 1
        const maxR = Math.hypot(w, h) * 1.1;
        // Theme-aware flash colors
        const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * flashProgress);
        
        if (theme === 'light') {
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, flashProgress * 1.5)})`);
          flashGrad.addColorStop(0.6, `rgba(186, 230, 253, ${Math.min(0.9, flashProgress * 1.1)})`); // sky-200
          flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, flashProgress * 1.5)})`);
          flashGrad.addColorStop(0.6, `rgba(34, 211, 238, ${Math.min(0.9, flashProgress * 1.1)})`); // cyan-400
          flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }

        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, w, h);
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
  }, [exited]);

  if (exited) return null;

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

      {/* Ambient background glow orb */}
      <div className="genshin-loader-ambient-glow" />

      {/* ─── Bottom-Centered HUD (Pure Genshin Spatial Hierarchy) ─── */}
      <div className={`genshin-bottom-hud ${isWarping ? 'hud-warp-exit' : ''}`}>
        
        {/* ─── Elemental Row Section ─── */}
        <div className="genshin-elemental-row" id="hud-icons-section">
          {SECTION_GLYPHS.map((glyph) => {
            const isLit = percent >= glyph.threshold;
            const Icon = glyph.icon;

            return (
              <div
                key={glyph.id}
                className={`genshin-element-node ${isLit ? 'lit' : ''}`}
                title={glyph.label}
              >
                <Icon size={24} className="genshin-element-svg" />
              </div>
            );
          })}
        </div>

        {/* ─── Loading / Prompt Area Section ─── */}
        <div className="genshin-bottom-center-stage" id="hud-prompt-section">
          {!isReadyToEnter ? (
            /* Active Loading Progress Bar & Status Text */
            <div className="genshin-progress-container">
              <div className="genshin-progress-bar-track">
                <div
                  className="genshin-progress-bar-fill"
                  style={{ width: `${percent}%` }}
                >
                  {/* Primogem Spark Head */}
                  <div className="genshin-progress-spark-head" />
                </div>
              </div>

              {/* Dynamic Descriptive Status Phrase (No raw % digits) */}
              <div className="genshin-status-row">
                <span className="genshin-status-text">{currentStatus}</span>
              </div>
            </div>
          ) : (
            /* Genshin "Press to Start" Celestial Prompt */
            <div className="genshin-enter-prompt" onClick={handleEnter}>
              <div className="genshin-enter-banner">
                <Sparkles size={15} className="genshin-enter-star left" />
                <span className="genshin-enter-text">CLICK ANYWHERE TO ENTER</span>
                <Sparkles size={15} className="genshin-enter-star right" />
              </div>
              <span className="genshin-enter-subtext">Tap screen or press any key to enter</span>
            </div>
          )}
        </div>

        {/* ─── Tips Section ─── */}
        <div className="genshin-tip-row" id="hud-tips-section">
          <span className="genshin-tip-tag">[{LORE_TIPS[tipIndex].tag}]</span>
          <span className="genshin-tip-text" key={tipIndex}>
            {LORE_TIPS[tipIndex].text}
          </span>
        </div>

      </div>
    </div>
  );
}
