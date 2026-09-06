import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  Trash2, 
  Sparkles, 
  FileCheck, 
  Eye,
  RefreshCw,
  Clock
} from 'lucide-react';
import { 
  getActiveResume, 
  processResumeFile, 
  saveResumeToDatabase 
} from '../utils/resumeDb';
import './ResumeUploadModal.css';

export default function ResumeUploadModal({ isOpen, onClose, onSaveSuccess }) {
  const [activeResume, setActiveResume] = useState(null);
  const [isLoadingActive, setIsLoadingActive] = useState(true);
  const [stagedFile, setStagedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Load active resume when modal opens
  useEffect(() => {
    if (!isOpen) {
      setStagedFile(null);
      setErrorMsg('');
      setSaveStatus('');
      return;
    }

    let isMounted = true;
    setIsLoadingActive(true);

    getActiveResume()
      .then((resume) => {
        if (isMounted) {
          setActiveResume(resume);
          setIsLoadingActive(false);
        }
      })
      .catch((err) => {
        console.warn('Error loading active resume:', err);
        if (isMounted) setIsLoadingActive(false);
      });

    return () => { isMounted = false; };
  }, [isOpen]);

  const handleFileSelect = async (file) => {
    if (!file) return;
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const processed = await processResumeFile(file);
      setStagedFile(processed);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process selected file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmUpload = async () => {
    if (!stagedFile) return;
    setIsSaving(true);
    setErrorMsg('');

    try {
      const result = await saveResumeToDatabase(
        stagedFile, 
        activeResume, 
        (status) => setSaveStatus(status)
      );

      setActiveResume(result);
      setStagedFile(null);
      onSaveSuccess?.(result);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Resume upload error:', err);
      setErrorMsg(err.message || 'Error saving resume to database.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isReplacing = Boolean(activeResume && stagedFile);

  return (
    <div className="resume-upload-backdrop" onClick={onClose}>
      <motion.div 
        className="resume-upload-panel"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="resume-upload-header">
          <div className="resume-upload-title-group">
            <div className="resume-upload-icon-box">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="resume-upload-title">
                {isReplacing ? 'Confirm Resume Replacement' : 'Resume Database Management'}
              </h3>
              <p className="resume-upload-subtitle">
                {isReplacing 
                  ? 'Review comparison between existing and newly uploaded document' 
                  : 'Manage and update your published resume stored in the database'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="resume-upload-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="resume-upload-body">
          {/* Error notice */}
          {errorMsg && (
            <div className="resume-upload-alert error">
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success notice */}
          {saveStatus && (
            <div className="resume-upload-alert success">
              <Sparkles size={16} className="animate-spin" />
              <span>{saveStatus}</span>
            </div>
          )}

          {/* ─── SCENARIO A: Replacement Comparison View ─── */}
          {isReplacing ? (
            <div className="resume-comparison-container">
              <div className="resume-comparison-banner">
                <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                <div>
                  <div className="resume-comparison-banner-title">Confirm Document Replacement</div>
                  <div className="resume-comparison-banner-desc">
                    Are you sure you want to replace your existing resume? This will permanently delete the current resume from the database and publish the newly uploaded one.
                  </div>
                </div>
              </div>

              <div className="resume-comparison-cards">
                {/* Current Resume (Will be deleted) */}
                <div className="resume-card current">
                  <div className="resume-card-header">
                    <span className="resume-card-tag tag-delete">Current (To be replaced)</span>
                  </div>

                  <div className="resume-preview-container">
                    {activeResume.previewUrl ? (
                      <img 
                        src={activeResume.previewUrl} 
                        alt="Current resume preview" 
                        className="resume-preview-img"
                      />
                    ) : (
                      <div className="resume-preview-fallback">
                        <FileText size={40} className="text-slate-500" />
                        <span>No Preview Available</span>
                      </div>
                    )}
                  </div>

                  <div className="resume-card-meta">
                    <span className="resume-card-name" title={activeResume.name}>{activeResume.name}</span>
                    <div className="resume-card-sub">
                      <span>{activeResume.size || 'Unknown size'}</span>
                      {activeResume.uploadedAt && (
                        <span>&bull; {new Date(activeResume.uploadedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="resume-comparison-divider">
                  <div className="resume-comparison-arrow">
                    <ArrowRight size={20} />
                  </div>
                </div>

                {/* New Resume (To be saved) */}
                <div className="resume-card next">
                  <div className="resume-card-header">
                    <span className="resume-card-tag tag-new">New (To be activated)</span>
                  </div>

                  <div className="resume-preview-container">
                    {stagedFile.previewUrl ? (
                      <img 
                        src={stagedFile.previewUrl} 
                        alt="New resume preview" 
                        className="resume-preview-img"
                      />
                    ) : (
                      <div className="resume-preview-fallback">
                        <FileCheck size={40} className="text-cyan-400" />
                        <span>Document Ready</span>
                      </div>
                    )}
                  </div>

                  <div className="resume-card-meta">
                    <span className="resume-card-name" title={stagedFile.name}>{stagedFile.name}</span>
                    <div className="resume-card-sub">
                      <span>{stagedFile.size}</span>
                      <span>&bull; Newly Staged</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─── SCENARIO B: Default Upload or First-time Upload ─── */
            <div className="resume-upload-default-view">
              {/* Active resume status bar if exists */}
              {activeResume ? (
                <div className="resume-active-status-card">
                  <div className="resume-active-icon">
                    <FileCheck size={20} />
                  </div>
                  <div className="resume-active-info">
                    <div className="resume-active-title">
                      <span>{activeResume.name}</span>
                      <span className="resume-status-badge">Active on Database</span>
                    </div>
                    <div className="resume-active-details">
                      <span>{activeResume.size}</span>
                      {activeResume.uploadedAt && (
                        <span>&bull; Updated {new Date(activeResume.uploadedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : !isLoadingActive && (
                <div className="resume-empty-note">
                  No custom resume uploaded to database yet. Uploading will activate your public CV link and overlay.
                </div>
              )}

              {/* Drag and Drop Upload Area */}
              <div 
                className={`resume-dropzone ${isDragOver ? 'dragover' : ''} ${isProcessing ? 'processing' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                  accept=".pdf,application/pdf,image/*" 
                  className="hidden" 
                />

                {isProcessing ? (
                  <div className="resume-dropzone-inner">
                    <Sparkles size={32} className="text-cyan-400 animate-spin mb-2" />
                    <span className="resume-dropzone-prompt">Rendering Document Preview...</span>
                  </div>
                ) : (
                  <div className="resume-dropzone-inner">
                    <div className="resume-dropzone-icon-circle">
                      <Upload size={22} />
                    </div>
                    <span className="resume-dropzone-prompt">
                      {activeResume ? 'Click or drag a new resume to replace' : 'Click or drag your resume here'}
                    </span>
                    <span className="resume-dropzone-hint">
                      Supports PDF, PNG, JPG (Auto-generates high-res viewer & stores in database)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="resume-upload-footer">
          <button 
            type="button" 
            className="resume-btn-cancel" 
            onClick={() => {
              if (stagedFile) {
                setStagedFile(null);
                setErrorMsg('');
              } else {
                onClose();
              }
            }}
            disabled={isSaving}
          >
            {stagedFile ? 'Discard New File' : 'Cancel'}
          </button>

          {stagedFile && (
            <button 
              type="button" 
              className={`resume-btn-primary ${isReplacing ? 'btn-replace' : ''}`}
              onClick={handleConfirmUpload}
              disabled={isSaving || isProcessing}
            >
              {isSaving ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Updating Database...</span>
                </>
              ) : isReplacing ? (
                <>
                  <RefreshCw size={16} />
                  <span>Confirm & Replace Resume</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save to Database</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
