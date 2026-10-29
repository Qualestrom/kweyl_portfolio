import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  MessageSquare, 
  Briefcase, 
  Globe, 
  Clock, 
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { DynamicSocialIcon } from '../components/HomeHero';
import { ensureAbsoluteUrl } from '../utils/imageUtils';
import './ContactSection.css';

const CONTACT_INTENTS = [
  {
    id: 'fulltime',
    label: 'Full-Time Role',
    icon: Briefcase,
    subject: '[Role Inquiry] Engineering Opportunity',
    placeholder: 'Hi Christopher, I came across your portfolio and wanted to discuss an engineering role at...',
  },
  {
    id: 'contract',
    label: 'Contract / Project',
    icon: Sparkles,
    subject: '[Project Inquiry] Scope & Timeline',
    placeholder: 'Hi Christopher, we have a project involving web/mobile development and would like to check your availability...',
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    icon: Globe,
    subject: '[Collaboration] Technical Exploration',
    placeholder: 'Hi Christopher, I would love to connect and explore collaborating on...',
  },
  {
    id: 'general',
    label: 'General Inquiry',
    icon: MessageSquare,
    subject: '[Inquiry] Connecting with Christopher',
    placeholder: 'Hi Christopher, reaching out to ask about...',
  },
];

export default function ContactSection({ config, isAdmin, isLoading = false }) {
  const socials = Array.isArray(config?.heroSocials) && config.heroSocials.length > 0 
    ? config.heroSocials 
    : [
        { id: '1', url: 'https://github.com/Qualestrom', label: 'GitHub Profile' },
        { id: '2', url: 'https://linkedin.com', label: 'LinkedIn Profile' }
      ];

  const primaryEmail = 'chrislamera0408@gmail.com';

  // Intent & Form State
  const [selectedIntentId, setSelectedIntentId] = useState('fulltime');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const activeIntent = CONTACT_INTENTS.find((it) => it.id === selectedIntentId) || CONTACT_INTENTS[0];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectIntent = (intentId) => {
    setSelectedIntentId(intentId);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(primaryEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2400);
    } catch (_) {
      // Fallback
    }
  };

  // Compile formatted message draft
  const getCompiledDraft = () => {
    const sender = formData.name ? `${formData.name}${formData.email ? ` <${formData.email}>` : ''}` : 'Portfolio Visitor';
    return `To: ${primaryEmail}\nSubject: ${activeIntent.subject}\nFrom: ${sender}\n\nMessage:\n${formData.message || '(No message body provided)'}`;
  };

  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(getCompiledDraft());
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2600);
    } catch (_) {}
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    const subject = encodeURIComponent(`${activeIntent.subject} - ${formData.name || 'Portfolio Contact'}`);
    const body = encodeURIComponent(
      `Hi Christopher,\n\n${formData.message}\n\n---\nSender: ${formData.name || 'Anonymous'}\nContact Email: ${formData.email || 'Not specified'}\nIntent Category: ${activeIntent.label}`
    );

    window.location.href = `mailto:${primaryEmail}?subject=${subject}&body=${body}`;
    setTimeout(() => setIsSending(false), 1500);
  };

  // Gmail Web fallback link
  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(primaryEmail)}&su=${encodeURIComponent(activeIntent.subject)}`;

  return (
    <section className="section-viewport contact-viewport overflow-y-auto lg:overflow-hidden" id="contact-section">
      <div className="section-content contact-section-content w-full flex flex-col justify-start lg:justify-center items-center px-4 sm:px-8 lg:pl-[210px] xl:pl-[250px] lg:pr-8 xl:pr-14 max-w-[1480px] my-auto">
        
        <div className="contact-grid">
          
          {/* ─── Left Column: Presence, Status, & Direct Channels (Unboxed, Airy) ─── */}
          <motion.div
            className="contact-presence-column"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top Group: Status + Headline + Bio */}
            <div className="contact-presence-header-group">
              <div className="contact-status-beacon">
                <span className="contact-status-dot" />
                <span className="contact-status-text">
                  {config?.aboutStatus || 'Available for Full-Time Roles & High-Impact Contracts'}
                </span>
              </div>

              <h2 className="contact-headline">
                Have a project in mind, or an open role on your team?{' '}
                <span className="contact-headline-accent">Let's talk.</span>
              </h2>

              <p className="contact-bio-lead">
                Computer Engineering graduate specializing in Full-Stack Web and Cross-Platform Mobile development (React, React Native, Flutter, Supabase). Based in the Philippines (UTC+8) and open to remote worldwide and hybrid opportunities.
              </p>
            </div>

            {/* Middle: Direct Email Hub */}
            <div className="contact-email-hub">
              <div className="contact-email-header">
                <span className="contact-email-label">
                  <Mail size={13} className="text-sky-400" /> Direct Communication Hub
                </span>
                <span className="contact-email-sla">
                  <Clock size={11} /> Typically replies within 24 hours
                </span>
              </div>

              <div className="contact-email-box">
                <div className="contact-email-address" title={primaryEmail}>
                  {primaryEmail}
                </div>
                <div className="contact-email-actions">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`contact-action-btn ${copiedEmail ? 'contact-action-btn--success' : ''}`}
                    title="Copy email to clipboard"
                    aria-label="Copy email to clipboard"
                  >
                    {copiedEmail ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={gmailWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-action-btn contact-action-btn--gmail"
                    title="Open directly in Gmail web"
                  >
                    <span>Gmail Web</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>

              {/* Geographic & Availability Meta */}
              <div className="contact-meta-row">
                <div className="contact-meta-item">
                  <Globe size={12} className="text-sky-400" />
                  <span>Philippines (UTC+8)</span>
                </div>
                <div className="contact-meta-divider" />
                <div className="contact-meta-item">
                  <Briefcase size={12} className="text-sky-400" />
                  <span>Remote Worldwide / Hybrid</span>
                </div>
              </div>
            </div>

            {/* Bottom: Profiles & Verification Links */}
            <div className="contact-channels-block">
              <span className="contact-channels-title">Profiles &amp; Verification</span>
              <div className="contact-channels-list">
                {socials.map((social) => (
                  <a
                    key={social.id || social.url}
                    href={ensureAbsoluteUrl(social.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-channel-pill"
                    title={social.label}
                  >
                    <DynamicSocialIcon url={social.url} size={15} strokeWidth={1.75} />
                    <span>{social.label || 'Channel'}</span>
                    <ExternalLink size={11} className="contact-channel-pill-arrow" />
                  </a>
                ))}

                {/* Direct CV Download Link */}
                <a
                  href={config?.heroCvUrl || '/assets/recovered/resumes/Lamera_Resume.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-channel-pill contact-channel-pill--cv"
                  title="View / Download Resume PDF"
                >
                  <ArrowUpRight size={13} className="text-sky-400" />
                  <span>Download Curriculum Vitae</span>
                </a>
              </div>
            </div>

          </motion.div>

          {/* ─── Right Bento Card: Crystalline Dispatch Terminal ─── */}
          <motion.div
            className="contact-bento-card contact-terminal-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Terminal Header */}
            <div className="contact-terminal-header">
              <div className="contact-terminal-title-wrap">
                <div className="contact-terminal-icon">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="contact-terminal-heading">Crystalline Dispatch Terminal</h3>
                  <p className="contact-terminal-sub">Select your inquiry intent or draft a direct message</p>
                </div>
              </div>
            </div>

            {/* Inquiry Intent Selector Chips */}
            <div className="contact-intents-wrapper">
              <span className="contact-intents-label">Inquiry Intent</span>
              <div className="contact-intents-chips">
                {CONTACT_INTENTS.map((intent) => {
                  const isSelected = selectedIntentId === intent.id;
                  const IntentIcon = intent.icon;
                  return (
                    <button
                      key={intent.id}
                      type="button"
                      onClick={() => handleSelectIntent(intent.id)}
                      className={`contact-intent-chip ${isSelected ? 'active' : ''}`}
                    >
                      <IntentIcon size={12} className={isSelected ? 'text-sky-300' : 'text-slate-400'} />
                      <span>{intent.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dispatch Form */}
            <form onSubmit={handleSubmit} className="contact-form">
              
              <div className="contact-form-row">
                <div className="contact-input-group">
                  <label htmlFor="contact-sender-name" className="contact-input-label">
                    Your Name
                  </label>
                  <input
                    id="contact-sender-name"
                    type="text"
                    name="name"
                    className="contact-input"
                    placeholder="e.g. Christopher"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-input-group">
                  <label htmlFor="contact-sender-email" className="contact-input-label">
                    Your Email Address
                  </label>
                  <input
                    id="contact-sender-email"
                    type="email"
                    name="email"
                    className="contact-input"
                    placeholder="your.email@domain.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="contact-input-group">
                <div className="flex items-center justify-between">
                  <label htmlFor="contact-sender-message" className="contact-input-label">
                    Message Body
                  </label>
                  <span className="contact-input-hint">
                    Topic: {activeIntent.label}
                  </span>
                </div>
                <textarea
                  id="contact-sender-message"
                  name="message"
                  className="contact-textarea"
                  placeholder={activeIntent.placeholder}
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              {/* Dual-Action Dispatch Row */}
              <div className="contact-actions-row">
                <button
                  type="submit"
                  className="contact-btn-submit"
                  disabled={isSending}
                >
                  <Send size={14} />
                  <span>{isSending ? 'Opening Mail Client...' : 'Send via Email Client'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className={`contact-btn-copy-draft ${copiedDraft ? 'contact-btn-copy-draft--success' : ''}`}
                  title="Copy formatted draft to paste in browser webmail (Gmail / Outlook)"
                >
                  {copiedDraft ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Draft Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Draft Text</span>
                    </>
                  )}
                </button>
              </div>

              {/* Webmail assistance notice */}
              <div className="contact-form-footer-hint">
                <span>* Using browser webmail? Click <strong>Copy Draft Text</strong> to paste directly into your open Gmail or Outlook tab.</span>
              </div>

            </form>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
