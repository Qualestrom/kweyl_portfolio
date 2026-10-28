import React, { useEffect, useRef } from 'react';
import { spawnRealConstellation } from '../utils/constellations';

/**
 * StellarBackground — Stellar-Glimmer & Nod-Krai Frostmoon Canvas Engine
 * - Renders the ethereal Nod-Krai Crescent Frostmoon (Columbina's Moon) with
 *   authentic lunar maria, earthshine limb, and multi-tier cryo corona.
 * - 3-Tier Parallax Depth System:
 *   Tier 0 (z: 0.20): Deep cosmic dust & Frostmoon (-18vw to -20vw)
 *   Tier 1 (z: 0.45): Mid astral stars & constellations (-45vw)
 *   Tier 2 (z: 0.85): Near-field crystalline ice prisms & Primogem stars (-85vw)
 * - Dynamic velocity stretching on near-field particles during section transitions.
 */

const PALETTES = {
  dark: {
    dust: [
      'rgba(224, 242, 254, 0.14)',
      'rgba(186, 230, 253, 0.10)',
      'rgba(255, 255, 255, 0.16)',
      'rgba(56, 189, 248, 0.12)',
    ],
    star: [
      'rgba(224, 242, 254, 0.45)',
      'rgba(255, 255, 255, 0.65)',
      'rgba(125, 211, 252, 0.50)',
    ],
    prismStroke: 'rgba(186, 230, 253, 0.52)',
    prismFill: 'rgba(56, 189, 248, 0.12)',
    glowCore: '#FFFFFF',
    glowRgb: '56, 189, 248',
  },
  light: {
    dust: [
      'rgba(2, 132, 199, 0.16)',
      'rgba(15, 23, 42, 0.12)',
      'rgba(3, 105, 161, 0.15)',
      'rgba(14, 165, 233, 0.18)',
    ],
    star: [
      'rgba(2, 132, 199, 0.50)',
      'rgba(15, 23, 42, 0.38)',
      'rgba(3, 105, 161, 0.55)',
    ],
    prismStroke: 'rgba(2, 132, 199, 0.45)',
    prismFill: 'rgba(14, 165, 233, 0.10)',
    glowCore: '#0284C7',
    glowRgb: '2, 132, 199',
  },
};

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function createStaticParticle(w, h, palette) {
  const depthRoll = Math.random();
  let depth = 0.45;
  let tier = 1;

  if (depthRoll < 0.35) {
    depth = 0.20; // Tier 0: Deep cosmic dust (-20vw)
    tier = 0;
  } else if (depthRoll < 0.72) {
    depth = 0.45; // Tier 1: Mid astral field (-45vw)
    tier = 1;
  } else {
    depth = 0.85; // Tier 2: Near high-glimmer field (-85vw)
    tier = 2;
  }

  const isStar = tier === 2 ? Math.random() > 0.38 : tier === 1 ? Math.random() > 0.52 : false;
  const isPrism = tier === 2 && !isStar && Math.random() > 0.35;

  return {
    x: rand(-120, w + 120),
    y: rand(0, h),
    size: tier === 2 ? rand(3.6, 7.2) : tier === 1 ? rand(1.8, 4.0) : rand(0.9, 2.0),
    isStar,
    isPrism,
    tier,
    depth,
    color: isStar ? pick(palette.star) : pick(palette.dust),
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: (isStar || isPrism) ? rand(0.0015, 0.0045) : 0,
    breathPhase: rand(0, Math.PI * 2),
    breathSpeed: rand(0.008, 0.02),
    breathDepth: rand(0.08, 0.2),
    baseOpacity: tier === 2 ? rand(0.32, 0.65) : tier === 1 ? rand(0.20, 0.40) : rand(0.10, 0.22),
    glowProgress: 0,
    glowPhase: 'idle',
  };
}

