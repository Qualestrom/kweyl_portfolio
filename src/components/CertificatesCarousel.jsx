import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Check, 
  X, 
  ShieldCheck, 
  Globe, 
  Upload,
  MousePointerClick,
  FileText,
  Sparkles,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { supabase, isSupabaseConfigured, uploadToSupabaseStorage } from '../supabase';
import { ensureAbsoluteUrl, resolveAssetUrl } from '../utils/imageUtils';
import { isPdfFile, renderPdfFirstPageToImage, extractPdfCertificateMetadata } from '../utils/pdfUtils';
import EditableText from './EditableText';
import ImageWithPlaceholder from './ImageWithPlaceholder';
import useInputDevice from '../utils/useInputDevice';

const FALLBACK_CERTIFICATES = [
  {
    id: '1',
    title: 'CCNA: Switching, Routing, and Wireless',
    issuer: 'Cisco Networking Academy',
    date: '28 May 2025',
    imageUrl: '',
    pdfUrl: '/assets/recovered/certificates/CCNA Switching Routing Wireless Essentials.pdf',
    verifyUrl: ''
  },
  {
    id: '2',
    title: 'Python Essentials 1',
    issuer: 'Cisco Networking Academy',
    date: '04 Aug 2026',
    imageUrl: '',
    pdfUrl: '/assets/recovered/certificates/Python Essentials 1.pdf',
    verifyUrl: ''
  },
  {
    id: '3',
    title: 'Introduction to IoT and Digital Transformation',
    issuer: 'Cisco Networking Academy',
    date: '04 Aug 2026',
    imageUrl: '',
    pdfUrl: '/assets/recovered/certificates/Introduction to IOT and Digital Transformation.pdf',
    verifyUrl: ''
  }
];

