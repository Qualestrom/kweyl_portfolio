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

// ─── Responsive Colossal Full Frostmoon Metrics (Low Lunar Orbit Scale) ──────
export function getHeroMoonMetrics(w, h) {
  const isMobile = w < 768;
  const isTablet = w >= 768 && w < 1024;

  let radius;
  let targetX;
  let targetY;

  if (isMobile) {
    radius = Math.max(155, Math.min(210, w * 0.44));
    targetX = w * 0.70;
    targetY = Math.max(140, Math.min(230, h * 0.25));
  } else if (isTablet) {
    radius = Math.max(250, Math.min(340, Math.min(w * 0.33, h * 0.38)));
    targetX = w * 0.70;
    targetY = Math.max(200, Math.min(330, h * 0.34));
  } else {
    // Desktop: Colossal planetary-scale Full Moon (820px–980px diameter) in Low Lunar Orbit
    radius = Math.max(380, Math.min(490, Math.min(w * 0.30, h * 0.48)));
    targetX = w * 0.745;
    targetY = Math.max(250, Math.min(410, h * 0.39));
  }

  return { radius, targetX, targetY };
}

// ─── Deterministic 3D Spherical Fractal Noise & HD Procedural Lunar Engine ───
const TEX_W = 2048;
const SPH_R = 440; // 880x880 native 1:1 High-Definition spherical pixel buffer
const SPH_SIZE = SPH_R * 2;
const TEX_H = SPH_SIZE; // 1:1 row-matched latitude projection (zero vertical resampling blur!)
const NOISE_W = 512;
const NOISE_H = 256;

// Fast deterministic hash for 3D lattice coordinates
function hash3(ix, iy, iz) {
  let n = (ix * 374761393 + iy * 668265263 + iz * 2147483647) | 0;
  n = (n ^ (n >> 13)) | 0;
  n = Math.imul(n, 1274126177);
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

// Quintic C2-continuous 3D value noise (eliminates cubic lattice grid seams)
function valueNoise3D(x, y, z) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
  const uz = fz * fz * fz * (fz * (fz * 6 - 15) + 10);

  const n000 = hash3(ix, iy, iz);
  const n100 = hash3(ix + 1, iy, iz);
  const n010 = hash3(ix, iy + 1, iz);
  const n110 = hash3(ix + 1, iy + 1, iz);
  const n001 = hash3(ix, iy, iz + 1);
  const n101 = hash3(ix + 1, iy, iz + 1);
  const n011 = hash3(ix, iy + 1, iz + 1);
  const n111 = hash3(ix + 1, iy + 1, iz + 1);

  const nx00 = n000 + (n100 - n000) * ux;
  const nx10 = n010 + (n110 - n010) * ux;
  const nx01 = n001 + (n101 - n001) * ux;
  const nx11 = n011 + (n111 - n011) * ux;

  const nxy0 = nx00 + (nx10 - nx00) * uy;
  const nxy1 = nx01 + (nx11 - nx01) * uy;

  return nxy0 + (nxy1 - nxy0) * uz;
}

function fbm3D(x, y, z, octaves = 5) {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    val += amp * valueNoise3D(x * freq, y * freq, z * freq);
    freq *= 2.07;
    amp *= 0.5;
  }
  return val;
}

// Canonical Lunar Maria Centers on the 3D Unit Sphere (360° coverage)
const MARIA_BASINS = [
  { lon: -0.55, lat: 0.25, rad: 0.48, depth: 0.92 }, // Oceanus Procellarum North
  { lon: -0.65, lat: -0.10, rad: 0.42, depth: 0.85 },// Oceanus Procellarum South
  { lon: -0.18, lat: 0.42, rad: 0.38, depth: 0.96 }, // Mare Imbrium
  { lon: 0.24, lat: 0.34, rad: 0.31, depth: 0.90 },  // Mare Serenitatis
  { lon: 0.45, lat: 0.08, rad: 0.35, depth: 0.88 },  // Mare Tranquillitatis
  { lon: 0.78, lat: 0.22, rad: 0.24, depth: 0.95 },  // Mare Crisium
  { lon: 0.68, lat: -0.18, rad: 0.30, depth: 0.82 }, // Mare Foecunditatis
  { lon: -0.22, lat: -0.34, rad: 0.32, depth: 0.84 },// Mare Nubium
  { lon: -0.56, lat: -0.40, rad: 0.25, depth: 0.88 },// Mare Humorum
  { lon: 0.05, lat: 0.68, rad: 0.38, depth: 0.78 },  // Mare Frigoris
  // Far-side / Orbital Nod-Krai Maria for seamless 360° rotation
  { lon: 1.40, lat: 0.20, rad: 0.44, depth: 0.92 },  // Mare Hyperboreum
  { lon: 1.85, lat: -0.22, rad: 0.38, depth: 0.86 }, // Mare Columbae
  { lon: 2.42, lat: 0.30, rad: 0.42, depth: 0.94 },  // Mare Glacialis
  { lon: 2.82, lat: -0.14, rad: 0.34, depth: 0.84 }, // Sinus Welkin
  { lon: -2.42, lat: 0.24, rad: 0.40, depth: 0.90 }, // Mare Borealis
  { lon: -1.82, lat: -0.28, rad: 0.36, depth: 0.86 },// Mare Niveus
  { lon: -1.28, lat: 0.35, rad: 0.32, depth: 0.82 }, // Mare Astralis
];

// Generate 90 realistic multi-scale impact craters on the 3D unit sphere
const PROCEDURAL_CRATERS = (() => {
  const list = [
    // Major Ray Craters (Tycho, Copernicus, Kepler, Aristarchus, Proclus, Caelestis, etc.)
    { lon: -0.18, lat: -0.62, rad: 0.085, rays: true, rayScale: 0.78, seed: 1.2 },
    { lon: -0.34, lat: 0.16, rad: 0.082, rays: true, rayScale: 0.65, seed: 2.8 },
    { lon: -0.66, lat: 0.12, rad: 0.058, rays: true, rayScale: 0.48, seed: 4.1 },
    { lon: -0.80, lat: 0.38, rad: 0.062, rays: true, rayScale: 0.52, seed: 5.5 },
    { lon: 0.58, lat: 0.26, rad: 0.060, rays: true, rayScale: 0.50, seed: 7.3 },
    { lon: 1.62, lat: -0.18, rad: 0.086, rays: true, rayScale: 0.72, seed: 9.4 },
    { lon: -2.25, lat: 0.24, rad: 0.080, rays: true, rayScale: 0.66, seed: 11.2 },
    { lon: 2.55, lat: 0.10, rad: 0.074, rays: true, rayScale: 0.58, seed: 13.6 },
  ];

  // Add 82 deterministic secondary & micro craters across all longitudes
  for (let i = 0; i < 82; i++) {
    const h1 = hash3(i * 17, 43, 99);
    const h2 = hash3(i * 31, 71, 13);
    const h3 = hash3(i * 53, 19, 61);
    const lon = (h1 * 2 - 1) * Math.PI;
    const lat = Math.asin(h2 * 1.76 - 0.88);
    const rad = 0.018 + Math.pow(h3, 2.2) * 0.068;
    list.push({ lon, lat, rad, rays: false, rayScale: 0, seed: i * 1.7 });
  }

  return list.map((c) => ({
    ...c,
    nx: Math.cos(c.lat) * Math.sin(c.lon),
    ny: Math.sin(c.lat),
    nz: Math.cos(c.lat) * Math.cos(c.lon),
  }));
})();

