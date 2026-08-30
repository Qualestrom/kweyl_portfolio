import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Github, Linkedin, Twitter, Instagram, MapPin, Send } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import EditableText from '../components/EditableText';
import './ContactSection.css';

// Helper to determine icon based on URL
const getSocialIcon = (url) => {
  const lower = url.toLowerCase();
  if (lower.includes('github.com')) return <Github size={18} />;
  if (lower.includes('linkedin.com')) return <Linkedin size={18} />;
  if (lower.includes('twitter.com') || lower.includes('x.com')) return <Twitter size={18} />;
  if (lower.includes('instagram.com')) return <Instagram size={18} />;
  return <Mail size={18} />;
};

export default function ContactSection({ config, isAdmin, onUpdateConfig }) {
  const socials = config?.heroSocials || [];
  
  // Form State for Mailto
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = `Portfolio Contact from ${formData.name}`;
    const body = `Name: ${formData.name}%0AEmail: ${formData.email}%0A%0AMessage:%0A${formData.message}`;
    window.location.href = `mailto:chrislamera0408@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="section-viewport" id="contact-section">
      <div className="section-content section-centered">
        
        <div className="contact-split-layout">
          {/* Left Panel: Info & Socials */}
          <motion.div 
            className="contact-left-panel"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>
              <h2 className="contact-headline">
                Let's <span className="contact-highlight">Build</span><br/>
                Something<br/>
                Together.
              </h2>
              <div className="contact-status-badge">
                <span className="status-dot"></span>
                {config?.aboutStatus || 'Open to Work'}
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '400px', marginTop: '1rem' }}>
              I'm always open to new opportunities, collaborations, and conversations about software engineering.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                <Mail size={18} className="contact-highlight" /> 
                <span style={{ fontSize: '1.05rem' }}>chrislamera0408@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                <MapPin size={18} className="contact-highlight" /> 
                <span style={{ fontSize: '1.05rem' }}>Philippines</span>
              </div>
            </div>

            <div className="social-links-grid">
              {socials.map((social) => (
                <a 
                  key={social.id}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-grid-item"
                >
                  {getSocialIcon(social.url)}
                  <span>{social.label || 'Link'}</span>
                </a>
              ))}
              {isAdmin && (
                <div style={{ gridColumn: '1 / -1', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  * Admin: Social links are managed in the Hero section.
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Panel: Glassmorphism Form */}
          <motion.div 
            className="contact-right-panel"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <form className="contact-form-card" onSubmit={handleSubmit}>
              <div className="contact-form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="contact-input" 
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="contact-form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="contact-input" 
                  placeholder="john@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="contact-form-group">
                <label>Message</label>
                <textarea 
                  name="message"
                  className="contact-textarea" 
                  placeholder="Tell me about your project..."
                  required
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>
              <button type="submit" className="contact-submit-btn">
                Send Message <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
