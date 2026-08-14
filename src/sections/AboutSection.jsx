import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Smartphone, Cloud, Layers, ArrowRight } from 'lucide-react';
import EditableText from '../components/EditableText';
import MagneticButton from '../components/MagneticButton';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 20 } }
};

export default function AboutSection({ config, isAdmin, onUpdateConfig, onNavigateContact }) {
  return (
    <section className="section-viewport" id="about-section">
      <div className="section-content">
        <motion.div
          className="bento-container bento-viewport"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Large About block */}
          <motion.div className="bento-item bento-large" variants={itemVariants}>
            <h2 className="bento-title">
              <EditableText text={config.aboutTitle} isAdmin={isAdmin} onSave={(v) => onUpdateConfig('aboutTitle', v)} />
            </h2>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
              <EditableText text={config.aboutText1} isAdmin={isAdmin} multiline={true} onSave={(v) => onUpdateConfig('aboutText1', v)} />
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <EditableText text={config.aboutText2} isAdmin={isAdmin} multiline={true} onSave={(v) => onUpdateConfig('aboutText2', v)} />
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
              <MagneticButton as="button" onClick={onNavigateContact} className="btn-primary">
                Let's Connect <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </MagneticButton>
            </div>
          </motion.div>

          {/* Software */}
          <motion.div className="bento-item" variants={itemVariants}>
            <Terminal size={32} className="bento-icon" />
            <h3 className="bento-title" style={{ fontSize: '1.5rem' }}>Software</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>High-performance web architecture.</p>
            <div className="tag-list">
              <span className="tag">React</span>
              <span className="tag">TypeScript</span>
              <span className="tag">C#</span>
            </div>
          </motion.div>

          {/* Mobile */}
          <motion.div className="bento-item" variants={itemVariants}>
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

          {/* Cloud */}
          <motion.div className="bento-item" variants={itemVariants}>
            <Cloud size={32} className="bento-icon" />
            <h3 className="bento-title" style={{ fontSize: '1.5rem' }}>Cloud</h3>
            <div className="tag-list" style={{ marginTop: '1rem' }}>
              <span className="tag">Firebase</span>
              <span className="tag">Supabase</span>
              <span className="tag">Vercel</span>
            </div>
          </motion.div>

          {/* Design */}
          <motion.div className="bento-item" variants={itemVariants}>
            <Layers size={32} className="bento-icon" />
            <h3 className="bento-title" style={{ fontSize: '1.5rem' }}>Design & Workflow</h3>
            <div className="tag-list" style={{ marginTop: '1rem' }}>
              <span className="tag">Figma Wireframing</span>
              <span className="tag">UI/UX Principles</span>
              <span className="tag">Git / CI/CD</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
