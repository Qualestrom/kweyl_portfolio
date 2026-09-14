import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';

const PULL_THRESHOLD = 65;
const MAX_PULL = 100;

export default function PullToRefresh() {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startRef = useRef({ x: 0, y: 0, canPull: false, active: false });

  useEffect(() => {
    // ── Touch Events (Mobile screens) ───────────────────────────────────────────
    const handleTouchStart = (e) => {
      if (isRefreshing) return;
      if (!e.touches || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const target = touch.target;

      // Ignore interactive form controls or floating components
      if (
        target.closest(
          'input, textarea, select, button, .mobile-nav-root, .stellar-modal-backdrop, .project-media-slider, [data-no-swipe]'
        )
      ) {
        startRef.current.canPull = false;
        return;
      }

      // Check if inside a scrollable container
      const scrollable = target.closest('.section-scrollable, .overflow-y-auto, [data-scrollable]');
      const isAtTop = !scrollable || scrollable.scrollTop <= 2;

      if (isAtTop) {
        startRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          canPull: true,
          active: false,
        };
      } else {
        startRef.current.canPull = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!startRef.current.canPull || isRefreshing) return;
      if (!e.touches || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const dy = touch.clientY - startRef.current.y;
      const dx = touch.clientX - startRef.current.x;

      // Only pull down if vertical downward movement is dominant
      if (dy > 8 && dy > Math.abs(dx) * 1.15) {
        startRef.current.active = true;
        const damped = Math.min((dy - 8) * 0.45, MAX_PULL);
        setPullDistance(damped);

        if (e.cancelable && damped > 15) {
          e.preventDefault();
        }
      } else if (dy <= 0 && startRef.current.active) {
        setPullDistance(0);
        startRef.current.active = false;
      }
    };

    const handleTouchEnd = () => {
      if (!startRef.current.canPull) return;

      if (pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        setTimeout(() => {
          window.location.reload();
        }, 550);
      } else {
        setPullDistance(0);
      }

      startRef.current = { x: 0, y: 0, canPull: false, active: false };
    };

    // ── Mouse Drag Support for Mobile Emulation & Testing ────────────────────────
    let isMouseDown = false;
    const handleMouseDown = (e) => {
      if (isRefreshing || window.innerWidth > 768) return;
      if (e.button !== 0) return; // Left click only

      const target = e.target;
      if (
        target.closest(
          'input, textarea, select, button, .mobile-nav-root, .stellar-modal-backdrop, .project-media-slider, [data-no-swipe]'
        )
      ) {
        return;
      }

      // Check scrollable
      const scrollable = target.closest('.section-scrollable, .overflow-y-auto, [data-scrollable]');
      const isAtTop = !scrollable || scrollable.scrollTop <= 2;

      if (isAtTop && e.clientY < 260) {
        isMouseDown = true;
        startRef.current = {
          x: e.clientX,
          y: e.clientY,
          canPull: true,
          active: false,
        };
      }
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown || !startRef.current.canPull || isRefreshing) return;
      const dy = e.clientY - startRef.current.y;
      const dx = e.clientX - startRef.current.x;

      if (dy > 8 && dy > Math.abs(dx) * 1.15) {
        startRef.current.active = true;
        const damped = Math.min((dy - 8) * 0.45, MAX_PULL);
        setPullDistance(damped);
      } else if (dy <= 0 && startRef.current.active) {
        setPullDistance(0);
        startRef.current.active = false;
      }
    };

    const handleMouseUp = () => {
      if (isMouseDown) {
        isMouseDown = false;
        handleTouchEnd();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);

      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [pullDistance, isRefreshing]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const isReady = pullDistance >= PULL_THRESHOLD;

  return (
    <AnimatePresence>
      {(pullDistance > 10 || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0, y: -45 }}
          animate={{
            opacity: 1,
            y: Math.min(pullDistance, PULL_THRESHOLD + 12),
          }}
          exit={{ opacity: 0, y: -45 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          style={{
            position: 'fixed',
            top: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(10, 15, 28, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border:
                isReady || isRefreshing
                  ? '1px solid var(--cryo-accent, #00f0ff)'
                  : '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow:
                isReady || isRefreshing
                  ? '0 4px 22px rgba(0, 240, 255, 0.28), 0 0 12px rgba(0, 240, 255, 0.2)'
                  : '0 4px 16px rgba(0, 0, 0, 0.45)',
              color: isReady || isRefreshing ? 'var(--cryo-accent, #00f0ff)' : '#e2e8f0',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              transition: 'border 0.2s ease, box-shadow 0.2s ease, color 0.2s ease',
            }}
          >
            {isRefreshing ? (
              <RefreshCw size={14} className="animate-spin text-cyan-400" />
            ) : (
              <motion.div
                animate={{ rotate: isReady ? 180 : progress * 180 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowDown size={14} />
              </motion.div>
            )}
            <span>
              {isRefreshing
                ? 'Refreshing page...'
                : isReady
                ? 'Release to refresh'
                : 'Pull down to refresh'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