// ─── Crystalline High-Fidelity Certificate Inspector Modal ───
const CertificateModal = ({ cert, isOpen, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [modalImgError, setModalImgError] = useState(false);
  const { isTouch, isMobile } = useInputDevice();
  const isTouchDevice = isTouch || isMobile;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setModalImgError(false);
    }
  }, [isOpen, cert?.imageUrl]);

  if (!isOpen || !cert) return null;

  const fileUrl = cert.pdfUrl || cert.imageUrl || '';
  const isPdf = Boolean(cert.pdfUrl && (cert.pdfUrl.toLowerCase().endsWith('.pdf') || cert.pdfUrl.includes('.pdf?')));
  const hasModalImage = Boolean(
    cert.imageUrl &&
    !cert.imageUrl.includes('firebasestorage.googleapis.com') &&
    !modalImgError
  );

  const modalNode = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >

        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-sky-100 dark:bg-cyan-500/10 text-sky-800 dark:text-cyan-300 border border-sky-300 dark:border-cyan-500/30 shrink-0">
              <span className="w-1.5 h-1.5 rotate-45 bg-cyan-500 dark:bg-cyan-400" />
              <span>OFFICIAL ACCREDITATION</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate font-['Outfit']">
                {cert.title}
              </h3>
              <p className="text-xs font-mono text-sky-700 dark:text-cyan-400 truncate font-semibold">
                {cert.issuer} {cert.date ? `• ${cert.date}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Verification Link (if provided) */}
            {cert.verifyUrl && (
              <a
                href={ensureAbsoluteUrl(cert.verifyUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono text-white dark:text-slate-950 bg-sky-600 hover:bg-sky-500 dark:bg-sky-400 dark:hover:bg-sky-300 border border-sky-500/40 shadow-xs cursor-pointer active:scale-95 transition-colors"
                title="Verify on official issuer portal"
              >
                <ShieldCheck size={13} />
                <span>Verify Credential</span>
                <ExternalLink size={11} />
              </a>
            )}

            {/* Download / Open File Button */}
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={cert.title ? `${cert.title.replace(/\s+/g, '_')}.pdf` : undefined}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Open or download original document"
              >
                <Download size={13} />
                <span className="hidden xs:inline">Download</span>
              </a>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Viewport Body */}
        <div className="flex-1 min-h-[300px] max-h-[calc(90vh-140px)] bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center overflow-auto p-2 sm:p-4 relative">
          {hasModalImage ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-auto">
              <img
                src={cert.imageUrl}
                alt={cert.title}
                onError={() => setModalImgError(true)}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-white text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setZoomLevel(z => Math.max(0.7, z - 0.15))}
                  className="p-1 hover:text-cyan-300 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="px-1 text-[11px]">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(z => Math.min(1.8, z + 0.15))}
                  className="p-1 hover:text-cyan-300 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full min-h-[420px] flex flex-col">
              {isTouchDevice ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-cyan-500/10 border border-sky-300 dark:border-cyan-500/30 flex items-center justify-center text-sky-700 dark:text-cyan-400">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                      Official PDF Certificate Available
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mt-1">
                      Touch screens handle PDFs best in full window mode. Tap below to view or save the verified document.
                    </p>
                  </div>
                  <a
                    href={cert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-mono text-sm text-white dark:text-slate-950 bg-sky-600 hover:bg-sky-500 dark:bg-sky-400 dark:hover:bg-sky-300 border border-sky-500/40 shadow-lg transition-colors"
                  >
                    <ExternalLink size={15} />
                    <span>Open PDF in Full Screen</span>
                  </a>
                </div>
              ) : (
                <iframe
                  src={`${cert.pdfUrl}#toolbar=0`}
                  title={cert.title}
                  className="w-full h-full min-h-[450px] rounded-lg border border-slate-200 dark:border-white/10"
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 flex items-center justify-center text-sky-700 dark:text-sky-400">
                <Award size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                {cert.title}
              </h4>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                Issued by <span className="font-bold text-sky-700 dark:text-sky-400">{cert.issuer}</span>
              </p>
              {cert.verifyUrl && (
                <a
                  href={ensureAbsoluteUrl(cert.verifyUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold font-mono text-white dark:text-slate-950 bg-sky-600 hover:bg-sky-500 dark:bg-sky-400 dark:hover:bg-sky-300 border border-sky-500/40 transition-colors"
                >
                  <ShieldCheck size={14} />
                  <span>Verify on Official Portal</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Mobile footer bar if verifyUrl exists */}
        {cert.verifyUrl && (
          <div className="sm:hidden p-3 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-white/10 flex justify-center">
            <a
              href={ensureAbsoluteUrl(cert.verifyUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold font-mono text-white dark:text-slate-950 bg-sky-600 hover:bg-sky-500 dark:bg-sky-400 dark:hover:bg-sky-300 border border-sky-500/40 transition-colors"
            >
              <ShieldCheck size={14} />
              <span>Verify on Official Portal</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};

// Individual High-Resolution Landscape Stacked Deck Certificate Card (Theme-Adaptive)
const LandscapeCarouselCard = ({
  cert,
  idx,
  total,
  activeIndex,
  windowWidth,
  isActive,
  isAdmin,
  editingUrlId,
  urlDraft,
  uploading,
  setEditingUrlId,
  setUrlDraft,
  handleUpdateField,
  handleSaveUrl,
  handleDeleteCert,
  handleUploadDocument,
  handleRemoveDocument,
  onClickCard,
  onInspect,
}) => {
  const isEditingUrl = editingUrlId === cert.id;
  const isUploading = Boolean(uploading[cert.id]);
  const uploadStatus = typeof uploading[cert.id] === 'string' ? uploading[cert.id] : 'Uploading...';

  // Self-healing preview: if imageUrl is missing or broken, render Page 1 of pdfUrl automatically
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

  const hasValidDirectImage = Boolean(
    cert.imageUrl &&
    !cert.imageUrl.includes('firebasestorage.googleapis.com') &&
    !imgFailed
  );

  useEffect(() => {
    setImgFailed(false);
  }, [cert.imageUrl]);

  useEffect(() => {
    if (hasValidDirectImage || !cert.pdfUrl) return;
    let cancelled = false;
    renderPdfFirstPageToImage(cert.pdfUrl, 1.8)
      .then((res) => {
        if (!cancelled && res?.dataUrl) {
          setPdfPreviewUrl(res.dataUrl);
        }
      })
      .catch((err) => {
        console.warn('Certificate PDF preview render notice:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [hasValidDirectImage, cert.pdfUrl]);

  const displayImageUrl = hasValidDirectImage ? cert.imageUrl : pdfPreviewUrl;

  // Compute signed circular offset from activeIndex for Stacked / Layered Deck positioning
  let offset = idx - activeIndex;
  if (total > 2) {
    const half = Math.floor(total / 2);
    if (offset > half) offset -= total;
    if (offset < -half) offset += total;
  }

  const absOffset = Math.abs(offset);
  const peekSpreadPx = windowWidth < 640 ? 28 : windowWidth < 1024 ? 96 : 140;

  const deckX =
    offset === 0
      ? 0
      : absOffset === 1
      ? offset * peekSpreadPx
      : Math.sign(offset) * (peekSpreadPx * 1.35);

  const deckY = offset === 0 ? 0 : absOffset === 1 ? 10 : 20;
  const deckScale = offset === 0 ? 1 : absOffset === 1 ? 0.9 : 0.82;
  const deckOpacity = offset === 0 ? 1 : absOffset === 1 ? 0.62 : 0;
  const deckZIndex = offset === 0 ? 30 : absOffset === 1 ? 20 : 10;

  return (
    <motion.div
      onClick={() => {
        if (!isActive) onClickCard(idx);
      }}
      initial={false}
      animate={{
        x: deckX,
        y: deckY,
        scale: deckScale,
        opacity: deckOpacity,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 28,
        mass: 0.9,
      }}
      className={`absolute inset-0 rounded-2xl transition-colors duration-300 flex flex-col justify-between cursor-pointer ${
        isActive
          ? 'border-2 border-sky-500 dark:border-sky-400/90 bg-white/95 dark:bg-slate-900/95 shadow-[0_20px_50px_-10px_rgba(2,132,199,0.22)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.8)] ring-1 ring-sky-400/40 dark:ring-sky-400/40'
          : 'border border-slate-300/90 dark:border-white/15 bg-white/90 dark:bg-slate-900/90 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-sky-400/60 dark:hover:border-sky-400/40'
      }`}
      style={{
        zIndex: deckZIndex,
        pointerEvents: absOffset > 1 ? 'none' : 'auto',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
      }}
    >
      {/* ─── Top Landscape Certificate Frame (Seamless Edge-to-Edge Display) ─── */}
      <div 
        onClick={(e) => {
          if (isActive && onInspect) {
            e.stopPropagation();
            onInspect(cert);
          }
        }}
        className="relative w-full h-[145px] sm:h-[170px] md:h-[190px] lg:h-[200px] bg-slate-100 dark:bg-slate-950 rounded-t-2xl overflow-hidden border-b border-slate-200/80 dark:border-white/[0.1] group/img shrink-0 flex items-center justify-center cursor-pointer"
      >
        {displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt={cert.title}
            onError={() => {
              if (!imgFailed && cert.imageUrl && displayImageUrl === cert.imageUrl) {
                setImgFailed(true);
              }
            }}
            className="w-full h-full object-cover object-top select-none pointer-events-none transition-transform duration-500 group-hover/img:scale-102 bg-white"
            draggable={false}
          />
        ) : (
          /* Clean Architectural Credential Emblem Plate (No Duplicate Title/Issuer) */
          <div className="w-full h-full bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group/plate select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(2,132,199,0.12),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.12),transparent_70%)] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-400/30 flex items-center justify-center text-sky-700 dark:text-sky-300 shadow-sm transition-transform duration-300 group-hover/plate:scale-105">
                <Award size={24} className="text-sky-700 dark:text-sky-400" />
              </div>
              <span className="text-[11px] font-mono text-sky-800 dark:text-sky-300/90 tracking-wider uppercase font-semibold">
                Official Accreditation Preview
              </span>
            </div>
          </div>
        )}

        {/* Hover inspect banner on active card */}
        {isActive && (
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-mono text-xs font-bold backdrop-blur-[2px] pointer-events-none z-20">
            <Maximize2 size={14} className="text-cyan-300" />
            <span>Inspect Credential</span>
          </div>
        )}

        {/* Top Right Admin Controls */}
        {isAdmin && isActive && (
          <div 
            className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <label
              title="Upload PDF certificate (Auto-scans title, issuer & date)"
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 dark:bg-slate-950/90 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium cursor-pointer backdrop-blur-md transition-colors shadow-lg inline-flex items-center gap-1.5"
            >
              <Upload size={12} />
              <span>{isUploading ? 'Scanning...' : 'Upload PDF/Img'}</span>
              <input
                type="file"
                accept="image/*, .pdf, application/pdf"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleUploadDocument(cert.id, e.target.files[0]);
                }}
              />
            </label>

            {(cert.imageUrl || cert.pdfUrl) && (
              <button
                type="button"
                onClick={(e) => handleRemoveDocument(cert.id, e)}
                className="p-1.5 rounded-lg bg-slate-900/90 dark:bg-slate-950/90 border border-red-500/50 text-red-400 hover:bg-red-500/30 text-xs cursor-pointer backdrop-blur-md transition-colors shadow-lg"
                title="Remove uploaded document/image"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )}

        {/* Top Left Verified Badge */}
        <div className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-slate-950/90 border border-sky-300 dark:border-cyan-400/50 text-sky-800 dark:text-cyan-300 text-[10px] font-mono shadow-xs backdrop-blur-md font-bold">
          <span className="w-1.5 h-1.5 rotate-45 bg-cyan-500 dark:bg-cyan-400 inline-block" />
          <ShieldCheck size={11} className="text-sky-700 dark:text-cyan-400" />
          <span>{cert.pdfUrl ? 'Verified PDF' : cert.verifyUrl ? 'Verified Online' : 'Verified'}</span>
        </div>

        {/* Uploading / Scanning Status Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-1.5 text-cyan-300 text-xs font-mono z-30">
            <Sparkles size={18} className="animate-spin text-cyan-400" />
            <span className="font-semibold animate-pulse">{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* ─── Bottom Details & Text Section ─── */}
      <div 
        className="p-3.5 sm:p-4 md:p-4.5 flex-1 flex flex-col justify-between relative"
        onClick={(e) => {
          if (isActive) e.stopPropagation();
        }}
      >
        <div>
          {/* Issuer & Date Row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="w-1 h-1 rotate-45 bg-sky-500 dark:bg-cyan-400 shrink-0" />
              <div className="text-[11px] sm:text-xs font-mono text-sky-700 dark:text-cyan-400 font-bold min-w-0 flex-1 truncate tracking-wide">
                <EditableText
                  text={cert.issuer}
                  isAdmin={isAdmin && isActive}
                  onSave={(v) => handleUpdateField(cert.id, 'issuer', v)}
                />
              </div>
            </div>

            <div className="text-[10px] sm:text-xs font-mono tabular-nums text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.08] border border-slate-300 dark:border-white/[0.12] px-2.5 py-0.5 rounded-full shrink-0 font-bold">
              <EditableText
                text={cert.date}
                isAdmin={isAdmin && isActive}
                onSave={(v) => handleUpdateField(cert.id, 'date', v)}
              />
            </div>
          </div>

          {/* Certificate Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] tracking-tight leading-snug">
            <EditableText
              text={cert.title}
              isAdmin={isAdmin && isActive}
              onSave={(v) => handleUpdateField(cert.id, 'title', v)}
            />
          </h3>
        </div>

        {/* ─── Bottom Actions Row (Verify Link & Admin Actions) ─── */}
        <div className="pt-2 mt-1 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-2">
          {isAdmin && isActive ? (
            isEditingUrl ? (
              <form
                className="flex-1 flex items-center gap-1.5"
                onSubmit={(e) => { e.preventDefault(); handleSaveUrl(cert.id); }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="url"
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://credential-link..."
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-sky-500 text-slate-900 dark:text-white text-xs font-mono outline-none w-full"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Escape') { setEditingUrlId(null); setUrlDraft(''); } }}
                />
                <button type="submit" className="p-1 text-green-600 dark:text-green-400 hover:text-green-500 cursor-pointer"><Check size={12} /></button>
                <button type="button" onClick={() => { setEditingUrlId(null); setUrlDraft(''); }} className="p-1 text-red-600 dark:text-red-400 hover:text-red-500 cursor-pointer"><X size={12} /></button>
              </form>
            ) : (
              <div className="flex items-center justify-between w-full" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => { setEditingUrlId(cert.id); setUrlDraft(cert.verifyUrl || cert.pdfUrl || ''); }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-700 dark:text-sky-300 hover:underline cursor-pointer font-bold"
                  title="Edit verification link"
                >
                  <Globe size={13} />
                  <span>{cert.verifyUrl ? 'Edit Link' : cert.pdfUrl ? 'PDF Attached' : 'Set Link'}</span>
                  <Edit3 size={10} className="opacity-70" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteCert(cert.id, e)}
                  className="p-1 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                  title="Delete certificate"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          ) : cert.verifyUrl && (cert.pdfUrl || cert.imageUrl) ? (
            <div className="w-full flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onInspect && onInspect(cert)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold font-mono text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 hover:bg-sky-200 dark:hover:bg-sky-500/20 transition-colors cursor-pointer shadow-xs active:scale-95"
                title="Preview Certificate Document"
              >
                <FileText size={13} className="text-sky-700 dark:text-sky-400" />
                <span>Document</span>
              </button>
              <a
                href={ensureAbsoluteUrl(cert.verifyUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-bold font-mono text-white dark:text-slate-950 bg-sky-600 hover:bg-sky-500 dark:bg-sky-400 dark:hover:bg-sky-300 border border-sky-500/40 transition-colors cursor-pointer shadow-sm active:scale-95"
                title="Verify on official portal"
              >
                <ShieldCheck size={13} />
                <span>Verify</span>
                <ExternalLink size={11} />
              </a>
            </div>
          ) : (cert.pdfUrl || cert.imageUrl) ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onInspect && onInspect(cert); }}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-xl text-xs font-bold font-mono text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/10 border border-sky-300 dark:border-sky-500/30 hover:bg-sky-200 dark:hover:bg-sky-500/20 hover:border-sky-400 transition-colors cursor-pointer shadow-xs active:scale-95"
              title="Inspect Certificate Document"
            >
              <FileText size={13} className="text-sky-700 dark:text-sky-400" />
              <span>View Certificate Document</span>
              <Maximize2 size={11} className="opacity-80" />
            </button>
          ) : cert.verifyUrl ? (
            <a
              href={ensureAbsoluteUrl(cert.verifyUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-xl text-xs font-bold font-mono text-white dark:text-slate-950 bg-sky-600 hover:bg-sky-500 dark:bg-sky-400 dark:hover:bg-sky-300 border border-sky-500/40 transition-colors cursor-pointer shadow-sm active:scale-95"
              title="Verify on official portal"
            >
              <ShieldCheck size={13} />
              <span>Verify Credential</span>
              <ExternalLink size={11} />
            </a>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onInspect && onInspect(cert); }}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-xl text-xs font-bold font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/10 hover:border-sky-400/50 transition-colors cursor-pointer shadow-xs"
            >
              <FileText size={13} className="text-slate-500 dark:text-slate-400" />
              <span>Credential Record Details</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function CertificatesCarousel({ isAdmin = false }) {
  const { isTouch, isMobile } = useInputDevice();
  const isTouchDevice = isTouch || isMobile;

  const [certificates, setCertificates] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio_certificates');
      return cached ? JSON.parse(cached) : FALLBACK_CERTIFICATES;
    } catch (_) {
      return FALLBACK_CERTIFICATES;
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploading, setUploading] = useState({});
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Admin inline URL edit state
  const [editingUrlId, setEditingUrlId] = useState(null);
  const [urlDraft, setUrlDraft] = useState('');

  // Crystalline Document Inspector Modal state
  const [inspectingCert, setInspectingCert] = useState(null);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch certificates from Supabase or Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchCertificates = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          try {
            const { data, error } = await supabase
              .from('certificates')
              .select('*')
              .order('sort_order', { ascending: true });

            if (!error && data && data.length > 0) {
              const list = data.map(d => ({
                ...d,
                imageUrl: resolveAssetUrl(d.imageUrl),
                pdfUrl: resolveAssetUrl(d.pdfUrl)
              }));
              if (isMounted) {
                setCertificates(list);
                try {
                  localStorage.setItem('portfolio_certificates', JSON.stringify(list));
                } catch (_) {}
                setLoading(false);
                return;
              }
            }
          } catch (supErr) {
            console.warn('Supabase fetch certificates notice:', supErr);
          }
        }

        const snapshot = await getDocs(collection(db, 'certificates'));
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              imageUrl: resolveAssetUrl(data.imageUrl),
              pdfUrl: resolveAssetUrl(data.pdfUrl)
            };
          });
          if (isMounted) {
            setCertificates(list);
            try {
              localStorage.setItem('portfolio_certificates', JSON.stringify(list));
            } catch (_) {}
          }
        } else {
          if (isMounted) setCertificates(FALLBACK_CERTIFICATES);
        }
      } catch (err) {
        console.warn('Fetch certificates fallback:', err);
        if (isMounted) setCertificates(FALLBACK_CERTIFICATES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCertificates();
    return () => { isMounted = false; };
  }, []);

  // Keep activeIndex in bounds when certificates list changes
  useEffect(() => {
    if (certificates.length > 0 && activeIndex >= certificates.length) {
      setActiveIndex(0);
    }
  }, [certificates.length, activeIndex]);

  // Circular Deck Step Navigation
  const handlePrev = () => {
    if (certificates.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + certificates.length) % certificates.length);
  };

  const handleNext = () => {
    if (certificates.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % certificates.length);
  };

  // Click adjacent card or indicator dot to bring to front
  const handleSelectCard = (clickedIdx) => {
    if (certificates.length === 0) return;
    setActiveIndex(clickedIdx);
  };

  // Swipe / Pan gesture on deck
  const handlePanEnd = (e, info) => {
    if (certificates.length <= 1) return;
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset > 45 || velocity > 250) {
      handlePrev();
    } else if (offset < -45 || velocity < -250) {
      handleNext();
    }
  };

  // ─── Admin Handlers ────────────────────────────────────────────────────────
  const handleOpenAdd = async () => {
    const newCert = {
      title: 'New Certificate',
      issuer: 'Issuing Organization',
      date: new Date().getFullYear().toString(),
      imageUrl: '',
      pdfUrl: '',
      verifyUrl: '',
      createdAt: new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'certificates'), newCert);
      const created = { id: docRef.id, ...newCert };
      setCertificates(prev => [...prev, created]);
    } catch (err) {
      console.warn('Add certificate fallback (local only):', err);
      const localId = `local-${Date.now()}`;
      const created = { id: localId, ...newCert };
      setCertificates(prev => [...prev, created]);
    }
  };

  const handleUpdateField = async (id, field, value) => {
    setCertificates(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('certificates').update({ [field]: value }).eq('id', id);
      } catch (err) {
        console.warn('Certificate update Supabase fallback:', err);
      }
      return;
    }

    try {
      await updateDoc(doc(db, 'certificates', id), { [field]: value });
    } catch (err) {
      console.warn('Certificate update fallback (local only):', err);
    }
  };

  const handleSaveUrl = (id) => {
    handleUpdateField(id, 'verifyUrl', urlDraft.trim());
    setEditingUrlId(null);
    setUrlDraft('');
  };

  const handleDeleteCert = async (id, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Delete this certificate?')) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('certificates').delete().eq('id', id);
      } catch (err) {
        console.warn('Delete certificate Supabase fallback:', err);
      }
    } else {
      try {
        await deleteDoc(doc(db, 'certificates', id));
      } catch (err) {
        console.warn('Delete cert local fallback:', err);
      }
    }

    setCertificates(prev => prev.filter(c => c.id !== id));
  };

  // Upload either PDF document or Image File with Smart Metadata Scanning
  const handleUploadDocument = async (certId, file) => {
    if (!file) return;
    const isPdf = isPdfFile(file);

    setUploading(prev => ({ 
      ...prev, 
      [certId]: isPdf ? 'Scanning PDF text...' : 'Uploading image...' 
    }));

    try {
      // 1. Supabase Upload Pipeline
      if (isSupabaseConfigured && supabase) {
        const currentCert = certificates.find(c => c.id === certId);
        if (isPdf) {
          const metadata = await extractPdfCertificateMetadata(file);
          setUploading(prev => ({ ...prev, [certId]: 'Rendering preview...' }));
          const { blob: imageBlob } = await renderPdfFirstPageToImage(file, 2.0);

          setUploading(prev => ({ ...prev, [certId]: 'Saving to Supabase...' }));
          const { publicUrl: imgUrl } = await uploadToSupabaseStorage(`certificates/${certId}`, imageBlob, `thumb-${Date.now()}.webp`);
          const { publicUrl: pdfUrl } = await uploadToSupabaseStorage(`certificates/${certId}`, file);

          const updatePayload = {
            title: metadata.title || currentCert?.title || 'Verified Credential',
            issuer: metadata.issuer || currentCert?.issuer || 'Official Accreditation',
            date: metadata.date || currentCert?.date || '',
            imageUrl: imgUrl,
            pdfUrl: pdfUrl,
            ...(currentCert && !currentCert.verifyUrl ? { verifyUrl: pdfUrl } : {})
          };

          const { error: updateErr } = await supabase.from('certificates').update(updatePayload).eq('id', certId);
          if (updateErr) {
            await supabase.from('certificates').upsert({ id: certId, ...updatePayload });
          }
          setCertificates(prev => {
            const next = prev.map(c => c.id === certId ? { ...c, ...updatePayload } : c);
            try { localStorage.setItem('portfolio_certificates', JSON.stringify(next)); } catch (_) {}
            return next;
          });
          return;
        } else {
          setUploading(prev => ({ ...prev, [certId]: 'Saving image to Supabase...' }));
          const { publicUrl: imgUrl } = await uploadToSupabaseStorage(`certificates/${certId}`, file);
          const { error: updateErr } = await supabase.from('certificates').update({ imageUrl: imgUrl }).eq('id', certId);
          if (updateErr) {
            await supabase.from('certificates').upsert({
              id: certId,
              title: currentCert?.title || 'Verified Credential',
              issuer: currentCert?.issuer || 'Official Accreditation',
              date: currentCert?.date || '',
              imageUrl: imgUrl,
            });
          }
          setCertificates(prev => {
            const next = prev.map(c => c.id === certId ? { ...c, imageUrl: imgUrl } : c);
            try { localStorage.setItem('portfolio_certificates', JSON.stringify(next)); } catch (_) {}
            return next;
          });
          return;
        }
      }

      // 2. Firebase Fallback Pipeline
      if (['1', '2', '3', '4', '5', '6'].includes(certId)) {
        const fc = FALLBACK_CERTIFICATES.find(c => c.id === certId);
        if (fc) {
          const { id, ...data } = fc;
          await setDoc(doc(db, 'certificates', certId), data, { merge: true });
        }
      }

      let downloadImageUrl = '';
      let downloadPdfUrl = '';

      if (isPdf) {
        // 1. Scan and extract Title, Issuer, Date from PDF text layer
        const metadata = await extractPdfCertificateMetadata(file);

        setUploading(prev => ({ ...prev, [certId]: 'Rendering preview...' }));

        // 2. Render Page 1 to high-resolution WebP Blob client-side
        const { blob: imageBlob } = await renderPdfFirstPageToImage(file, 2.0);

        setUploading(prev => ({ ...prev, [certId]: 'Saving to Firebase...' }));

        // 3. Upload rendered thumbnail image
        const imageStorageRef = ref(storage, `certificates/${certId}/thumb-${Date.now()}.webp`);
        await uploadBytes(imageStorageRef, imageBlob);
        downloadImageUrl = await getDownloadURL(imageStorageRef);

        // 4. Upload original authentic PDF document
        const pdfStorageRef = ref(storage, `certificates/${certId}/doc-${Date.now()}-${file.name}`);
        await uploadBytes(pdfStorageRef, file);
        downloadPdfUrl = await getDownloadURL(pdfStorageRef);

        const currentCert = certificates.find(c => c.id === certId);
        const updatePayload = {
          imageUrl: downloadImageUrl,
          pdfUrl: downloadPdfUrl,
          ...(metadata.title ? { title: metadata.title } : {}),
          ...(metadata.issuer ? { issuer: metadata.issuer } : {}),
          ...(metadata.date ? { date: metadata.date } : {}),
          ...(currentCert && !currentCert.verifyUrl ? { verifyUrl: downloadPdfUrl } : {})
        };

        await updateDoc(doc(db, 'certificates', certId), updatePayload);

        setCertificates(prev => prev.map(c =>
          c.id === certId ? { ...c, ...updatePayload } : c
        ));
      } else {
        // Regular image upload
        const storageRef = ref(storage, `certificates/${certId}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        downloadImageUrl = await getDownloadURL(storageRef);

        await updateDoc(doc(db, 'certificates', certId), {
          imageUrl: downloadImageUrl
        });

        setCertificates(prev => prev.map(c =>
          c.id === certId ? { ...c, imageUrl: downloadImageUrl } : c
        ));
      }
    } catch (err) {
      console.error('Error uploading document/image:', err);
      alert('Upload failed: ' + (err.message || 'Check storage connection.'));
    } finally {
      setUploading(prev => ({ ...prev, [certId]: false }));
    }
  };

  const handleRemoveDocument = async (certId, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Remove document / image for this certificate?')) return;
    try {
      await updateDoc(doc(db, 'certificates', certId), {
        imageUrl: '',
        pdfUrl: ''
      });
      setCertificates(prev => prev.map(c =>
        c.id === certId ? { ...c, imageUrl: '', pdfUrl: '' } : c
      ));
    } catch (err) {
      console.error('Error removing certificate document:', err);
    }
  };

  const handlePushDefaults = async () => {
    if (!window.confirm('Push default certificates to Firebase database?')) return;
    try {
      for (const fc of FALLBACK_CERTIFICATES) {
        const { id, ...data } = fc;
        await setDoc(doc(db, 'certificates', id), { ...data });
      }
      alert('Certificates successfully saved to Firestore!');
    } catch (err) {
      console.error('Push defaults error:', err);
      alert('Error pushing defaults to database.');
    }
  };

  return (
    <div className="w-full flex flex-col justify-center select-none py-3 sm:py-5">
      {/* ─── Clean Header Bar (Theme-Adaptive) ─── */}
      <div className="flex items-center justify-between gap-3 mb-4 px-1 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-100 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/25 shadow-xs">
            <span className="w-1.5 h-1.5 rotate-45 bg-sky-600 dark:bg-sky-400" />
            <Award size={13} className="text-sky-700 dark:text-sky-400" />
            <span>Verified Credentials</span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-900 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] border border-slate-300 dark:border-white/[0.1] px-2.5 py-0.5 rounded-full font-bold">
            {String(activeIndex + 1).padStart(2, '0')} / {String(certificates.length).padStart(2, '0')}
          </span>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 hover:bg-sky-200 dark:hover:bg-sky-500/30 transition-colors cursor-pointer shadow-sm ml-1"
              title="Add new certificate"
            >
              <Plus size={13} /> Add Credential
            </button>
          )}
        </div>
      </div>

      {/* ─── STACKED / LAYERED CREDENTIAL DECK STAGE ─── */}
      <div 
        className="certificates-carousel w-full relative h-[350px] sm:h-[390px] md:h-[420px] lg:h-[440px] flex items-center justify-center overflow-visible"
        data-no-swipe="true"
      >
        {/* Floating Left Stage Arrow Button (Theme-Adaptive) */}
        <button
          type="button"
          aria-label="Previous certificate"
          onClick={handlePrev}
          className="absolute left-1 sm:left-3 md:left-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-950/85 border-2 border-slate-200 dark:border-white/15 text-slate-900 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-300 hover:border-sky-400 dark:hover:border-sky-400/50 hover:bg-sky-50 dark:hover:bg-sky-500/20 backdrop-blur-md transition-colors shadow-xl active:scale-95 cursor-pointer"
          title="Previous Certificate"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Stacked / Layered Deck Container */}
        <motion.div
          className="certificates-carousel-stage relative w-[310px] sm:w-[450px] md:w-[510px] lg:w-[550px] h-[270px] sm:h-[310px] md:h-[335px] lg:h-[350px] cursor-grab active:cursor-grabbing"
          data-no-swipe="true"
          onPanEnd={handlePanEnd}
        >
          {certificates.map((cert, idx) => (
            <LandscapeCarouselCard
              key={cert.id || idx}
              cert={cert}
              idx={idx}
              total={certificates.length}
              activeIndex={activeIndex}
              windowWidth={windowWidth}
              isActive={idx === activeIndex}
              isAdmin={isAdmin}
              editingUrlId={editingUrlId}
              urlDraft={urlDraft}
              uploading={uploading}
              setEditingUrlId={setEditingUrlId}
              setUrlDraft={setUrlDraft}
              handleUpdateField={handleUpdateField}
              handleSaveUrl={handleSaveUrl}
              handleDeleteCert={handleDeleteCert}
              handleUploadDocument={handleUploadDocument}
              handleRemoveDocument={handleRemoveDocument}
              onClickCard={handleSelectCard}
              onInspect={setInspectingCert}
            />
          ))}
        </motion.div>

        {/* Floating Right Stage Arrow Button (Theme-Adaptive) */}
        <button
          type="button"
          aria-label="Next certificate"
          onClick={handleNext}
          className="absolute right-1 sm:right-3 md:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-950/85 border-2 border-slate-200 dark:border-white/15 text-slate-900 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-300 hover:border-sky-400 dark:hover:border-sky-400/50 hover:bg-sky-50 dark:hover:bg-sky-500/20 backdrop-blur-md transition-colors shadow-xl active:scale-95 cursor-pointer"
          title="Next Certificate"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* ─── Interactive Bottom Indicator Strip (Theme-Adaptive) ─── */}
      <div className="flex items-center justify-center gap-1.5 mt-3 sm:mt-4">
        {certificates.map((_, i) => {
          const isCurrent = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Jump to certificate ${i + 1}`}
              onClick={() => handleSelectCard(i)}
              className={`h-2 rounded-full transition-colors duration-300 cursor-pointer ${
                isCurrent 
                  ? 'w-7 bg-sky-600 dark:bg-sky-400' 
                  : 'w-2 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40'
              }`}
              title={`Jump to certificate ${i + 1}`}
            />
          );
        })}
      </div>

      {/* ─── Navigation Legend Bar (Theme-Adaptive) ─── */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 text-[11px] font-mono text-slate-700 dark:text-slate-400/90 text-center flex-wrap px-2 font-medium">
        {isTouchDevice ? (
          <>
            <span className="inline-flex items-center gap-1">
              <span>Swipe deck to browse</span>
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1">
              <span>Tap layered card to bring to front</span>
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] border border-slate-300 dark:border-white/10 text-[10px] text-slate-900 dark:text-slate-300 font-bold">◄</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.08] border border-slate-300 dark:border-white/10 text-[10px] text-slate-900 dark:text-slate-300 font-bold">►</kbd>
              <span>Swipe or arrows to cycle deck</span>
            </span>
            <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1">
              <MousePointerClick size={12} className="text-sky-700 dark:text-sky-400" />
              <span>Click layered card to bring to front</span>
            </span>
          </>
        )}
      </div>

      {/* Admin Template Helper */}
      {isAdmin && certificates.length > 0 && certificates[0].id === '1' && (
        <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400 px-2">
          <span className="text-amber-700 dark:text-amber-400/80 font-bold">Using fallback certificate templates</span>
          <button
            type="button"
            onClick={handlePushDefaults}
            className="text-sky-700 dark:text-cyan-300 hover:underline cursor-pointer font-bold"
          >
            Push to Firestore DB
          </button>
        </div>
      )}

      {/* ─── Crystalline High-Fidelity Certificate Inspector Modal ─── */}
      <AnimatePresence>
        {inspectingCert && (
          <CertificateModal
            cert={inspectingCert}
            isOpen={Boolean(inspectingCert)}
            onClose={() => setInspectingCert(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
