/**
 * Stellar-Glimmer & Nod-Krai Procedural Constellation Engine
 * 
 * Generates unique, non-repeating procedural constellations:
 * - 4 to 7 stars per constellation (strictly bounded).
 * - Organic spatial clustering in the upper sky canopy.
 * - Minimum Spanning Tree (MST) stick-figure topology with optional planar cross-facet.
 * - Sequential BFS edge ordering (traces once slowly from apex outwards).
 * - Spatial bounding hitbox to prevent overlapping with existing constellations or the Moon.
 */

// ── 2D Geometry Helpers ──
function ccw(p1, p2, p3) {
  return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
}

function segmentsIntersect(a, b, c, d) {
  // If sharing an endpoint, they don't "cross"
  if (
    (a.x === c.x && a.y === c.y) ||
    (a.x === d.x && a.y === d.y) ||
    (b.x === c.x && b.y === c.y) ||
    (b.x === d.x && b.y === d.y)
  ) {
    return false;
  }
  return (
    ccw(a, c, d) !== ccw(b, c, d) &&
    ccw(a, b, c) !== ccw(a, b, d)
  );
}

// ── Disjoint Set Union (Union-Find) for Kruskal's MST ──
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(i) {
    if (this.parent[i] === i) return i;
    return (this.parent[i] = this.find(this.parent[i]));
  }
  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootI] = rootJ;
      return true;
    }
    return false;
  }
}

/**
 * Spawns a procedural celestial constellation with collision avoidance ("hitbox").
 * Returns null if the sky canopy is currently crowded.
 */
