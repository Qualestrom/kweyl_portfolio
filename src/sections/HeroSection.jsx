import React from 'react';
import { motion } from 'framer-motion';
import EditableText from '../components/EditableText';

export default function HeroSection({ config, isAdmin, onUpdateConfig }) {
  return (
    <section className="section-viewport" id="hero-section">
      <div className="section-content section-centered">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="hero-headline">
            <EditableText text={config.hero1} isAdmin={isAdmin} onSave={(v) => onUpdateConfig('hero1', v)} /> <br/>
            <span style={{ color: 'var(--cryo-accent, var(--accent))' }}>
              <EditableText text={config.hero2} isAdmin={isAdmin} onSave={(v) => onUpdateConfig('hero2', v)} />
            </span><br/>
            <EditableText text={config.hero3} isAdmin={isAdmin} onSave={(v) => onUpdateConfig('hero3', v)} />
          </h1>
          <div className="hero-sub">
            <EditableText text={config.heroSub} isAdmin={isAdmin} multiline={true} onSave={(v) => onUpdateConfig('heroSub', v)} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
