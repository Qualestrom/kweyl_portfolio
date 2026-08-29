import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import './ImageWithPlaceholder.css';

export default function ImageWithPlaceholder({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackSrc = '',
  showSpinner = false,
  draggable = false,
  style = {},
  onClick,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  // Synchronous cache detection on src update or mount
  useEffect(() => {
    setError(false);

    if (!src) {
      setLoaded(true);
      return;
    }

    // Check if the image is already cached in browser memory
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  const activeSrc = error ? (fallbackSrc || '') : src;

  return (
    <div 
      className={`stellar-image-wrapper ${containerClassName}`}
      onClick={onClick}
    >
      {/* ─── Stellar Cosmic Shimmer Effect (Visible while image loads) ─── */}
      {!loaded && activeSrc && (
        <>
          <div className="stellar-shimmer-sweep" />
          {showSpinner && (
            <div className="stellar-loader-center">
              <div className="stellar-orbital-ring" />
              <span className="text-[10px] font-mono text-cyan-300 tracking-wider">LOADING</span>
            </div>
          )}
        </>
      )}

      {/* ─── Actual Image Asset with Progressive Fade-In ─── */}
      {activeSrc ? (
        <img
          ref={(el) => {
            imgRef.current = el;
            // Immediate check when DOM element attaches (e.g. from memory cache)
            if (el && el.complete && el.naturalWidth > 0 && !loaded) {
              setLoaded(true);
            }
          }}
          src={activeSrc}
          alt={alt}
          style={style}
          draggable={draggable}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!error && fallbackSrc && fallbackSrc !== src) {
              setError(true);
            } else {
              setLoaded(true);
              setError(true);
            }
          }}
          className={`stellar-image-asset ${loaded ? 'stellar-image-loaded' : 'stellar-image-loading'} ${className}`}
        />
      ) : (
        /* Fallback if no image source is provided */
        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-slate-500 text-xs font-mono gap-1">
          <Sparkles size={16} className="text-cyan-400/60" />
          <span>Asset on record</span>
        </div>
      )}
    </div>
  );
}
