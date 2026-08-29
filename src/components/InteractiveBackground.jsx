import React, { useEffect, useRef } from 'react';

/**
 * InteractiveBackground — Circuit Constellation Grid
 * A dot grid with mouse-repulsion physics, overlaid with:
 * - Sparse circuit-trace lines between adjacent dots (cyber/PCB feel)
 * - Constellation links between randomly designated brighter nodes (stellar feel)
 * The two visual layers intertwine to unify the stellar + cyber theme.
 */

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let circuitEdges = [];       // [indexA, indexB] pairs for circuit traces
    let constellationEdges = [];  // [indexA, indexB] pairs for constellation links
    let mouse = { x: -1000, y: -1000, radius: 150 };
    let frame = 0;

    const SPACING = 44;
    const SPRING = 0.05;
    const FRICTION = 0.85;
    const REPULSION = 5;
    const CIRCUIT_DENSITY = 0.35;       // % of possible adjacent connections
    const CONSTELLATION_RATIO = 0.12;   // % of dots designated as constellation nodes

    let cols = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      circuitEdges = [];
      constellationEdges = [];

      cols = Math.floor(width / SPACING) + 2;
      const rows = Math.floor(height / SPACING) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i - 1) * SPACING;
          const y = (j - 1) * SPACING;
          const isConstellation = Math.random() < CONSTELLATION_RATIO;
          particles.push({
            baseX: x, baseY: y,
            x, y,
            vx: 0, vy: 0,
            isConstellation,
            // Constellation nodes are slightly larger & brighter
            radius: isConstellation ? 2.5 : 1.5,
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      }

      // Build circuit edges (adjacent horizontal & vertical)
      const rows2 = Math.floor(height / SPACING) + 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows2; j++) {
          const idx = i * rows2 + j;
          // Right neighbor
          if (i + 1 < cols && Math.random() < CIRCUIT_DENSITY) {
            circuitEdges.push([idx, (i + 1) * rows2 + j]);
          }
          // Bottom neighbor
          if (j + 1 < rows2 && Math.random() < CIRCUIT_DENSITY) {
            circuitEdges.push([idx, i * rows2 + (j + 1)]);
          }
        }
      }

      // Build constellation links — connect each constellation node to 1-2 nearest constellation neighbors
      const constellationIndices = particles
        .map((p, i) => p.isConstellation ? i : -1)
        .filter(i => i >= 0);

      for (const ci of constellationIndices) {
        const p = particles[ci];
        // Find nearest constellation neighbors by distance
        const neighbors = constellationIndices
          .filter(ni => ni !== ci)
          .map(ni => ({
            idx: ni,
            dist: Math.hypot(particles[ni].baseX - p.baseX, particles[ni].baseY - p.baseY),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 2); // Link to 2 nearest

        for (const n of neighbors) {
          // Only add if distance is reasonable (within ~4 grid spacings) and not duplicate
          if (n.dist < SPACING * 4.5) {
            const edgeKey = Math.min(ci, n.idx) + '-' + Math.max(ci, n.idx);
            const exists = constellationEdges.some(
              e => (Math.min(e[0], e[1]) + '-' + Math.max(e[0], e[1])) === edgeKey
            );
            if (!exists) {
              constellationEdges.push([ci, n.idx]);
            }
          }
        }
      }
    };

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      // Color tokens
      const dotColor = isDark ? 'rgba(255, 255, 255, 0.13)' : 'rgba(15, 23, 42, 0.14)';
      const constellationDotColor = isDark ? 'rgba(103, 232, 249, 0.35)' : 'rgba(2, 132, 199, 0.65)';
      const circuitLineColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.08)';
      const constellationLineColor = isDark ? 'rgba(103, 232, 249, 0.10)' : 'rgba(2, 132, 199, 0.28)';

      // Global subtle pulse for lines
      const linePulse = 0.7 + 0.3 * Math.sin(frame * 0.015);

      // Update particle physics
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * REPULSION;
          p.vy += Math.sin(angle) * force * REPULSION;
        }

        p.vx += (p.baseX - p.x) * SPRING;
        p.vy += (p.baseY - p.y) * SPRING;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw circuit trace lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = circuitLineColor;
      ctx.globalAlpha = linePulse;
      ctx.beginPath();
      for (const [a, b] of circuitEdges) {
        const pa = particles[a];
        const pb = particles[b];
        if (pa && pb) {
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
        }
      }
      ctx.stroke();

      // Draw constellation links
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = constellationLineColor;
      ctx.globalAlpha = linePulse * 0.9;
      ctx.beginPath();
      for (const [a, b] of constellationEdges) {
        const pa = particles[a];
        const pb = particles[b];
        if (pa && pb) {
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
        }
      }
      ctx.stroke();

      ctx.globalAlpha = 1;

      // Draw dots
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.isConstellation) {
          // Constellation node — slightly pulsing
          const pulse = 0.8 + 0.2 * Math.sin(frame * 0.025 + p.pulsePhase);
          ctx.globalAlpha = pulse;
          ctx.fillStyle = constellationDotColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Faint glow halo
          ctx.globalAlpha = pulse * 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = 1;
          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
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
        zIndex: -2,
        pointerEvents: 'none',
      }}
    />
  );
}
