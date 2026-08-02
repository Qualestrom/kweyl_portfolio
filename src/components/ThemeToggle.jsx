import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
            title="Toggle Light/Dark Mode"
        >
            <div className={`theme-toggle-icon ${theme === 'dark' ? 'rotate' : ''}`}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </div>
        </button>
    );
}

export default ThemeToggle;
