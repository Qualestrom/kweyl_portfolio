import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

function getSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
}

export function ThemeProvider({ children }) {
    const [manualTheme, setManualTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('portfolio-theme-manual');
            return saved === 'light' || saved === 'dark' ? saved : null;
        } catch (_) {
            return null;
        }
    });

    const [systemTheme, setSystemTheme] = useState(getSystemTheme);
    const theme = manualTheme || systemTheme;

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        const handleChange = (e) => {
            setSystemTheme(e.matches ? 'light' : 'dark');
            // Clear manual override when user changes OS theme so device preference stays authoritative
            setManualTheme(null);
            try {
                localStorage.removeItem('portfolio-theme-manual');
            } catch (_) {}
        };
        mq.addEventListener('change', handleChange);
        return () => mq.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'light' ? '#F1F5F9' : '#0A0F1C');
        }
    }, [theme]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setManualTheme(next);
        try {
            localStorage.setItem('portfolio-theme-manual', next);
        } catch (_) {}
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
