import React, { useEffect, useRef } from 'react';

/**
 * InteractiveBackground — Interactive Circuit Dot Grid
 * A dot grid with mouse-repulsion physics and sparse circuit-trace lines.
 * Clean, subtle, and non-intrusive (real constellations are handled by StellarBackground).
 */

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let circuitEdges = []; // [indexA, indexB] pairs for circuit traces
    let mouse = { x: -1000, y: -1000, radius: 150 };
    let frame = 0;

    const SPACING = 48;
    const SPRING = 0.05;
    const FRICTION = 0.85;
    const REPULSION = 5;
    const CIRCUIT_DENSITY = 0.28; // subtle circuit connections

    let cols = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      circuitEdges = [];

      cols = Math.floor(width / SPACING) + 2;
      const rows = Math.floor(height / SPACING) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i - 1) * SPACING;
          const y = (j - 1) * SPACING;
          particles.push({
            baseX: x, baseY: y,
            x, y,
            vx: 0, vy: 0,
            radius: 1.4,
          });
        }
      }

      // Build subtle circuit edges (adjacent horizontal & vertical)
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
    };

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      // Color tokens
      const dotColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)';
      const circuitLineColor = isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(15, 23, 42, 0.06)';

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

      // Draw clean dots
      ctx.globalAlpha = 1;
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.moveTo(p.x + p.radius, p.y);
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      }
      ctx.fill();

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
