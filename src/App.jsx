import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import StellarCryoLoader from './components/StellarCryoLoader';
import StellarBackground from './components/StellarBackground';
import InteractiveBackground from './components/InteractiveBackground';
import PortfolioSPA from './components/PortfolioSPA';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [loaderExited, setLoaderExited] = useState(false);

  useEffect(() => {
    const minDelay = new Promise(resolve => setTimeout(resolve, 5000));
    Promise.all([
      document.fonts.ready,
      minDelay,
    ]).then(() => setAppReady(true));
  }, []);

  return (
    <>
      {/* Loading screen */}
      {!loaderExited && (
        <StellarCryoLoader
          isLoading={!appReady}
          onExited={() => setLoaderExited(true)}
        />
      )}

      {/* Persistent backgrounds — starfield + circuit constellation grid */}
      <StellarBackground />
      <InteractiveBackground />

      {/* Theme + Router shell */}
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PortfolioSPA />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}
