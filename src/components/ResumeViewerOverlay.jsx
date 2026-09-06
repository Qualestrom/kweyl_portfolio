import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  ZoomIn, 
  ZoomOut,
  Maximize2
} from 'lucide-react';
import './ResumeViewerOverlay.css';

export default function ResumeViewerOverlay({ isOpen, onClose, resumeData, defaultCvUrl = '/cv.pdf' }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset zoom on open
  useEffect(() => {
    if (isOpen) setZoomLevel(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const title = resumeData?.name || 'Christopher_Lamera_Resume.pdf';
  const fileUrl = resumeData?.fileUrl || resumeData?.previewUrl || defaultCvUrl;
  const isImage = resumeData?.fileType?.startsWith('image/') || fileUrl?.match(/\.(png|jpe?g|webp)$/i);
  const previewImg = resumeData?.previewUrl;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="resume-overlay-backdrop" onClick={onClose}>
      <motion.div 
        className="resume-overlay-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Control Bar */}
        <div className="resume-overlay-topbar">
          <div className="resume-overlay-doc-info">
            <div className="resume-overlay-badge">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>OFFICIAL RESUME</span>
            </div>
            <h4 className="resume-overlay-filename" title={title}>
              {title}
            </h4>
          </div>

          <div className="resume-overlay-actions">
            {/* Zoom Controls (if viewing image preview) */}
            {(isImage || previewImg) && (
              <div className="resume-overlay-zoom-group">
                <button 
                  type="button" 
                  className="resume-overlay-btn-icon" 
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="resume-overlay-zoom-val">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  type="button" 
                  className="resume-overlay-btn-icon" 
                  onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            )}

            {/* Direct Link in New Tab */}
            {fileUrl && (
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="resume-overlay-action-btn"
                title="Open document directly in new tab"
              >
                <ExternalLink size={15} />
                <span className="btn-text">Open Tab</span>
              </a>
            )}

            {/* Download Button */}
            <button 
              type="button" 
              className="resume-overlay-download-btn" 
              onClick={handleDownload}
              title="Download resume file"
            >
              <Download size={15} />
              <span>Download PDF</span>
            </button>

            {/* Close Button */}
            <button 
              type="button" 
              className="resume-overlay-close-btn" 
              onClick={onClose}
              aria-label="Close resume viewer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div className="resume-overlay-content">
          {previewImg ? (
            /* High-definition rendered canvas preview (works across all browsers and devices flawlessly) */
            <div className="resume-overlay-img-scroll">
              <img 
                src={previewImg} 
                alt="Resume Page Preview" 
                className="resume-overlay-rendered-img"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              />
            </div>
          ) : fileUrl && !isImage ? (
            /* Native browser PDF viewer embed */
            <iframe 
              src={fileUrl} 
              title="Resume Document" 
              className="resume-overlay-iframe" 
            />
          ) : isImage ? (
            <div className="resume-overlay-img-scroll">
              <img 
                src={fileUrl} 
                alt="Resume" 
                className="resume-overlay-rendered-img" 
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              />
            </div>
          ) : (
            <div className="resume-overlay-empty">
              <FileText size={48} className="text-slate-600 mb-2" />
              <p>No document preview available.</p>
              <button 
                type="button" 
                className="resume-overlay-download-btn mt-2" 
                onClick={handleDownload}
              >
                <Download size={16} /> Download File
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
