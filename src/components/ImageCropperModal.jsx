import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Sparkles, 
  Upload, 
  Trash2, 
  Move,
  Layers,
  CircleDot
} from 'lucide-react';
import './ImageCropperModal.css';

export const FRAME_ANIMATIONS = [
  {
    id: 'orbit',
    name: 'Cosmic Orbit',
    desc: 'Rotating orbital dashed ring with smooth float',
    icon: '🪐',
  },
  {
    id: 'pulse',
    name: 'Pulse Glow',
    desc: 'Breathing radiant halo glow with wave float',
    icon: '✨',
  },
  {
    id: 'quantum',
    name: 'Quantum Spin',
    desc: 'Dual counter-rotating cyber rings',
    icon: '⚛️',
  },
  {
    id: 'hologram',
    name: 'Cryo Hologram',
    desc: 'Futuristic scanline sheen & elevation',
    icon: '💎',
  },
  {
    id: 'static',
    name: 'Static Sleek',
    desc: 'Clean, elegant frosted glass frame',
    icon: '🛡️',
  },
];

export default function ImageCropperModal({
  imageSource,
  currentAnimation = 'orbit',
  hasExistingImage = false,
  onSave,
  onRevertToDefault,
  onChangeImage,
  onClose,
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedAnimation, setSelectedAnimation] = useState(currentAnimation || 'orbit');
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Load image object
  useEffect(() => {
    if (!imageSource) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImageLoaded(true);
      // Center image
      setOffset({ x: 0, y: 0 });
      setZoom(1);
    };
    img.src = imageSource;
  }, [imageSource]);

  // Redraw canvas whenever zoom or offset changes
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const size = canvas.width; // 400x400

    ctx.clearRect(0, 0, size, size);

    // Save context for circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Fill background
    ctx.fillStyle = '#0B132B';
    ctx.fillRect(0, 0, size, size);

    // Calculate dimensions to cover square
    const scale = Math.max(size / img.width, size / img.height) * zoom;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    const drawX = (size - drawWidth) / 2 + offset.x;
    const drawY = (size - drawHeight) / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }, [zoom, offset]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [imageLoaded, drawCanvas]);

  // Mouse & Touch Pan Handling
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Attach non-passive wheel listener to allow preventDefault without browser warning
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * -0.0015;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.8), 3.5));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Handle Save
  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-res export canvas (600x600 for crisp display, compressed to ~50KB webp/jpeg)
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 600;
    exportCanvas.height = 600;
    const exportCtx = exportCanvas.getContext('2d');

    const img = imgRef.current;
    if (img) {
      exportCtx.beginPath();
      exportCtx.arc(300, 300, 300, 0, Math.PI * 2);
      exportCtx.closePath();
      exportCtx.clip();

      exportCtx.fillStyle = '#0B132B';
      exportCtx.fillRect(0, 0, 600, 600);

      const ratio = 600 / 400;
      const scale = Math.max(600 / img.width, 600 / img.height) * zoom;
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;

      const drawX = (600 - drawWidth) / 2 + offset.x * ratio;
      const drawY = (600 - drawHeight) / 2 + offset.y * ratio;

      exportCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      let dataUrl = '';
      try {
        dataUrl = exportCanvas.toDataURL('image/webp', 0.85);
        if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
          dataUrl = exportCanvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (_) {
        dataUrl = exportCanvas.toDataURL('image/jpeg', 0.85);
      }

      onSave(dataUrl, selectedAnimation);
    } else {
      // Just animation change
      onSave(imageSource, selectedAnimation);
    }
  };

  return (
    <div className="cropper-modal-backdrop" onClick={onClose}>
      <motion.div 
        className="cropper-modal-panel"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Modal Header */}
        <div className="cropper-modal-header">
          <div className="cropper-modal-title">
            <Sparkles size={20} style={{ color: 'var(--cryo-accent)' }} />
            <span>Customize Avatar & Frame</span>
          </div>
          <button className="cropper-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="cropper-modal-body">
          <div className="cropper-grid">
            
            {/* Left Side: Interactive Circular Cropper */}
            <div className="cropper-crop-column">
              <div className="cropper-crop-area-wrapper">
                <div 
                  ref={containerRef}
                  className="cropper-viewport-container"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={400} 
                    className="cropper-canvas" 
                  />

                  {/* Circular Overlay Mask Guideline */}
                  <div className="cropper-circular-guide">
                    <div className="cropper-crosshair-h" />
                    <div className="cropper-crosshair-v" />
                  </div>
                </div>

                <div className="cropper-drag-hint">
                  <Move size={14} /> Drag image to position &bull; Scroll to zoom
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="cropper-zoom-controls">
                <button 
                  type="button" 
                  className="cropper-zoom-btn" 
                  onClick={() => setZoom((z) => Math.max(z - 0.15, 0.8))}
                >
                  <ZoomOut size={16} />
                </button>
                <input 
                  type="range" 
                  min="0.8" 
                  max="3.5" 
                  step="0.02" 
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))} 
                  className="cropper-zoom-slider" 
                />
                <button 
                  type="button" 
                  className="cropper-zoom-btn" 
                  onClick={() => setZoom((z) => Math.min(z + 0.15, 3.5))}
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* Action: Choose another image */}
              <div className="cropper-photo-actions">
                <button 
                  type="button" 
                  className="cropper-btn-choose-new" 
                  onClick={onChangeImage}
                >
                  <Upload size={15} /> Choose Another Photo
                </button>

                {hasExistingImage && (
                  <button 
                    type="button" 
                    className="cropper-btn-revert" 
                    onClick={onRevertToDefault}
                  >
                    <Trash2 size={15} /> Revert to Cosmic Avatar
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: Frame Animation Selection */}
            <div className="cropper-settings-column">
              <div className="cropper-section-heading">
                <Layers size={16} style={{ color: 'var(--cryo-accent)' }} />
                <span>Select Frame Animation</span>
              </div>

              <div className="cropper-animations-list">
                {FRAME_ANIMATIONS.map((anim) => {
                  const isSelected = selectedAnimation === anim.id;
                  return (
                    <div 
                      key={anim.id}
                      className={`cropper-anim-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedAnimation(anim.id)}
                    >
                      <div className="cropper-anim-card-icon">{anim.icon}</div>
                      <div className="cropper-anim-card-text">
                        <div className="cropper-anim-name">{anim.name}</div>
                        <div className="cropper-anim-desc">{anim.desc}</div>
                      </div>
                      <div className="cropper-anim-radio">
                        {isSelected ? (
                          <div className="cropper-radio-checked">
                            <Check size={12} />
                          </div>
                        ) : (
                          <div className="cropper-radio-empty" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="cropper-modal-footer">
          <button type="button" className="cropper-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="cropper-btn-save" onClick={handleConfirm}>
            <Check size={16} /> Apply & Save to Database
          </button>
        </div>
      </motion.div>
    </div>
  );
}
