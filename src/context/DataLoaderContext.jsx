import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Context for reporting milestones (stable, 0 re-render churn for data loaders)
export const DataLoaderReportContext = createContext((_key) => {});

// Context for reading milestones state (only StellarCryoLoader subscribes to this)
export const DataLoaderStateContext = createContext({
  milestones: {
    fonts: false,
    config: false,
    projects: false,
    certificates: false,
  },
  allLoaded: false,
});

export const useReportMilestone = () => useContext(DataLoaderReportContext);
export const useDataLoaderState = () => useContext(DataLoaderStateContext);

// Backward-compatible hook
export const useDataLoader = () => {
  const reportMilestone = useContext(DataLoaderReportContext);
  const state = useContext(DataLoaderStateContext);
  return { ...state, reportMilestone };
};

/**
 * DataLoaderProvider — Precision Simultaneous Data Loading Orchestrator
 * 
 * Separates milestone reporting from milestone state consumption so child components
 * (Projects, Certs, Persona) never suffer context-induced re-render churn or React 19
 * fiber collisions while hydrating.
 */
export function DataLoaderProvider({ children }) {
  const [milestones, setMilestones] = useState({
    fonts: false,
    config: false,
    projects: false,
    certificates: false,
  });

  const allLoaded = Boolean(
    milestones.fonts &&
    milestones.config &&
    milestones.projects &&
    milestones.certificates
  );

  const reportMilestone = useCallback((key) => {
    setMilestones((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  }, []);

  // 1. Automatic Core Assets & Fonts Listener
  useEffect(() => {
    let isMounted = true;
    const fontsReady = typeof document !== 'undefined' && document.fonts
      ? document.fonts.ready
      : Promise.resolve();

    fontsReady
      .then(() => {
        if (isMounted) reportMilestone('fonts');
      })
      .catch(() => {
        if (isMounted) reportMilestone('fonts');
      });

    return () => { isMounted = false; };
  }, [reportMilestone]);

  // 2. Safety fallbacks for slow/offline networks
  useEffect(() => {
    const tConfig = setTimeout(() => reportMilestone('config'), 2400);
    const tProjects = setTimeout(() => reportMilestone('projects'), 2800);
    const tCerts = setTimeout(() => reportMilestone('certificates'), 3000);
    const tMaster = setTimeout(() => {
      reportMilestone('fonts');
      reportMilestone('config');
      reportMilestone('projects');
      reportMilestone('certificates');
    }, 3600);

    return () => {
      clearTimeout(tConfig);
      clearTimeout(tProjects);
      clearTimeout(tCerts);
      clearTimeout(tMaster);
    };
  }, [reportMilestone]);

  const stateValue = useMemo(() => ({
    milestones,
    allLoaded,
  }), [milestones, allLoaded]);

  return (
    <DataLoaderReportContext.Provider value={reportMilestone}>
      <DataLoaderStateContext.Provider value={stateValue}>
        {children}
      </DataLoaderStateContext.Provider>
    </DataLoaderReportContext.Provider>
  );
}
