import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Sparkles, RefreshCw } from 'lucide-react';
import './HeadlineEditorModal.css';

/**
 * Parses headline text into lines and words, with highlight tracking.
 */
export default function HeadlineEditorModal({
  currentLine1 = "PRECISION IN EVERY PIXEL.",
  currentLine2 = "PERFORMANCE IN EVERY DEPLOYMENT.",
  currentHighlightedWords = ['PRECISION', 'PERFORMANCE'],
  onSave,
  onClose,
}) {
  const [line1, setLine1] = useState(currentLine1);
  const [line2, setLine2] = useState(currentLine2);
  const [highlightedWords, setHighlightedWords] = useState(
    Array.isArray(currentHighlightedWords) ? currentHighlightedWords : ['PRECISION', 'PERFORMANCE']
  );

  // Clean a word from punctuation for comparison
  const normalizeWord = (w) => (w || '').replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toUpperCase();

  // Extract list of clean tokens/words from line1 and line2
  const wordsLine1 = useMemo(() => {
    return line1.split(/\s+/).filter(Boolean);
  }, [line1]);

  const wordsLine2 = useMemo(() => {
    return line2.split(/\s+/).filter(Boolean);
  }, [line2]);

  // List of all current normalized words present in Line 1 + Line 2
  const currentNormalizedWords = useMemo(() => {
    return [...wordsLine1, ...wordsLine2].map(normalizeWord).filter(Boolean);
  }, [wordsLine1, wordsLine2]);

  // Only count & keep highlighted words that actually exist in the current headline
  const activeHighlightedWords = useMemo(() => {
    const validSet = new Set(currentNormalizedWords);
    return Array.from(new Set(highlightedWords.filter((w) => validSet.has(w))));
  }, [highlightedWords, currentNormalizedWords]);

  const toggleHighlight = (word) => {
    const norm = normalizeWord(word);
    if (!norm) return;

    if (activeHighlightedWords.includes(norm)) {
      setHighlightedWords(activeHighlightedWords.filter((w) => w !== norm));
    } else {
      setHighlightedWords([...activeHighlightedWords, norm]);
    }
  };

  const handleResetDefaults = () => {
    setLine1("PRECISION IN EVERY PIXEL.");
    setLine2("PERFORMANCE IN EVERY DEPLOYMENT.");
    setHighlightedWords(['PRECISION', 'PERFORMANCE']);
  };

  const handleSave = () => {
    onSave({
      heroHeadline1: line1.trim(),
      heroHeadline2: line2.trim(),
      heroHighlightedWords: activeHighlightedWords,
    });
    onClose();
  };

  return (
    <div className="hl-editor-modal-backdrop" onClick={onClose}>
      <motion.div 
        className="hl-editor-modal-panel"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="hl-editor-modal-header">
          <div className="hl-editor-modal-title">
            <Sparkles size={20} style={{ color: 'var(--cryo-accent)' }} />
            <span>Customize Headline & Word Highlights</span>
          </div>
          <button className="hl-editor-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="hl-editor-modal-body">
          <p className="hl-editor-modal-desc">
            Type your headline lines below, then <strong>click any word token</strong> to toggle its cyan accent color and glow emphasis!
          </p>

          {/* Live Preview */}
          <div className="hl-editor-preview-card">
            <div className="hl-editor-preview-badge">Live Headline Preview</div>
            <div className="hl-editor-preview-headline">
              {/* Line 1 preview */}
              <div className="hl-editor-preview-line">
                {wordsLine1.map((w, idx) => {
                  const isHighlighted = activeHighlightedWords.includes(normalizeWord(w));
                  return (
                    <span 
                      key={`p1-${idx}`} 
                      className={`hl-preview-word ${isHighlighted ? 'is-highlighted' : ''}`}
                    >
                      {w}{' '}
                    </span>
                  );
                })}
              </div>
              {/* Line 2 preview */}
              <div className="hl-editor-preview-line">
                {wordsLine2.map((w, idx) => {
                  const isHighlighted = activeHighlightedWords.includes(normalizeWord(w));
                  return (
                    <span 
                      key={`p2-${idx}`} 
                      className={`hl-preview-word ${isHighlighted ? 'is-highlighted' : ''}`}
                    >
                      {w}{' '}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Text Inputs */}
          <div className="hl-editor-inputs-grid">
            <div className="hl-editor-form-group">
              <label className="hl-editor-label">Headline Line 1</label>
              <input 
                type="text" 
                value={line1} 
                onChange={(e) => setLine1(e.target.value)} 
                className="hl-editor-input"
                placeholder="PRECISION IN EVERY PIXEL."
              />
            </div>
            <div className="hl-editor-form-group">
              <label className="hl-editor-label">Headline Line 2</label>
              <input 
                type="text" 
                value={line2} 
                onChange={(e) => setLine2(e.target.value)} 
                className="hl-editor-input"
                placeholder="PERFORMANCE IN EVERY DEPLOYMENT."
              />
            </div>
          </div>

          {/* Interactive Word Highlighting Selector */}
          <div className="hl-editor-tokens-section">
            <div className="hl-editor-tokens-header">
              <span className="hl-editor-label">Click words to toggle cyan emphasis:</span>
              <span className="hl-editor-active-count">
                {activeHighlightedWords.length} emphasized {activeHighlightedWords.length === 1 ? 'word' : 'words'}
              </span>
            </div>

            {/* Line 1 Tokens */}
            <div className="hl-tokens-line-group">
              <div className="hl-tokens-line-tag">Line 1 Words</div>
              <div className="hl-tokens-wrap">
                {wordsLine1.map((word, i) => {
                  const isHighlighted = activeHighlightedWords.includes(normalizeWord(word));
                  return (
                    <button
                      key={`l1-${i}`}
                      type="button"
                      className={`hl-token-pill ${isHighlighted ? 'active' : ''}`}
                      onClick={() => toggleHighlight(word)}
                    >
                      <span>{word}</span>
                      {isHighlighted && <Sparkles size={12} className="hl-token-sparkle" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Line 2 Tokens */}
            <div className="hl-tokens-line-group">
              <div className="hl-tokens-line-tag">Line 2 Words</div>
              <div className="hl-tokens-wrap">
                {wordsLine2.map((word, i) => {
                  const isHighlighted = activeHighlightedWords.includes(normalizeWord(word));
                  return (
                    <button
                      key={`l2-${i}`}
                      type="button"
                      className={`hl-token-pill ${isHighlighted ? 'active' : ''}`}
                      onClick={() => toggleHighlight(word)}
                    >
                      <span>{word}</span>
                      {isHighlighted && <Sparkles size={12} className="hl-token-sparkle" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="hl-editor-modal-footer">
          <button 
            type="button" 
            className="hl-editor-btn-reset" 
            onClick={handleResetDefaults}
          >
            <RefreshCw size={14} /> Reset Defaults
          </button>
          <div className="hl-editor-footer-right">
            <button 
              type="button" 
              className="hl-editor-btn-cancel" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="hl-editor-btn-save" 
              onClick={handleSave}
            >
              <Check size={16} /> Apply & Save Headline
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
