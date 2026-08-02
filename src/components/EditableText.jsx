import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X } from 'lucide-react';

export default function EditableText({ 
    text, 
    isAdmin, 
    onSave, 
    multiline = false, 
    className = "", 
    style = {},
    as: Component = "span" 
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(text);
    const inputRef = useRef(null);

    // Update local state if prop changes (e.g. initial fetch)
    useEffect(() => {
        setValue(text);
    }, [text]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        if (value !== text && onSave) {
            onSave(value);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setValue(text);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !multiline) {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (!isAdmin) {
        // If it's a Component like 'h1', we might need to handle dangerouslySetInnerHTML for line breaks, 
        // but for safety we just render it. If we need <br/> we can split by \n.
        const content = multiline 
            ? value.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)
            : value;
            
        return <Component className={className} style={style}>{content}</Component>;
    }

    if (isEditing) {
        return (
            <div style={{ position: 'relative', display: 'inline-block', width: multiline ? '100%' : 'auto', zIndex: 50 }}>
                {multiline ? (
                    <textarea 
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={className}
                        style={{ 
                            ...style, 
                            background: 'rgba(255,255,255,0.1)', 
                            border: '1px solid var(--accent)',
                            outline: 'none',
                            color: 'inherit',
                            width: '100%',
                            minHeight: '100px',
                            resize: 'vertical',
                            padding: '8px',
                            borderRadius: '4px'
                        }}
                    />
                ) : (
                    <input 
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={className}
                        style={{ 
                            ...style, 
                            background: 'rgba(255,255,255,0.1)', 
                            border: '1px solid var(--accent)',
                            outline: 'none',
                            color: 'inherit',
                            width: '100%',
                            padding: '4px 8px',
                            borderRadius: '4px'
                        }}
                    />
                )}
                <div style={{ position: 'absolute', right: '0', top: '-30px', display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                    <button onClick={handleSave} style={{ color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer' }}><Check size={16}/></button>
                    <button onClick={handleCancel} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16}/></button>
                </div>
            </div>
        );
    }

    // View mode for Admin (shows edit icon on hover)
    const content = multiline 
        ? value.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)
        : value;

    return (
        <Component 
            className={`editable-hover ${className}`} 
            style={{ ...style, position: 'relative', display: 'inline-block', width: multiline ? '100%' : 'auto' }}
            onClick={() => setIsEditing(true)}
            title="Click to edit"
        >
            {content}
            <div className="edit-icon-overlay" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                padding: '8px',
                borderRadius: '50%',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Edit2 size={20} />
            </div>
        </Component>
    );
}
