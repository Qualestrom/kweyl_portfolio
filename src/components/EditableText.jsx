import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import './EditableText.css';

export default function EditableText({ 
  text, 
  isAdmin, 
  onSave, 
  multiline = false, 
  placeholder = "Click to edit...",
  className = "", 
  style = {},
  as: Component = "span" 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text || '');
  const inputRef = useRef(null);

  // Synchronize local state with prop updates
  useEffect(() => {
    setValue(text || '');
  }, [text]);

  // Auto-resize textarea to fit text height perfectly without scrollbars
  const autoResizeTextarea = useCallback(() => {
    if (multiline && inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.max(inputRef.current.scrollHeight, 40)}px`;
    }
  }, [multiline]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      autoResizeTextarea();
      // Move cursor to end of text
      if (inputRef.current.setSelectionRange) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }
  }, [isEditing, autoResizeTextarea]);

  const handleChange = (e) => {
    setValue(e.target.value);
    autoResizeTextarea();
  };

  const handleSave = () => {
    setIsEditing(false);
    if (value !== text && onSave) {
      onSave(value);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(text || '');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // If not admin, simply render the component
  if (!isAdmin) {
    const content = multiline 
      ? (value || '').split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i !== (value || '').split('\n').length - 1 && <br />}
          </React.Fragment>
        ))
      : value;
        
    return <Component className={className} style={style}>{content}</Component>;
  }

  // Active in-place edit mode
  if (isEditing) {
    return (
      <div className={`editable-wrapper ${multiline ? 'editable-wrapper--block' : ''}`} style={style}>
        <div className="editable-active-container">
          {multiline ? (
            <textarea 
              ref={inputRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`editable-textarea-field ${className}`}
              rows={1}
              style={{ overflow: 'hidden' }}
            />
          ) : (
            <input 
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`editable-input-field ${className}`}
            />
          )}

          {/* Action Toolbar */}
          <div className="editable-actions-bar">
            <div className="editable-actions-buttons">
              <button 
                type="button" 
                onClick={handleSave} 
                className="editable-btn-save"
                title="Save changes"
              >
                <Check size={14} /> Save
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                className="editable-btn-cancel"
                title="Cancel"
              >
                <X size={14} /> Cancel
              </button>
            </div>
            <span className="editable-hint-text">
              {multiline ? 'Esc to cancel' : '↵ Enter to save • Esc to cancel'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // View mode for Admin (shows subtle dashed outline and edit badge on hover)
  const content = multiline 
    ? (value || '').split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i !== (value || '').split('\n').length - 1 && <br />}
        </React.Fragment>
      ))
    : value;

  const displayContent = value 
    ? content 
    : <span className="opacity-50 italic font-normal">{placeholder}</span>;

  return (
    <Component 
      className={`editable-hover-container ${multiline ? 'editable-hover-container--block' : ''} ${className}`} 
      style={style}
      onClick={() => setIsEditing(true)}
    >
      {displayContent}
      <span className="editable-hover-badge">
        <Edit2 size={9} /> Edit
      </span>
    </Component>
  );
}
