import React from 'react';
import './KeyboardHints.css';

export default function KeyboardHints({ currentSection }) {
  const canGoLeft = currentSection > 0;
  const canGoRight = currentSection < 4; // 5 sections total (0 to 4)

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
