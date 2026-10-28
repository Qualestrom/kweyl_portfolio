/**
 * Stellar-Glimmer & Nod-Krai Constellation Templates
 * 
 * Replaces generic astrology with authentic Snezhnayan, Cryo, and Astral archetypes:
 * - Stella Glacialis (Frost Prism / Diamond Crest)
 * - Corona Frostmoon (Crown of the Frostmoon)
 * - Lotus Niveus (Snow Lotus / Crystalline Hexagon)
 * - Columba Caelestis (Celestial Feather / Astral Quill)
 * - Horologium Astrale (Celestial Astrolabe / Hourglass)
 */

export const CONSTELLATION_TEMPLATES = [
  {
    name: 'STELLA GLACIALIS',
    subtitle: 'The Frost Prism',
    nodes: [
      { x: 0.50, y: 0.05, isPrimary: true, size: 5.5 },  // Top apex
      { x: 0.50, y: 0.44, isPrimary: false, size: 4.8 }, // Central nexus
      { x: 0.12, y: 0.44, isPrimary: false, size: 3.8 }, // Left facet
      { x: 0.88, y: 0.44, isPrimary: false, size: 3.8 }, // Right facet
      { x: 0.50, y: 0.72, isPrimary: false, size: 4.2 }, // Lower brace
      { x: 0.50, y: 0.95, isPrimary: false, size: 3.6 }, // Bottom tip
    ],
    edges: [
      [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]
    ],
  },
  {
    name: 'CORONA FROSTMOON',
    subtitle: 'Crown of the Frostmoon',
    nodes: [
      { x: 0.50, y: 0.08, isPrimary: true, size: 5.8 },  // Central crown jewel
      { x: 0.28, y: 0.28, isPrimary: false, size: 4.4 }, // Left arch
      { x: 0.72, y: 0.28, isPrimary: false, size: 4.4 }, // Right arch
      { x: 0.10, y: 0.62, isPrimary: false, size: 3.6 }, // Left tip
      { x: 0.90, y: 0.62, isPrimary: false, size: 3.6 }, // Right tip
      { x: 0.50, y: 0.78, isPrimary: false, size: 4.2 }, // Base anchor
    ],
    edges: [
      [0, 1], [0, 2], [1, 3], [2, 4], [1, 5], [2, 5], [3, 5], [4, 5]
    ],
  },
  {
    name: 'LOTUS NIVEUS',
    subtitle: 'The Snow Lotus',
    nodes: [
      { x: 0.50, y: 0.50, isPrimary: true, size: 5.5 },  // Central core
      { x: 0.50, y: 0.10, isPrimary: false, size: 4.0 }, // Top petal
      { x: 0.85, y: 0.30, isPrimary: false, size: 3.8 }, // Top-right petal
      { x: 0.85, y: 0.70, isPrimary: false, size: 3.8 }, // Bottom-right petal
      { x: 0.50, y: 0.90, isPrimary: false, size: 4.0 }, // Bottom petal
      { x: 0.15, y: 0.70, isPrimary: false, size: 3.8 }, // Bottom-left petal
      { x: 0.15, y: 0.30, isPrimary: false, size: 3.8 }, // Top-left petal
    ],
    edges: [
      [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1],
      [0, 1], [0, 3], [0, 5]
    ],
  },
  {
    name: 'COLUMBA CAELESTIS',
    subtitle: 'The Celestial Feather',
    nodes: [
      { x: 0.18, y: 0.12, isPrimary: true, size: 5.2 },  // Quill apex
      { x: 0.38, y: 0.36, isPrimary: false, size: 4.2 }, // Mid shaft
      { x: 0.82, y: 0.26, isPrimary: false, size: 3.8 }, // High vane
      { x: 0.58, y: 0.62, isPrimary: false, size: 4.0 }, // Low shaft
      { x: 0.92, y: 0.54, isPrimary: false, size: 3.6 }, // Low vane
      { x: 0.78, y: 0.90, isPrimary: false, size: 3.6 }, // Quill tip
    ],
    edges: [
      [0, 1], [1, 2], [1, 3], [3, 4], [3, 5]
    ],
  },
  {
    name: 'HOROLOGIUM ASTRALE',
    subtitle: 'The Celestial Astrolabe',
    nodes: [
      { x: 0.50, y: 0.50, isPrimary: true, size: 5.8 },  // Nexus star
      { x: 0.20, y: 0.15, isPrimary: false, size: 4.0 }, // Top-left
      { x: 0.80, y: 0.15, isPrimary: false, size: 4.0 }, // Top-right
      { x: 0.20, y: 0.85, isPrimary: false, size: 4.0 }, // Bottom-left
      { x: 0.80, y: 0.85, isPrimary: false, size: 4.0 }, // Bottom-right
    ],
    edges: [
      [1, 2], [1, 0], [2, 0], [3, 4], [3, 0], [4, 0]
    ],
  },
];

/**
 * Spawns a celestial constellation anchored to the open sky canopy.
 * Guaranteed to frame the atmospheric vault (y: 8%–30%) without obscuring cards or text.
 */
export function spawnRealConstellation(w, h, rand, getStarColor) {
  const template = CONSTELLATION_TEMPLATES[Math.floor(Math.random() * CONSTELLATION_TEMPLATES.length)];

  // Canopy Anchoring: keep high in upper sky vault framing the page
  const scale = rand(Math.min(w, h) * 0.13, Math.min(w, h) * 0.18);
  const cy = rand(h * 0.08, h * 0.16);

  // Position across open sky pockets:
  // 60% spawn in left sky (w * 0.10 - 0.34), 40% in right sky (w * 0.72 - 0.88), leaving Moon corridor open
  const spawnLeft = Math.random() < 0.60;
  const cx = spawnLeft
    ? rand(w * 0.10, Math.min(w * 0.34, w - scale))
    : rand(w * 0.72, Math.min(w * 0.88, w - scale));

  // Subtle natural celestial tilt (-15 deg to +15 deg)
  const rotation = rand(-0.26, 0.26);

  const nodes = template.nodes.map((n) => {
    const nx = n.x - 0.5;
    const ny = n.y - 0.5;

    const rx = nx * Math.cos(rotation) - ny * Math.sin(rotation);
    const ry = nx * Math.sin(rotation) + ny * Math.cos(rotation);

    return {
      x: cx + rx * scale,
      y: cy + ry * scale,
      size: n.size || rand(3.4, 5.2),
      isPrimary: Boolean(n.isPrimary),
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(0.0015, 0.004),
      color: getStarColor(),
      baseOpacity: 0,
      glowProgress: 0,
      glowPhase: 'idle',
      isStar: true,
    };
  });

  return {
    templateName: template.name,
    subtitle: template.subtitle,
    cx,
    cy,
    scale,
    nodes,
    edges: template.edges.map((e) => ({ from: e[0], to: e[1], drawn: 0 })),
    activeEdgeIdx: 0,
    nodeFlashes: [],  // Shockwave ripple ignitions
    energyPulses: [], // Packets of starlight traveling along lines
    phase: 'drawing', // 'drawing' -> 'holding' -> 'fading'
    holdTimer: 0,
    holdDuration: rand(180, 340),
    drawSpeed: rand(0.038, 0.065),
    fadeAlpha: 1,
  };
}
