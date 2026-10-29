import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MainframeProvider, useMainframe } from './context/MainframeContext';
import MainframeAccessHUD from './components/MainframeAccessHUD';
import StellarCryoLoader from './components/StellarCryoLoader';
import StellarBackground from './components/StellarBackground';
import PortfolioSPA from './components/PortfolioSPA';

// Lazy-load AdminDashboard to keep visitor bundles ultra-lean
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { isAccessingMainframe, mainframeProgress, isReturning, returnProgress } = useMainframe();

  const hasEnteredSession = typeof window !== 'undefined' && sessionStorage.getItem('kweyl_stellar_entered') === 'true';

  const [appReady, setAppReady] = useState(isAdminRoute || hasEnteredSession);
  const [loaderExited, setLoaderExited] = useState(isAdminRoute || hasEnteredSession);
  const [isWarping, setIsWarping] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (isAdminRoute || hasEnteredSession) return;
    // On fresh session entrance, ensure critical fonts are ready with a snappy 400ms baseline
    const minDelay = new Promise(resolve => setTimeout(resolve, 400));
    const fontsTimeout = new Promise(resolve => setTimeout(resolve, 2000));
    const fontsReady = Promise.race([document.fonts.ready, fontsTimeout]);

    Promise.all([
      fontsReady,
      minDelay,
    ]).then(() => setAppReady(true));
  }, [isAdminRoute, hasEnteredSession]);

  // Expose intro replay helper for convenience & testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__replayStellarIntro = () => {
        sessionStorage.removeItem('kweyl_stellar_entered');
        window.location.reload();
      };
    }
  }, []);

  return (
    <>
      {/* Loading screen */}
      {!loaderExited && !isAdminRoute && (
        <StellarCryoLoader
          isLoading={!appReady}
          onWarpStart={() => setIsWarping(true)}
          onExited={() => {
            try {
              sessionStorage.setItem('kweyl_stellar_entered', 'true');
            } catch (_) {}
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
        isAdminRoute={isAdminRoute}
        isAccessingMainframe={isAccessingMainframe}
        mainframeProgress={mainframeProgress}
        isReturning={isReturning}
        returnProgress={returnProgress}
      />

      {/* Cinematic Mainframe Access HUD */}
      <MainframeAccessHUD />

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
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={
              <div style={{
                minHeight: '100vh',
                background: '#050811',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                letterSpacing: '0.12em'
              }}>
                SYNCHRONIZING MAINFRAME CORE...
              </div>
            }>
              <AdminDashboard />
            </Suspense>
          } 
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MainframeProvider>
          <AppContent />
        </MainframeProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