const BASIN_VECTORS = MARIA_BASINS.map((b) => ({
  ...b,
  nx: Math.cos(b.lat) * Math.sin(b.lon),
  ny: Math.sin(b.lat),
  nz: Math.cos(b.lat) * Math.cos(b.lon),
}));

// Cached Procedural Lunar Engine State
let lunarEngineCache = null;

// ─── Nod-Krai / Project Moongazer Dark Side Logic Architecture ─────────────
const DARK_HEX_RINGS = [0.08, 0.14, 0.22, 0.32, 0.44, 0.60];
const DARK_STATIONS = [
  { x: 0.38, y: 0.24, r: 0.08, dist: Math.hypot(0.38, 0.24) },
  { x: -0.42, y: -0.22, r: 0.09, dist: Math.hypot(-0.42, -0.22) },
  { x: 0.25, y: -0.48, r: 0.075, dist: Math.hypot(0.25, -0.48) },
  { x: -0.32, y: 0.45, r: 0.075, dist: Math.hypot(-0.32, 0.45) },
  { x: 0.62, y: -0.15, r: 0.065, dist: Math.hypot(0.62, -0.15) },
  { x: -0.60, y: 0.18, r: 0.065, dist: Math.hypot(-0.60, 0.18) },
  { x: -0.12, y: -0.65, r: 0.06, dist: Math.hypot(-0.12, -0.65) },
  { x: 0.15, y: 0.66, r: 0.06, dist: Math.hypot(0.15, 0.66) }
];

function sampleSphericalGrid(grid, uNorm, vNorm) {
  const gx = ((uNorm % 1) + 1) % 1 * NOISE_W;
  const gy = Math.max(0, Math.min(NOISE_H - 1.001, vNorm * (NOISE_H - 1)));
  const ix0 = Math.floor(gx) & (NOISE_W - 1);
  const ix1 = (ix0 + 1) & (NOISE_W - 1);
  const iy0 = Math.floor(gy);
  const iy1 = Math.min(NOISE_H - 1, iy0 + 1);
  const fx = gx - Math.floor(gx);
  const fy = gy - iy0;
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10);

  const r0 = iy0 * NOISE_W;
  const r1 = iy1 * NOISE_W;
  const v0 = grid[r0 + ix0] + (grid[r0 + ix1] - grid[r0 + ix0]) * ux;
  const v1 = grid[r1 + ix0] + (grid[r1 + ix1] - grid[r1 + ix0]) * ux;
  return v0 + (v1 - v0) * uy;
}

