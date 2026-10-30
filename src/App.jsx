import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MainframeProvider, useMainframe } from './context/MainframeContext';
import { DataLoaderProvider, useDataLoader } from './context/DataLoaderContext';
import MainframeAccessHUD from './components/MainframeAccessHUD';
import StellarCryoLoader from './components/StellarCryoLoader';
import StellarBackground from './components/StellarBackground';
import PortfolioSPA from './components/PortfolioSPA';
import { ScaffoldPanel, ScaffoldBlock } from './components/common/LoadingScaffold';

// Lazy-load AdminDashboard & ScaffoldsPreview to keep visitor bundles ultra-lean
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const ScaffoldsPreview = lazy(() => import('./pages/ScaffoldsPreview.jsx'));

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isScaffoldsRoute = location.pathname.startsWith('/scaffolds');
  const { isAccessingMainframe, mainframeProgress, isReturning, returnProgress } = useMainframe();

  const hasEnteredSession = typeof window !== 'undefined' && sessionStorage.getItem('kweyl_stellar_entered') === 'true';

  const [loaderExited, setLoaderExited] = useState(isAdminRoute || isScaffoldsRoute || hasEnteredSession);
  const [isWarping, setIsWarping] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

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
      {/* Loading screen with simultaneous data-driven icon loading progression */}
      {!loaderExited && !isAdminRoute && !isScaffoldsRoute && (
        <StellarCryoLoader
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

      {/* Persistent celestial background — 3D Full Frostmoon, starfield & procedural constellations scaled with loadProgress */}
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
              <div className="min-h-screen bg-[#050811] flex items-center justify-center p-6">
                <ScaffoldPanel className="w-full max-w-sm p-7 flex flex-col items-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-full border border-cyan-400/30 flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <div className="text-xs font-mono text-cyan-400 tracking-wider">
                    SYNCHRONIZING MAINFRAME...
                  </div>
                  <ScaffoldBlock width="80%" height="14px" rounded="rounded" />
                  <ScaffoldBlock width="60%" height="12px" rounded="rounded" />
                  <div className="w-full flex flex-col gap-2.5 pt-3">
                    <ScaffoldBlock width="100%" height="38px" rounded="rounded-xl" />
                    <ScaffoldBlock width="100%" height="38px" rounded="rounded-xl" />
                  </div>
                </ScaffoldPanel>
              </div>
            }>
              <AdminDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="/scaffolds" 
          element={
            <Suspense fallback={null}>
              <ScaffoldsPreview />
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
      <DataLoaderProvider>
        <BrowserRouter>
          <MainframeProvider>
            <AppContent />
          </MainframeProvider>
        </BrowserRouter>
      </DataLoaderProvider>
    </ThemeProvider>
  );
}
