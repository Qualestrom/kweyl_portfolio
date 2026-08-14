import React from 'react';
import './KeyboardHints.css';

const TOTAL_SECTIONS = 5;

export default function KeyboardHints({ currentSection }) {
  const canGoLeft = currentSection > 0;
  const canGoRight = currentSection < TOTAL_SECTIONS - 1;

  return (
    <div className="keyboard-hints">
      <div className={`keyboard-hint${canGoLeft ? ' visible' : ''}`}>
        <span className="keyboard-hint-key">◄</span>
      </div>
      <div className={`keyboard-hint${canGoRight ? ' visible' : ''}`}>
        <span className="keyboard-hint-key">►</span>
      </div>
    </div>
  );
}
