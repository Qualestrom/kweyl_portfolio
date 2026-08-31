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
    
    // Generate streaks starting from outer edges
    const streakCount = Math.max(80, Math.floor((w * h) / 10000));
    const streaks = Array.from({ length: streakCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.hypot(w, h) * (0.5 + Math.random() * 0.5); // Start far away
      const speed = Math.random() * 20 + 30; // Fast initial speed
      const length = Math.random() * 150 + 50;
      
      return {
        angle,
        distance,
        speed,
        length,
        size: Math.random() * 2 + 1,
      };
    });
    
    let frame = 0;
    let raf;
    
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      
      const cx = w / 2;
      const cy = h / 2;
      
      const isLight = theme === 'light';
      const streakColor = isLight ? 'rgba(8, 145, 178, ' : 'rgba(34, 211, 238, ';
      const coreColor = isLight ? '#0891B2' : '#ffffff';
      
      // Update and draw streaks (moving INWARD)
      for (const streak of streaks) {
        streak.distance -= streak.speed;
        
        // Slow down as it approaches center
        streak.speed *= 0.94;
        
        if (streak.distance < 10) continue; // Passed center
        
        const x = cx + Math.cos(streak.angle) * streak.distance;
        const y = cy + Math.sin(streak.angle) * streak.distance;
        
        // Tail is further out
        const tailX = cx + Math.cos(streak.angle) * (streak.distance + streak.length * (streak.speed / 10));
        const tailY = cy + Math.sin(streak.angle) * (streak.distance + streak.length * (streak.speed / 10));
        
        const grad = ctx.createLinearGradient(x, y, tailX, tailY);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, coreColor);
        grad.addColorStop(1, streakColor + '0)');
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(1, streak.size * (streak.speed / 15));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
      
      // Central bloom shrinking/fading
      const maxR = Math.hypot(w, h) * 1.1;
      
      // Flash starts at 1, goes to 0 rapidly
      const flashProgress = Math.max(0, 1 - frame / 45); 
      
      if (flashProgress > 0) {
        const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * Math.max(0.1, flashProgress));
        
        if (isLight) {
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, flashProgress * 1.5)})`);
          flashGrad.addColorStop(0.6, `rgba(186, 230, 253, ${Math.min(0.9, flashProgress * 1.1)})`);
          flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${Math.min(1, flashProgress * 1.5)})`);
          flashGrad.addColorStop(0.6, `rgba(34, 211, 238, ${Math.min(0.9, flashProgress * 1.1)})`);
          flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        
        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, w, h);
      }
      
      if (frame < 80) {
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
