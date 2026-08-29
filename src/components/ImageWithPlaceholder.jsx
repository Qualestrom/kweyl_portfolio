import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
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
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset loading state if src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const activeSrc = error ? fallbackSrc || src : src;

  return (
    <div className={`stellar-image-wrapper ${containerClassName}`}>
      {/* ─── Stellar Cosmic Shimmer Effect (Visible while image loads) ─── */}
      {!loaded && (
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
      {activeSrc && (
        <img
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
      )}

      {/* ─── Fallback on error if no image available ─── */}
      {error && !fallbackSrc && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-slate-500 text-xs font-mono gap-1">
          <Sparkles size={16} className="text-cyan-400/60" />
          <span>Asset on record</span>
        </div>
      )}
    </div>
  );
}
