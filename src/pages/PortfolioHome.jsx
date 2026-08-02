import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Terminal, Smartphone, Cloud, Layers, ArrowRight } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ProjectsList from '../components/ProjectsList';
import ThemeToggle from '../components/ThemeToggle';
import MagneticButton from '../components/MagneticButton';
import InteractiveBackground from '../components/InteractiveBackground';
import EditableText from '../components/EditableText';

export default function PortfolioHome({ isAdmin = false, onLogout }) {
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const [config, setConfig] = useState({
        hero1: "Engineering",
        hero2: "Digital",
        hero3: "Experiences.",
        heroSub: "Software Engineer & Front-End Developer crafting high-performance, scalable web and mobile applications.",
        aboutTitle: "The Architect.",
        aboutText1: "I am a Computer Engineering graduate specializing in Software Development.",
        aboutText2: "My philosophy is simple: complex problems require elegant, scalable software solutions. From architecting robust React front-ends to building cross-platform Flutter applications, I build end-to-end digital systems that perform flawlessly."
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, 'config', 'main');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (err) {
                console.error("Error fetching config:", err);
            }
        };
        fetchConfig();
    }, []);

    const handleUpdateConfig = async (key, value) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        try {
            await setDoc(doc(db, 'config', 'main'), newConfig, { merge: true });
        } catch (err) {
            console.error("Error updating config:", err);
        }
    };

    const navigate = useNavigate();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (isAdmin) return; // Disable konami code in admin mode
        
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];
        let konamiIndex = 0;

        const handleKeyDown = (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    setIsRedirecting(true);
                    setTimeout(() => navigate('/admin'), 1200); // Hold for 1.2s to finish animation and let user read text
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
                if (e.key === konamiCode[0]) {
                    konamiIndex = 1;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate, isAdmin]);

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const item = {
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
    };

    return (
        <>
            <AnimatePresence>
                {isRedirecting && (
                    <motion.div 
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, width: '100vw', height: '100vh',
                            background: 'var(--accent)',
                            zIndex: 99999,
                            transformOrigin: 'bottom'
                        }}
                    >
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontFamily: 'Outfit', fontSize: '3rem' }}
                        >
                            Accessing Mainframe...
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <InteractiveBackground />
            <div className="portfolio-wrapper">
                <header className="header">
                    <div className="nav-container">
                        <Link to="/" className="logo interactive">CHRISTOPHER.</Link>
                        <nav className="nav-links">
                            <MagneticButton as="a" href="#about" className="nav-link">About</MagneticButton>
                            <MagneticButton as="a" href="#projects" className="nav-link">Work</MagneticButton>
                            {isAdmin && <button onClick={onLogout} className="nav-link interactive" style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '1rem', cursor: 'pointer' }}>Logout</button>}
                            <ThemeToggle />
                        </nav>
                    </div>
                </header>

                <main>
                    {/* Hero Section */}
                    <section className="hero-section" id="hero">
                        <motion.div 
                            style={{ y: heroY, opacity }}
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h1 className="hero-headline">
                                <EditableText text={config.hero1} isAdmin={isAdmin} onSave={(v) => handleUpdateConfig('hero1', v)} /> <br/>
                                <span style={{ color: 'var(--accent)' }}><EditableText text={config.hero2} isAdmin={isAdmin} onSave={(v) => handleUpdateConfig('hero2', v)} /></span><br/>
                                <EditableText text={config.hero3} isAdmin={isAdmin} onSave={(v) => handleUpdateConfig('hero3', v)} />
                            </h1>
                            <div className="hero-sub">
                                <EditableText text={config.heroSub} isAdmin={isAdmin} multiline={true} onSave={(v) => handleUpdateConfig('heroSub', v)} />
                            </div>
                        </motion.div>
                    </section>

                    {/* Bento Box Section (About & Skills) */}
                    <section id="about">
                        <motion.div 
                            className="bento-container"
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            {/* Large About block */}
                            <motion.div className="bento-item bento-large" variants={item}>
                                <h2 className="bento-title">
                                    <EditableText text={config.aboutTitle} isAdmin={isAdmin} onSave={(v) => handleUpdateConfig('aboutTitle', v)} />
                                </h2>
                                <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    <EditableText text={config.aboutText1} isAdmin={isAdmin} multiline={true} onSave={(v) => handleUpdateConfig('aboutText1', v)} />
                                </div>
                                <div style={{ color: 'var(--text-muted)' }}>
                                    <EditableText text={config.aboutText2} isAdmin={isAdmin} multiline={true} onSave={(v) => handleUpdateConfig('aboutText2', v)} />
                                </div>
                                <div style={{ marginTop: 'auto' }}>
                                    <MagneticButton as="a" href="#contact" className="btn-primary">
                                        Let's Connect <ArrowRight size={16} style={{ marginLeft: '8px' }}/>
                                    </MagneticButton>
                                </div>
                            </motion.div>

                            {/* Software Block */}
                            <motion.div className="bento-item" variants={item}>
                                <Terminal size={32} className="bento-icon" />
                                <h3 className="bento-title" style={{ fontSize: '1.5rem' }}>Software</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>High-performance web architecture.</p>
                                <div className="tag-list">
                                    <span className="tag">React</span>
                                    <span className="tag">TypeScript</span>
                                    <span className="tag">C#</span>
                                </div>
                            </motion.div>

                            {/* Mobile Block */}
                            <motion.div className="bento-item bento-tall" variants={item}>
                                <Smartphone size={32} className="bento-icon" />
                                <h3 className="bento-title" style={{ fontSize: '1.5rem' }}>Mobile</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Cross-platform application development.</p>
                                <div className="tag-list">
                                    <span className="tag">Flutter</span>
                                    <span className="tag">Dart</span>
                                    <span className="tag">React Native</span>
                                    <span className="tag">PWA</span>
                                </div>
                            </motion.div>

                            {/* Infrastructure Block */}
                            <motion.div className="bento-item" variants={item}>
                                <Cloud size={32} className="bento-icon" />
                                <h3 className="bento-title" style={{ fontSize: '1.5rem' }}>Cloud</h3>
                                <div className="tag-list" style={{ marginTop: '1rem' }}>
                                    <span className="tag">Firebase</span>
                                    <span className="tag">Supabase</span>
                                    <span className="tag">Vercel</span>
                                </div>
                            </motion.div>

                            {/* Design Block */}
                            <motion.div className="bento-item bento-wide" variants={item}>
                                <Layers size={32} className="bento-icon" />
                                <h3 className="bento-title" style={{ fontSize: '1.5rem' }}>Design & Workflow</h3>
                                <div className="tag-list" style={{ marginTop: '1rem' }}>
                                    <span className="tag">Figma Wireframing</span>
                                    <span className="tag">UI/UX Principles</span>
                                    <span className="tag">Git / CI/CD</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </section>

                    {/* Dynamic Projects */}
                    <ProjectsList isAdmin={isAdmin} />

                    {/* Footer / Contact */}
                    <section id="contact" style={{ padding: '100px 40px', textAlign: 'center' }}>
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 style={{ fontSize: '4rem', textTransform: 'uppercase', marginBottom: '2rem' }}>Ready to build?</h2>
                            <MagneticButton as="a" href="mailto:chrislamera0408@gmail.com" className="btn-primary" style={{ padding: '24px 48px', fontSize: '1.5rem' }}>
                                Start a Conversation
                            </MagneticButton>
                        </motion.div>
                    </section>
                </main>
            </div>
        </>
    );
}
