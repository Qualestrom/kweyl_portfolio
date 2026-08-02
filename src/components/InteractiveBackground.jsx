import React, { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = { x: -1000, y: -1000, radius: 150 };

        const SPACING = 40; // Grid spacing
        const SPRING = 0.05; // Spring back to original position
        const FRICTION = 0.85; // Damping
        const REPULSION = 5; // How hard the mouse pushes

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const cols = Math.floor(width / SPACING) + 2;
            const rows = Math.floor(height / SPACING) + 2;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = (i - 1) * SPACING;
                    const y = (j - 1) * SPACING;
                    particles.push({
                        baseX: x, baseY: y,
                        x: x, y: y,
                        vx: 0, vy: 0,
                    });
                }
            }
        };

        const animate = () => {
            // Use a subtle color based on the current theme
            // We'll just draw them in a highly transparent, neutral gray so it works in both themes, 
            // or we could use the CSS accent variable if we want it to pop.
            ctx.clearRect(0, 0, width, height);
            
            // Getting the current theme color is tricky in canvas without re-reading CSS vars constantly,
            // so we'll use a semi-transparent gray that looks good on both black and white.
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                
                // Distance from mouse
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Force from mouse
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    p.vx += Math.cos(angle) * force * REPULSION;
                    p.vy += Math.sin(angle) * force * REPULSION;
                }

                // Spring back to base position
                p.vx += (p.baseX - p.x) * SPRING;
                p.vy += (p.baseY - p.y) * SPRING;

                // Friction
                p.vx *= FRICTION;
                p.vy *= FRICTION;

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Draw dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

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
                pointerEvents: 'none'
            }}
        />
    );
}
