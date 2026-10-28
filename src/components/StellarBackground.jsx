import React, { useEffect, useRef } from 'react';
import { spawnRealConstellation } from '../utils/constellations';

/**
 * StellarBackground — Static starry-night ambient background
 * Stars and dust are placed randomly and remain fixed.
 * Random stars periodically bloom with a bright glow pulse,
 * mimicking a living starry night sky.
 * Theme-aware via data-theme attribute observation.
 */

// ─── Theme Palettes for Stellar-Glimmer & Nod-Krai Frostmoon ────────────────
const PALETTES = {
  dark: {
    dust: ['rgba(224, 242, 254, 0.12)', 'rgba(186, 230, 253, 0.09)', 'rgba(255, 255, 255, 0.15)', 'rgba(56, 189, 248, 0.10)'],
    star: ['rgba(224, 242, 254, 0.35)', 'rgba(255, 255, 255, 0.55)', 'rgba(125, 211, 252, 0.40)'],
    glowCore: '#ffffff',
    glowHalo: 'rgba(56, 189, 248, 0.65)',
    moonCore: '#F0F9FF',
    moonCrescent: '#E0F2FE',
    moonAura: 'rgba(56, 189, 248, 0.18)',
    moonOuterHalo: 'rgba(56, 189, 248, 0.05)',
  },
  light: {
    dust: ['rgba(2, 132, 199, 0.16)', 'rgba(15, 23, 42, 0.12)', 'rgba(3, 105, 161, 0.15)', 'rgba(14, 165, 233, 0.18)'],
    star: ['rgba(2, 132, 199, 0.45)', 'rgba(15, 23, 42, 0.35)', 'rgba(3, 105, 161, 0.50)'],
    glowCore: '#0284C7',
    glowHalo: 'rgba(2, 132, 199, 0.70)',
    moonCore: '#BAE6FD',
    moonCrescent: '#38BDF8',
    moonAura: 'rgba(2, 132, 199, 0.20)',
    moonOuterHalo: 'rgba(2, 132, 199, 0.06)',
  },
};

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Particles partitioned into 3 depth tiers:
// Tier 0 (z: 0.20): Deep cosmic dust
// Tier 1 (z: 0.45): Mid astral stars & constellations
// Tier 2 (z: 0.85): Near-field crystalline ice prisms & large Primogem stars
function createStaticParticle(w, h, palette) {
  const depthRoll = Math.random();
  let depth = 0.45;
  let tier = 1;

  if (depthRoll < 0.35) {
    depth = 0.20; // Deep cosmic dust (moves at -20vw)
    tier = 0;
  } else if (depthRoll < 0.75) {
    depth = 0.45; // Mid astral field (moves at -45vw)
    tier = 1;
  } else {
    depth = 0.85; // Near high-glimmer field (moves at -85vw)
    tier = 2;
  }

  const isStar = tier === 2 ? Math.random() > 0.30 : tier === 1 ? Math.random() > 0.55 : false;

  return {
    x: rand(0, w * 1.5), // Spread across wide virtual canvas for continuous gliding
    y: rand(0, h),
    size: tier === 2 ? rand(3.5, 7.5) : tier === 1 ? rand(1.8, 4.0) : rand(0.8, 2.0),
    isStar,
    tier,
    depth,
    color: isStar ? pick(palette.star) : pick(palette.dust),
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: isStar ? rand(0.001, 0.004) : 0,
    breathPhase: rand(0, Math.PI * 2),
    breathSpeed: rand(0.008, 0.02),
    breathDepth: rand(0.08, 0.2),
    baseOpacity: tier === 2 ? rand(0.25, 0.55) : tier === 1 ? rand(0.18, 0.35) : rand(0.08, 0.18),
    glowProgress: 0,
    glowPhase: 'idle',
  };
}

