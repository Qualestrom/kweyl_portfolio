import React, { useEffect, useRef } from 'react';

/**
 * StellarBackground — Static starry-night ambient background
 * Stars and dust are placed randomly and remain fixed.
 * Random stars periodically bloom with a bright glow pulse,
 * mimicking a living starry night sky.
 * Theme-aware via data-theme attribute observation.
 */

const PALETTES = {
  dark: {
    dust: ['rgba(232,244,253,0.10)', 'rgba(184,223,240,0.08)', 'rgba(255,255,255,0.12)', 'rgba(168,216,234,0.06)'],
    star: ['rgba(232,244,253,0.20)', 'rgba(255,255,255,0.25)', 'rgba(197,232,247,0.18)'],
    glowCore: '#ffffff',
    glowHalo: 'rgba(103,232,249,0.6)',
  },
  light: {
    dust: ['rgba(2,132,199,0.14)', 'rgba(15,23,42,0.10)', 'rgba(3,105,161,0.12)', 'rgba(14,165,233,0.15)'],
    star: ['rgba(2,132,199,0.30)', 'rgba(15,23,42,0.25)', 'rgba(3,105,161,0.35)'],
    glowCore: '#0284C7',
    glowHalo: 'rgba(2,132,199,0.65)',
  },
};

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function createStaticParticle(w, h, palette) {
  const isStar = Math.random() > 0.70; // 30% stars
  return {
    x: rand(0, w),
    y: rand(0, h),
    size: isStar ? rand(2.5, 7) : rand(0.8, 2.5),
    isStar,
    color: isStar ? pick(palette.star) : pick(palette.dust),
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: isStar ? rand(0.001, 0.004) : 0,
    // Gentle ambient breathing
    breathPhase: rand(0, Math.PI * 2),
    breathSpeed: rand(0.008, 0.02),
    breathDepth: rand(0.08, 0.2),
    baseOpacity: isStar ? rand(0.15, 0.30) : rand(0.06, 0.15),
    // Glow pulse state
    glowProgress: 0,    // 0 → 1 → 0 over the glow cycle
    glowPhase: 'idle',  // 'idle' | 'rising' | 'falling'
  };
}

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

// Easing: ease-in-out quad
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Glow pulse timing
const GLOW_RISE_SPEED = 0.025;    // ~40 frames to peak (~0.65s)
const GLOW_FALL_SPEED = 0.008;    // ~125 frames to fade (~2s)
const GLOW_INTERVAL_MIN = 40;     // min frames between triggers (~0.7s)
const GLOW_INTERVAL_MAX = 120;    // max frames between triggers (~2s)
const MAX_SIMULTANEOUS_GLOWS = 6;

// ─── Constellation Factory ───────────────────────────────────────────────────
function createConstellation(starIndices, stars, maxDist, mouseX, mouseY) {
  const seedIdx = starIndices[Math.floor(Math.random() * starIndices.length)];
  const seed = stars[seedIdx];

  const nearby = starIndices
    .filter(i => i !== seedIdx)
    .map(i => ({ idx: i, dist: Math.hypot(stars[i].x - seed.x, stars[i].y - seed.y) }))
    .filter(n => n.dist < maxDist)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, Math.floor(rand(2, 5)));

  if (nearby.length < 2) return null;

  const nodes = [seedIdx, ...nearby.map(n => n.idx)];

  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push([nodes[i], nodes[i + 1]]);
  }
  if (nodes.length >= 4 && Math.random() > 0.4) {
    edges.push([nodes[0], nodes[Math.floor(nodes.length / 2)]]);
  }

  // Check distance to mouse to possibly boost brightness
  let isNearMouse = false;
  if (mouseX >= 0 && mouseY >= 0) {
    const distToMouse = Math.hypot(seed.x - mouseX, seed.y - mouseY);
    if (distToMouse < 300) isNearMouse = true;
  }

  return {
    nodes,
    edges,
    progress: 0,
    phase: 'rising',
    holdTimer: 0,
    holdDuration: rand(120, 300), // slightly longer hold for background
    riseSpeed: rand(0.008, 0.02), // slightly slower drawing
    fallSpeed: rand(0.004, 0.01),
    isNearMouse,
  };
}

