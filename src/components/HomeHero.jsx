import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Sparkles, 
  Link as LinkIcon, 
  FileText, 
  Edit3,
  Layers,
  Crop
} from 'lucide-react';
import EditableText from './EditableText';
import ImageCropperModal, { FRAME_ANIMATIONS } from './ImageCropperModal';
import HeadlineEditorModal from './HeadlineEditorModal';
import { getLinkIconType, ensureAbsoluteUrl } from '../utils/imageUtils';
import './HomeHero.css';

// ─── Crisp Vector Social / Platform Icons ────────────────────────────────────────
export const DynamicSocialIcon = ({ url = '', size = 20, strokeWidth = 1.5 }) => {
  const type = getLinkIconType(url);

  switch (type) {
    case 'github':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 19 4s-1.12-.36-3.7 1.39a12.1 12.1 0 0 0-7 0C5.7 3.64 4.58 4 4.58 4A5.07 5.07 0 0 0 4 4.77 5.44 5.44 0 0 0 2 7.98c0 5.46 3.3 6.65 6.44 7A4.8 4.8 0 0 0 7.4 18v4" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'twitter':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
          <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
        </svg>
      );
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
        </svg>
      );
    case 'discord':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6h0a14.5 14.5 0 0 0-4-1.3 1 1 0 0 0-1 .5 9.8 9.8 0 0 0-.5 1.1 13.9 13.9 0 0 0-5 0 9.8 9.8 0 0 0-.5-1.1 1 1 0 0 0-1-.5A14.5 14.5 0 0 0 6 6a15.8 15.8 0 0 0-2.5 11.5 1 1 0 0 0 .5.8 15.5 15.5 0 0 0 4.7 2.4 1 1 0 0 0 1.1-.5 11.3 11.3 0 0 0 .9-1.8 9.6 9.6 0 0 1-1.5-.7 1 1 0 0 1-.2-1.3 1 1 0 0 1 1.2-.4 10.8 10.8 0 0 0 3.8.7 10.8 10.8 0 0 0 3.8-.7 1 1 0 0 1 1.2.4 1 1 0 0 1-.2 1.3 9.6 9.6 0 0 1-1.5.7 11.3 11.3 0 0 0 .9 1.8 1 1 0 0 0 1.1.5 15.5 15.5 0 0 0 4.7-2.4 1 1 0 0 0 .5-.8A15.8 15.8 0 0 0 18 6z" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="15" cy="12" r="1" />
        </svg>
      );
    case 'mail':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'twitch':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
        </svg>
      );
    case 'figma':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
          <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
          <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
          <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
          <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
        </svg>
      );
    case 'gitlab':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 5.5 2a.4.4 0 0 1 .4.28l2.24 6.9h7.72l2.24-6.9a.4.4 0 0 1 .4-.28.42.42 0 0 1 .79.16l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.94z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    case 'blog':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'dribbble':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
          <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
          <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
        </svg>
      );
    case 'codepen':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          <line x1="12" y1="22" x2="12" y2="15.5" />
          <polyline points="22 8.5 12 15.5 2 8.5" />
          <polyline points="2 15.5 12 8.5 22 15.5" />
          <line x1="12" y1="22" x2="12" y2="8.5" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
};

// ─── Stellar-Cryo Cosmic Avatar Graphic (Default fallback) ───────────────────────
const CosmicAvatarGraphic = () => (
  <svg viewBox="0 0 200 200" className="home-hero-avatar-img" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="100" fill="url(#cosmic-grad)" />
    <circle cx="100" cy="78" r="32" stroke="#66D7EE" strokeWidth="2.5" fill="#0B132B" />
    <path d="M50 165 C 50 125, 150 125, 150 165" stroke="#66D7EE" strokeWidth="2.5" fill="#0B132B" />
    <circle cx="100" cy="78" r="22" fill="#66D7EE" fillOpacity="0.15" />
    <path d="M85 75 Q100 68 115 75" stroke="#66D7EE" strokeWidth="2" strokeLinecap="round" />
    <path d="M92 72 L108 72" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8" />
    <defs>
      <radialGradient id="cosmic-grad" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="60%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#0B132B" />
      </radialGradient>
    </defs>
  </svg>
);