// ─── 4-Point Primogem Astral Star ───────────────────────────────────────────
function drawFourPointStar(ctx, x, y, size, rotation, stretchFactor = 1) {
  const outer = size;
  const inner = size * 0.24;
  ctx.save();
  ctx.translate(x, y);
  if (stretchFactor > 1.01) {
    ctx.scale(stretchFactor, 1 / Math.sqrt(stretchFactor));
  }
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

// ─── Ethereal Nod-Krai Crescent Frostmoon (Columbina's Celestial Moon) ───────
function drawFrostmoon(ctx, x, y, radius, palette, frame, isDark) {
  ctx.save();

  // Subtle hovering celestial buoyancy
  const buoyY = y + Math.sin(frame * 0.014) * 3.5;

  // 1. Soft Outer Atmospheric Lunar Corona (Multi-Tier Radial Glow)
  const coronaRadius = radius * 3.6;
  const outerGrad = ctx.createRadialGradient(x, buoyY, radius * 0.3, x, buoyY, coronaRadius);
  outerGrad.addColorStop(0, palette.moonAura);
  outerGrad.addColorStop(0.45, palette.moonOuterHalo);
  outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.arc(x, buoyY, coronaRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Crescent Frostmoon Geometry (Outer Arc minus Inner Shadow Arc)
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, buoyY, radius, 0, Math.PI * 2, false);
  // Cutout circle for slender, graceful crescent
  const cutoutOffset = radius * 0.36;
  ctx.arc(x - cutoutOffset, buoyY - radius * 0.12, radius * 0.88, 0, Math.PI * 2, true);
  ctx.closePath();

  // Luminous Frost Gradient across crescent
  const moonGrad = ctx.createLinearGradient(x - radius, buoyY - radius, x + radius, buoyY + radius);
  moonGrad.addColorStop(0, palette.moonCore);
  moonGrad.addColorStop(0.65, palette.moonCrescent);
  moonGrad.addColorStop(1, isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(2, 132, 199, 0.45)');
  ctx.fillStyle = moonGrad;
  ctx.fill();
  ctx.restore();

  // 3. Delicate Crystalline Moon Corona Rim
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, buoyY, radius + 1.5, -Math.PI * 0.45, Math.PI * 0.55);
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(2, 132, 199, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 4. Stellar-Glimmer Cryo Spark at the Moon Cusp
  const sparkAlpha = 0.45 + 0.35 * Math.sin(frame * 0.038);
  ctx.save();
  ctx.globalAlpha = sparkAlpha;
  ctx.fillStyle = isDark ? '#FFFFFF' : '#0284C7';
  drawFourPointStar(ctx, x + radius * 0.52, buoyY - radius * 0.68, 3.2, frame * 0.025);
  ctx.restore();

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



export default function StellarBackground({ isWarping = false, activeSection = 0 }) {
  const canvasRef = useRef(null);
  const isWarpingRef = useRef(isWarping);
  const activeSectionRef = useRef(activeSection);

  useEffect(() => {
    isWarpingRef.current = isWarping;
  }, [isWarping]);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    let starIndices = [];
    let constellations = [];
    let raf;
    let frame = 0;
    let currentParallaxX = 0;
    let prevParallaxX = 0;
    let nextGlowFrame = 30; // first glow trigger quickly
    let nextConstellationFrame = 90; // delay first constellation
    let mouseX = -1000;
    let mouseY = -1000;
    const prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const isSmall = w < 768;
      const palette = PALETTES[getTheme()] || PALETTES.dark;
      // On small screens, cut density in half (~50% particle reduction) for optimal battery and framerates
      const density = isSmall ? 32000 : 16000;
      const minCount = isSmall ? 30 : 65;
      const count = Math.max(minCount, Math.floor((w * h) / density));
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

      const maxGlows = w < 768 ? 2 : MAX_SIMULTANEOUS_GLOWS;
      const currentGlowing = particles.filter(p => p.glowPhase !== 'idle').length;
      if (currentGlowing >= maxGlows) return;

      const target = eligible[Math.floor(Math.random() * eligible.length)];
      target.glowPhase = 'rising';
      target.glowProgress = 0;
    };

    const spawnConstellation = () => {
      const maxConstellations = w < 768 ? 1 : 3;
      if (isWarpingRef.current || constellations.length >= maxConstellations) return;
      const getStarColor = () => pick(PALETTES[getTheme()]?.star || PALETTES.dark.star);
      const c = spawnRealConstellation(w, h, rand, getStarColor);
      
      c.progress = 0;
      c.phase = 'rising';
      c.holdTimer = 0;
      c.holdDuration = rand(120, 300);
      c.riseSpeed = rand(0.008, 0.02);
      c.fallSpeed = rand(0.004, 0.01);
      
      let isNearMouse = false;
      const firstNode = c.nodes[0];
      if (mouseX >= 0 && mouseY >= 0 && firstNode) {
        const distToMouse = Math.hypot(firstNode.x - mouseX, firstNode.y - mouseY);
        if (distToMouse < 300) isNearMouse = true;
      }
      c.isNearMouse = isNearMouse;
      
      constellations.push(c);
    };

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const theme = getTheme();
      const palette = PALETTES[theme] || PALETTES.dark;
      const isDark = theme === 'dark';

      // ── High-Visibility Multi-Tier Parallax System ──
      // Near-field travel = 85vw per section; Mid = 45vw; Moon & deep dust = 22vw
      const targetParallaxX = prefersReducedMotion ? 0 : -activeSectionRef.current * (w * 0.85);
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.088;

      const velocity = currentParallaxX - prevParallaxX;
      prevParallaxX = currentParallaxX;
      const isMovingFast = !prefersReducedMotion && Math.abs(velocity) > 0.6;
      const stretchFactor = !prefersReducedMotion ? 1 + Math.min(Math.abs(velocity) * 0.038, 2.0) : 1;

      // ── Draw the Nod-Krai Crescent Frostmoon (Columbina's Celestial Horizon) ──
      if (!isWarpingRef.current) {
        const moonRadius = Math.max(30, Math.min(48, w * 0.032));
        // Glides across sky from upper right on Home (0.82) to upper left on Contact (0.21)
        const moonDrawX = prefersReducedMotion 
          ? w * 0.82 
          : w * 0.82 + currentParallaxX * 0.18;
        // Subtle celestial arc: reaches zenith near center of page
        const zenithProgress = prefersReducedMotion ? 0 : (moonDrawX / w - 0.5) * 2;
        const moonDrawY = Math.min(160, h * 0.16) + (zenithProgress * zenithProgress) * 16;
        drawFrostmoon(ctx, moonDrawX, moonDrawY, moonRadius, palette, frame, isDark);
      }

      // Trigger new glows frequently
      if (frame >= nextGlowFrame) {
        triggerRandomGlow();
        nextGlowFrame = frame + rand(GLOW_INTERVAL_MIN, GLOW_INTERVAL_MAX);
      }

      // Spawn constellations
      if (frame >= nextConstellationFrame && !isWarpingRef.current) {
        spawnConstellation();
        const spawnDelay = w < 768 ? rand(240, 500) : rand(150, 400);
        nextConstellationFrame = frame + spawnDelay;
      }

      // ── Update & draw constellation lines ──
      if (isWarpingRef.current) {
        if (constellations.length > 0) {
          constellations = [];
        }
      } else {
        const midShift = currentParallaxX * 0.45;
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
          
          const totalEdges = c.edges.length;
          const edgeProgressRaw = c.phase === 'rising' ? c.progress * totalEdges : totalEdges;

          ctx.strokeStyle = palette.glowHalo.replace(/[\d.]+\)$/g, `${(alpha * baseOpacity).toFixed(3)})`);
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          for (let ei = 0; ei < totalEdges; ei++) {
            if (ei > Math.floor(edgeProgressRaw)) continue;
            
            const edge = c.edges[ei];
            const sa = c.nodes[edge.from];
            const sb = c.nodes[edge.to];
            if (!sa || !sb) continue;

            const ax = (((sa.x + midShift) % w) + w) % w;
            const ay = sa.y;
            const bx = (((sb.x + midShift) % w) + w) % w;
            const by = sb.y;

            // Only draw edge if nodes are on the same side of screen wrap
            if (Math.abs(bx - ax) < w * 0.5) {
              ctx.moveTo(ax, ay);
              if (ei === Math.floor(edgeProgressRaw) && c.phase === 'rising') {
                const edgeAlpha = edgeProgressRaw - Math.floor(edgeProgressRaw);
                const currentX = ax + (bx - ax) * easeInOutQuad(edgeAlpha);
                const currentY = ay + (by - ay) * easeInOutQuad(edgeAlpha);
                ctx.lineTo(currentX, currentY);
              } else {
                ctx.lineTo(bx, by);
              }
            }
          }
          ctx.stroke();

          // Draw node highlights
          for (let ni = 0; ni < c.nodes.length; ni++) {
            const nodeAppearThreshold = ni / (c.nodes.length || 1);
            if (c.phase === 'rising' && c.progress < nodeAppearThreshold) continue;
            
            const s = c.nodes[ni];
            if (!s) continue;
            const nodeAlpha = c.phase === 'rising' ? Math.min(1, (c.progress - nodeAppearThreshold) * 4) : alpha;
            const nodeGlowAlpha = (nodeAlpha * (c.isNearMouse ? 0.6 : 0.35)).toFixed(3);
            
            const nx = (((s.x + midShift) % w) + w) % w;
            const ny = s.y;

            const nodeGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, s.size * 5);
            nodeGlow.addColorStop(0, palette.glowHalo.replace(/[\d.]+\)$/g, `${nodeGlowAlpha})`));
            nodeGlow.addColorStop(1, palette.glowHalo.replace(/[\d.]+\)$/g, '0)'));
            ctx.fillStyle = nodeGlow;
            ctx.beginPath();
            ctx.arc(nx, ny, s.size * 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = Math.max(0.02, Math.min(1, nodeAlpha * 0.8));
            ctx.fillStyle = s.color;
            s.rotation += s.rotationSpeed;
            drawFourPointStar(ctx, nx, ny, s.size, s.rotation);
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const depth = p.depth || (p.isStar ? 0.85 : 0.35);
        const drawX = (((p.x + currentParallaxX * depth) % w) + w) % w;
        const drawY = p.y;

        if (!prefersReducedMotion) {
          p.rotation += p.rotationSpeed;
        }

        // Ambient breathing
        const breath = prefersReducedMotion ? 0 : p.breathDepth * Math.sin(p.breathSpeed * frame + p.breathPhase);
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

        // ── Draw glow bloom ──
        if (isGlowing) {
          const bloomSize = p.size * (4 + glowEased * 12);
          const intensity = glowEased;

          const outerGrad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, bloomSize);
          outerGrad.addColorStop(0, palette.glowHalo.replace(/[\d.]+\)$/g, `${(intensity * 0.35).toFixed(3)})`));
          outerGrad.addColorStop(0.3, palette.glowHalo.replace(/[\d.]+\)$/g, `${(intensity * 0.15).toFixed(3)})`));
          outerGrad.addColorStop(1, palette.glowHalo.replace(/[\d.]+\)$/g, '0)'));
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(drawX, drawY, bloomSize, 0, Math.PI * 2);
          ctx.fill();

          const midGrad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, bloomSize * 0.4);
          const midColor = palette.glowHalo.replace(/rgba\((\d+),(\d+),(\d+),[\d.]+\)/, 'rgba($1,$2,$3,');
          midGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.6})`);
          midGrad.addColorStop(0.5, `${midColor}${intensity * 0.35})`);
          midGrad.addColorStop(1, `${midColor}0)`);
          ctx.fillStyle = midGrad;
          ctx.beginPath();
          ctx.arc(drawX, drawY, bloomSize * 0.4, 0, Math.PI * 2);
          ctx.fill();

          opacity = Math.min(1, opacity + glowEased * 0.8);
        }

        ctx.globalAlpha = Math.max(0.02, Math.min(1, opacity));

        if (p.isStar) {
          ctx.fillStyle = isGlowing ? palette.glowCore : p.color;
          // Apply velocity elongation to Tier 2 near stars during active section translation
          const particleStretch = (p.tier === 2 && isMovingFast) ? stretchFactor : 1;
          drawFourPointStar(ctx, drawX, drawY, p.size * (isGlowing ? 1 + glowEased * 0.5 : 1), p.rotation, particleStretch);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (p.tier === 2 && isMovingFast) {
            ctx.ellipse(drawX, drawY, p.size * stretchFactor, p.size / Math.sqrt(stretchFactor), 0, 0, Math.PI * 2);
          } else {
            ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
          }
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
