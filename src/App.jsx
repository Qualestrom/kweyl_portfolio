import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import StellarCryoLoader from './components/StellarCryoLoader';
import StellarBackground from './components/StellarBackground';
import PortfolioSPA from './components/PortfolioSPA';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const [appReady, setAppReady] = useState(isAdminRoute);
  const [loaderExited, setLoaderExited] = useState(isAdminRoute);
  const [isWarping, setIsWarping] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (isAdminRoute) return;
    const minDelay = new Promise(resolve => setTimeout(resolve, 2000));
    const fontsTimeout = new Promise(resolve => setTimeout(resolve, 2500));
    const fontsReady = Promise.race([document.fonts.ready, fontsTimeout]);

    Promise.all([
      fontsReady,
      minDelay,
    ]).then(() => setAppReady(true));
  }, [isAdminRoute]);

  return (
    <>
      {/* Loading screen */}
      {!loaderExited && !isAdminRoute && (
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
      <StellarBackground
        isWarping={isWarping}
        loaderExited={loaderExited}
        activeSection={activeSection}
      />

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
