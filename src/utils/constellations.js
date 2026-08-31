export const CONSTELLATION_TEMPLATES = [
  {
    name: 'Cassiopeia',
    nodes: [
      { x: 0.1, y: 0.5 },
      { x: 0.3, y: 0.2 },
      { x: 0.5, y: 0.4 },
      { x: 0.7, y: 0.3 },
      { x: 0.9, y: 0.6 },
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4]
    ]
  },
  {
    name: 'Big Dipper',
    nodes: [
      { x: 0.1, y: 0.1 },
      { x: 0.25, y: 0.2 },
      { x: 0.4, y: 0.35 },
      { x: 0.6, y: 0.4 },
      { x: 0.65, y: 0.7 },
      { x: 0.9, y: 0.8 },
      { x: 0.9, y: 0.45 },
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]
    ]
  },
  {
    name: 'Lyra',
    nodes: [
      { x: 0.5, y: 0.1 },
      { x: 0.3, y: 0.4 },
      { x: 0.7, y: 0.4 },
      { x: 0.4, y: 0.8 },
      { x: 0.8, y: 0.8 },
      { x: 0.6, y: 0.9 },
    ],
    edges: [
      [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 5], [4, 5]
    ]
  },
  {
    name: 'Cygnus',
    nodes: [
      { x: 0.5, y: 0.1 },
      { x: 0.5, y: 0.35 },
      { x: 0.1, y: 0.5 },
      { x: 0.9, y: 0.2 },
      { x: 0.5, y: 0.8 },
    ],
    edges: [
      [0, 1], [1, 4], [2, 1], [1, 3]
    ]
  },
  {
    name: 'Orion',
    nodes: [
      { x: 0.3, y: 0.2 },
      { x: 0.7, y: 0.3 },
      { x: 0.4, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.6, y: 0.45 },
      { x: 0.3, y: 0.8 },
      { x: 0.7, y: 0.7 },
    ],
    edges: [
      [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [5, 6]
    ]
  }
];

// Helper to spawn a constellation instance
export function spawnRealConstellation(w, h, rand, getStarColor) {
  const template = CONSTELLATION_TEMPLATES[Math.floor(Math.random() * CONSTELLATION_TEMPLATES.length)];
  
  // Random position, scale, and rotation
  const scale = rand(Math.min(w, h) * 0.15, Math.min(w, h) * 0.3);
  const cx = rand(scale, w - scale);
  const cy = rand(scale, h - scale);
  const rotation = rand(0, Math.PI * 2);
  
  const nodes = template.nodes.map(n => {
    // Center normalized coords (-0.5 to 0.5)
    const nx = n.x - 0.5;
    const ny = n.y - 0.5;
    
    // Rotate and scale
    const rx = nx * Math.cos(rotation) - ny * Math.sin(rotation);
    const ry = nx * Math.sin(rotation) + ny * Math.cos(rotation);
    
    const size = rand(3, 6);
    
    return {
      x: cx + rx * scale,
      y: cy + ry * scale,
      size,
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(0.001, 0.004),
      color: getStarColor(),
      baseOpacity: 0, // starts at 0, grows during phase
      glowProgress: 0,
      glowPhase: 'idle',
      isStar: true,
    };
  });
  
  return {
    templateName: template.name,
    nodes,
    edges: template.edges.map(e => ({ from: e[0], to: e[1], drawn: 0 })),
  };
}
