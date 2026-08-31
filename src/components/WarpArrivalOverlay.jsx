import React, { useEffect, useRef, useState } from 'react';
import './WarpArrivalOverlay.css';

export default function WarpArrivalOverlay({ onComplete }) {
  const canvasRef = useRef(null);
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    const docTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(docTheme);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    // Generate streaks bursting OUTWARD from center (forward hyperspace travel)
    const streakCount = Math.max(90, Math.floor((w * h) / 9000));
    const streaks = Array.from({ length: streakCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 80 + 20; // Start near center
      const speed = Math.random() * 25 + 35; // Fast initial forward velocity
      const length = Math.random() * 120 + 80;
      
      return {
        angle,
        distance,
        speed,
        length,
        size: Math.random() * 2 + 1.2,
      };
    });
    
    let frame = 0;
    let raf;
    const maxFrames = 50;
    
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      
      const cx = w / 2;
      const cy = h / 2;
      const progress = frame / maxFrames; // 0 to 1
      const alphaFade = Math.max(0, 1 - progress);
      
      const isLight = theme === 'light';
      const streakColor = isLight ? 'rgba(2, 132, 199, ' : 'rgba(34, 211, 238, ';
      const coreColor = isLight ? '#0284C7' : '#FFFFFF';
      
      // Update and draw streaks (moving OUTWARD and decelerating)
      for (const streak of streaks) {
        streak.distance += streak.speed;
        streak.speed *= 0.93; // Decelerate smoothly
        
        const x = cx + Math.cos(streak.angle) * streak.distance;
        const y = cy + Math.sin(streak.angle) * streak.distance;
        
        // Tail is closer to center
        const tailDist = Math.max(0, streak.distance - streak.length * (streak.speed / 20));
        const tailX = cx + Math.cos(streak.angle) * tailDist;
        const tailY = cy + Math.sin(streak.angle) * tailDist;
        
        const grad = ctx.createLinearGradient(tailX, tailY, x, y);
        grad.addColorStop(0, streakColor + '0)');
        grad.addColorStop(0.5, streakColor + (alphaFade * 0.7).toFixed(3) + ')');
        grad.addColorStop(1, coreColor);
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(1, streak.size * (streak.speed / 15));
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      if (frame < maxFrames) {
        raf = requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };
    
    raf = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [theme, onComplete]);

  return (
    <div className="warp-arrival-overlay">
      <canvas ref={canvasRef} />
    </div>
  );
}