// ─── 4-Point Primogem Astral Star ───────────────────────────────────────────
function drawFourPointStar(ctx, x, y, size, rotation, stretchFactor = 1) {
  const outer = size;
  const inner = size * 0.23;
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

// ─── Rhombic Crystalline Ice Prism (Stellar-Glimmer Cryo Facet) ──────────────
function drawIcePrism(ctx, x, y, size, rotation, palette, stretchFactor = 1) {
  ctx.save();
  ctx.translate(x, y);
  if (stretchFactor > 1.01) {
    ctx.scale(stretchFactor, 1 / Math.sqrt(stretchFactor));
  }
  ctx.rotate(rotation);

  const rx = size * 0.62;
  const ry = size * 1.15;

  // Outer rhombic crystal facet
  ctx.beginPath();
  ctx.moveTo(0, -ry);
  ctx.lineTo(rx, 0);
  ctx.lineTo(0, ry);
  ctx.lineTo(-rx, 0);
  ctx.closePath();

  ctx.fillStyle = palette.prismFill;
  ctx.fill();
  ctx.lineWidth = 0.85;
  ctx.strokeStyle = palette.prismStroke;
  ctx.stroke();

  // Inner crystalline refraction axis
  ctx.beginPath();
  ctx.moveTo(0, -ry * 0.7);
  ctx.lineTo(0, ry * 0.7);
  ctx.moveTo(-rx * 0.65, 0);
  ctx.lineTo(rx * 0.65, 0);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

// ─── Ethereal Nod-Krai Crescent Frostmoon (Columbina's Celestial Moon) ───────
export function drawFrostmoon(ctx, x, y, radius, palette, frame, isDark) {
  ctx.save();

  // Gentle celestial buoyancy
  const buoyY = y + Math.sin(frame * 0.015) * 3.0;
  const R = radius;

  ctx.translate(x, buoyY);
  // Tilt coordinate space (-28 deg) so the waxing crescent cradles the sky naturally
  ctx.rotate(-0.48);

  // Crescent Geometry: Outer sphere (0,0,R) minus shadow sphere (-d,0,R2)
  const d = R * 0.44;
  const R2 = R * 0.92;
  const x0 = (R2 * R2 - R * R - d * d) / (2 * d);
  const y0 = Math.sqrt(Math.max(0, R * R - x0 * x0));
  const alpha1 = Math.atan2(y0, x0);
  const alpha2 = Math.atan2(y0, x0 + d);

  const traceCrescent = () => {
    ctx.beginPath();
    ctx.arc(0, 0, R, -alpha1, alpha1, false);
    ctx.arc(-d, 0, R2, alpha2, -alpha2, true);
    ctx.closePath();
  };

  // 1. Soft Outer Atmospheric Lunar Corona (Centered on the Lit Crescent Belly)
  const coronaR = R * 3.8;
  const coronaGrad = ctx.createRadialGradient(R * 0.55, 0, R * 0.1, R * 0.2, 0, coronaR);
  if (isDark) {
    coronaGrad.addColorStop(0, 'rgba(186, 230, 253, 0.20)');
    coronaGrad.addColorStop(0.28, 'rgba(56, 189, 248, 0.09)');
    coronaGrad.addColorStop(0.60, 'rgba(56, 189, 248, 0.025)');
    coronaGrad.addColorStop(1, 'rgba(5, 8, 17, 0)');
  } else {
    coronaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
    coronaGrad.addColorStop(0.32, 'rgba(2, 132, 199, 0.07)');
    coronaGrad.addColorStop(0.65, 'rgba(2, 132, 199, 0.02)');
    coronaGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');
  }
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(R * 0.2, 0, coronaR, 0, Math.PI * 2);
  ctx.fill();

  // 2. Luminous Crescent Body with Celestial Bloom
  ctx.save();
  ctx.shadowColor = isDark ? 'rgba(125, 211, 252, 0.65)' : 'rgba(2, 132, 199, 0.35)';
  ctx.shadowBlur = 22;
  traceCrescent();

  const crescentGrad = ctx.createRadialGradient(R * 0.78, 0, R * 0.04, 0, 0, R * 1.15);
  if (isDark) {
    crescentGrad.addColorStop(0, '#FFFFFF');
    crescentGrad.addColorStop(0.45, '#F0F9FF');
    crescentGrad.addColorStop(0.80, '#BAE6FD');
    crescentGrad.addColorStop(1, '#7DD3FC');
  } else {
    crescentGrad.addColorStop(0, '#FFFFFF');
    crescentGrad.addColorStop(0.40, '#E0F2FE');
    crescentGrad.addColorStop(0.78, '#38BDF8');
    crescentGrad.addColorStop(1, '#0284C7');
  }
  ctx.fillStyle = crescentGrad;
  ctx.fill();
  ctx.restore();

  // 3. Subtle Feathered Lunar Maria Clipped Inside the Crescent
  ctx.save();
  traceCrescent();
  ctx.clip();

  const mariaPatches = [
    { mx: R * 0.68, my: -R * 0.22, mr: R * 0.32, alpha: 0.16 },
    { mx: R * 0.75, my: R * 0.20, mr: R * 0.26, alpha: 0.14 },
    { mx: R * 0.45, my: R * 0.50, mr: R * 0.22, alpha: 0.12 },
  ];

  for (const m of mariaPatches) {
    const mGrad = ctx.createRadialGradient(m.mx, m.my, 0, m.mx, m.my, m.mr);
    const rgb = isDark ? '14, 116, 144' : '2, 132, 199';
    mGrad.addColorStop(0, `rgba(${rgb}, ${m.alpha})`);
    mGrad.addColorStop(0.6, `rgba(${rgb}, ${(m.alpha * 0.4).toFixed(3)})`);
    mGrad.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.arc(m.mx, m.my, m.mr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. Crisp Specular Rim along the Outer Sunlit Limb
  ctx.beginPath();
  ctx.arc(0, 0, R, -alpha1 * 0.90, alpha1 * 0.90, false);
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.92)' : 'rgba(2, 132, 199, 0.45)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // 5. Delicate Stellar-Glimmer Star Spark near the Upper Cusp
  const sparkPulse = 0.45 + 0.35 * Math.sin(frame * 0.04);
  ctx.fillStyle = isDark ? '#FFFFFF' : '#0284C7';
  ctx.globalAlpha = sparkPulse;
  drawFourPointStar(ctx, x0 - 4, -y0 - 2, 2.8, frame * 0.018);

  ctx.restore();
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

const GLOW_RISE_SPEED = 0.025;
const GLOW_FALL_SPEED = 0.008;
const GLOW_INTERVAL_MIN = 40;
const GLOW_INTERVAL_MAX = 120;
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth;
    let h = window.innerHeight;
    let particles = [];
    let constellations = [];
    let raf;
    let frame = 0;
    let currentParallaxX = 0;
    let prevParallaxX = 0;
    let nextGlowFrame = 30;
    let nextConstellationFrame = 90;
    let mouseX = -1000;
    let mouseY = -1000;
    const prefersReducedMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const isSmall = w < 768;
      const palette = PALETTES[getTheme()] || PALETTES.dark;
      const density = isSmall ? 28000 : 14000;
      const minCount = isSmall ? 36 : 75;
      const count = Math.max(minCount, Math.floor((w * h) / density));
      particles = Array.from({ length: count }, () => createStaticParticle(w, h, palette));
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

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const triggerRandomGlow = () => {
      const eligible = particles.filter((p) => p.isStar && p.glowPhase === 'idle');
      if (eligible.length === 0) return;

      const maxGlows = w < 768 ? 2 : MAX_SIMULTANEOUS_GLOWS;
      const currentGlowing = particles.filter((p) => p.glowPhase !== 'idle').length;
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
      raf = requestAnimationFrame(animate);
      frame++;
      ctx.clearRect(0, 0, w, h);

      const theme = getTheme();
      const palette = PALETTES[theme] || PALETTES.dark;
      const isDark = theme === 'dark';

      // ── High-Visibility Multi-Tier Parallax System ──
      // Near-field travel = 85vw per section; Mid = 45vw; Moon & deep dust = 20vw
      const targetParallaxX = prefersReducedMotion ? 0 : -activeSectionRef.current * (w * 0.85);
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.085;

      const velocity = currentParallaxX - prevParallaxX;
      prevParallaxX = currentParallaxX;
      const isMovingFast = !prefersReducedMotion && Math.abs(velocity) > 0.6;
      const stretchFactor = !prefersReducedMotion
        ? 1 + Math.min(Math.abs(velocity) * 0.038, 2.2)
        : 1;

      // ── 1. Draw the Nod-Krai Crescent Frostmoon (Columbina's Celestial Horizon) ──
      if (!isWarpingRef.current) {
        ctx.globalAlpha = 1;
        const moonRadius = Math.max(30, Math.min(44, w * 0.030));
        // Positioned in the high sky canopy on Home (0.65w), gliding to (0.16w) on Contact
        const moonDrawX = prefersReducedMotion
          ? w * 0.65
          : w * 0.65 + currentParallaxX * 0.145;
        const zenithProgress = prefersReducedMotion ? 0 : (moonDrawX / w - 0.42) * 2;
        const moonDrawY = Math.min(82, h * 0.092) + zenithProgress * zenithProgress * 12;
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

      // ── 2. Update & Draw Constellation Filaments (Tier 1: -45vw) ──
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

          ctx.globalAlpha = 1;
          ctx.strokeStyle = `rgba(${palette.glowRgb}, ${(alpha * baseOpacity).toFixed(3)})`;
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
            const nodeAlpha =
              c.phase === 'rising'
                ? Math.min(1, (c.progress - nodeAppearThreshold) * 4)
                : alpha;
            const nodeGlowAlpha = (nodeAlpha * (c.isNearMouse ? 0.45 : 0.25)).toFixed(3);

            const nx = (((s.x + midShift) % w) + w) % w;
            const ny = s.y;

            ctx.globalAlpha = 1;
            const nodeGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, s.size * 4.5);
            nodeGlow.addColorStop(0, `rgba(${palette.glowRgb}, ${nodeGlowAlpha})`);
            nodeGlow.addColorStop(1, `rgba(${palette.glowRgb}, 0)`);
            ctx.fillStyle = nodeGlow;
            ctx.beginPath();
            ctx.arc(nx, ny, s.size * 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = Math.max(0.02, Math.min(1, nodeAlpha * 0.85));
            ctx.fillStyle = s.color;
            s.rotation += s.rotationSpeed;
            drawFourPointStar(ctx, nx, ny, s.size, s.rotation);
          }
        }
      }

      // ── 3. Draw 3-Tier Particles (Stars, Crystalline Ice Prisms, & Cosmic Dust) ──
      const wrapSpan = w + 240;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const depth = p.depth || (p.isStar ? 0.85 : 0.35);
        const drawX = (((p.x + currentParallaxX * depth + 120) % wrapSpan) + wrapSpan) % wrapSpan - 120;
        const drawY = p.y;

        if (!prefersReducedMotion) {
          p.rotation += p.rotationSpeed;
        }

        const breath = prefersReducedMotion
          ? 0
          : p.breathDepth * Math.sin(p.breathSpeed * frame + p.breathPhase);
        let opacity = p.baseOpacity + breath;

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

        if (isGlowing) {
          ctx.globalAlpha = 1;
          const bloomSize = p.size * (3.5 + glowEased * 8);
          const intensity = glowEased;

          const outerGrad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, bloomSize);
          outerGrad.addColorStop(0, `rgba(255, 255, 255, ${(intensity * 0.55).toFixed(3)})`);
          outerGrad.addColorStop(0.25, `rgba(${palette.glowRgb}, ${(intensity * 0.32).toFixed(3)})`);
          outerGrad.addColorStop(0.6, `rgba(${palette.glowRgb}, ${(intensity * 0.08).toFixed(3)})`);
          outerGrad.addColorStop(1, `rgba(${palette.glowRgb}, 0)`);
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(drawX, drawY, bloomSize, 0, Math.PI * 2);
          ctx.fill();

          opacity = Math.min(1, opacity + glowEased * 0.75);
        }

        ctx.globalAlpha = Math.max(0.02, Math.min(1, opacity));
        const particleStretch = p.tier === 2 && isMovingFast ? stretchFactor : 1;

        if (p.isStar) {
          ctx.fillStyle = isGlowing ? palette.glowCore : p.color;
          drawFourPointStar(
            ctx,
            drawX,
            drawY,
            p.size * (isGlowing ? 1 + glowEased * 0.45 : 1),
            p.rotation,
            particleStretch
          );
        } else if (p.isPrism) {
          drawIcePrism(ctx, drawX, drawY, p.size, p.rotation, palette, particleStretch);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (p.tier === 2 && isMovingFast) {
            ctx.ellipse(
              drawX,
              drawY,
              p.size * particleStretch,
              p.size / Math.sqrt(particleStretch),
              0,
              0,
              Math.PI * 2
            );
          } else {
            ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
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