function getLunarEngine() {
  if (typeof document === 'undefined') return null;
  if (lunarEngineCache) return lunarEngineCache;

  // ── 1A. Precompute Smooth Quintic 3D Spherical Noise Fields (512x256) ──
  const detailGrid = new Float32Array(NOISE_W * NOISE_H);
  const microGrid = new Float32Array(NOISE_W * NOISE_H);

  for (let ny = 0; ny < NOISE_H; ny++) {
    const lat = (0.5 - (ny + 0.5) / NOISE_H) * Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const rowOff = ny * NOISE_W;

    for (let nxIdx = 0; nxIdx < NOISE_W; nxIdx++) {
      const lon = ((nxIdx / NOISE_W) * 2 - 1) * Math.PI;
      const nx = cosLat * Math.sin(lon);
      const ny3 = sinLat;
      const nz = cosLat * Math.cos(lon);

      const warpX = fbm3D(nx * 2.5 + 1.3, ny3 * 2.5, nz * 2.5, 3) * 0.26;
      const warpY = fbm3D(nx * 2.5, ny3 * 2.5 + 4.7, nz * 2.5, 3) * 0.26;
      const warpZ = fbm3D(nx * 2.5, ny3 * 2.5, nz * 2.5 + 8.1, 3) * 0.26;

      detailGrid[rowOff + nxIdx] = fbm3D((nx + warpX) * 4.8, (ny3 + warpY) * 4.8, (nz + warpZ) * 4.8, 5);
      microGrid[rowOff + nxIdx] = fbm3D(nx * 14.0, ny3 * 14.0, nz * 14.0, 3);
    }
  }

  // ── 1B. Bake 2048x880 Row-Matched High-Definition Albedo Texture ──
  const texDarkR = new Uint8Array(TEX_W * TEX_H);
  const texDarkG = new Uint8Array(TEX_W * TEX_H);
  const texDarkB = new Uint8Array(TEX_W * TEX_H);

  const texLightR = new Uint8Array(TEX_W * TEX_H);
  const texLightG = new Uint8Array(TEX_W * TEX_H);
  const texLightB = new Uint8Array(TEX_W * TEX_H);

  for (let y = 0; y < TEX_H; y++) {
    // Exact 1:1 latitude matching screen row y of the 880x880 sphere (zero vertical resampling!)
    const nySphere = Math.max(-0.9995, Math.min(0.9995, (y + 0.5 - SPH_R) / SPH_R));
    const lat = Math.asin(-nySphere);
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const vNorm = 0.5 - lat / Math.PI;
    const rowOff = y * TEX_W;

    for (let x = 0; x < TEX_W; x++) {
      const uNorm = x / TEX_W;
      const lon = (uNorm * 2 - 1) * Math.PI;
      const nx = cosLat * Math.sin(lon);
      const ny = sinLat;
      const nz = cosLat * Math.cos(lon);

      const detailNoise = sampleSphericalGrid(detailGrid, uNorm, vNorm);
      const detailEast = sampleSphericalGrid(detailGrid, uNorm + 0.0022, vNorm);
      const microNoise = sampleSphericalGrid(microGrid, uNorm, vNorm);

      // Smooth highland mountain slope shading (analytic from continuous noise gradient)
      const terrainSlope = (detailEast - detailNoise) * 6.5;

      // Evaluate 17 Maria Basins with fractal coastline warping
      let mVal = 0;
      for (let b = 0; b < BASIN_VECTORS.length; b++) {
        const basin = BASIN_VECTORS[b];
        const dot = nx * basin.nx + ny * basin.ny + nz * basin.nz;
        const angDist = Math.acos(Math.max(-1, Math.min(1, dot)));
        const warpedDist = angDist + (detailNoise - 0.5) * 0.24;
        if (warpedDist < basin.rad) {
          const t = 1 - warpedDist / basin.rad;
          const smooth = t * t * (3 - 2 * t) * basin.depth;
          if (smooth > mVal) mVal = smooth;
        }
      }

      let h = (detailNoise * 0.68 + microNoise * 0.32) * (1 - mVal * 0.62) - mVal * 0.48;
      let rGlow = 0;
      let craterSlope = 0;

      // Evaluate 90 3D Impact Craters & Feathered Ejecta Ray Plumes at full 2048x880 HD resolution
      for (let c = 0; c < PROCEDURAL_CRATERS.length; c++) {
        const cr = PROCEDURAL_CRATERS[c];
        const dot = nx * cr.nx + ny * cr.ny + nz * cr.nz;
        const maxSearch = cr.rays ? cr.rayScale : cr.rad * 1.55;
        if (dot < Math.cos(maxSearch)) continue;

        const angDist = Math.acos(Math.max(-1, Math.min(1, dot)));
        const dLon = Math.sin(lon - cr.lon) * cosLat;
        const dLat = lat - cr.lat;
        const invDist = 1 / (angDist + 0.0001);
        const dirDotSun = (dLon * 0.78 - dLat * 0.62) * invDist;

        const rimDist = angDist + (microNoise - 0.5) * cr.rad * 0.14;

        if (rimDist < cr.rad * 1.45) {
          const u = rimDist / cr.rad;
          if (u < 0.80) {
            // Smooth recessed crater bowl with directional 3D inner-wall lighting
            const bowl = u / 0.80;
            const bowlProfile = 1 - bowl * bowl;
            h -= bowlProfile * (0.24 + cr.rad * 1.2);
            craterSlope += -dirDotSun * bowl * (1 - bowl * 0.35) * 0.38;

            // Central mountain peak for larger craters
            if (cr.rad > 0.042 && u < 0.22) {
              const pk = 1 - u / 0.22;
              const pkSmooth = pk * pk * (3 - 2 * pk);
              h += pkSmooth * 0.22;
              craterSlope += dirDotSun * pkSmooth * 0.25;
              rGlow = Math.max(rGlow, pkSmooth * 0.45);
            }
          } else if (u < 1.38) {
            // Raised rugged crater rim ridge with smooth 3D directional slope
            const rimT = Math.max(0, 1 - Math.abs(u - 1.02) / 0.36);
            const rimSmooth = rimT * rimT * (3 - 2 * rimT);
            const rimIrregularity = 0.52 + 0.62 * microNoise;
            h += rimSmooth * (0.18 + cr.rad * 1.0) * rimIrregularity;
            const outerSign = u < 1.02 ? -1 : 1;
            craterSlope += outerSign * dirDotSun * rimSmooth * 0.34;
            if (cr.rays) {
              rGlow = Math.max(rGlow, rimSmooth * rimIrregularity * 0.20);
            }
          }
        }

        // Feathered Ejecta Ray Plumes for Major Ray Craters
        if (cr.rays && angDist > cr.rad * 0.72 && angDist < cr.rayScale) {
          const az = Math.atan2(dLat, dLon);
          const plume1 = Math.sin(az * 9 + cr.seed + detailNoise * 2.0);
          const plume2 = Math.cos(az * 15 - cr.seed * 1.7 + microNoise * 1.5);
          const rayStr = Math.pow(Math.max(0, plume1 * 0.6 + plume2 * 0.4), 3.0);
          const radialFade = Math.pow(1 - (angDist - cr.rad * 0.72) / (cr.rayScale - cr.rad * 0.72), 1.65);
          rGlow = Math.max(rGlow, rayStr * radialFade * 0.74);
        }
      }

      const slopeShade = Math.max(-0.40, Math.min(0.45, terrainSlope * (1 - mVal * 0.55) + craterSlope));
      let lum = 0.56 - mVal * 0.44 + h * 0.27 + slopeShade * 0.42 + rGlow * 0.44;
      lum = Math.max(0.05, Math.min(1.0, lum));

      const idx = rowOff + x;
      let dr, dg, db;
      if (lum < 0.35) {
        const t = lum / 0.35;
        dr = 13 + t * 32;
        dg = 30 + t * 54;
        db = 58 + t * 72;
      } else if (lum < 0.68) {
        const t = (lum - 0.35) / 0.33;
        dr = 45 + t * 115;
        dg = 84 + t * 122;
        db = 130 + t * 110;
      } else {
        const t = (lum - 0.68) / 0.32;
        dr = 160 + t * 95;
        dg = 206 + t * 49;
        db = 240 + t * 15;
      }

      let lr = Math.round(120 + lum * 135);
      let lg = Math.round(190 + lum * 65);
      let lb = Math.round(235 + lum * 20);

      // ── DARK SIDE OF THE FROSTMOON (Project Moongazer & Ancient Logic Core) ──
      const nzDark = -nz;
      if (nzDark > -0.18) {
        const darkBlend = Math.max(0, Math.min(1, (nzDark + 0.18) / 0.36));
        const lonDark = lon > 0 ? lon - Math.PI : lon + Math.PI;
        const xTan = Math.sin(lonDark) * cosLat;
        const yTan = sinLat;
        const rTan = Math.sqrt(xTan * xTan + yTan * yTan);
        const phiTan = Math.atan2(yTan, xTan);

        // 1. High-Relief Obsidian & Abyssal Basalt Crust (Genshin impact craters & 3D topography)
        // High-contrast terrain slope and crater rim highlights/shadows
        const sunRelief = craterSlope * 1.8 + terrainSlope * 0.9;
        const sunHighlight = Math.max(0, sunRelief);
        const shadowOcclusion = Math.max(0, -sunRelief);
        
        // Base crust: Rich volcanic basalt with slate-indigo plateaus and illuminated crater crests
        const baseElevation = Math.max(0, Math.min(1, 0.30 + h * 0.50 - mVal * 0.30));
        let crustR = Math.round(6 + baseElevation * 28 + sunHighlight * 65 - shadowOcclusion * 8);
        let crustG = Math.round(12 + baseElevation * 42 + sunHighlight * 95 - shadowOcclusion * 12);
        let crustB = Math.round(24 + baseElevation * 68 + sunHighlight * 145 - shadowOcclusion * 20);

        // 2. Branching Cryo-Lithospheric Fissures (Genshin celestial fracture veins)
        // Two-frequency ridged multi-fractal noise along the sphere
        const crackNoise1 = 1.0 - Math.abs(fbm3D(nx * 7.5 + 3.1, ny * 7.5 + 1.8, (nzDark + 1.1) * 7.5, 4) * 2 - 1);
        const crackNoise2 = 1.0 - Math.abs(fbm3D(nx * 18.0 + 7.3, ny * 18.0 + 4.9, (nzDark + 1.1) * 18.0, 3) * 2 - 1);
        const combinedCrack = crackNoise1 * 0.70 + crackNoise2 * 0.30;
        
        let fissureGlow = 0;
        let fissureCore = 0;
        if (combinedCrack > 0.67 && rTan < 0.92) {
          const uCrack = (combinedCrack - 0.67) / 0.33;
          fissureGlow = Math.pow(uCrack, 2.2);
          if (uCrack > 0.58) {
            fissureCore = Math.pow((uCrack - 0.58) / 0.42, 1.8);
          }
          // Chasm shadow along fissure borders
          const chasmShadow = Math.min(1.0, fissureGlow * 0.5);
          crustR = Math.round(crustR * (1 - chasmShadow * 0.4));
          crustG = Math.round(crustG * (1 - chasmShadow * 0.4));
          crustB = Math.round(crustB * (1 - chasmShadow * 0.4));
        }

        // 3. 3D Embossed Concentric Hexagonal Logic Matrix (6-fold cyclopean trenches)
        const normAngle = ((phiTan % (Math.PI / 3)) + (Math.PI / 3)) % (Math.PI / 3);
        const hexCos = Math.cos(normAngle - Math.PI / 6);
        const rHex = rTan * hexCos;
        
        let hexBevelHighlight = 0;
        let hexBevelShadow = 0;
        let hexCoreGlow = 0;
        const HEX_TRENCH_W = 0.0075;
        for (let rhIdx = 0; rhIdx < DARK_HEX_RINGS.length; rhIdx++) {
          const rh = DARK_HEX_RINGS[rhIdx];
          const distToRim = rHex - rh;
          const absDist = Math.abs(distToRim);
          if (absDist < HEX_TRENCH_W) {
            if (distToRim > 0.0012) {
              const u = (distToRim - 0.0012) / (HEX_TRENCH_W - 0.0012);
              if (u > hexBevelHighlight) hexBevelHighlight = u;
            } else if (distToRim < -0.0012) {
              const u = (-distToRim - 0.0012) / (HEX_TRENCH_W - 0.0012);
              if (u > hexBevelShadow) hexBevelShadow = u;
            }
            if (absDist < 0.0030) {
              const g = 1 - absDist / 0.0030;
              if (g > hexCoreGlow) hexCoreGlow = g;
            }
          }
        }

        // 4. Primary 3D Radial Data Highways (12 spokes with beveled rails)
        const normAngle12 = ((phiTan % (Math.PI / 6)) + (Math.PI / 6)) % (Math.PI / 6);
        const spokeDelta = normAngle12 - Math.PI / 12;
        const absSpoke = Math.abs(spokeDelta);
        let spokeBevelHighlight = 0;
        let spokeBevelShadow = 0;
        let spokeCoreGlow = 0;
        if (absSpoke < 0.0090 && rTan > 0.045 && rTan < 0.78) {
          const falloff = 1 - (rTan - 0.045) / 0.76;
          if (spokeDelta > 0.0018) {
            spokeBevelHighlight = ((spokeDelta - 0.0018) / 0.0072) * falloff;
          } else if (spokeDelta < -0.0018) {
            spokeBevelShadow = ((-spokeDelta - 0.0018) / 0.0072) * falloff;
          }
          if (absSpoke < 0.0035) {
            spokeCoreGlow = (1 - absSpoke / 0.0035) * falloff;
          }
        }

        // 5. Planetary Facility Craters & Calderas (8 Moongazer stations with stepped terraces)
        let stationHighlight = 0;
        let stationShadow = 0;
        let stationBeacon = 0;
        let conduitGlow = 0;
        for (let si = 0; si < DARK_STATIONS.length; si++) {
          const st = DARK_STATIONS[si];
          const d = Math.hypot(xTan - st.x, yTan - st.y);
          if (d < st.r * 1.8) {
            const rimDist = Math.abs(d - st.r);
            if (rimDist < 0.008) {
              const g = 1 - rimDist / 0.008;
              if (xTan > st.x) stationHighlight = Math.max(stationHighlight, g);
              else stationShadow = Math.max(stationShadow, g * 0.8);
            }
            if (d < st.r * 0.75) {
              stationShadow = Math.max(stationShadow, 0.45); // Recessed crater caldera
            }
            if (d < 0.016) {
              stationBeacon = Math.max(stationBeacon, (1 - d / 0.016) * 1.5); // Central logic spire
            }
          }
          const stDist = st.dist;
          const proj = (xTan * st.x + yTan * st.y) / (stDist * stDist);
          if (proj > 0.07 && proj < 1.05) {
            const px = proj * st.x;
            const py = proj * st.y;
            const lineDist = Math.hypot(xTan - px, yTan - py);
            if (lineDist < 0.0042) {
              const cg = 1 - lineDist / 0.0042;
              if (cg > conduitGlow) conduitGlow = cg;
            }
          }
        }

        // 6. Spherical Logic Latitude and Longitude Graticule Bus
        const lonDeg = Math.abs(Math.atan2(xTan, nzDark) * (180 / Math.PI));
        const latDeg = Math.abs(lat * (180 / Math.PI));
        const lonMod = lonDeg % 30;
        const latMod = latDeg % 30;
        const dLon = Math.min(lonMod, 30 - lonMod);
        const dLat = Math.min(latMod, 30 - latMod);
        let busGlow = 0;
        if ((dLon < 0.35 || dLat < 0.35) && rTan > 0.20 && rTan < 0.88) {
          busGlow = 0.50;
        }
        if (dLon < 0.8 && dLat < 0.8 && rTan > 0.20 && rTan < 0.88) {
          busGlow = 0.85;
        }

        // 7. Central Logic Singularity Core
        const coreGlow = Math.exp(-Math.pow(rTan / 0.052, 2));

        // ── Synthesize 3D Layered Crust & Megastructure Colors ──
        // Apply directional bevel shadows (deep grooves)
        const totalShadow = Math.min(0.85, hexBevelShadow * 0.7 + spokeBevelShadow * 0.65 + stationShadow * 0.6);
        crustR = Math.round(crustR * (1 - totalShadow));
        crustG = Math.round(crustG * (1 - totalShadow));
        crustB = Math.round(crustB * (1 - totalShadow));

        // Apply directional bevel highlights (metallic/crystalline sunward rims)
        const totalHighlight = Math.min(1.0, hexBevelHighlight * 0.85 + spokeBevelHighlight * 0.8 + stationHighlight * 0.75);
        crustR = Math.round(crustR + totalHighlight * 75);
        crustG = Math.round(crustG + totalHighlight * 125);
        crustB = Math.round(crustB + totalHighlight * 185);

        // Emissive Energy Channels (Superconductor cores, conduits, beacon towers, fissures)
        const totalCyanEnergy = Math.min(1.0,
          hexCoreGlow * 1.1 +
          spokeCoreGlow * 0.95 +
          conduitGlow * 0.90 +
          busGlow * 0.60 +
          fissureGlow * 0.85 +
          stationBeacon * 0.90
        );

        let finalDarkR = crustR;
        let finalDarkG = crustG;
        let finalDarkB = crustB;

        let finalLightR = Math.round(20 + crustR * 0.35);
        let finalLightG = Math.round(35 + crustG * 0.45);
        let finalLightB = Math.round(55 + crustB * 0.55);

        if (totalCyanEnergy > 0) {
          finalDarkR = Math.round(finalDarkR * (1 - totalCyanEnergy) + 14 * totalCyanEnergy);
          finalDarkG = Math.round(finalDarkG * (1 - totalCyanEnergy) + 225 * totalCyanEnergy);
          finalDarkB = Math.round(finalDarkB * (1 - totalCyanEnergy) + 255 * totalCyanEnergy);

          finalLightR = Math.round(finalLightR * (1 - totalCyanEnergy) + 2 * totalCyanEnergy);
          finalLightG = Math.round(finalLightG * (1 - totalCyanEnergy) + 132 * totalCyanEnergy);
          finalLightB = Math.round(finalLightB * (1 - totalCyanEnergy) + 199 * totalCyanEnergy);
        }

        // White-hot energy core (fissure cores, singularity core, beacon spires)
        const totalWhiteCore = Math.min(1.0, coreGlow * 1.8 + fissureCore * 1.2 + stationBeacon * 0.85);
        if (totalWhiteCore > 0.12) {
          const wf = (totalWhiteCore - 0.12) / 0.88;
          finalDarkR = Math.round(finalDarkR * (1 - wf) + 245 * wf);
          finalDarkG = Math.round(finalDarkG * (1 - wf) + 252 * wf);
          finalDarkB = Math.round(finalDarkB * (1 - wf) + 255 * wf);

          finalLightR = Math.round(finalLightR * (1 - wf) + 186 * wf);
          finalLightG = Math.round(finalLightG * (1 - wf) + 230 * wf);
          finalLightB = Math.round(finalLightB * (1 - wf) + 253 * wf);
        }

        // Smooth boundary blending between Light Side and Dark Side
        dr = Math.round(dr * (1 - darkBlend) + finalDarkR * darkBlend);
        dg = Math.round(dg * (1 - darkBlend) + finalDarkG * darkBlend);
        db = Math.round(db * (1 - darkBlend) + finalDarkB * darkBlend);

        lr = Math.round(lr * (1 - darkBlend) + finalLightR * darkBlend);
        lg = Math.round(lg * (1 - darkBlend) + finalLightG * darkBlend);
        lb = Math.round(lb * (1 - darkBlend) + finalLightB * darkBlend);
      }

      texDarkR[idx] = dr;
      texDarkG[idx] = dg;
      texDarkB[idx] = db;

      texLightR[idx] = lr;
      texLightG[idx] = lg;
      texLightB[idx] = lb;
    }
  }

  // ── 2. Pre-Compute 880x880 1:1 Spherical LUT with Sub-Texel Bilinear Precision ──
  const axialTilt = -0.18;
  const cosTilt = Math.cos(axialTilt);
  const sinTilt = Math.sin(axialTilt);

  const activePixels = [];
  for (let py = 0; py < SPH_SIZE; py++) {
    const nyLocal = (py + 0.5 - SPH_R) / SPH_R;
    const rowOff = py * TEX_W;

    for (let px = 0; px < SPH_SIZE; px++) {
      const nxLocal = (px + 0.5 - SPH_R) / SPH_R;
      const rSq = nxLocal * nxLocal + nyLocal * nyLocal;
      if (rSq > 1.0) continue;

      const rDist = Math.sqrt(rSq);
      const nzLocal = Math.sqrt(Math.max(0, 1.0 - rSq));

      const lon = Math.atan2(nxLocal, nzLocal); // [-PI, PI]
      const uFloat = (((lon / (Math.PI * 2)) + 0.5) * TEX_W + TEX_W) % TEX_W;

      // Convert local rotated coordinates back to screen space for consistent directional lighting
      const nxScreen = nxLocal * cosTilt - nyLocal * sinTilt;
      const nyScreen = nxLocal * sinTilt + nyLocal * cosTilt;

      const sunDot = nxScreen * 0.46 - nyScreen * 0.22 + nzLocal * 0.86;
      const leftTwilight = Math.max(0.36, Math.min(1.0, (nxScreen + 1.05) / 1.15));
      const shade = Math.max(0.30, Math.min(1.12, (0.38 + Math.max(0, sunDot) * 0.72) * leftTwilight));

      // 360° Fresnel Atmospheric Rim Glow + Smooth 2.5px Anti-Aliased Edge
      const fresnel = Math.pow(rDist, 3.6) * (0.26 + 0.34 * leftTwilight);
      const edgeAA = rDist > 0.992 ? Math.max(0, (1.0 - rDist) / 0.008) : 1.0;

      activePixels.push({
        pixIdx: py * SPH_SIZE + px,
        rowOff,
        uFixed: Math.round(uFloat * 256),
        shade: Math.round(shade * 256),
        fresnel: Math.round(fresnel * 255),
        alpha: Math.round(edgeAA * 255),
      });
    }
  }

  const count = activePixels.length;
  const lutPixIdx = new Uint32Array(count);
  const lutRowOff = new Uint32Array(count);
  const lutUFixed = new Uint32Array(count);
  const lutShade = new Uint16Array(count);
  const lutFresnel = new Uint8Array(count);
  const lutAlpha = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    const p = activePixels[i];
    lutPixIdx[i] = p.pixIdx;
    lutRowOff[i] = p.rowOff;
    lutUFixed[i] = p.uFixed;
    lutShade[i] = p.shade;
    lutFresnel[i] = p.fresnel;
    lutAlpha[i] = p.alpha;
  }

  const sphereCanvas = document.createElement('canvas');
  sphereCanvas.width = SPH_SIZE;
  sphereCanvas.height = SPH_SIZE;
  const sphereCtx = sphereCanvas.getContext('2d');
  const imgData = sphereCtx.createImageData(SPH_SIZE, SPH_SIZE);
  const out32 = new Uint32Array(imgData.data.buffer);

  lunarEngineCache = {
    count,
    axialTilt,
    lutPixIdx,
    lutRowOff,
    lutUFixed,
    lutShade,
    lutFresnel,
    lutAlpha,
    texDarkR,
    texDarkG,
    texDarkB,
    texLightR,
    texLightG,
    texLightB,
    sphereCanvas,
    sphereCtx,
    imgData,
    out32,
    lastUShiftFixed: -1,
    lastThemeDark: null,
  };
  return lunarEngineCache;
}

