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

// ─── Deterministic 3D Spherical Fractal Noise & Procedural Lunar Map Engine ──
const TEX_W = 1024;
const TEX_H = 512;
const SPH_R = 200; // 400x400 native spherical pixel buffer (upscaled smoothly with bilinear filtering)
const SPH_SIZE = SPH_R * 2;

// Fast deterministic hash for 3D lattice coordinates
function hash3(ix, iy, iz) {
  let n = (ix * 374761393 + iy * 668265263 + iz * 2147483647) | 0;
  n = (n ^ (n >> 13)) | 0;
  n = Math.imul(n, 1274126177);
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function valueNoise3D(x, y, z) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

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

function getLunarEngine() {
  if (typeof document === 'undefined') return null;
  if (lunarEngineCache) return lunarEngineCache;

  // ── 1. Build 1024x512 Equirectangular Height, Albedo & Normal-Shaded Lunar Map ──
  const heightMap = new Float32Array(TEX_W * TEX_H);
  const mariaMask = new Float32Array(TEX_W * TEX_H);
  const rayMask = new Float32Array(TEX_W * TEX_H);

  for (let y = 0; y < TEX_H; y++) {
    const lat = ((0.5 - y / TEX_H) * Math.PI);
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const rowOff = y * TEX_W;

    for (let x = 0; x < TEX_W; x++) {
      const lon = ((x / TEX_W) * 2 - 1) * Math.PI;
      const nx = cosLat * Math.sin(lon);
      const ny = sinLat;
      const nz = cosLat * Math.cos(lon);

      // Domain-warped 3D fractal noise for organic, jagged Genshin lunar coastlines
      const warpX = fbm3D(nx * 2.6 + 1.3, ny * 2.6, nz * 2.6, 3) * 0.28;
      const warpY = fbm3D(nx * 2.6, ny * 2.6 + 4.7, nz * 2.6, 3) * 0.28;
      const warpZ = fbm3D(nx * 2.6, ny * 2.6, nz * 2.6 + 8.1, 3) * 0.28;

      const detailNoise = fbm3D((nx + warpX) * 5.2, (ny + warpY) * 5.2, (nz + warpZ) * 5.2, 5);
      const microNoise = fbm3D(nx * 18.0, ny * 18.0, nz * 18.0, 3);

      // Evaluate Maria Basins with fractal coastline warping
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

      // Base highland vs mare elevation
      let h = (detailNoise * 0.65 + microNoise * 0.35) * (1 - mVal * 0.62) - mVal * 0.48;
      let rGlow = 0;

      // Evaluate 90 3D Impact Craters & Feathered Ejecta Ray Plumes
      for (let c = 0; c < PROCEDURAL_CRATERS.length; c++) {
        const cr = PROCEDURAL_CRATERS[c];
        const dot = nx * cr.nx + ny * cr.ny + nz * cr.nz;
        const maxSearch = cr.rays ? cr.rayScale : cr.rad * 1.65;
        if (dot < Math.cos(maxSearch)) continue;

        const angDist = Math.acos(Math.max(-1, Math.min(1, dot)));
        // Perturb crater radius slightly with microNoise so rims are rocky, never compass-perfect
        const rimDist = angDist + (microNoise - 0.5) * cr.rad * 0.18;

        if (rimDist < cr.rad * 1.55) {
          const u = rimDist / cr.rad;
          if (u < 0.78) {
            // Recessed bowl
            const bowl = (u / 0.78);
            h -= (1 - bowl * bowl) * (0.28 + cr.rad * 1.5);
            // Central mountain peak for larger craters
            if (cr.rad > 0.042 && u < 0.24) {
              const pk = 1 - u / 0.24;
              h += pk * pk * 0.24;
              rGlow = Math.max(rGlow, pk * 0.55);
            }
          } else if (u < 1.38) {
            // Raised rugged crater rim ridge (broken by fractal noise, shaded by 3D slope)
            const rimT = 1 - Math.abs(u - 1.02) / 0.36;
            const rimIrregularity = 0.45 + 0.75 * microNoise;
            const rimHeight = rimT * rimT * (0.20 + cr.rad * 1.15) * rimIrregularity;
            h += rimHeight;
            if (cr.rays) {
              rGlow = Math.max(rGlow, rimT * rimIrregularity * 0.24);
            }
          }
        }

        // Feathered Ejecta Ray Plumes for Major Ray Craters
        if (cr.rays && angDist > cr.rad * 0.75 && angDist < cr.rayScale) {
          // Local tangent azimuth around crater center
          const dLon = lon - cr.lon;
          const dLat = lat - cr.lat;
          const az = Math.atan2(dLat, dLon * cosLat);
          const plume1 = Math.sin(az * 9 + cr.seed + detailNoise * 2.2);
          const plume2 = Math.cos(az * 15 - cr.seed * 1.7 + microNoise * 1.8);
          const rayStr = Math.pow(Math.max(0, plume1 * 0.6 + plume2 * 0.4), 3.2);
          const radialFade = Math.pow(1 - (angDist - cr.rad * 0.75) / (cr.rayScale - cr.rad * 0.75), 1.6);
          rGlow = Math.max(rGlow, rayStr * radialFade * 0.78);
        }
      }

      const idx = rowOff + x;
      heightMap[idx] = h;
      mariaMask[idx] = mVal;
      rayMask[idx] = rGlow;
    }
  }

  // ── 2. Bake Bump-Mapped Albedo RGB Texture (Dark & Light Palettes) ──
  const texDarkR = new Uint8Array(TEX_W * TEX_H);
  const texDarkG = new Uint8Array(TEX_W * TEX_H);
  const texDarkB = new Uint8Array(TEX_W * TEX_H);

  const texLightR = new Uint8Array(TEX_W * TEX_H);
  const texLightG = new Uint8Array(TEX_W * TEX_H);
  const texLightB = new Uint8Array(TEX_W * TEX_H);

  for (let y = 0; y < TEX_H; y++) {
    const rowOff = y * TEX_W;
    const yUp = Math.max(0, y - 1) * TEX_W;
    const yDn = Math.min(TEX_H - 1, y + 1) * TEX_W;

    for (let x = 0; x < TEX_W; x++) {
      const idx = rowOff + x;
      const xPrev = (x - 1 + TEX_W) & (TEX_W - 1);
      const xNext = (x + 1) & (TEX_W - 1);

      // Finite-difference surface slope for crisp 3D crater & mountain relief
      const dhx = (heightMap[rowOff + xNext] - heightMap[rowOff + xPrev]) * 3.4;
      const dhy = (heightMap[yUp + x] - heightMap[yDn + x]) * 3.4;
      const slopeShade = Math.max(-0.42, Math.min(0.48, dhx * 0.75 + dhy * 0.65));

      const m = mariaMask[idx];
      const ray = rayMask[idx];
      const h = heightMap[idx];

      // Composite lunar surface value [0 = deepest basaltic sea, 1 = brightest frost peak]
      let lum = 0.56 - m * 0.44 + h * 0.28 + slopeShade * 0.38 + ray * 0.45;
      lum = Math.max(0.05, Math.min(1.0, lum));

      // Genshin Impact "Song of the Welkin Moon" Cel-Painterly Color Ramp (Dark Mode)
      // Deep Maria: #0F2342 -> Mid Regolith: #4A88C2 -> Highland Silver: #BCE4FE -> Frost Peak: #FFFFFF
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
      texDarkR[idx] = dr;
      texDarkG[idx] = dg;
      texDarkB[idx] = db;

      // Light Mode Color Ramp
      const lt = lum;
      texLightR[idx] = Math.round(120 + lt * 135);
      texLightG[idx] = Math.round(190 + lt * 65);
      texLightB[idx] = Math.round(235 + lt * 20);
    }
  }

  // ── 3. Pre-Compute 3D Spherical Projection Lookup Table (SPH_SIZE x SPH_SIZE) ──
  const tilt = -0.20;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);

  const activePixels = [];
  for (let py = 0; py < SPH_SIZE; py++) {
    const nyScreen = (py + 0.5 - SPH_R) / SPH_R;
    for (let px = 0; px < SPH_SIZE; px++) {
      const nxScreen = (px + 0.5 - SPH_R) / SPH_R;
      const rSq = nxScreen * nxScreen + nyScreen * nyScreen;
      if (rSq > 1.0) continue;

      const rDist = Math.sqrt(rSq);
      const nzScreen = Math.sqrt(Math.max(0, 1.0 - rSq));

      // Rotate view normal by axial tilt into lunar body coordinates
      const bx = nxScreen;
      const by = -nyScreen * cosTilt + nzScreen * sinTilt;
      const bz = nyScreen * sinTilt + nzScreen * cosTilt;

      const lat = Math.asin(Math.max(-1, Math.min(1, by)));
      const lon = Math.atan2(bx, bz); // [-PI, PI]

      const v = Math.min(TEX_H - 1, Math.max(0, Math.floor((0.5 - lat / Math.PI) * TEX_H)));
      const u = ((Math.floor(((lon / (Math.PI * 2)) + 0.5) * TEX_W) % TEX_W) + TEX_W) % TEX_W;

      // 3D Spherical Illumination:
      // Brightest across the right/upper-right/center of the Full Moon;
      // Gently shaded into twilight sapphire toward the left limb so Hero text has effortless contrast!
      const sunDot = nxScreen * 0.46 - nyScreen * 0.22 + nzScreen * 0.86;
      const leftTwilight = Math.max(0.36, Math.min(1.0, (nxScreen + 1.05) / 1.15));
      const shade = Math.max(0.30, Math.min(1.12, (0.38 + Math.max(0, sunDot) * 0.72) * leftTwilight));

      // 360° Fresnel Atmospheric Rim Glow + Smooth 1.5px Anti-Aliased Edge
      const fresnel = Math.pow(rDist, 3.6) * (0.26 + 0.34 * leftTwilight);
      const edgeAA = rDist > 0.985 ? Math.max(0, (1.0 - rDist) / 0.015) : 1.0;

      activePixels.push({
        pixIdx: py * SPH_SIZE + px,
        rowOff: v * TEX_W,
        u,
        shade: Math.round(shade * 256),
        fresnel: Math.round(fresnel * 255),
        alpha: Math.round(edgeAA * 255),
      });
    }
  }

  // Convert LUT to flat TypedArrays for sub-0.4ms per-frame execution
  const count = activePixels.length;
  const lutPixIdx = new Uint32Array(count);
  const lutRowOff = new Uint32Array(count);
  const lutU = new Uint16Array(count);
  const lutShade = new Uint16Array(count);
  const lutFresnel = new Uint8Array(count);
  const lutAlpha = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    const p = activePixels[i];
    lutPixIdx[i] = p.pixIdx;
    lutRowOff[i] = p.rowOff;
    lutU[i] = p.u;
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
    lutPixIdx,
    lutRowOff,
    lutU,
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
    lastUShift: -1,
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

  ctx.translate(x, buoyY);
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

  // ── 1. Multi-Layered Deep-Space Atmospheric Corona ──
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

  // ── 2. Update & Blit 3D Rotating Spherical Lunar Texture ──
  // Continuous 3D longitude rotation (advances smoothly on Hero + revolves across sections)
  const rotLon = frame * 0.0020 + rotation;
  const uShift = ((Math.floor((rotLon / (Math.PI * 2)) * TEX_W) % TEX_W) + TEX_W) % TEX_W;

  if (uShift !== engine.lastUShift || isDark !== engine.lastThemeDark) {
    engine.lastUShift = uShift;
    engine.lastThemeDark = isDark;

    const {
      count,
      lutPixIdx,
      lutRowOff,
      lutU,
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
      const texIdx = lutRowOff[i] + ((lutU[i] + uShift) & mask);
      const sh = lutShade[i];
      const fr = lutFresnel[i];

      let r = ((tR[texIdx] * sh) >> 8) + ((fr * 225) >> 8);
      let g = ((tG[texIdx] * sh) >> 8) + ((fr * 244) >> 8);
      let b = ((tB[texIdx] * sh) >> 8) + fr;

      if (r > 255) r = 255;
      if (g > 255) g = 255;
      if (b > 255) b = 255;

      out32[lutPixIdx[i]] = (lutAlpha[i] << 24) | (b << 16) | (g << 8) | r;
    }

    engine.sphereCtx.putImageData(engine.imgData, 0, 0);
  }

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(engine.sphereCanvas, -R, -R, R * 2, R * 2);
  ctx.restore();

  // ── 3. Crisp 360° Full-Moon Specular Atmospheric Rim ──
  const scale = R / 400;
  ctx.save();
  ctx.shadowColor = isDark ? 'rgba(125, 211, 252, 0.72)' : 'rgba(2, 132, 199, 0.35)';
  ctx.shadowBlur = Math.max(8, 20 * scale);
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

  ctx.restore(); // Restore wheelRot
  ctx.restore(); // Restore main moon transform
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

      // ── 1. Draw the Colossal 3D-Rotating Genshin Impact Full Frostmoon ──
      if (!isWarpingRef.current) {
        ctx.globalAlpha = 1;
        const { radius: baseRadius, targetX, targetY } = getHeroMoonMetrics(w, h);

        // Orbital spatial tracking across sections (0 at Home -> ~ -1.0 at Contact)
        const totalSpan = Math.max(w, w * 3.4);
        const orbitFactor = prefersReducedMotion ? 0 : currentParallaxX / totalSpan;

        // Low-Lunar-Orbit X sweep across the backdrop as viewer navigates sections
        const moonDrawX = prefersReducedMotion
          ? targetX
          : targetX + currentParallaxX * 0.095;

        // Orbital elevation: gentle celestial arch as camera revolves around the Full Moon
        const arcElevation = prefersReducedMotion ? 0 : Math.sin(Math.abs(orbitFactor) * Math.PI) * 38;
        const moonDrawY = targetY - arcElevation;

        // 3D Spherical Orbital Longitude shift as viewer revolves around the Moon across sections
        const orbitLongitude = prefersReducedMotion ? 0 : orbitFactor * 1.45;

        // Subtle periapsis perspective scaling as camera orbits closer in mid-sections
        const orbitScale = prefersReducedMotion ? 1 : 1 + Math.sin(Math.abs(orbitFactor) * Math.PI) * 0.06;
        const finalRadius = baseRadius * orbitScale;

        // Content-aware attenuation in dense card sections
        const sectionDimming = activeSectionRef.current >= 2 ? 0.92 : 1.0;

        drawFrostmoon(ctx, moonDrawX, moonDrawY, finalRadius, palette, frame, isDark, orbitLongitude, sectionDimming);

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

        // 1. Resonate with nearby background stars (excluding stars occluded behind the Moon)
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (!p.isStar) continue;
          const px = (((p.x + currentParallaxX * (p.depth || 0.85) + 120) % wrapSpan) + wrapSpan) % wrapSpan - 120;
          if (
            activeMoonInfo &&
            p.tier < 2 &&
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

        // Occlude distant background stars behind the solid Full Moon sphere (allow Tier 2 near-field ice prisms in front)
        if (
          activeMoonInfo &&
          p.tier < 2 &&
          Math.hypot(drawX - activeMoonInfo.x, drawY - activeMoonInfo.y) < activeMoonInfo.radius * 0.995
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
