import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import StellarCryoLoader from './components/StellarCryoLoader';
import StellarBackground from './components/StellarBackground';
import PortfolioSPA from './components/PortfolioSPA';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [loaderExited, setLoaderExited] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

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
          onWarpStart={() => setIsWarping(true)}
          onExited={() => {
            setLoaderExited(true);
            setIsWarping(false);
          }}
        />
      )}

      {/* Persistent celestial background — 3D Full Frostmoon, starfield & procedural constellations */}
      <StellarBackground isWarping={isWarping} activeSection={activeSection} />

      {/* Theme + Router shell */}
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PortfolioSPA
                  loaderExited={loaderExited}
                  isWarping={isWarping}
                  onSectionChange={setActiveSection}
                />
              }
            />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}
