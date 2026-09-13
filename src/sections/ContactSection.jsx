import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ensureAbsoluteUrl } from '../utils/imageUtils';
import './ContactSection.css';

export default function ContactSection({ config, isAdmin }) {
  const socials = config?.heroSocials || [];
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('chrislamera0408@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (_) {
      // Fallback
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:chrislamera0408@gmail.com?subject=${subject}&body=${body}`;
    setTimeout(() => setIsSending(false), 1200);
  };

  return (
    <section className="section-viewport overflow-y-auto lg:overflow-hidden" id="contact-section">
      <div className="section-content w-full min-h-full flex flex-col justify-start lg:justify-center items-center px-4 sm:px-8 lg:pl-36 xl:pl-48 lg:pr-10 xl:pr-16 max-w-[1440px] pt-8 sm:pt-14 pb-24 sm:pb-28 lg:py-0 my-auto">
        
        <div className="contact-split-layout">
          {/* ─── Left Panel: Contact Details & Socials ─── */}
          <motion.div 
            className="contact-left-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="contact-badge">
              <span>Get In Touch</span>
            </div>

            <h2 className="contact-headline">
              Let's <span className="contact-highlight">Build</span> Something Remarkable.
            </h2>

            <div className="contact-status-badge">
              <span className="status-dot"></span>
              <span className="status-text">{config?.aboutStatus || 'Open to Work & Collaborations'}</span>
            </div>

            <p className="contact-intro-text">
              Looking for a dedicated software developer for web or mobile? I'm available for engineering roles, technical partnerships, and high-impact projects.
            </p>

            {/* Quick Contact Chips */}
            <div className="contact-info-cards">
              <div className="contact-info-card group" onClick={handleCopyEmail} title="Click to copy email address">
                <div className="contact-info-text-group">
                  <span className="contact-info-label">Direct Email</span>
                  <span className="contact-info-value">chrislamera0408@gmail.com</span>
                </div>
                <button 
                  type="button" 
                  className="contact-copy-btn" 
                  aria-label="Copy email"
                >
                  <span className="copy-label">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="contact-info-card static">
                <div className="contact-info-text-group">
                  <span className="contact-info-label">Current Location</span>
                  <span className="contact-info-value">Philippines &bull; Remote Worldwide</span>
                </div>
                <div className="contact-tz-badge">
                  <span>UTC+8</span>
                </div>
              </div>
            </div>

            {/* Social Grid */}
            <div className="contact-social-section">
              <span className="contact-social-heading">Verified Profiles</span>
              <div className="social-links-grid">
                {socials.map((social) => (
                  <a 
                    key={social.id || social.url}
                    href={ensureAbsoluteUrl(social.url)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-grid-item"
                  >
                    <span className="social-grid-name">{social.label || 'Channel'}</span>
                  </a>
                ))}
              </div>
              {isAdmin && (
                <div className="contact-admin-hint">
                  * Social links are synchronised with the Hero section configuration.
                </div>
              )}
            </div>
          </motion.div>

          {/* ─── Right Panel: Interactive Message Form ─── */}
          <motion.div 
            className="contact-right-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <div className="contact-form-card">
              <div className="contact-form-header">
                <h3 className="contact-form-title">Send Direct Message</h3>
                <p className="contact-form-sub">Dispatches directly to my primary mailbox.</p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-group">
                  <label htmlFor="contact-name">Your Name</label>
                  <input 
                    id="contact-name"
                    type="text" 
                    name="name"
                    className="contact-input" 
                    placeholder="e.g. Alex Morgan"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-email">Email Address</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    name="email"
                    className="contact-input" 
                    placeholder="alex@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-message">Your Message</label>
                  <textarea 
                    id="contact-message"
                    name="message"
                    className="contact-textarea" 
                    placeholder="Tell me about your project, timeline, or inquiries..."
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <button 
                  type="submit" 
                  className={`contact-submit-btn ${isSending ? 'is-sending' : ''}`}
                  disabled={isSending}
                >
                  <span>{isSending ? 'Opening Mail...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