export function spawnRealConstellation(w, h, rand, getStarColor, existingConstellations = [], moonInfo = null) {
  const isSmall = w < 768;
  const boundRadius = isSmall ? rand(50, 70) : rand(75, 110);
  const moonX = moonInfo?.x ?? (w * 0.70);
  const moonY = moonInfo?.y ?? (h * 0.22);
  const moonRadius = moonInfo?.radius ?? (isSmall ? 80 : 180);
  const moonClearance = moonRadius * 1.32;

  // Active constellations currently visible or holding
  const activeExisting = existingConstellations.filter(
    (c) => c.fadeAlpha > 0.08
  );

  // Maximum simultaneous constellations in sky: 1 on mobile, 2 on desktop
  const maxAllowed = isSmall ? 1 : 2;
  if (activeExisting.length >= maxAllowed) {
    return null;
  }

  // ── 1. Spatial Hitbox & Clearance Placement ──
  // Candidate pockets in the upper sky canopy:
  // Pocket 0: Far Left (w * 0.08 - 0.26)
  // Pocket 1: Mid Left (w * 0.28 - 0.50)
  // Pocket 2: Lower Horizon / Mid-Sky below the moon corridor
  // Pocket 3: Far Right Horizon (if space allows past the colossal moon)
  const candidatePockets = isSmall
    ? [
        { minX: w * 0.10, maxX: w * 0.38, minY: h * 0.09, maxY: h * 0.18 },
        { minX: w * 0.15, maxX: w * 0.55, minY: h * 0.22, maxY: h * 0.35 }
      ]
    : [
        { minX: w * 0.08 + boundRadius, maxX: w * 0.26, minY: h * 0.09, maxY: h * 0.20 },
        { minX: w * 0.28, maxX: w * 0.50, minY: h * 0.08, maxY: h * 0.22 },
        { minX: w * 0.14, maxX: w * 0.48, minY: h * 0.24, maxY: h * 0.38 },
        { minX: Math.max(w * 0.88, moonX + moonClearance + boundRadius), maxX: w * 0.94, minY: h * 0.10, maxY: h * 0.24 }
      ];

  // Shuffle pockets to distribute variety
  candidatePockets.sort(() => Math.random() - 0.5);

  let chosenCx = null;
  let chosenCy = null;

  for (const pocket of candidatePockets) {
    if (pocket.minX >= pocket.maxX) continue;
    for (let attempt = 0; attempt < 8; attempt++) {
      const cx = rand(pocket.minX, pocket.maxX);
      const cy = rand(pocket.minY, pocket.maxY);

      // Check distance to Moon (scaled to colossal radius)
      const distToMoon = Math.hypot(cx - moonX, cy - moonY);
      if (distToMoon < boundRadius + moonClearance) {
        continue;
      }

      // Check distance / hitbox to all existing constellations
      let overlaps = false;
      for (const other of activeExisting) {
        const distToOther = Math.hypot(cx - other.cx, cy - other.cy);
        const minSafeDist = boundRadius + (other.boundRadius || 90) + 65;
        if (distToOther < minSafeDist) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        chosenCx = cx;
        chosenCy = cy;
        break;
      }
    }
    if (chosenCx !== null) break;
  }

  // If sky is too crowded to maintain proper clearance, skip this cycle
  if (chosenCx === null) {
    return null;
  }

  const cx = chosenCx;
  const cy = chosenCy;

  // ── 2. Random Star Placement (4 to 7 stars strictly) ──
  const starCount = Math.floor(rand(4, 7.99)); // Exactly 4, 5, 6, or 7
  const nodes = [];

  // Star 0: Primary Nexus / Apex star near upper-center of cluster
  nodes.push({
    x: cx + rand(-0.25, 0.25) * boundRadius,
    y: cy + rand(-0.55, -0.15) * boundRadius,
    size: rand(4.6, 5.8),
    isPrimary: true,
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: rand(0.0015, 0.0035),
    color: getStarColor(),
  });

  // Generate remaining stars with aesthetic spatial separation (>= 38px apart)
  const minStarDist = isSmall ? 28 : 38;
  for (let i = 1; i < starCount; i++) {
    let placed = false;
    for (let attempts = 0; attempts < 35; attempts++) {
      const angle = rand(0, Math.PI * 2);
      const dist = rand(boundRadius * 0.32, boundRadius * 0.95);
      const candidateX = cx + Math.cos(angle) * dist;
      const candidateY = cy + Math.sin(angle) * dist;

      // Keep within sky canopy
      if (candidateY < 20 || candidateY > h * 0.24) continue;

      let tooClose = false;
      for (const existingNode of nodes) {
        if (Math.hypot(candidateX - existingNode.x, candidateY - existingNode.y) < minStarDist) {
          tooClose = true;
          break;
        }
      }

      if (!tooClose) {
        nodes.push({
          x: candidateX,
          y: candidateY,
          size: rand(3.2, 4.4),
          isPrimary: false,
          rotation: rand(0, Math.PI * 2),
          rotationSpeed: rand(0.0015, 0.0035),
          color: getStarColor(),
        });
        placed = true;
        break;
      }
    }

    // Fallback if tight: place on outer perimeter
    if (!placed) {
      const angle = (Math.PI * 2 * i) / starCount;
      nodes.push({
        x: cx + Math.cos(angle) * boundRadius * 0.75,
        y: cy + Math.sin(angle) * boundRadius * 0.75,
        size: rand(3.2, 4.2),
        isPrimary: false,
        rotation: rand(0, Math.PI * 2),
        rotationSpeed: rand(0.0015, 0.0035),
        color: getStarColor(),
      });
    }
  }

  // ── 3. Graph Connectivity: Minimum Spanning Tree (MST) ──
  // Compute all pairwise distances
  const allPairEdges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      allPairEdges.push({ from: i, to: j, dist });
    }
  }
  allPairEdges.sort((a, b) => a.dist - b.dist);

  const dsu = new DSU(nodes.length);
  const mstAdj = Array.from({ length: nodes.length }, () => []);
  const mstEdges = [];

  for (const edge of allPairEdges) {
    if (dsu.union(edge.from, edge.to)) {
      mstEdges.push(edge);
      mstAdj[edge.from].push(edge.to);
      mstAdj[edge.to].push(edge.from);
      if (mstEdges.length === nodes.length - 1) break;
    }
  }

  // Optional: add 1 planar cross-edge if starCount >= 5 to form a crystalline facet
  if (nodes.length >= 5 && Math.random() < 0.35) {
    for (const edge of allPairEdges) {
      const isAlreadyInMst = mstEdges.some(
        (e) => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
      );
      if (isAlreadyInMst) continue;

      // Degree limiter: don't over-connect a single node
      if (mstAdj[edge.from].length >= 3 || mstAdj[edge.to].length >= 3) continue;

      // Check if this cross-edge intersects any existing MST edge
      const p1 = nodes[edge.from];
      const p2 = nodes[edge.to];
      let crosses = false;
      for (const existing of mstEdges) {
        const ep1 = nodes[existing.from];
        const ep2 = nodes[existing.to];
        if (segmentsIntersect(p1, p2, ep1, ep2)) {
          crosses = true;
          break;
        }
      }

      if (!crosses) {
        mstEdges.push(edge);
        mstAdj[edge.from].push(edge.to);
        mstAdj[edge.to].push(edge.from);
        break; // Only 1 cross-edge
      }
    }
  }

  // ── 4. Sequential BFS Ordering (Traces Once Slowly from Apex Outwards) ──
  const visitedNodes = new Set([0]);
  const orderedEdges = [];
  const queue = [0];

  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = mstAdj[current] || [];
    // Sort neighbors by distance to keep tracing natural and contiguous
    neighbors.sort((a, b) => {
      const distA = Math.hypot(nodes[current].x - nodes[a].x, nodes[current].y - nodes[a].y);
      const distB = Math.hypot(nodes[current].x - nodes[b].x, nodes[current].y - nodes[b].y);
      return distA - distB;
    });

    for (const nbr of neighbors) {
      if (!visitedNodes.has(nbr)) {
        visitedNodes.add(nbr);
        orderedEdges.push({ from: current, to: nbr, drawn: 0 });
        queue.push(nbr);
      } else {
        // If it's a cross-edge between already visited nodes
        const alreadyInList = orderedEdges.some(
          (e) => (e.from === current && e.to === nbr) || (e.from === nbr && e.to === current)
        );
        if (!alreadyInList) {
          orderedEdges.push({ from: current, to: nbr, drawn: 0 });
        }
      }
    }
  }

  // Fallback: if any edge missed, append cleanly
  for (const edge of mstEdges) {
    const found = orderedEdges.some(
      (e) => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
    );
    if (!found) {
      orderedEdges.push({ from: edge.from, to: edge.to, drawn: 0 });
    }
  }

  return {
    cx,
    cy,
    boundRadius,
    nodes,
    edges: orderedEdges,
    activeEdgeIdx: 0,
    nodeFlashes: [],     // Destination shockwave ripple on connection
    phase: 'drawing',    // 'drawing' -> 'glowing' -> 'fading'
    glowTimer: 0,
    glowDuration: rand(180, 240), // Radiates starlight for ~3-4s
    drawSpeed: rand(0.018, 0.026), // Traces once slowly (~45 frames per edge)
    fadeAlpha: 1,
  };
}
