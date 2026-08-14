import React, { useEffect, useRef } from 'react';

/**
 * StellarBackground — Persistent ambient particle background
 * Lightweight raw Canvas 2D (no Konva) for maximum performance.
 * Renders subtle floating dust and four-pointed stars.
 * Theme-aware via data-theme attribute observation.
 */

const PALETTES = {
  dark: {
    dust: ['rgba(232,244,253,0.12)', 'rgba(184,223,240,0.10)', 'rgba(255,255,255,0.15)', 'rgba(168,216,234,0.08)'],
    star: ['rgba(232,244,253,0.18)', 'rgba(255,255,255,0.22)', 'rgba(197,232,247,0.15)'],
  },
  light: {
    dust: ['rgba(91,164,207,0.10)', 'rgba(59,130,160,0.08)', 'rgba(74,144,184,0.10)', 'rgba(137,207,240,0.08)'],
    star: ['rgba(91,164,207,0.14)', 'rgba(74,144,184,0.16)', 'rgba(109,179,214,0.12)'],
  },
};

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function createBgParticle(w, h, palette, bottom = false) {
  const isStar = Math.random() > 0.75; // 25% stars, 75% dust
  return {
    x: rand(0, w),
    y: bottom ? h + rand(10, 40) : rand(-10, h + 20),
    baseX: 0,
    vy: -(rand(0.08, 0.35)),
    oscAmp: rand(5, 18),
    oscFreq: rand(0.003, 0.012),
    oscPhase: rand(0, Math.PI * 2),
    size: isStar ? rand(3, 8) : rand(1, 3),
    isStar,
    color: isStar ? pick(palette.star) : pick(palette.dust),
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: isStar ? rand(0.002, 0.008) : 0,
    opacityBase: 1,
    opacityPhase: rand(0, Math.PI * 2),
  };
}

function drawStar(ctx, x, y, size, rotation) {
  const outer = size;
  const inner = size * 0.28;
  ctx.save();
  ctx.translate(x, y);
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

export default function StellarBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    let frame = 0;
    let raf;

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const palette = PALETTES[getTheme()] || PALETTES.dark;
      particles = Array.from({ length: 40 }, () => createBgParticle(w, h, palette));
      particles.forEach(p => { p.baseX = p.x; });
    };

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      const theme = getTheme();
      const palette = PALETTES[theme] || PALETTES.dark;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.vy;
        p.x = p.baseX + p.oscAmp * Math.sin(p.oscFreq * frame + p.oscPhase);
        p.rotation += p.rotationSpeed;

        // Breathing
        const opacity = p.opacityBase + 0.15 * Math.sin(0.02 * frame + p.opacityPhase);
        ctx.globalAlpha = Math.max(0.02, Math.min(1, opacity));

        if (p.isStar) {
          ctx.fillStyle = p.color;
          drawStar(ctx, p.x, p.y, p.size, p.rotation);
        } else {
          // Glow halo
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
          // Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Respawn
        if (p.y < -(p.size * 3)) {
          const newP = createBgParticle(w, h, palette, true);
          newP.baseX = newP.x;
          Object.assign(p, newP);
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
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