export default function StellarBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    let starIndices = [];
    let constellations = [];
    let raf;
    let frame = 0;
    let nextGlowFrame = 30; // first glow trigger quickly
    let nextConstellationFrame = 90; // delay first constellation
    let mouseX = -1000;
    let mouseY = -1000;

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const palette = PALETTES[getTheme()] || PALETTES.dark;
      const count = Math.max(90, Math.floor((w * h) / 12000));
      particles = Array.from({ length: count }, () => createStaticParticle(w, h, palette));
      starIndices = particles.map((p, i) => p.isStar ? i : -1).filter(i => i >= 0);
      constellations = [];
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const triggerRandomGlow = () => {
      const eligible = particles.filter(p => p.isStar && p.glowPhase === 'idle');
      if (eligible.length === 0) return;

      const currentGlowing = particles.filter(p => p.glowPhase !== 'idle').length;
      if (currentGlowing >= MAX_SIMULTANEOUS_GLOWS) return;

      const target = eligible[Math.floor(Math.random() * eligible.length)];
      target.glowPhase = 'rising';
      target.glowProgress = 0;
    };

    const spawnConstellation = () => {
      if (constellations.length >= 3) return; // Max 3 at a time in background
      const maxDist = Math.min(w, h) * 0.25;
      const c = createConstellation(starIndices, particles, maxDist, mouseX, mouseY);
      if (c) constellations.push(c);
    };

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const theme = getTheme();
      const palette = PALETTES[theme] || PALETTES.dark;

      // Trigger new glows frequently
      if (frame >= nextGlowFrame) {
        triggerRandomGlow();
        nextGlowFrame = frame + rand(GLOW_INTERVAL_MIN, GLOW_INTERVAL_MAX);
      }

      // Spawn constellations
      if (frame >= nextConstellationFrame) {
        spawnConstellation();
        nextConstellationFrame = frame + rand(150, 400); // Between 2.5s and ~6.5s
      }

      // ── Update & draw constellation lines ──
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
        const baseOpacity = c.isNearMouse ? 0.45 : 0.25;
        
        // Draw edges sequentially (animating the line drawing)
        // c.progress (0 to 1) maps to the total length of the edges
        const totalEdges = c.edges.length;
        const edgeProgressRaw = c.phase === 'rising' ? c.progress * totalEdges : totalEdges;

        ctx.strokeStyle = palette.glowHalo.replace(/[\d.]+\)$/g, `${(alpha * baseOpacity).toFixed(3)})`);
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let ei = 0; ei < totalEdges; ei++) {
          if (ei > Math.floor(edgeProgressRaw)) continue; // Not started drawing this edge yet
          
          const [a, b] = c.edges[ei];
          const sa = particles[a];
          const sb = particles[b];
          if (!sa || !sb) continue;

          ctx.moveTo(sa.x, sa.y);
          
          if (ei === Math.floor(edgeProgressRaw) && c.phase === 'rising') {
             // Partially draw this specific edge
             const edgeAlpha = edgeProgressRaw - Math.floor(edgeProgressRaw);
             const currentX = sa.x + (sb.x - sa.x) * easeInOutQuad(edgeAlpha);
             const currentY = sa.y + (sb.y - sa.y) * easeInOutQuad(edgeAlpha);
             ctx.lineTo(currentX, currentY);
          } else {
             // Fully draw completed edges
             ctx.lineTo(sb.x, sb.y);
          }
        }
        ctx.stroke();

        // Draw node highlights
        for (let ni = 0; ni < c.nodes.length; ni++) {
          // Stagger node highlight appearance with the line drawing
          const nodeAppearThreshold = ni / (c.nodes.length || 1);
          if (c.phase === 'rising' && c.progress < nodeAppearThreshold) continue;
          
          const s = particles[c.nodes[ni]];
          if (!s) continue;
          const nodeAlpha = c.phase === 'rising' ? Math.min(1, (c.progress - nodeAppearThreshold) * 4) : alpha;
          const nodeGlowAlpha = (nodeAlpha * (c.isNearMouse ? 0.6 : 0.35)).toFixed(3);
          
          const nodeGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 5);
          nodeGlow.addColorStop(0, palette.glowHalo.replace(/[\d.]+\)$/g, `${nodeGlowAlpha})`));
          nodeGlow.addColorStop(1, palette.glowHalo.replace(/[\d.]+\)$/g, '0)'));
          ctx.fillStyle = nodeGlow;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.rotation += p.rotationSpeed;

        // Ambient breathing
        const breath = p.breathDepth * Math.sin(p.breathSpeed * frame + p.breathPhase);
        let opacity = p.baseOpacity + breath;

        // Advance glow state machine
        if (p.glowPhase === 'rising') {
          p.glowProgress += GLOW_RISE_SPEED;
          if (p.glowProgress >= 1) {
            p.glowProgress = 1;
            p.glowPhase = 'falling';
          }
        } else if (p.glowPhase === 'falling') {
          p.glowProgress -= GLOW_FALL_SPEED;
          if (p.glowProgress <= 0) {
            p.glowProgress = 0;
            p.glowPhase = 'idle';
          }
        }

        const glowEased = easeInOutQuad(p.glowProgress);
        const isGlowing = p.glowPhase !== 'idle' && p.glowProgress > 0.01;

        // ── Draw glow bloom (radial gradient circles, no shadowBlur) ──
        if (isGlowing) {
          const bloomSize = p.size * (4 + glowEased * 12);
          const intensity = glowEased;

          // Large soft outer halo (radial gradient)
          const outerGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloomSize);
          outerGrad.addColorStop(0, palette.glowHalo.replace(/[\d.]+\)$/g, `${(intensity * 0.35).toFixed(3)})`));
          outerGrad.addColorStop(0.3, palette.glowHalo.replace(/[\d.]+\)$/g, `${(intensity * 0.15).toFixed(3)})`));
          outerGrad.addColorStop(1, palette.glowHalo.replace(/[\d.]+\)$/g, '0)'));
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, bloomSize, 0, Math.PI * 2);
          ctx.fill();

          // Medium bright halo
          const midGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloomSize * 0.4);
          // In dark mode glowHalo is rgba(103,232,249,0.6). We'll use a brighter version for the mid halo.
          const midColor = palette.glowHalo.replace(/rgba\((\d+),(\d+),(\d+),[\d.]+\)/, 'rgba($1,$2,$3,');
          midGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.6})`);
          midGrad.addColorStop(0.5, `${midColor}${intensity * 0.35})`);
          midGrad.addColorStop(1, `${midColor}0)`);
          ctx.fillStyle = midGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, bloomSize * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Boost star opacity during glow
          opacity = Math.min(1, opacity + glowEased * 0.8);
        }

        ctx.globalAlpha = Math.max(0.02, Math.min(1, opacity));

        if (p.isStar) {
          ctx.fillStyle = isGlowing ? palette.glowCore : p.color;
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
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
