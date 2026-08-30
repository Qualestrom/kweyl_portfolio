import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SectionWarpFlash.css';

export default function SectionWarpFlash({ direction, isVisible }) {
  // If direction is positive (going forward/right), flash moves right to left
  // If direction is negative (going backward/left), flash moves left to right
  const isForward = direction > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="warp-flash-container"
          initial={{ x: isForward ? '100%' : '-100%', opacity: 0 }}
          animate={{ x: isForward ? '-100%' : '100%', opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="warp-flash-line" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
