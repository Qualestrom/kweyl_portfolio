import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MapPin, 
  Send, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles,
  MessageSquare
} from 'lucide-react';
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
      <div className="section-content contact-section-content w-full flex flex-col justify-start lg:justify-center items-center my-0 lg:my-auto">
        
        <div className="contact-unified-layout w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* ─── Left Panel: Contact Details & Socials (Stellar-Cryo Themed) ─── */}
          <motion.div
            className="contact-left-panel flex flex-col gap-3.5 sm:gap-4.5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header Eyebrow & Status Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-100 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/25 shadow-xs">
                <Mail size={13} className="text-sky-700 dark:text-sky-400" />
                <span>Initiate Contact</span>
              </div>

              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-sky-400/30 text-slate-800 dark:text-sky-300 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-sky-400" />
                <span>{config?.aboutStatus || 'Open to Work'}</span>
              </div>
            </div>

            {/* Headline */}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Let&apos;s <span className="text-sky-600 dark:text-sky-400">Build</span> Something Exceptional.
            </h2>

            {/* Intro text */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 max-w-lg leading-relaxed font-normal">
              Available for full-stack web and mobile engineering, technical architecture, and high-impact software solutions. Reach out directly or send a message below.
            </p>

            {/* Quick Contact Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              {/* Direct Email Card */}
              <div 
                className="group p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl flex items-center justify-between gap-2 cursor-pointer hover:border-sky-400/50 transition-colors shadow-xs"
                onClick={handleCopyEmail}
                title="Click to copy email address"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Direct Email</span>
                  <span className="text-xs sm:text-sm font-mono font-semibold text-slate-900 dark:text-white truncate">chrislamera0408@gmail.com</span>
                </div>
                <button
                  type="button"
                  className="shrink-0 w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 text-sky-800 dark:text-sky-300 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors"
                  aria-label="Copy email address"
                >
                  {copied ? <Check size={14} className="text-emerald-500 dark:text-sky-400" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Location Card */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl flex items-center justify-between gap-2 shadow-xs">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Current Location</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1">
                    <MapPin size={12} className="text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Philippines • Remote</span>
                  </span>
                </div>
                <div className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.08] border border-slate-300 dark:border-white/10 text-[10px] font-mono tabular-nums font-bold text-slate-800 dark:text-slate-300">
                  UTC+8
                </div>
              </div>
            </div>

            {/* Social Grid */}
            <div className="pt-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                Profiles &amp; Channels
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {socials.map((social) => (
                  <a
                    key={social.id || social.url}
                    href={ensureAbsoluteUrl(social.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-sky-400/50 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors shadow-xs active:scale-95"
                  >
                    <span>{social.label || 'Channel'}</span>
                    <ExternalLink size={11} className="opacity-70" />
                  </a>
                ))}
              </div>
              {isAdmin && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  * Social links are synchronised with Hero section configuration.
                </div>
              )}
            </div>
          </motion.div>

          {/* ─── Right Panel: Crystalline Dispatch Form ─── */}
          <motion.div
            className="contact-right-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-400/30 flex items-center justify-center text-sky-700 dark:text-sky-300">
                    <MessageSquare size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                      Send Direct Message
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Dispatches straight to primary mailbox
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="contact-name" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
                      placeholder="e.g. Alex Morgan"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="contact-email" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
                      placeholder="alex@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="contact-message" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Your Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors resize-none"
                    placeholder="Tell me about your project, timeline, or inquiries..."
                    required
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="contact-submit-btn w-full mt-1 inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold text-white dark:text-slate-950 bg-sky-600 hover:bg-sky-500 dark:bg-sky-400 dark:hover:bg-sky-300 border border-sky-500/40 shadow-sm active:scale-98 transition-colors cursor-pointer"
                  disabled={isSending}
                >
                  <Send size={13} />
                  <span>{isSending ? 'Opening Mail Client...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
