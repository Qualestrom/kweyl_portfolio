import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export const DataLoaderContext = createContext({
  loadProgress: 0,
  displayPercent: 0,
  isDataReady: false,
  milestones: {
    fonts: false,
    config: false,
    projects: false,
    certificates: false,
  },
  reportMilestone: () => {},
});

export const useDataLoader = () => useContext(DataLoaderContext);

/**
 * DataLoaderProvider — Precision data loading orchestrator
 * 
 * Maps real network and asset milestones to exact percentage thresholds:
 * - 0% - 20%: Engine Init & Critical Fonts (document.fonts.ready)
 * - 20% - 40%: Portfolio Config & Persona Bio (Supabase / Firestore)
 * - 40% - 65%: Projects Database & Case Studies (Supabase / Firestore)
 * - 65% - 90%: Credentials & Certifications Database (Supabase / Firestore)
 * - 90% - 100%: System Calibration & Final Verification
 * 
 * Guarantees smooth, non-blocking 60 FPS interpolation and failsafe timeouts
 * so the user can never be stranded even on slow or offline networks.
 */
export function DataLoaderProvider({ children }) {
  const [milestones, setMilestones] = useState({
    fonts: false,
    config: false,
    projects: false,
    certificates: false,
  });

  const [rawTargetPercent, setRawTargetPercent] = useState(5);
  const [displayPercent, setDisplayPercent] = useState(5);
  const [loadProgress, setLoadProgress] = useState(0.05);
  const [isDataReady, setIsDataReady] = useState(false);

  const rawTargetRef = useRef(5);
  const displayProgressRef = useRef(0.05);
  const isAllLoadedRef = useRef(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Report a specific data milestone as resolved
  const reportMilestone = useCallback((key) => {
    setMilestones((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  }, []);

  // Compute raw target percentage based on milestone weights
  useEffect(() => {
    let p = 5; // Base boot progress
    if (milestones.fonts) p += 15;        // Reaches 20% (Icon 1: Home fully lit)
    if (milestones.config) p += 20;       // Reaches 40% (Icon 2: About fully lit)
    if (milestones.projects) p += 25;     // Reaches 65% (Icon 3: Projects fully lit)
    if (milestones.certificates) p += 25; // Reaches 90% (Icon 4: Credentials fully lit)

    const allResolved = milestones.fonts && milestones.config && milestones.projects && milestones.certificates;
    if (allResolved) {
      p = 100; // Finalization (Icon 5: Contact fully lit)
      isAllLoadedRef.current = true;
    }

    rawTargetRef.current = p;
    setRawTargetPercent(p);
  }, [milestones]);

  // ── 1. Automatic Core Assets & Fonts Listener ──
  useEffect(() => {
    let isMounted = true;
    const minDelay = new Promise((r) => setTimeout(r, 200));
    const fontsTimeout = new Promise((r) => setTimeout(r, 2200));
    const fontsReady = typeof document !== 'undefined' && document.fonts
      ? Promise.race([document.fonts.ready, fontsTimeout])
      : Promise.resolve();

    Promise.all([fontsReady, minDelay]).then(() => {
      if (isMounted) {
        reportMilestone('fonts');
      }
    });

    return () => { isMounted = false; };
  }, [reportMilestone]);

  // ── 2. Robust Safety Fallback Timeouts ──
  // Ensures that even if a network query stalls indefinitely or fails, all milestones resolve smoothly
  useEffect(() => {
    const tConfig = setTimeout(() => reportMilestone('config'), 2600);
    const tProjects = setTimeout(() => reportMilestone('projects'), 3000);
    const tCerts = setTimeout(() => reportMilestone('certificates'), 3200);
    const tMaster = setTimeout(() => {
      reportMilestone('fonts');
      reportMilestone('config');
      reportMilestone('projects');
      reportMilestone('certificates');
    }, 3800);

    return () => {
      clearTimeout(tConfig);
      clearTimeout(tProjects);
      clearTimeout(tCerts);
      clearTimeout(tMaster);
    };
  }, [reportMilestone]);

  // ── 3. Smooth Non-Blocking 60 FPS Interpolation Loop ──
  useEffect(() => {
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = Math.min(32, now - lastTime) / 1000;
      lastTime = now;

      const target = rawTargetRef.current / 100;
      const current = displayProgressRef.current;

      // Adaptive lerp speed:
      // Smooth and readable when approaching milestones, brisk when wrapping up to 100%
      const speed = isAllLoadedRef.current ? 8.5 : 4.5;
      const diff = target - current;

      if (Math.abs(diff) > 0.001) {
        displayProgressRef.current += diff * Math.min(1, dt * speed);
      } else {
        displayProgressRef.current = target;
      }

      const curVal = displayProgressRef.current;
      const roundedPercent = Math.min(100, Math.round(curVal * 100));

      setLoadProgress(curVal);
      setDisplayPercent(roundedPercent);

      if (isAllLoadedRef.current && curVal >= 0.995) {
        setIsDataReady(true);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <DataLoaderContext.Provider
      value={{
        loadProgress,
        displayPercent,
        isDataReady,
        milestones,
        reportMilestone,
      }}
    >
      {children}
    </DataLoaderContext.Provider>
  );
}
