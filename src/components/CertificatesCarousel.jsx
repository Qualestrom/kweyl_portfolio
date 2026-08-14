import React, { useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import { Award } from 'lucide-react';
import './CertificatesCarousel.css';

const certificates = [
    { id: 1, title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
    { id: 2, title: 'Google Professional Cloud Developer', issuer: 'Google Cloud', date: '2023' },
    { id: 3, title: 'Meta Front-End Developer', issuer: 'Meta', date: '2022' },
    { id: 4, title: 'Certified Kubernetes Administrator', issuer: 'CNCF', date: '2024' },
    { id: 5, title: 'Advanced React Patterns', issuer: 'Frontend Masters', date: '2022' },
    { id: 6, title: 'Full Stack Open', issuer: 'University of Helsinki', date: '2021' }
];

const CertificatesCarousel = () => {
    const rotation = useMotionValue(0);
    const [isDragging, setIsDragging] = useState(false);
    const direction = useRef(-1);
    
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Smooth auto-rotation
    useAnimationFrame((t, delta) => {
        if (!isDragging) {
            // Mobile check: only rotate if we are likely using 3D
            if (windowWidth > 768) {
                rotation.set(rotation.get() + direction.current * (delta / 60));
            }
        }
    });

    const handlePan = (e, info) => {
        if (windowWidth <= 768) return;
        rotation.set(rotation.get() + info.delta.x * 0.5);
    };

    const handlePanStart = () => setIsDragging(true);
    
    const handlePanEnd = (e, info) => {
        setIsDragging(false);
        if (info.velocity.x > 50) direction.current = 1;
        else if (info.velocity.x < -50) direction.current = -1;
    };

    return (
        <section id="certificates" className="certificates-section">
            <div className="section-header">
                <h2 className="section-title">Certifications</h2>
                <p className="section-subtitle">Continuous learning and professional development.</p>
            </div>
            
            <div className="carousel-container">
                <motion.div 
                    className="carousel-spinner"
                    style={{ rotateY: rotation }}
                    onPan={handlePan}
                    onPanStart={handlePanStart}
                    onPanEnd={handlePanEnd}
                >
                    {certificates.map((cert, index) => {
                        const angle = (360 / certificates.length) * index;
                        // Smaller landscape translation distance
                        const translateZ = windowWidth > 1024 ? 320 : 280;
                        
                        return (
                            <div 
                                key={cert.id} 
                                className="carousel-card"
                                style={{
                                    transform: `rotateY(${angle}deg) translateZ(${translateZ}px)`
                                }}
                            >
                                <div className="carousel-card-inner">
                                    <div className="cert-header">
                                        <Award size={32} className="cert-icon" />
                                        <span className="cert-date">{cert.date}</span>
                                    </div>
                                    <h3>{cert.title}</h3>
                                    <p className="cert-issuer">{cert.issuer}</p>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

export default CertificatesCarousel;
