import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  MapPin, 
  Copy, 
  Check, 
  Sparkles, 
  Globe, 
  Share2, 
  MessageSquare, 
  AtSign, 
  ExternalLink,
  Clock
} from 'lucide-react';
import './ContactSection.css';

// Helper to determine icon based on URL
const getSocialIcon = (url = '') => {
  const lower = url.toLowerCase();
  if (lower.includes('github.com')) return <Globe size={16} />;
  if (lower.includes('linkedin.com')) return <Share2 size={16} />;
  if (lower.includes('twitter.com') || lower.includes('x.com')) return <MessageSquare size={16} />;
  if (lower.includes('instagram.com')) return <AtSign size={16} />;
  return <Mail size={16} />;
};

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
    <section className="section-viewport overflow-y-auto lg:overflow-hidden py-8 sm:py-10 lg:py-0" id="contact-section">
      <div className="section-content w-full h-full flex items-center justify-center px-4 sm:px-8 lg:pl-36 xl:pl-48 lg:pr-10 xl:pr-16 max-w-[1440px]">
        
        <div className="contact-split-layout">
          {/* ─── Left Panel: Contact Details & Socials ─── */}
          <motion.div 
            className="contact-left-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="contact-badge">
              <Sparkles size={13} className="contact-badge-icon" />
              <span>COMMUNICATION TERMINAL</span>
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
                <div className="contact-info-icon-wrapper">
                  <Mail size={16} className="contact-info-icon" />
                </div>
                <div className="contact-info-text-group">
                  <span className="contact-info-label">Direct Email</span>
                  <span className="contact-info-value">chrislamera0408@gmail.com</span>
                </div>
                <button 
                  type="button" 
                  className="contact-copy-btn" 
                  aria-label="Copy email"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span className="copy-label">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="contact-info-card static">
                <div className="contact-info-icon-wrapper">
                  <MapPin size={16} className="contact-info-icon" />
                </div>
                <div className="contact-info-text-group">
                  <span className="contact-info-label">Current Location</span>
                  <span className="contact-info-value">Philippines &bull; Remote Worldwide</span>
                </div>
                <div className="contact-tz-badge">
                  <Clock size={11} />
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
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-grid-item"
                  >
                    <span className="social-grid-icon">{getSocialIcon(social.url)}</span>
                    <span className="social-grid-name">{social.label || 'Channel'}</span>
                    <ExternalLink size={12} className="social-grid-ext" />
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
                  <Send size={16} className="contact-send-icon" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
