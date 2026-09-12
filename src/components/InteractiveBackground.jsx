import React, { useEffect, useRef, useState } from 'react';

/**
 * InteractiveBackground — Interactive Circuit Dot Grid
 * A dot grid with mouse-repulsion physics and sparse circuit-trace lines.
 * Clean, subtle, and non-intrusive (real constellations are handled by StellarBackground).
 *
 * Performance Optimized:
 * - Disabled on mobile (<768px) to eliminate battery drain & GPU overhead.
 * - Reduced density (SPACING=90) on tablet screens (768px–1024px).
 * - Pauses cleanly on prefers-reduced-motion.
 */

export default function InteractiveBackground() {
  const canvasRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 768;
  });

  useEffect(() => {
    const handleResizeCheck = () => {
      const isWideEnough = window.innerWidth >= 768;
      setIsEnabled(prev => {
        if (prev !== isWideEnough) return isWideEnough;
        return prev;
      });
    };

    window.addEventListener('resize', handleResizeCheck, { passive: true });
    return () => window.removeEventListener('resize', handleResizeCheck);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let circuitEdges = []; // [indexA, indexB] pairs for circuit traces
    let mouse = { x: -1000, y: -1000, radius: 150 };
    let frame = 0;
    let rafId = null;

    const prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    const SPRING = 0.05;
    const FRICTION = 0.85;
    const REPULSION = 5;
    const CIRCUIT_DENSITY = 0.22;

    const getSpacing = (w) => (w < 1024 ? 90 : 60);

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      circuitEdges = [];
      const SPACING = getSpacing(width);

      const cols = Math.floor(width / SPACING) + 2;
      const rows = Math.floor(height / SPACING) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i - 1) * SPACING;
          const y = (j - 1) * SPACING;
          particles.push({
            baseX: x, baseY: y,
            x, y,
            vx: 0, vy: 0,
            radius: 1.3,
          });
        }
      }

      // Build subtle circuit edges (adjacent horizontal & vertical)
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const idx = i * rows + j;
          // Right neighbor
          if (i + 1 < cols && Math.random() < CIRCUIT_DENSITY) {
            circuitEdges.push([idx, (i + 1) * rows + j]);
          }
          // Bottom neighbor
          if (j + 1 < rows && Math.random() < CIRCUIT_DENSITY) {
            circuitEdges.push([idx, i * rows + (j + 1)]);
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

      // Update particle physics (skip physics if reduced motion)
      if (!prefersReducedMotion) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = mouse.radius * mouse.radius;

          if (distSq < radiusSq) {
            const distance = Math.sqrt(distSq) || 1;
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

      rafId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

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
