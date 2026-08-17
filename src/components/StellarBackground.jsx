import React, { useEffect, useRef } from 'react';

/**
 * StellarBackground — Static starry-night ambient background
 * Stars and dust are placed randomly and remain fixed.
 * Random stars periodically bloom with a bright glow pulse,
 * mimicking a living starry night sky.
 * Theme-aware via data-theme attribute observation.
 */

const PALETTES = {
  dark: {
    dust: ['rgba(232,244,253,0.10)', 'rgba(184,223,240,0.08)', 'rgba(255,255,255,0.12)', 'rgba(168,216,234,0.06)'],
    star: ['rgba(232,244,253,0.20)', 'rgba(255,255,255,0.25)', 'rgba(197,232,247,0.18)'],
    glowCore: '#ffffff',
    glowHalo: 'rgba(103,232,249,0.6)',
  },
  light: {
    dust: ['rgba(91,164,207,0.08)', 'rgba(59,130,160,0.06)', 'rgba(74,144,184,0.08)', 'rgba(137,207,240,0.06)'],
    star: ['rgba(91,164,207,0.14)', 'rgba(74,144,184,0.16)', 'rgba(109,179,214,0.12)'],
    glowCore: '#0891B2',
    glowHalo: 'rgba(8,145,178,0.5)',
  },
};

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function createStaticParticle(w, h, palette) {
  const isStar = Math.random() > 0.70; // 30% stars
  return {
    x: rand(0, w),
    y: rand(0, h),
    size: isStar ? rand(2.5, 7) : rand(0.8, 2.5),
    isStar,
    color: isStar ? pick(palette.star) : pick(palette.dust),
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: isStar ? rand(0.001, 0.004) : 0,
    // Gentle ambient breathing
    breathPhase: rand(0, Math.PI * 2),
    breathSpeed: rand(0.008, 0.02),
    breathDepth: rand(0.08, 0.2),
    baseOpacity: isStar ? rand(0.15, 0.30) : rand(0.06, 0.15),
    // Glow pulse state
    glowProgress: 0,    // 0 → 1 → 0 over the glow cycle
    glowPhase: 'idle',  // 'idle' | 'rising' | 'falling'
  };
}

function drawFourPointStar(ctx, x, y, size, rotation) {
  const outer = size;
  const inner = size * 0.25;
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

// Easing: ease-in-out quad
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Glow pulse timing
const GLOW_RISE_SPEED = 0.025;    // ~40 frames to peak (~0.65s)
const GLOW_FALL_SPEED = 0.008;    // ~125 frames to fade (~2s)
const GLOW_INTERVAL_MIN = 40;     // min frames between triggers (~0.7s)
const GLOW_INTERVAL_MAX = 120;    // max frames between triggers (~2s)
const MAX_SIMULTANEOUS_GLOWS = 6;

export default function StellarBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w, h;
    let particles = [];
    let raf;
    let frame = 0;
    let nextGlowFrame = 30; // first glow trigger quickly

    const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const palette = PALETTES[getTheme()] || PALETTES.dark;
      const count = Math.max(90, Math.floor((w * h) / 12000));
      particles = Array.from({ length: count }, () => createStaticParticle(w, h, palette));
    };

    const triggerRandomGlow = () => {
      const eligible = particles.filter(p => p.isStar && p.glowPhase === 'idle');
      if (eligible.length === 0) return;

      const currentGlowing = particles.filter(p => p.glowPhase !== 'idle').length;
      if (currentGlowing >= MAX_SIMULTANEOUS_GLOWS) return;

      const target = eligible[Math.floor(Math.random() * eligible.length)];
      target.glowPhase = 'rising';
      target.glowProgress = 0;
    };

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      const theme = getTheme();
      const palette = PALETTES[theme] || PALETTES.dark;

      // Trigger new glows frequently
      if (frame >= nextGlowFrame) {
        triggerRandomGlow();
        nextGlowFrame = frame + rand(GLOW_INTERVAL_MIN, GLOW_INTERVAL_MAX);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.rotation += p.rotationSpeed;

        // Ambient breathing
        const breath = p.breathDepth * Math.sin(p.breathSpeed * frame + p.breathPhase);
        let opacity = p.baseOpacity + breath;

        // Advance glow state machine
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

        // ── Draw glow bloom (radial gradient circles, no shadowBlur) ──
        if (isGlowing) {
          const bloomSize = p.size * (4 + glowEased * 12);
          const intensity = glowEased;

          // Large soft outer halo (radial gradient)
          const outerGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloomSize);
          outerGrad.addColorStop(0, `rgba(103, 232, 249, ${intensity * 0.35})`);
          outerGrad.addColorStop(0.3, `rgba(103, 232, 249, ${intensity * 0.15})`);
          outerGrad.addColorStop(1, 'rgba(103, 232, 249, 0)');
          ctx.fillStyle = outerGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, bloomSize, 0, Math.PI * 2);
          ctx.fill();

          // Medium bright halo
          const midGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, bloomSize * 0.4);
          midGrad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.6})`);
          midGrad.addColorStop(0.5, `rgba(197, 232, 247, ${intensity * 0.25})`);
          midGrad.addColorStop(1, 'rgba(197, 232, 247, 0)');
          ctx.fillStyle = midGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, bloomSize * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Boost star opacity during glow
          opacity = Math.min(1, opacity + glowEased * 0.8);
        }

        ctx.globalAlpha = Math.max(0.02, Math.min(1, opacity));

        if (p.isStar) {
          ctx.fillStyle = isGlowing ? palette.glowCore : p.color;
          drawFourPointStar(ctx, p.x, p.y, p.size * (isGlowing ? 1 + glowEased * 0.5 : 1), p.rotation);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
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
