import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

export default function ContactSection() {
  return (
    <section className="section-viewport" id="contact-section">
      <div className="section-content section-centered">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', maxWidth: '600px' }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            textTransform: 'uppercase',
            marginBottom: '1rem',
            lineHeight: 1.1,
          }}>
            Ready to <span style={{ color: 'var(--cryo-accent, var(--accent))' }}>build</span>?
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
            marginBottom: '2.5rem',
            lineHeight: 1.7,
          }}>
            I'm always open to new opportunities, collaborations, and conversations about software engineering.
          </p>

          {/* Contact Links */}
          <div className="contact-links">
            <MagneticButton
              as="a"
              href="mailto:chrislamera0408@gmail.com"
              className="contact-link-item"
            >
              <Mail size={20} />
              <span>chrislamera0408@gmail.com</span>
            </MagneticButton>
          </div>

          {/* CTA Button */}
          <div style={{ marginTop: '2.5rem' }}>
            <MagneticButton
              as="a"
              href="mailto:chrislamera0408@gmail.com"
              className="btn-primary"
              style={{ padding: '18px 40px', fontSize: '1.1rem' }}
            >
              Start a Conversation <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
