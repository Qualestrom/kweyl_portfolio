import React from 'react';
import './KeyboardHints.css';

const SECTION_NAMES = [
  'Home',
  'About',
  'Projects',
  'Certifications',
  'Contact'
];

export default function KeyboardHints({ currentSection }) {
  const canGoLeft = currentSection > 0;
  const canGoRight = currentSection < SECTION_NAMES.length - 1;

  const prevName = canGoLeft ? SECTION_NAMES[currentSection - 1] : '';
  const nextName = canGoRight ? SECTION_NAMES[currentSection + 1] : '';

  return (
    <div className="keyboard-hints">
      <div className={`keyboard-hint${canGoLeft ? ' visible' : ''}`}>
        <span className="keyboard-hint-key">◄</span>
        {prevName && <span className="keyboard-hint-label">{prevName}</span>}
      </div>
      <div className={`keyboard-hint${canGoRight ? ' visible' : ''}`}>
        {nextName && <span className="keyboard-hint-label">{nextName}</span>}
        <span className="keyboard-hint-key">►</span>
      </div>
    </div>
  );
}