// ─── Colossal 3D-Rotating Genshin Impact Full Frostmoon ─────────────────────
export function drawFrostmoon(
  ctx,
  x,
  y,
  radius,
  palette,
  frame,
  isDark,
  rotation = 0,
  opacity = 1
) {
  if (radius <= 2) return;
  const engine = getLunarEngine();
  if (!engine) return;

  ctx.save();
  const buoyY = y + Math.sin(frame * 0.014) * 3.0;
  const R = radius;
  const scale = R / 400;

  ctx.translate(x, buoyY);
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

  // ── 1. Solid Deep-Space Planetary Occlusion Disc (ensures 0% star bleed-through) ──
  ctx.fillStyle = isDark ? '#040917' : '#E2E8F0';
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.996, 0, Math.PI * 2);
  ctx.fill();

  // ── 2. Multi-Layered Deep-Space Atmospheric Corona ──
  // The Moon is tidally locked: Light Side in viewer mode, Dark Side in admin mode, 180° rotation on transition
  const libration = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 0
    : Math.sin(frame * 0.0006) * 0.025;
  const rotLon = rotation + libration;
  const darkFacing = Math.max(0, -Math.cos(rotLon));

  const coronaR = R * 1.52;
  const coronaGrad = ctx.createRadialGradient(0, 0, R * 0.94, 0, 0, coronaR);
  if (isDark) {
    coronaGrad.addColorStop(0, 'rgba(186, 230, 253, 0.36)');
    coronaGrad.addColorStop(0.15, 'rgba(125, 211, 252, 0.20)');
    coronaGrad.addColorStop(0.42, 'rgba(56, 189, 248, 0.08)');
    coronaGrad.addColorStop(0.75, 'rgba(14, 116, 144, 0.025)');
    coronaGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  } else {
    coronaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.24)');
    coronaGrad.addColorStop(0.25, 'rgba(2, 132, 199, 0.10)');
    coronaGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');
  }
  ctx.fillStyle = coronaGrad;
  ctx.beginPath();
  ctx.arc(0, 0, coronaR, 0, Math.PI * 2);
  ctx.fill();

  // Dark Side Inverted Eclipse Corona
  if (darkFacing > 0.08) {
    const eclipseGrad = ctx.createRadialGradient(0, 0, R * 0.95, 0, 0, R * 1.68);
    eclipseGrad.addColorStop(0, `rgba(0, 240, 255, ${(0.42 * darkFacing).toFixed(3)})`);
    eclipseGrad.addColorStop(0.18, `rgba(56, 189, 248, ${(0.22 * darkFacing).toFixed(3)})`);
    eclipseGrad.addColorStop(0.48, `rgba(14, 116, 144, ${(0.07 * darkFacing).toFixed(3)})`);
    eclipseGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = eclipseGrad;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.68, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── 3. Update & Blit 880x880 HD 3D Rotating Spherical Lunar Texture ──
  const maxFixed = TEX_W * 256;
  const uShiftFixed = ((Math.round((rotLon / (Math.PI * 2)) * maxFixed) % maxFixed) + maxFixed) % maxFixed;

  // Rate-limit the heavy 608k CPU pixel projection loop to 30 FPS or when theme changes (halves CPU load with 0 visual loss)
  const shouldUpdateTexture =
    (frame % 2 === 0 && uShiftFixed !== engine.lastUShiftFixed) ||
    isDark !== engine.lastThemeDark;

  if (shouldUpdateTexture) {
    engine.lastUShiftFixed = uShiftFixed;
    engine.lastThemeDark = isDark;

    const {
      count,
      lutPixIdx,
      lutRowOff,
      lutUFixed,
      lutShade,
      lutFresnel,
      lutAlpha,
      out32,
    } = engine;

    const tR = isDark ? engine.texDarkR : engine.texLightR;
    const tG = isDark ? engine.texDarkG : engine.texLightG;
    const tB = isDark ? engine.texDarkB : engine.texLightB;
    const mask = TEX_W - 1;

    for (let i = 0; i < count; i++) {
      const uPos = lutUFixed[i] + uShiftFixed;
      const u0 = (uPos >> 8) & mask;
      const u1 = (u0 + 1) & mask;
      const frac = uPos & 255;
      const invFrac = 256 - frac;

      const row = lutRowOff[i];
      const idx0 = row + u0;
      const idx1 = row + u1;

      const tr = (tR[idx0] * invFrac + tR[idx1] * frac) >> 8;
      const tg = (tG[idx0] * invFrac + tG[idx1] * frac) >> 8;
      const tb = (tB[idx0] * invFrac + tB[idx1] * frac) >> 8;

      const sh = lutShade[i];
      const fr = lutFresnel[i];

      let r = ((tr * sh) >> 8) + ((fr * 225) >> 8);
      let g = ((tg * sh) >> 8) + ((fr * 244) >> 8);
      let b = ((tb * sh) >> 8) + fr;

      if (r > 255) r = 255;
      if (g > 255) g = 255;
      if (b > 255) b = 255;

      out32[lutPixIdx[i]] = (lutAlpha[i] << 24) | (b << 16) | (g << 8) | r;
    }

    engine.sphereCtx.putImageData(engine.imgData, 0, 0);
  }

  ctx.save();
  ctx.rotate(engine.axialTilt);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(engine.sphereCanvas, -R, -R, R * 2, R * 2);
  ctx.restore();

  // ── Dynamic Dark Side Overlays (Archeolunar Radar & Core Shockwave) ──
  if (darkFacing > 0.12) {
    const radarAngle = frame * 0.022;
    const radarR = R * 1.05;
    ctx.save();
    ctx.rotate(radarAngle);
    const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radarR);
    sweepGrad.addColorStop(0, `rgba(0, 240, 255, ${(0.32 * darkFacing).toFixed(3)})`);
    sweepGrad.addColorStop(0.65, `rgba(56, 189, 248, ${(0.14 * darkFacing).toFixed(3)})`);
    sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radarR, -0.42, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(224, 242, 254, ${(0.82 * darkFacing).toFixed(3)})`;
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radarR, 0);
    ctx.stroke();
    ctx.restore();

    // Archeolunar Concentric Shockwave Pulse
    const pulseProgress = (frame % 150) / 150;
    const pulseR = R * pulseProgress * 1.12;
    const pulseAlpha = Math.sin(pulseProgress * Math.PI) * 0.45 * darkFacing;
    ctx.save();
    ctx.strokeStyle = isDark
      ? `rgba(56, 189, 248, ${pulseAlpha.toFixed(3)})`
      : `rgba(2, 132, 199, ${pulseAlpha.toFixed(3)})`;
    ctx.lineWidth = Math.max(1, 1.8 * scale);
    ctx.beginPath();
    ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── 3. Crisp 360° Full-Moon Specular Atmospheric Rim ──
  ctx.save();
  // Multi-pass layered limb glow (0ms blur rasterization cost!)
  ctx.strokeStyle = isDark ? 'rgba(125, 211, 252, 0.28)' : 'rgba(2, 132, 199, 0.18)';
  ctx.lineWidth = Math.max(2.5, 4.5 * scale);
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = isDark ? 'rgba(224, 242, 254, 0.86)' : 'rgba(2, 132, 199, 0.55)';
  ctx.lineWidth = Math.max(1.1, 1.6 * scale);
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── 4. Sacred Genshin "Song of the Welkin Moon" Celestial Astrolabe Wheel ──
  const wheelRot = -frame * 0.00045 + rotation * 0.32;
  ctx.save();
  ctx.rotate(wheelRot);

  // Inner Orbital Track (1.10R)
  const ring1R = R * 1.10;
  ctx.strokeStyle = isDark ? 'rgba(125, 211, 252, 0.16)' : 'rgba(2, 132, 199, 0.12)';
  ctx.lineWidth = Math.max(0.6, 0.95 * scale);
  ctx.beginPath();
  ctx.arc(0, 0, ring1R, 0, Math.PI * 2);
  ctx.stroke();

  // Primary Astrolabe Wheel (1.21R) with 48 Celestial Graduations
  const ring2R = R * 1.21;
  ctx.strokeStyle = isDark ? 'rgba(186, 230, 253, 0.25)' : 'rgba(2, 132, 199, 0.16)';
  ctx.lineWidth = Math.max(0.75, 1.15 * scale);
  ctx.beginPath();
  ctx.arc(0, 0, ring2R, 0, Math.PI * 2);
  ctx.stroke();

  for (let k = 0; k < 48; k++) {
    const ang = (k * Math.PI) / 24;
    const isCardinal = k % 12 === 0;
    const isMajor = k % 4 === 0;
    const tickLen = (isCardinal ? 13 : isMajor ? 7.5 : 3.8) * scale;
    const rIn = ring2R - tickLen * 0.5;
    const rOut = ring2R + tickLen * 0.5;

    ctx.strokeStyle = isDark
      ? isCardinal
        ? 'rgba(255, 255, 255, 0.50)'
        : isMajor
          ? 'rgba(186, 230, 253, 0.30)'
          : 'rgba(125, 211, 252, 0.15)'
      : isCardinal
        ? 'rgba(2, 132, 199, 0.38)'
        : 'rgba(2, 132, 199, 0.16)';
    ctx.lineWidth = Math.max(0.5, (isCardinal ? 1.2 : isMajor ? 0.85 : 0.55) * scale);
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * rIn, Math.sin(ang) * rIn);
    ctx.lineTo(Math.cos(ang) * rOut, Math.sin(ang) * rOut);
    ctx.stroke();
  }

  // Outer Dashed Resonance Track (1.32R)
  const ring3R = R * 1.32;
  ctx.save();
  ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.11)' : 'rgba(2, 132, 199, 0.08)';
  ctx.lineWidth = Math.max(0.6, 0.85 * scale);
  ctx.setLineDash([Math.max(3, 6 * scale), Math.max(5, 10 * scale)]);
  ctx.beginPath();
  ctx.arc(0, 0, ring3R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 8 Orbital Primogem Nodes on the Astrolabe Rings
  for (let si = 0; si < 8; si++) {
    const ang = (si * Math.PI) / 4;
    const targetRing = si % 2 === 0 ? ring2R : ring1R;
    const sx = Math.cos(ang) * targetRing;
    const sy = Math.sin(ang) * targetRing;
    const sparkPulse = 0.45 + 0.35 * Math.sin(frame * 0.032 + si * 0.9);
    const starSize = Math.max(1.6, (si % 2 === 0 ? 4.0 : 2.6) * scale);

    ctx.save();
    ctx.fillStyle = isDark ? '#FFFFFF' : '#0284C7';
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity * sparkPulse));
    drawFourPointStar(ctx, sx, sy, starSize, frame * 0.02 + si * (Math.PI / 8));
    ctx.restore();
  }

  // Hexadecimal Logic Dials on Astrolabe (Dark Side Logic Mode)
  const HEX_DIALS = ['0x00', '0x15', '0x2A', '0x3F', '0x54', '0x69', '0x7E', '0x93', '0xA8', '0xBD', '0xD2', '0xE7'];
  if (darkFacing > 0.22) {
    ctx.save();
    ctx.font = `bold ${Math.max(7, Math.round(8.5 * scale))}px "JetBrains Mono", monospace`;
    ctx.fillStyle = isDark
      ? `rgba(56, 189, 248, ${(0.78 * darkFacing).toFixed(3)})`
      : `rgba(2, 132, 199, ${(0.78 * darkFacing).toFixed(3)})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let hx = 0; hx < 12; hx++) {
      const hxAng = (hx * Math.PI) / 6;
      const hxR = ring2R + 13 * scale;
      ctx.save();
      ctx.translate(Math.cos(hxAng) * hxR, Math.sin(hxAng) * hxR);
      ctx.rotate(hxAng + Math.PI / 2);
      ctx.fillText(HEX_DIALS[hx], 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  ctx.restore(); // Restore wheelRot
  ctx.restore(); // Restore main moon transform
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const GLOW_RISE_SPEED = 0.025;
const GLOW_FALL_SPEED = 0.008;
const GLOW_INTERVAL_MIN = 35;
const GLOW_INTERVAL_MAX = 90;
const MAX_SIMULTANEOUS_GLOWS = 6;

export default function StellarBackground({
  isWarping = false,
  loaderExited = true,
  activeSection = 0,
  isAdminRoute = false,
  isAccessingMainframe = false,
  mainframeProgress = 0,
  isReturning = false,
  returnProgress = 0,
}) {
  const canvasRef = useRef(null);
  const isWarpingRef = useRef(isWarping);
  const loaderExitedRef = useRef(loaderExited);
  const activeSectionRef = useRef(activeSection);
  const isAdminRouteRef = useRef(isAdminRoute);
  const isAccessingMainframeRef = useRef(isAccessingMainframe);
  const mainframeProgressRef = useRef(mainframeProgress);
  const isReturningRef = useRef(isReturning);
  const returnProgressRef = useRef(returnProgress);
  const warpStartTimeRef = useRef(0);

  useEffect(() => {
    isAdminRouteRef.current = isAdminRoute;
  }, [isAdminRoute]);

  useEffect(() => {
    isAccessingMainframeRef.current = isAccessingMainframe;
  }, [isAccessingMainframe]);

  useEffect(() => {
    mainframeProgressRef.current = mainframeProgress;
  }, [mainframeProgress]);

  useEffect(() => {
    isReturningRef.current = isReturning;
  }, [isReturning]);

  useEffect(() => {
    returnProgressRef.current = returnProgress;
  }, [returnProgress]);

  useEffect(() => {
    if (isWarping && !isWarpingRef.current) {
      warpStartTimeRef.current = performance.now();
    }
    isWarpingRef.current = isWarping;
  }, [isWarping]);

  useEffect(() => {
    loaderExitedRef.current = loaderExited;
  }, [loaderExited]);

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
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

      // ── 1. Compute Colossal 3D Full Frostmoon Coordinates (Distant Beacon -> Warp Approach -> Orbital Flight) ──
      const { radius: targetRadius, targetX, targetY } = getHeroMoonMetrics(w, h);
      const distantRadius = Math.max(26, Math.min(38, w * 0.025));
      const distantX = w * 0.58;
      const distantY = h * 0.16;

      let moonX, moonY, moonRadius, moonOrbitLongitude, moonSectionDimming;

      const onAdmin = isAdminRouteRef.current || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));
      const isAccessing = isAccessingMainframeRef.current;
      const accessProgress = mainframeProgressRef.current || 0;
      const isRet = isReturningRef.current;
      const retProg = returnProgressRef.current || 0;

      // Base public portfolio coordinates
      const totalSpan = Math.max(w, w * 3.4);
      const orbitFactor = prefersReducedMotion ? 0 : currentParallaxX / totalSpan;
      
      // On Section 4 (Contact), smoothly move the moon further to the left per user directive
      const contactShiftT = prefersReducedMotion ? 0 : Math.max(0, Math.min(1, (-currentParallaxX / (w * 0.85) - 2.8) / 1.2));
      const contactExtraShiftX = -w * 0.62 * contactShiftT;

      const moonDrawX = prefersReducedMotion
        ? targetX
        : targetX + currentParallaxX * 0.095 + contactExtraShiftX;
      const arcElevation = prefersReducedMotion ? 0 : Math.sin(Math.abs(orbitFactor) * Math.PI) * 38;
      const moonDrawY = targetY - arcElevation;
      const orbitLongitude = prefersReducedMotion ? 0 : orbitFactor * 0.35; // Subtle section libration (Light Side only)
      const orbitScale = prefersReducedMotion ? 1 : 1 + Math.sin(Math.abs(orbitFactor) * Math.PI) * 0.06;
      const finalRadius = targetRadius * orbitScale;

      // Admin background canopy coordinates (upper-right sky, clears center card on desktop and mobile)
      const isMobile = w < 768;
      const adminRadius = isMobile
        ? Math.max(54, Math.min(70, w * 0.15))
        : Math.max(80, Math.min(130, Math.min(w * 0.09, h * 0.15)));
      const adminX = isMobile
        ? w - adminRadius - 18
        : Math.max(w * 0.86, w - adminRadius - 32);
      const adminY = isMobile
        ? adminRadius + 18
        : Math.max(adminRadius + 24, h * 0.18);

      // Colossal Close-Up Viewport Center Coordinates (moving directly in front of the Moon)
      const flyCenterX = w * 0.50;
      const flyCenterY = Math.max(160, Math.min(h * 0.44, h - 220));
      const flyRadius = Math.max(finalRadius * 1.30, Math.min(w * 0.40, h * 0.44));

      if (isAccessing) {
        // STATE TRANSITION: Accessing Mainframe — Dramatic 3-stage orbital approach right in front of Dark Side
        // Stage 1 (0.00 -> 0.62): Fly directly in front of the colossal Moon as it rotates 180° into Dark Side
        // Stage 2 (0.62 -> 0.80): Hover in front of the colossal Dark Side Logic Core while telemetry locks on
        // Stage 3 (0.80 -> 1.00): Smoothly glide and dock into admin canopy position
        if (accessProgress <= 0.62) {
          const t1 = accessProgress / 0.62;
          const u1 = easeInOutCubic(t1);
          moonX = moonDrawX + (flyCenterX - moonDrawX) * u1;
          moonY = moonDrawY + (flyCenterY - moonDrawY) * u1;
          moonRadius = finalRadius + (flyRadius - finalRadius) * u1;
          moonOrbitLongitude = orbitLongitude + u1 * Math.PI; // 180° spin right in front of camera!
          moonSectionDimming = 1.0;
        } else if (accessProgress <= 0.80) {
          // Hover directly in front of the Dark Side logic core
          moonX = flyCenterX;
          moonY = flyCenterY;
          moonRadius = flyRadius;
          moonOrbitLongitude = orbitLongitude + Math.PI; // Locked onto Dark Side
          moonSectionDimming = 1.0;
        } else {
          // Smooth docking into admin layout
          const t3 = (accessProgress - 0.80) / 0.20;
          const u3 = easeInOutQuad(t3);
          moonX = flyCenterX + (adminX - flyCenterX) * u3;
          moonY = flyCenterY + (adminY - flyCenterY) * u3;
          moonRadius = flyRadius + (adminRadius - flyRadius) * u3;
          moonOrbitLongitude = orbitLongitude + Math.PI; // Locked onto Dark Side
          moonSectionDimming = 1.0 - u3 * 0.12;
        }
      } else if (isRet) {
        // STATE RETURN: Returning to Public Portfolio — Reverse orbital departure
        // Stage 1 (0.00 -> 0.42): Undock from admin canopy back to center in front of Dark Side
        // Stage 2 (0.42 -> 1.00): Rotate 180° back to Light Side and pull back to Hero orbit
        if (retProg <= 0.42) {
          const t1 = retProg / 0.42;
          const u1 = easeInOutQuad(t1);
          moonX = adminX + (flyCenterX - adminX) * u1;
          moonY = adminY + (flyCenterY - adminY) * u1;
          moonRadius = adminRadius + (flyRadius - adminRadius) * u1;
          moonOrbitLongitude = Math.PI; // Still Dark Side during undocking
          moonSectionDimming = 0.88 + u1 * 0.12;
        } else {
          const t2 = (retProg - 0.42) / 0.58;
          const u2 = easeInOutCubic(t2);
          moonX = flyCenterX + (targetX - flyCenterX) * u2;
          moonY = flyCenterY + (targetY - flyCenterY) * u2;
          moonRadius = flyRadius + (targetRadius - flyRadius) * u2;
          moonOrbitLongitude = Math.PI - u2 * Math.PI; // Rotates 180° back from Dark Side to Light Side!
          moonSectionDimming = 1.0;
        }
      } else if (onAdmin) {
        // STATE ADMIN: Permanently locked on Dark Side of the Frostmoon!
        moonX = adminX;
        moonY = adminY;
        moonRadius = adminRadius;
        moonOrbitLongitude = Math.PI; // 180° -> Pure Dark Side of the Frostmoon!
        moonSectionDimming = 0.88;
      } else if (!loaderExitedRef.current && !isWarpingRef.current) {
        // STATE A: Initial loading screen — Moon is a distant beacon in deep space
        moonX = distantX;
        moonY = distantY;
        moonRadius = distantRadius;
        moonOrbitLongitude = 0; // Pure Light Side!
        moonSectionDimming = 1.0;
      } else if (isWarpingRef.current) {
        // STATE B: Hyperspace warp in flight — Moon smoothly approaches from distant beacon to Hero orbit
        const WARP_DURATION_MS = 1520;
        const elapsed = warpStartTimeRef.current > 0 ? performance.now() - warpStartTimeRef.current : 0;
        const warpProgress = Math.min(1, Math.max(0, elapsed / WARP_DURATION_MS));
        const approachT = easeInOutQuad(warpProgress);

        moonX = distantX + (targetX - distantX) * approachT;
        moonY = distantY + (targetY - distantY) * approachT;
        moonRadius = distantRadius + (targetRadius - distantRadius) * approachT;
        moonOrbitLongitude = 0; // Pure Light Side!
        moonSectionDimming = 1.0;
      } else {
        // STATE C: Fully arrived on portfolio page — Moon revolves with section parallax on Light Side
        moonX = moonDrawX;
        moonY = moonDrawY;
        moonRadius = finalRadius;
        moonOrbitLongitude = orbitLongitude; // Strictly within [-0.15, +0.15] -> Pure Light Side!
        moonSectionDimming = activeSectionRef.current >= 4 ? 0.78 : activeSectionRef.current >= 2 ? 0.92 : 1.0;
      }

      activeMoonInfo = {
        x: moonX,
        y: moonY,
        radius: moonRadius,
        orbitLongitude: moonOrbitLongitude,
        sectionDimming: moonSectionDimming,
      };

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

      // ── 2. Draw Deep-Space Stars, Prisms, & Cosmic Dust (BEHIND the Moon) ──
      const wrapSpan = w + 240;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const depth = p.depth || (p.isStar ? 0.85 : 0.35);
        const drawX = (((p.x + currentParallaxX * depth + 120) % wrapSpan) + wrapSpan) % wrapSpan - 120;
        const drawY = p.y;

        // Occlude all stars and particles behind the solid Full Moon sphere
        if (
          activeMoonInfo &&
          Math.hypot(drawX - activeMoonInfo.x, drawY - activeMoonInfo.y) < activeMoonInfo.radius * 1.02
        ) {
          continue;
        }

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

        const warpDim = isWarpingRef.current ? 0.35 : 1.0;
        ctx.globalAlpha = Math.max(0.02, Math.min(1, opacity * warpDim));
        const accessWarp = (isAccessing && accessProgress < 0.65)
          ? 1.0 + Math.sin((accessProgress / 0.65) * Math.PI) * 2.2
          : 1;
        const particleStretch = (p.tier === 2 && isMovingFast ? stretchFactor : 1) * accessWarp;

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

      // ── 3. Draw Shooting Meteors (BEHIND the Moon) ──
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

      // ── 4. Update & Draw Constellations (BEHIND the Moon) ──
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

      // ── 5. Draw the Colossal 3D-Rotating Genshin Impact Full Frostmoon (IN FRONT OF all stars) ──
      if (activeMoonInfo) {
        ctx.globalAlpha = 1;
        drawFrostmoon(
          ctx,
          activeMoonInfo.x,
          activeMoonInfo.y,
          activeMoonInfo.radius,
          palette,
          frame,
          isDark,
          activeMoonInfo.orbitLongitude,
          activeMoonInfo.sectionDimming
        );
      }

      // ── 6. Interactive "Celestial Astrolabe" Cursor Resonance ──
      if (!prefersReducedMotion && mouseX >= 0 && mouseY >= 0 && mouseY < h * 0.72) {
        let resonanceTargets = [];
        const maxDist = 220;
        const midShift = currentParallaxX * 0.45;

        // 1. Resonate with nearby background stars (excluding stars occluded behind the Moon)
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (!p.isStar) continue;
          const px = (((p.x + currentParallaxX * (p.depth || 0.85) + 120) % wrapSpan) + wrapSpan) % wrapSpan - 120;
          if (
            activeMoonInfo &&
            Math.hypot(px - activeMoonInfo.x, p.y - activeMoonInfo.y) < activeMoonInfo.radius * 1.02
          ) {
            continue;
          }
          const dist = Math.hypot(px - mouseX, p.y - mouseY);
          if (dist < maxDist) {
            resonanceTargets.push({ x: px, y: p.y, dist });
          }
        }

        // 2. Resonate with nearby active constellation nodes
        for (const c of constellations) {
          for (const n of c.nodes) {
            const nx = (((n.x + midShift) % w) + w) % w;
            if (
              activeMoonInfo &&
              Math.hypot(nx - activeMoonInfo.x, n.y - activeMoonInfo.y) < activeMoonInfo.radius * 1.02
            ) {
              continue;
            }
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