export default function HomeHero({
  config = {},
  isAdmin = false,
  onUpdateConfig,
  onNavigateProjects = null,
}) {
  const [imageError, setImageError] = useState(false);

  // Modals state
  const [cropperModalOpen, setCropperModalOpen] = useState(false);
  const [tempImageSource, setTempImageSource] = useState(null);
  const [headlineModalOpen, setHeadlineModalOpen] = useState(false);
  const [linksModalOpen, setLinksModalOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);

  // Hidden File input ref for clicking avatar
  const avatarFileInputRef = useRef(null);

  // Links edit local state
  const [socialsList, setSocialsList] = useState([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');

  // CV URL local state
  const [cvUrlInput, setCvUrlInput] = useState('');

  // Config values
  const greetingText = config.heroGreeting || "Hi, I'm Christopher Lamera.";
  const headlineLine1 = config.heroHeadline1 || "PRECISION IN EVERY PIXEL.";
  const headlineLine2 = config.heroHeadline2 || "PERFORMANCE IN EVERY DEPLOYMENT.";
  const highlightedWords = Array.isArray(config.heroHighlightedWords) 
    ? config.heroHighlightedWords 
    : ['PRECISION', 'PERFORMANCE'];

  const subHeadlineText = config.heroSub || "Cross-platform developer specializing in React and Flutter. I deliver rapid, pixel-perfect web and mobile solutions while building scalable architectures that anticipate future needs.";
  const profileImage = config.heroProfileImage || null;
  const frameAnimation = config.heroFrameAnimation || 'orbit';
  const btnPrimaryText = config.heroBtnPrimaryText || "View Projects";
  const btnSecondaryText = config.heroBtnSecondaryText || "Download CV";
  const cvUrl = config.heroCvUrl || "/cv.pdf";
  const socials = Array.isArray(config.heroSocials) && config.heroSocials.length > 0 
    ? config.heroSocials 
    : [
        { id: '1', url: 'https://github.com', label: 'GitHub Profile' },
        { id: '2', url: 'https://linkedin.com', label: 'LinkedIn Profile' }
      ];

  // ─── Word Highlighter Parser ─────────────────────────────────────────────────
  const normalizeWord = (w) => w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toUpperCase();

  const renderHighlightedLine = (lineText, lineKey) => {
    const words = lineText.split(/\s+/).filter(Boolean);
    return words.map((word, idx) => {
      const cleanWord = normalizeWord(word);
      const isHighlighted = highlightedWords.includes(cleanWord);

      return (
        <span key={`${lineKey}-${idx}-${word}`}>
          {isHighlighted ? (
            <span className="home-hero-highlight">{word}</span>
          ) : (
            <span>{word}</span>
          )}{' '}
        </span>
      );
    });
  };

  // ─── Handlers for Avatar Image Frame & Cropping ──────────────────────────────
  const handleAvatarClick = () => {
    if (!isAdmin) return;
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = '';
      avatarFileInputRef.current.click();
    }
  };

  const handleAvatarFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTempImageSource(event.target.result);
      setCropperModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenCropperWithExisting = () => {
    setTempImageSource(profileImage || null);
    setCropperModalOpen(true);
  };

  const handleSaveCroppedImage = (croppedDataUrl, selectedAnim) => {
    if (onUpdateConfig) {
      if (croppedDataUrl) {
        onUpdateConfig('heroProfileImage', croppedDataUrl);
      }
      onUpdateConfig('heroFrameAnimation', selectedAnim);
    }
    setImageError(false);
    setCropperModalOpen(false);
  };

  const handleRevertToDefaultAvatar = () => {
    if (onUpdateConfig) {
      onUpdateConfig('heroProfileImage', '');
    }
    setImageError(false);
    setCropperModalOpen(false);
  };

  // ─── Handlers for Headline Highlights ────────────────────────────────────────
  const handleSaveHeadlineConfig = ({ heroHeadline1, heroHeadline2, heroHighlightedWords }) => {
    if (onUpdateConfig) {
      onUpdateConfig('heroHeadline1', heroHeadline1);
      onUpdateConfig('heroHeadline2', heroHeadline2);
      onUpdateConfig('heroHighlightedWords', heroHighlightedWords);
    }
  };

  // ─── Handlers for Social Links ────────────────────────────────────────────────
  const openLinksModal = () => {
    setSocialsList([...socials]);
    setNewLinkUrl('');
    setNewLinkLabel('');
    setLinksModalOpen(true);
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) return;

    const detectedType = getLinkIconType(newLinkUrl);
    const defaultLabel = detectedType.charAt(0).toUpperCase() + detectedType.slice(1);

    const newEntry = {
      id: Date.now().toString(),
      url: newLinkUrl.trim(),
      label: newLinkLabel.trim() || defaultLabel,
    };

    const updated = [...socialsList, newEntry];
    setSocialsList(updated);
    setNewLinkUrl('');
    setNewLinkLabel('');

    if (onUpdateConfig) {
      onUpdateConfig('heroSocials', updated);
    }
  };

  const handleDeleteLink = (id) => {
    const updated = socialsList.filter(item => item.id !== id);
    setSocialsList(updated);
    if (onUpdateConfig) {
      onUpdateConfig('heroSocials', updated);
    }
  };

  const handleSaveLinks = () => {
    if (onUpdateConfig) {
      onUpdateConfig('heroSocials', socialsList);
    }
    setLinksModalOpen(false);
  };

  // ─── Handlers for CV Link ────────────────────────────────────────────────────
  const openCvModal = () => {
    setCvUrlInput(cvUrl);
    setCvModalOpen(true);
  };

  const handleSaveCv = (e) => {
    e.preventDefault();
    if (onUpdateConfig) {
      onUpdateConfig('heroCvUrl', cvUrlInput.trim() || '/cv.pdf');
    }
    setCvModalOpen(false);
  };

  // Animation motion props for the avatar frame container
  const getAvatarContainerMotionProps = () => {
    switch (frameAnimation) {
      case 'pulse':
        return {
          animate: { y: [-6, 6, -6], scale: [1, 1.025, 1] },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        };
      case 'quantum':
        return {
          animate: { y: [-10, 8, -10] },
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        };
      case 'hologram':
        return {
          animate: { y: [-4, 6, -4] },
          transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
        };
      case 'static':
        return {
          animate: { y: 0 },
          transition: { duration: 0.3 }
        };
      case 'orbit':
      default:
        return {
          animate: { y: [-8, 7, -8] },
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        };
    }
  };

  return (
    <section className="home-hero-viewport" id="hero-section">
      {/* Hidden file input for direct device photo picking */}
      <input 
        type="file" 
        ref={avatarFileInputRef} 
        accept="image/*" 
        onChange={handleAvatarFileSelected} 
        style={{ display: 'none' }} 
      />

      <div className="home-hero-container">
        
        {/* ─── Left Side: Text Content ────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="home-hero-text"
        >
          {/* Greeting */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="home-hero-greeting"
          >
            <span className="home-hero-greeting-dot"></span>
            <EditableText 
              text={greetingText} 
              isAdmin={isAdmin} 
              onSave={(v) => onUpdateConfig && onUpdateConfig('heroGreeting', v)} 
            />
          </motion.div>
          
          {/* Headline with Word Emphasis Support */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="home-hero-headline-wrapper"
          >
            <h1 
              className={`home-hero-headline ${isAdmin ? 'home-hero-headline-editable' : ''}`}
              onClick={isAdmin ? () => setHeadlineModalOpen(true) : undefined}
              title={isAdmin ? "Click to edit headline text and choose emphasized highlight words" : undefined}
            >
              <div className="home-hero-headline-line">
                {renderHighlightedLine(headlineLine1, 'l1')}
              </div>
              <div className="home-hero-headline-line">
                {renderHighlightedLine(headlineLine2, 'l2')}
              </div>
            </h1>

            {isAdmin && (
              <button 
                type="button" 
                className="home-hero-headline-edit-trigger"
                onClick={() => setHeadlineModalOpen(true)}
                title="Edit headline & select highlight words"
              >
                <Sparkles size={14} /> Customize Headline & Color Emphasis
              </button>
            )}
          </motion.div>
          
          {/* Sub-headline / Bio */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="home-hero-subheadline"
          >
            <EditableText 
              text={subHeadlineText} 
              isAdmin={isAdmin} 
              multiline={true}
              onSave={(v) => onUpdateConfig && onUpdateConfig('heroSub', v)} 
            />
          </motion.div>
          
          {/* Action Buttons Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="home-hero-actions"
          >
            {onNavigateProjects ? (
              <button onClick={onNavigateProjects} className="home-hero-btn-primary">
                <EditableText 
                  text={btnPrimaryText} 
                  isAdmin={isAdmin} 
                  onSave={(v) => onUpdateConfig && onUpdateConfig('heroBtnPrimaryText', v)} 
                />
              </button>
            ) : (
              <a href="#projects" className="home-hero-btn-primary">
                <EditableText 
                  text={btnPrimaryText} 
                  isAdmin={isAdmin} 
                  onSave={(v) => onUpdateConfig && onUpdateConfig('heroBtnPrimaryText', v)} 
                />
              </a>
            )}

            <div className="home-hero-btn-secondary-wrapper">
              <a 
                href={cvUrl} 
                download 
                target="_blank" 
                rel="noreferrer" 
                className="home-hero-btn-secondary"
              >
                <EditableText 
                  text={btnSecondaryText} 
                  isAdmin={isAdmin} 
                  onSave={(v) => onUpdateConfig && onUpdateConfig('heroBtnSecondaryText', v)} 
                />
              </a>

              {isAdmin && (
                <button 
                  type="button" 
                  onClick={openCvModal}
                  className="home-hero-admin-btn-inline"
                  title="Configure CV download link"
                >
                  <FileText size={14} />
                </button>
              )}
            </div>
          </motion.div>
          
          {/* Dynamic Social Links Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="home-hero-socials-wrapper"
          >
            <div className="home-hero-socials">
              {socials.map((link) => (
                <a 
                  key={link.id || link.url}
                  href={ensureAbsoluteUrl(link.url)} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="home-hero-social-link"
                  aria-label={link.label || link.url}
                  title={link.label || link.url}
                >
                  <DynamicSocialIcon url={link.url} size={20} strokeWidth={1.5} />
                </a>
              ))}

              {isAdmin && (
                <button 
                  type="button"
                  onClick={openLinksModal}
                  className="home-hero-social-admin-add"
                  title="Manage and add links"
                >
                  <Plus size={16} />
                  <span>Manage Links</span>
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
        
        {/* ─── Right Side: Avatar Image Frame ──────────────────── */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="home-hero-image-col"
        >
          {/* Ambient Cosmic Backlight */}
          <div className={`home-hero-glow-sphere frame-glow-${frameAnimation}`} />

          {/* Floating Image Container with selected frame animation */}
          <motion.div 
            {...getAvatarContainerMotionProps()}
            className={`home-hero-avatar-glass frame-anim-${frameAnimation} ${isAdmin ? 'admin-interactive-avatar' : ''}`}
            onClick={handleAvatarClick}
            title={isAdmin ? "Click to choose photo from device and crop" : undefined}
          >
            {/* Animation Rings */}
            {frameAnimation === 'orbit' && <div className="home-hero-orbit-ring" />}
            {frameAnimation === 'quantum' && (
              <>
                <div className="home-hero-quantum-ring-1" />
                <div className="home-hero-quantum-ring-2" />
              </>
            )}
            {frameAnimation === 'pulse' && <div className="home-hero-pulse-halo" />}
            {frameAnimation === 'hologram' && <div className="home-hero-hologram-sheen" />}

            {/* Inner Masked Avatar Container */}
            <div className="home-hero-avatar-inner">
              {profileImage && !imageError ? (
                <img 
                  src={profileImage} 
                  alt="Christopher Lamera" 
                  className="home-hero-avatar-img"
                  onError={() => setImageError(true)}
                />
              ) : (
                <CosmicAvatarGraphic />
              )}

              {/* Admin Hover Overlay with Camera Icon */}
              {isAdmin && (
                <div className="home-hero-avatar-admin-overlay">
                  <div className="home-hero-avatar-admin-badge">
                    <Camera size={26} />
                    <span>Choose Photo & Crop</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Admin options bar below frame */}
          {isAdmin && (
            <div className="home-hero-avatar-admin-actions">
              <button 
                type="button"
                className="home-hero-avatar-admin-trigger"
                onClick={handleAvatarClick}
              >
                <Camera size={14} /> Upload Device Photo
              </button>

              <button 
                type="button"
                className="home-hero-avatar-admin-settings-btn"
                onClick={handleOpenCropperWithExisting}
                title="Adjust Crop & Frame Animation"
              >
                <Layers size={14} /> Animation & Crop
              </button>
            </div>
          )}
        </motion.div>

      </div>

      {/* ─── MODAL 1: Image Cropper & Frame Animation Modal ─────────── */}
      <AnimatePresence>
        {cropperModalOpen && (
          <ImageCropperModal
            imageSource={tempImageSource || profileImage}
            currentAnimation={frameAnimation}
            hasExistingImage={!!profileImage}
            onSave={handleSaveCroppedImage}
            onRevertToDefault={handleRevertToDefaultAvatar}
            onChangeImage={handleAvatarClick}
            onClose={() => setCropperModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── MODAL 2: Headline Text & Word Highlights Customizer ────── */}
      <AnimatePresence>
        {headlineModalOpen && (
          <HeadlineEditorModal
            currentLine1={headlineLine1}
            currentLine2={headlineLine2}
            currentHighlightedWords={highlightedWords}
            onSave={handleSaveHeadlineConfig}
            onClose={() => setHeadlineModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── MODAL 3: Manage Links & Auto Icon Detection ────────────── */}
      <AnimatePresence>
        {linksModalOpen && (
          <div className="stellar-modal-backdrop" onClick={() => setLinksModalOpen(false)}>
            <motion.div 
              className="stellar-modal-panel stellar-modal-panel-wide"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="stellar-modal-header">
                <div className="stellar-modal-title">
                  <LinkIcon size={20} style={{ color: 'var(--cryo-accent)' }} />
                  <span>Manage Platform Links</span>
                </div>
                <button 
                  className="stellar-modal-close" 
                  onClick={() => setLinksModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="stellar-modal-body">
                <p className="stellar-modal-desc">
                  Icons are automatically detected based on the link URL (GitHub, LinkedIn, Twitter/X, Instagram, YouTube, Discord, Email, Figma, GitLab, etc.).
                </p>

                {/* Existing Links List */}
                <div className="stellar-modal-links-list">
                  {socialsList.map((link) => (
                    <div key={link.id} className="stellar-modal-link-row">
                      <div className="stellar-modal-link-icon-preview">
                        <DynamicSocialIcon url={link.url} size={20} />
                      </div>
                      <div className="stellar-modal-link-info">
                        <div className="stellar-modal-link-url">{link.url}</div>
                        <div className="stellar-modal-link-label">{link.label || 'Link'}</div>
                      </div>
                      <button 
                        type="button"
                        className="stellar-modal-link-delete"
                        onClick={() => handleDeleteLink(link.id)}
                        title="Remove link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {socialsList.length === 0 && (
                    <div className="stellar-modal-empty-state">
                      No links added yet. Use the form below to add your first profile link.
                    </div>
                  )}
                </div>

                {/* Add New Link Form */}
                <form onSubmit={handleAddLink} className="stellar-modal-add-form">
                  <div className="stellar-modal-label" style={{ marginBottom: '8px' }}>
                    Add New Link
                  </div>
                  <div className="stellar-modal-add-row">
                    <div className="stellar-modal-add-icon-box">
                      <DynamicSocialIcon url={newLinkUrl} size={22} />
                    </div>
                    <input 
                      type="text"
                      placeholder="URL (e.g. https://github.com/myname or mailto:me@example.com)"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="stellar-modal-input"
                      style={{ flex: 2 }}
                      required
                    />
                    <input 
                      type="text"
                      placeholder="Label (optional)"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      className="stellar-modal-input"
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="stellar-modal-btn-add">
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </form>
              </div>

              <div className="stellar-modal-footer">
                <div className="stellar-modal-footer-right" style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="stellar-modal-btn-primary" 
                    onClick={handleSaveLinks}
                  >
                    <Check size={16} /> Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 4: CV Download Link Editor ───────────────────────── */}
      <AnimatePresence>
        {cvModalOpen && (
          <div className="stellar-modal-backdrop" onClick={() => setCvModalOpen(false)}>
            <motion.div 
              className="stellar-modal-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="stellar-modal-header">
                <div className="stellar-modal-title">
                  <FileText size={20} style={{ color: 'var(--cryo-accent)' }} />
                  <span>Configure CV Download Link</span>
                </div>
                <button 
                  className="stellar-modal-close" 
                  onClick={() => setCvModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveCv}>
                <div className="stellar-modal-body">
                  <div className="stellar-modal-form-group">
                    <label className="stellar-modal-label">CV / Resume File Path or URL</label>
                    <div className="stellar-modal-input-wrapper">
                      <LinkIcon size={16} className="stellar-modal-input-icon" />
                      <input 
                        type="text" 
                        placeholder="/cv.pdf or https://drive.google.com/..." 
                        value={cvUrlInput} 
                        onChange={(e) => setCvUrlInput(e.target.value)} 
                        className="stellar-modal-input" 
                        required
                      />
                    </div>
                    <span className="stellar-modal-hint">
                      You can use a local path like <code>/cv.pdf</code> (located in the <code>public/</code> folder) or an external link like Google Drive or Dropbox.
                    </span>
                  </div>
                </div>

                <div className="stellar-modal-footer">
                  <div className="stellar-modal-footer-right" style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      className="stellar-modal-btn-cancel" 
                      onClick={() => setCvModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="stellar-modal-btn-primary"
                    >
                      <Check size={16} /> Save Link
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
