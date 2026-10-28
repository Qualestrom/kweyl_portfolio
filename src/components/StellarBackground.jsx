import React, { useEffect, useRef } from 'react';
import { spawnRealConstellation } from '../utils/constellations';

/**
 * StellarBackground — Stellar-Glimmer & Nod-Krai Celestial Sky Engine
 * - Renders the ethereal Nod-Krai Crescent Frostmoon (Columbina's Moon)
 * - 3-Tier Parallax Depth System:
 *   Tier 0 (z: 0.20): Deep cosmic dust & Frostmoon (-18vw to -20vw)
 *   Tier 1 (z: 0.45): Mid astral constellations & filaments (-45vw)
 *   Tier 2 (z: 0.85): Near-field crystalline ice prisms & Primogem stars (-85vw)
 * - Kinetic Emergent Constellations:
 *   Comet head tracing, node ignition shockwave ripples, and traveling photon pulses
 * - Interactive Celestial Astrolabe:
 *   Cursor resonance with nearby background stars
 * - High-Altitude Shooting Meteors:
 *   Rare diagonal starlight streaks across the celestial vault
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
    constellationPulse: '#FFFFFF',
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
    constellationPulse: '#0284C7',
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
    rotationSpeed: isStar || isPrism ? rand(0.0015, 0.0045) : 0,
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

  ctx.beginPath();
  ctx.moveTo(0, -ry * 0.7);
  ctx.lineTo(0, ry * 0.7);
  ctx.moveTo(-rx * 0.65, 0);
  ctx.lineTo(rx * 0.65, 0);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

// ─── Responsive Colossal Frostmoon Metrics ──────────────────────────────────
export function getHeroMoonMetrics(w, h) {
  const isMobile = w < 768;
  const isTablet = w >= 768 && w < 1024;

  let radius;
  let targetX;
  let targetY;

  if (isMobile) {
    radius = Math.max(70, Math.min(92, w * 0.20));
    targetX = w * 0.75;
    targetY = Math.max(80, Math.min(125, h * 0.13));
  } else if (isTablet) {
    radius = Math.max(95, Math.min(135, w * 0.12));
    targetX = w * 0.73;
    targetY = Math.max(100, Math.min(160, h * 0.17));
  } else {
    // Desktop: Colossal celestial titan crowning the upper-right sky canopy
    radius = Math.max(140, Math.min(190, Math.min(w * 0.11, h * 0.23)));
    targetX = w * 0.72;
    targetY = Math.max(110, Math.min(185, h * 0.18));
  }

  return { radius, targetX, targetY };
}

// ─── Offscreen Canvas Pre-Rendering Buffer for Colossal Frostmoon ────────────
const moonCache = new Map();

function drawLunarCrater(ctx, cx, cy, r, isDark) {
  // Ultra-subtle, naturalistic celestial crater: only grazing rim light and soft ambient depth
  // 1. Grazing Sunlit Rim Highlight (+X sunward arc)
  ctx.save();
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.42)' : 'rgba(2, 132, 199, 0.35)';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI * 0.38, Math.PI * 0.38, false);
  ctx.stroke();

  // 2. Soft Ambient Shadow Rim (-X terminator arc)
  ctx.strokeStyle = isDark ? 'rgba(14, 116, 144, 0.18)' : 'rgba(2, 132, 199, 0.12)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.62, Math.PI * 1.38, false);
  ctx.stroke();

  // 3. Faint interior depression wash (no harsh dark spot)
  const innerWash = ctx.createRadialGradient(cx - r * 0.15, cy, 0, cx, cy, r * 0.85);
  innerWash.addColorStop(0, isDark ? 'rgba(14, 116, 144, 0.08)' : 'rgba(2, 132, 199, 0.05)');
  innerWash.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = innerWash;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function getMoonOffscreen(radius, isDark) {
  if (typeof document === 'undefined') return null;

  const R = Math.round(radius);
  const key = `${R}_${isDark ? 'dark' : 'light'}`;
  if (moonCache.has(key)) {
    return moonCache.get(key);
  }

  // Padding sufficient for corona (2.5R) and celestial astrolabe rings (1.75R)
  const pad = Math.ceil(R * 2.5);
  const size = pad * 2;
  const offscreen = document.createElement('canvas');
  offscreen.width = size;
  offscreen.height = size;
  const octx = offscreen.getContext('2d');
  if (!octx) return null;

  octx.save();
  octx.translate(pad, pad);

  const d = R * 0.44;
  const R2 = R * 0.92;
  const x0 = (R2 * R2 - R * R - d * d) / (2 * d);
  const y0 = Math.sqrt(Math.max(0, R * R - x0 * x0));
  const alpha1 = Math.atan2(y0, x0);
  const alpha2 = Math.atan2(y0, x0 + d);

  const traceCrescent = (target) => {
    target.beginPath();
    target.arc(0, 0, R, -alpha1, alpha1, false);
    target.arc(-d, 0, R2, alpha2, -alpha2, true);
    target.closePath();
  };

  // ── 1. Soft Atmospheric Corona (Centered on Lit Crescent Belly) ──
  const coronaR = R * 2.45;
  const coronaGrad = octx.createRadialGradient(R * 0.52, 0, R * 0.12, R * 0.20, 0, coronaR);
  if (isDark) {
    coronaGrad.addColorStop(0, 'rgba(186, 230, 253, 0.24)');
    coronaGrad.addColorStop(0.24, 'rgba(56, 189, 248, 0.11)');
    coronaGrad.addColorStop(0.55, 'rgba(14, 116, 144, 0.038)');
    coronaGrad.addColorStop(0.85, 'rgba(2, 6, 23, 0.012)');
    coronaGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  } else {
    coronaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.20)');
    coronaGrad.addColorStop(0.28, 'rgba(2, 132, 199, 0.08)');
    coronaGrad.addColorStop(0.65, 'rgba(2, 132, 199, 0.022)');
    coronaGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');
  }
  octx.fillStyle = coronaGrad;
  octx.beginPath();
  octx.arc(R * 0.20, 0, coronaR, 0, Math.PI * 2);
  octx.fill();

  // ── 2. Celestial "Moon Wheel" Astrolabe Rings (Ancient Domain Skies) ──
  // Inner Ring
  const ring1R = R * 1.22;
  octx.strokeStyle = isDark ? 'rgba(125, 211, 252, 0.14)' : 'rgba(2, 132, 199, 0.10)';
  octx.lineWidth = 0.75;
  octx.beginPath();
  octx.arc(0, 0, ring1R, 0, Math.PI * 2);
  octx.stroke();

  // Primary Astrolabe Ring with 24 Radial Tick Marks
  const ring2R = R * 1.46;
  octx.strokeStyle = isDark ? 'rgba(125, 211, 252, 0.24)' : 'rgba(2, 132, 199, 0.16)';
  octx.lineWidth = 0.95;
  octx.beginPath();
  octx.arc(0, 0, ring2R, 0, Math.PI * 2);
  octx.stroke();

  // 24 Astrolabe Tick Marks
  for (let k = 0; k < 24; k++) {
    const angle = (k * Math.PI) / 12;
    const isMajor = k % 2 === 0;
    const tickLen = isMajor ? 6 : 3.5;
    const rStart = ring2R - tickLen * 0.5;
    const rEnd = ring2R + tickLen * 0.5;
    octx.save();
    octx.strokeStyle = isDark
      ? isMajor ? 'rgba(186, 230, 253, 0.32)' : 'rgba(125, 211, 252, 0.16)'
      : isMajor ? 'rgba(2, 132, 199, 0.22)' : 'rgba(2, 132, 199, 0.12)';
    octx.lineWidth = isMajor ? 0.85 : 0.55;
    octx.beginPath();
    octx.moveTo(Math.cos(angle) * rStart, Math.sin(angle) * rStart);
    octx.lineTo(Math.cos(angle) * rEnd, Math.sin(angle) * rEnd);
    octx.stroke();
    octx.restore();
  }

  // Outer Celestial Resonance Ring (Dashed)
  const ring3R = R * 1.72;
  octx.save();
  octx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.09)' : 'rgba(2, 132, 199, 0.06)';
  octx.lineWidth = 0.75;
  octx.setLineDash([4, 8]);
  octx.beginPath();
  octx.arc(0, 0, ring3R, 0, Math.PI * 2);
  octx.stroke();
  octx.restore();

  // ── 3. 3D Spherical Earthshine (The Dark Face in Deep Space) ──
  const earthshineGrad = octx.createRadialGradient(-R * 0.18, -R * 0.12, 0, 0, 0, R);
  if (isDark) {
    earthshineGrad.addColorStop(0, 'rgba(186, 230, 253, 0.052)');
    earthshineGrad.addColorStop(0.60, 'rgba(14, 116, 144, 0.035)');
    earthshineGrad.addColorStop(1, 'rgba(3, 7, 18, 0.22)');
  } else {
    earthshineGrad.addColorStop(0, 'rgba(2, 132, 199, 0.038)');
    earthshineGrad.addColorStop(0.60, 'rgba(2, 132, 199, 0.022)');
    earthshineGrad.addColorStop(1, 'rgba(224, 242, 254, 0.18)');
  }
  octx.fillStyle = earthshineGrad;
  octx.beginPath();
  octx.arc(0, 0, R, 0, Math.PI * 2);
  octx.fill();

  // Delicate limb rim around the full sphere
  octx.strokeStyle = isDark ? 'rgba(186, 230, 253, 0.12)' : 'rgba(2, 132, 199, 0.07)';
  octx.lineWidth = 0.8;
  octx.beginPath();
  octx.arc(0, 0, R, 0, Math.PI * 2);
  octx.stroke();

  // Faint Ghostly Craters on the Dark Hemisphere (visible through Earthshine)
  const darkCraters = [
    { cx: -R * 0.42, cy: -R * 0.24, r: R * 0.12 },
    { cx: -R * 0.54, cy: R * 0.26, r: R * 0.13 },
    { cx: -R * 0.25, cy: R * 0.52, r: R * 0.09 },
    { cx: -R * 0.20, cy: -R * 0.56, r: R * 0.08 },
  ];
  for (const dc of darkCraters) {
    octx.fillStyle = isDark ? 'rgba(186, 230, 253, 0.020)' : 'rgba(2, 132, 199, 0.016)';
    octx.beginPath();
    octx.arc(dc.cx, dc.cy, dc.r, 0, Math.PI * 2);
    octx.fill();
    octx.strokeStyle = isDark ? 'rgba(186, 230, 253, 0.05)' : 'rgba(2, 132, 199, 0.035)';
    octx.lineWidth = 0.6;
    octx.stroke();
  }

  // ── 4. Luminous Sunlit Crescent Body ──
  octx.save();
  octx.shadowColor = isDark ? 'rgba(125, 211, 252, 0.70)' : 'rgba(2, 132, 199, 0.35)';
  octx.shadowBlur = 24;
  traceCrescent(octx);

  const crescentGrad = octx.createRadialGradient(R * 0.78, 0, R * 0.05, -R * 0.10, 0, R * 1.25);
  if (isDark) {
    crescentGrad.addColorStop(0, '#FFFFFF');
    crescentGrad.addColorStop(0.35, '#F0F9FF');
    crescentGrad.addColorStop(0.65, '#BAE6FD');
    crescentGrad.addColorStop(0.88, '#7DD3FC');
    crescentGrad.addColorStop(1, '#38BDF8');
  } else {
    crescentGrad.addColorStop(0, '#FFFFFF');
    crescentGrad.addColorStop(0.35, '#E0F2FE');
    crescentGrad.addColorStop(0.72, '#38BDF8');
    crescentGrad.addColorStop(1, '#0284C7');
  }
  octx.fillStyle = crescentGrad;
  octx.fill();
  octx.restore();

  // ── 5. Feathered Lunar Maria (Columbina's Astral Dove / Glacial Frost Pattern) ──
  octx.save();
  traceCrescent(octx);
  octx.clip();

  const mariaPatches = [
    { mx: R * 0.64, my: -R * 0.30, rx: R * 0.28, ry: R * 0.18, rot: -0.40, alpha: 0.15 }, // Mare Glacialis
    { mx: R * 0.72, my: 0, rx: R * 0.30, ry: R * 0.20, rot: 0, alpha: 0.14 },            // Mare Columbae
    { mx: R * 0.54, my: R * 0.38, rx: R * 0.24, ry: R * 0.16, rot: 0.40, alpha: 0.13 },  // Mare Niveus
    { mx: R * 0.42, my: R * 0.12, rx: R * 0.18, ry: R * 0.12, rot: 0.10, alpha: 0.11 },  // Sinus Astralis
    { mx: R * 0.46, my: -R * 0.52, rx: R * 0.16, ry: R * 0.10, rot: -0.55, alpha: 0.10 }, // Mare Borealis
  ];

  for (const m of mariaPatches) {
    octx.save();
    octx.translate(m.mx, m.my);
    octx.rotate(m.rot);
    const mGrad = octx.createRadialGradient(0, 0, 0, 0, 0, Math.max(m.rx, m.ry));
    const rgb = isDark ? '14, 116, 144' : '2, 132, 199';
    mGrad.addColorStop(0, `rgba(${rgb}, ${m.alpha})`);
    mGrad.addColorStop(0.55, `rgba(${rgb}, ${(m.alpha * 0.45).toFixed(3)})`);
    mGrad.addColorStop(1, `rgba(${rgb}, 0)`);
    octx.fillStyle = mGrad;
    octx.beginPath();
    octx.scale(1, m.ry / m.rx);
    octx.arc(0, 0, m.rx, 0, Math.PI * 2);
    octx.fill();
    octx.restore();
  }

  // ── 6. Glacial Fracture Rilles (Delicate Crystalline Frost Veins) ──
  octx.save();
  octx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(2, 132, 199, 0.15)';
  octx.lineWidth = 0.65;
  octx.beginPath();
  octx.moveTo(R * 0.58, -R * 0.38);
  octx.quadraticCurveTo(R * 0.65, -R * 0.15, R * 0.50, R * 0.08);
  octx.quadraticCurveTo(R * 0.42, R * 0.25, R * 0.38, R * 0.45);
  octx.moveTo(R * 0.68, R * 0.10);
  octx.quadraticCurveTo(R * 0.60, R * 0.28, R * 0.48, R * 0.52);
  octx.stroke();
  octx.restore();

  // ── 7. Subtle Celestial Craters (Grazing Rim Light & Soft Depth) ──
  const subtleCraters = [
    { cx: R * 0.68, cy: -R * 0.24, r: R * 0.085 }, // Crater Lumine
    { cx: R * 0.75, cy: R * 0.12, r: R * 0.095 },  // Crater Aether
    { cx: R * 0.54, cy: R * 0.42, r: R * 0.075 },  // Crater Columba
    { cx: R * 0.44, cy: -R * 0.52, r: R * 0.060 }, // Crater Caelestis
    { cx: R * 0.35, cy: R * 0.62, r: R * 0.055 },  // Crater Borealis
  ];

  for (const c of subtleCraters) {
    drawLunarCrater(octx, c.cx, c.cy, c.r, isDark);
  }

  // ── 8. Crystalline Ejecta Ray Systems from Crater Aether ──
  const aether = subtleCraters[1];
  const rayAngles = [-2.4, -1.8, -1.2, 1.2, 1.8, 2.4];
  for (const rAng of rayAngles) {
    const rayLen = R * (0.24 + 0.12 * Math.sin(rAng * 2));
    const rayEndX = aether.cx + Math.cos(rAng) * rayLen;
    const rayEndY = aether.cy + Math.sin(rAng) * rayLen;
    const rayGrad = octx.createLinearGradient(aether.cx, aether.cy, rayEndX, rayEndY);
    rayGrad.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.20)' : 'rgba(2, 132, 199, 0.14)');
    rayGrad.addColorStop(0.60, isDark ? 'rgba(186, 230, 253, 0.08)' : 'rgba(2, 132, 199, 0.05)');
    rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    octx.save();
    octx.strokeStyle = rayGrad;
    octx.lineWidth = 0.75;
    octx.beginPath();
    octx.moveTo(aether.cx, aether.cy);
    octx.lineTo(rayEndX, rayEndY);
    octx.stroke();
    octx.restore();
  }

  // ── 9. Specular Sunlit Outer Limb ──
  octx.beginPath();
  octx.arc(0, 0, R, -alpha1 * 0.92, alpha1 * 0.92, false);
  octx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(2, 132, 199, 0.55)';
  octx.lineWidth = 1.35;
  octx.stroke();

  octx.restore(); // Unclip crescent
  octx.restore(); // Reset translate

  // Enforce small cache size
  if (moonCache.size > 8) {
    const oldestKey = moonCache.keys().next().value;
    moonCache.delete(oldestKey);
  }
  const result = { canvas: offscreen, pad, x0, y0, ring2R };
  moonCache.set(key, result);
  return result;
}

// ─── Ethereal Nod-Krai Crescent Frostmoon (Columbina's Celestial Titan) ───────
export function drawFrostmoon(ctx, x, y, radius, palette, frame, isDark, rotation = -0.48, opacity = 1) {
  ctx.save();

  const buoyY = y + Math.sin(frame * 0.015) * 2.5;
  const R = radius;

  ctx.translate(x, buoyY);
  ctx.rotate(rotation);
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

  // 1. Blit pre-rendered offscreen moon buffer
  const cached = getMoonOffscreen(R, isDark);
  if (cached) {
    ctx.drawImage(cached.canvas, -cached.pad, -cached.pad);
  }

  // ── Dynamic Live Starlight Effects ──
  // 2. Dynamic Breathing Corona Glow on Crescent Belly
  const breathAlpha = 0.06 + 0.035 * Math.sin(frame * 0.03);
  const breathGrad = ctx.createRadialGradient(R * 0.52, 0, R * 0.10, R * 0.30, 0, R * 1.85);
  breathGrad.addColorStop(0, isDark ? `rgba(186, 230, 253, ${breathAlpha.toFixed(3)})` : `rgba(56, 189, 248, ${(breathAlpha * 0.8).toFixed(3)})`);
  breathGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = breathGrad;
  ctx.beginPath();
  ctx.arc(R * 0.30, 0, R * 1.85, 0, Math.PI * 2);
  ctx.fill();

  // 3. Micro-Sparks on the Primary Astrolabe Ring (4 Cardinal Points)
  const ring2R = cached?.ring2R || (R * 1.46);
  const sparkAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
  for (let si = 0; si < sparkAngles.length; si++) {
    const ang = sparkAngles[si];
    const sx = Math.cos(ang) * ring2R;
    const sy = Math.sin(ang) * ring2R;
    const sparkPulse = 0.40 + 0.30 * Math.sin(frame * 0.03 + si * 1.2);
    ctx.save();
    ctx.fillStyle = isDark ? '#FFFFFF' : '#0284C7';
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity * sparkPulse));
    drawFourPointStar(ctx, sx, sy, 2.2, frame * 0.02 + si * (Math.PI / 4));
    ctx.restore();
  }

  // 4. Radiant Cusp Star Sparks (Northern & Southern Tips)
  const x0 = cached?.x0 || (R * 0.72);
  const y0 = cached?.y0 || (R * 0.68);
  const cuspSpark = 0.50 + 0.35 * Math.sin(frame * 0.04);
  ctx.save();
  ctx.fillStyle = isDark ? '#FFFFFF' : '#0284C7';
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity * cuspSpark));
  drawFourPointStar(ctx, x0 - 3, -y0 - 2, 3.4, frame * 0.018);
  drawFourPointStar(ctx, x0 - 3, y0 + 2, 3.4, frame * 0.018 + Math.PI / 4);
  ctx.restore();

  ctx.restore();
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

const GLOW_RISE_SPEED = 0.025;
const GLOW_FALL_SPEED = 0.008;
const GLOW_INTERVAL_MIN = 35;
const GLOW_INTERVAL_MAX = 90;
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
    let meteors = [];
    let raf;
    let frame = 0;
    let currentParallaxX = 0;
    let prevParallaxX = 0;
    let wasWarping = false;
    let nextGlowFrame = 25;
    let nextConstellationFrame = 20;
    let nextMeteorFrame = 80;
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
      meteors = [];
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

    let activeMoonInfo = null;

    const spawnConstellation = () => {
      const maxConstellations = w < 768 ? 1 : 2;
      if (isWarpingRef.current || constellations.length >= maxConstellations) return;
      const getStarColor = () => pick(PALETTES[getTheme()]?.star || PALETTES.dark.star);
      const c = spawnRealConstellation(w, h, rand, getStarColor, constellations, activeMoonInfo);
      if (c) {
        constellations.push(c);
      }
    };

    const spawnMeteor = () => {
      if (isWarpingRef.current || meteors.length >= 2) return;
      const startX = rand(w * 0.05, w * 0.72);
      const startY = rand(h * 0.04, h * 0.22);
      const angle = rand(0.50, 0.72);
      const speed = rand(15, 23);
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: rand(90, 160),
        life: 0,
        maxLife: rand(35, 52),
        size: rand(1.6, 2.6),
      });
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      frame++;
      ctx.clearRect(0, 0, w, h);

      const theme = getTheme();
      const palette = PALETTES[theme] || PALETTES.dark;
      const isDark = theme === 'dark';

      // ── High-Visibility Multi-Tier Parallax System ──
      const targetParallaxX = prefersReducedMotion ? 0 : -activeSectionRef.current * (w * 0.85);
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.085;

      const velocity = currentParallaxX - prevParallaxX;
      prevParallaxX = currentParallaxX;
      const isMovingFast = !prefersReducedMotion && Math.abs(velocity) > 0.6;
      const stretchFactor = !prefersReducedMotion
        ? 1 + Math.min(Math.abs(velocity) * 0.038, 2.2)
        : 1;

      // ── 1. Draw the Nod-Krai Crescent Frostmoon (Columbina's Celestial Titan) ──
      if (!isWarpingRef.current) {
        ctx.globalAlpha = 1;
        const { radius: baseRadius, targetX, targetY } = getHeroMoonMetrics(w, h);

        // Orbital spatial tracking across sections
        const totalSpan = Math.max(w, w * 3.4);
        const orbitFactor = prefersReducedMotion ? 0 : currentParallaxX / totalSpan; // 0 (Home) to ~ -1.0 (Contact)

        // Orbital X parallax: moves with deep astronomical perspective
        const moonDrawX = prefersReducedMotion
          ? targetX
          : targetX + currentParallaxX * 0.075;

        // Orbital elevation: gentle celestial arch as camera revolves around the Frostmoon
        const arcElevation = prefersReducedMotion ? 0 : Math.sin(Math.abs(orbitFactor) * Math.PI) * 26;
        const moonDrawY = targetY - arcElevation;

        // Slow continuous celestial rotation + orbital perspective tilt
        const idleRotation = -0.48 + frame * 0.0004;
        const orbitTilt = prefersReducedMotion ? 0 : orbitFactor * 0.42;
        const totalRotation = idleRotation + orbitTilt;

        // Subtle depth perspective scaling as camera revolves around the moon
        const orbitScale = prefersReducedMotion ? 1 : 1 + Math.sin(Math.abs(orbitFactor) * Math.PI) * 0.05;
        const finalRadius = baseRadius * orbitScale;

        // Content-aware attenuation in project/credential sections for perfect text contrast
        const sectionDimming = activeSectionRef.current >= 2 ? 0.90 : 1.0;

        drawFrostmoon(ctx, moonDrawX, moonDrawY, finalRadius, palette, frame, isDark, totalRotation, sectionDimming);

        activeMoonInfo = { x: moonDrawX, y: moonDrawY, radius: finalRadius };
      }

      // ── Detect exit from hyperspace warp into Hero page ──
      if (wasWarping && !isWarpingRef.current) {
        nextConstellationFrame = frame + 15; // Rapid spawn within ~0.25s of entering Hero!
        nextMeteorFrame = frame + 45;
      }
      wasWarping = Boolean(isWarpingRef.current);

      // Trigger periodic blooms
      if (frame >= nextGlowFrame) {
        triggerRandomGlow();
        nextGlowFrame = frame + rand(GLOW_INTERVAL_MIN, GLOW_INTERVAL_MAX);
      }

      // Spawn constellations
      if (frame >= nextConstellationFrame && !isWarpingRef.current) {
        spawnConstellation();
        const spawnDelay = w < 768 ? rand(300, 600) : rand(200, 450);
        nextConstellationFrame = frame + spawnDelay;
      }

      // Spawn high-altitude shooting stars (meteors)
      if (frame >= nextMeteorFrame && !isWarpingRef.current) {
        spawnMeteor();
        nextMeteorFrame = frame + rand(350, 750);
      }

      // ── 2. Draw Shooting Meteors ──
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
        const speedMag = Math.hypot(m.vx, m.vy) || 1;
        const tailX = m.x - (m.vx / speedMag) * m.length;
        const tailY = m.y - (m.vy / speedMag) * m.length;

        ctx.save();
        ctx.shadowColor = `rgba(${palette.glowRgb}, 0.8)`;
        ctx.shadowBlur = 6;
        const meteorGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        meteorGrad.addColorStop(0, `rgba(${palette.glowRgb}, 0)`);
        meteorGrad.addColorStop(0.65, `rgba(${palette.glowRgb}, ${(alpha * 0.75).toFixed(3)})`);
        meteorGrad.addColorStop(1, palette.glowCore);

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = m.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── 3. Update & Draw Constellations (Tier 1 Parallax: -45vw) ──
      if (isWarpingRef.current) {
        if (constellations.length > 0) constellations = [];
      } else {
        const midShift = currentParallaxX * 0.45;

        for (let ci = constellations.length - 1; ci >= 0; ci--) {
          const c = constellations[ci];

          // Mouse proximity check
          c.isNearMouse =
            mouseX >= 0 &&
            mouseY >= 0 &&
            c.nodes.some((n) => {
              const nx = (((n.x + midShift) % w) + w) % w;
              return Math.hypot(nx - mouseX, n.y - mouseY) < 140;
            });

          // Kinetic State Machine: 'drawing' -> 'glowing' -> 'fading'
          if (c.phase === 'drawing') {
            const currentEdge = c.edges[c.activeEdgeIdx];
            if (currentEdge) {
              currentEdge.drawn += c.drawSpeed;
              if (currentEdge.drawn >= 1) {
                currentEdge.drawn = 1;
                // Node ignition shockwave
                const targetNode = c.nodes[currentEdge.to];
                if (targetNode) {
                  c.nodeFlashes.push({ x: targetNode.x, y: targetNode.y, r: 0, maxR: 26, alpha: 1 });
                }
                c.activeEdgeIdx++;
              }
            } else {
              // All edges have been traced once slowly! Transition to glowing
              c.phase = 'glowing';
              c.glowTimer = 0;
            }
          } else if (c.phase === 'glowing') {
            c.glowTimer++;
            if (c.glowTimer >= c.glowDuration) {
              c.phase = 'fading';
            }
          } else if (c.phase === 'fading') {
            c.fadeAlpha -= 0.009;
            if (c.fadeAlpha <= 0) {
              constellations.splice(ci, 1);
              continue;
            }
          }

          const masterAlpha = easeInOutQuad(Math.max(0, c.fadeAlpha));
          const glowPulse = c.phase === 'glowing'
            ? Math.sin((c.glowTimer / c.glowDuration) * Math.PI)
            : 0;

          // Draw Edges & Active Comet Head
          for (let ei = 0; ei < c.edges.length; ei++) {
            const edge = c.edges[ei];
            if (edge.drawn <= 0) continue;

            const sa = c.nodes[edge.from];
            const sb = c.nodes[edge.to];
            if (!sa || !sb) continue;

            const ax = (((sa.x + midShift) % w) + w) % w;
            const ay = sa.y;
            const bx = (((sb.x + midShift) % w) + w) % w;
            const by = sb.y;

            if (Math.abs(bx - ax) > w * 0.5) continue;

            const targetX = ax + (bx - ax) * easeInOutQuad(edge.drawn);
            const targetY = ay + (by - ay) * easeInOutQuad(edge.drawn);

            // Outer starlight filament with bloom
            ctx.save();
            ctx.shadowColor = `rgba(${palette.glowRgb}, ${(0.65 + glowPulse * 0.35).toFixed(2)})`;
            ctx.shadowBlur = 5 + glowPulse * 6;
            ctx.strokeStyle = `rgba(${palette.glowRgb}, ${(masterAlpha * (0.60 + glowPulse * 0.35 + (c.isNearMouse ? 0.25 : 0))).toFixed(3)})`;
            ctx.lineWidth = (c.isNearMouse ? 1.8 : 1.35) + glowPulse * 0.3;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.restore();

            // Crisp inner crystalline core for fully-drawn edges
            if (edge.drawn >= 0.98) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${(masterAlpha * (0.35 + glowPulse * 0.45)).toFixed(3)})`;
              ctx.lineWidth = 0.65;
              ctx.beginPath();
              ctx.moveTo(ax, ay);
              ctx.lineTo(bx, by);
              ctx.stroke();
            }

            // Leading Comet Head at the active tracing tip (ONLY during active tracing)
            if (edge.drawn < 1 && c.phase === 'drawing') {
              const headGlow = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 13);
              headGlow.addColorStop(0, '#FFFFFF');
              headGlow.addColorStop(0.35, `rgba(${palette.glowRgb}, 0.90)`);
              headGlow.addColorStop(1, `rgba(${palette.glowRgb}, 0)`);
              ctx.fillStyle = headGlow;
              ctx.beginPath();
              ctx.arc(targetX, targetY, 13, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#FFFFFF';
              drawFourPointStar(ctx, targetX, targetY, 3.8, frame * 0.08);
            }
          }

          // Draw Node Ignition Shockwaves
          for (let fi = c.nodeFlashes.length - 1; fi >= 0; fi--) {
            const fl = c.nodeFlashes[fi];
            fl.r += 1.4;
            fl.alpha = Math.max(0, 1 - fl.r / fl.maxR);
            if (fl.alpha <= 0) {
              c.nodeFlashes.splice(fi, 1);
              continue;
            }
            const flx = (((fl.x + midShift) % w) + w) % w;
            ctx.save();
            ctx.shadowColor = `rgba(${palette.glowRgb}, 0.75)`;
            ctx.shadowBlur = 5;
            ctx.strokeStyle = `rgba(${palette.glowRgb}, ${(fl.alpha * masterAlpha * 0.85).toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(flx, fl.y, fl.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // Draw Constellation Nodes (Primogem Stars)
          for (let ni = 0; ni < c.nodes.length; ni++) {
            const s = c.nodes[ni];
            const nx = (((s.x + midShift) % w) + w) % w;
            const ny = s.y;

            const nodeGlowAlpha = (masterAlpha * (0.35 + glowPulse * 0.45 + (c.isNearMouse ? 0.30 : s.isPrimary ? 0.20 : 0.05))).toFixed(3);
            const glowR = s.size * (s.isPrimary ? 5.5 : 4.4) * (1 + glowPulse * 0.35);
            const nodeGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowR);
            nodeGlow.addColorStop(0, `rgba(${palette.glowRgb}, ${nodeGlowAlpha})`);
            nodeGlow.addColorStop(1, `rgba(${palette.glowRgb}, 0)`);
            ctx.fillStyle = nodeGlow;
            ctx.beginPath();
            ctx.arc(nx, ny, glowR, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = Math.max(0.04, Math.min(1, masterAlpha * (s.isPrimary ? 1.0 : 0.90)));
            ctx.fillStyle = s.isPrimary ? palette.glowCore : s.color;
            s.rotation += s.rotationSpeed;
            drawFourPointStar(ctx, nx, ny, s.size * (s.isPrimary ? 1.25 : 1.05) * (1 + glowPulse * 0.2), s.rotation);
          }
        }
      }

      // ── 4. Interactive "Celestial Astrolabe" Cursor Resonance ──
      const wrapSpan = w + 240;
      if (!prefersReducedMotion && mouseX >= 0 && mouseY >= 0 && mouseY < h * 0.72) {
        let resonanceTargets = [];
        const maxDist = 220;
        const midShift = currentParallaxX * 0.45;

        // 1. Resonate with nearby background stars
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (!p.isStar) continue;
          const px = (((p.x + currentParallaxX * (p.depth || 0.85) + 120) % wrapSpan) + wrapSpan) % wrapSpan - 120;
          const dist = Math.hypot(px - mouseX, p.y - mouseY);
          if (dist < maxDist) {
            resonanceTargets.push({ x: px, y: p.y, dist });
          }
        }

        // 2. Resonate with nearby active constellation nodes
        for (const c of constellations) {
          for (const n of c.nodes) {
            const nx = (((n.x + midShift) % w) + w) % w;
            const dist = Math.hypot(nx - mouseX, n.y - mouseY);
            if (dist < maxDist) {
              resonanceTargets.push({ x: nx, y: n.y, dist });
            }
          }
        }

        resonanceTargets.sort((a, b) => a.dist - b.dist);
        const links = resonanceTargets.slice(0, 4);

        ctx.save();
        ctx.shadowColor = `rgba(${palette.glowRgb}, 0.65)`;
        ctx.shadowBlur = 4;
        for (const link of links) {
          const alpha = (1 - link.dist / maxDist) * (isDark ? 0.50 : 0.40);
          ctx.strokeStyle = `rgba(${palette.glowRgb}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(mouseX, mouseY);
          ctx.lineTo(link.x, link.y);
          ctx.stroke();
        }

        // Central cursor astrolabe bloom
        const curGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 14);
        curGlow.addColorStop(0, '#FFFFFF');
        curGlow.addColorStop(0.35, `rgba(${palette.glowRgb}, 0.70)`);
        curGlow.addColorStop(1, `rgba(${palette.glowRgb}, 0)`);
        ctx.fillStyle = curGlow;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Astrolabe reticle ring
        ctx.strokeStyle = `rgba(${palette.glowRgb}, 0.40)`;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 9, 0, Math.PI * 2);
        ctx.stroke();

        // Central Primogem spark
        ctx.fillStyle = palette.glowCore;
        ctx.globalAlpha = 0.95;
        drawFourPointStar(ctx, mouseX, mouseY, 3.8, frame * 0.03);
        ctx.restore();
      }

      // ── 5. Draw 3-Tier Particles (Stars, Crystalline Ice Prisms, & Cosmic Dust) ──
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
