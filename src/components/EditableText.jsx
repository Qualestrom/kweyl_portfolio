import React, { useState, useEffect, useRef, useCallback } from 'react';
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
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [multiline]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) {
        autoResizeTextarea();
      }
      // Move cursor to end of text
      if (inputRef.current.setSelectionRange) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }
  }, [isEditing, autoResizeTextarea, multiline]);

  const handleChange = (e) => {
    setValue(e.target.value);
    if (multiline) {
      autoResizeTextarea();
    }
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
      e.stopPropagation();
      handleSave();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && multiline) {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
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

  // Active in-place edit mode (Ultra-compact inline editor)
  if (isEditing) {
    return (
      <span 
        className={`editable-inline-wrapper ${multiline ? 'editable-inline-wrapper--block' : ''}`} 
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {multiline ? (
          <textarea 
            ref={inputRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`editable-textarea-field ${className}`}
            rows={1}
          />
        ) : (
          <input 
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`editable-input-field ${className}`}
          />
        )}
      </span>
    );
  }

  // View mode for Admin (shows subtle dashed outline on hover)
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {displayContent}
    </Component>
  );
}
