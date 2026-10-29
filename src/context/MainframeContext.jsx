import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const MainframeContext = createContext({
  isAccessingMainframe: false,
  mainframeProgress: 0,
  isReturning: false,
  returnProgress: 0,
  triggerMainframeAccess: () => {},
  triggerReturnToPortfolio: () => {},
});

export const useMainframe = () => useContext(MainframeContext);

export function MainframeProvider({ children }) {
  const [isAccessingMainframe, setIsAccessingMainframe] = useState(false);
  const [mainframeProgress, setMainframeProgress] = useState(0);
  const [isReturning, setIsReturning] = useState(false);
  const [returnProgress, setReturnProgress] = useState(0);

  const animFrameRef = useRef(null);
  const navigate = useNavigate();

  // Trigger: Public Portfolio -> Admin (Moon rotates to Dark Side Logic Core)
  const triggerMainframeAccess = useCallback(() => {
    if (isAccessingMainframe || isReturning) return;
    setIsAccessingMainframe(true);
    setMainframeProgress(0);

    const DURATION = 1600; // ms
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / DURATION));
      setMainframeProgress(progress);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Complete transition: navigate to /admin
        navigate('/admin');
        setTimeout(() => {
          setIsAccessingMainframe(false);
          setMainframeProgress(0);
        }, 350);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [isAccessingMainframe, isReturning, navigate]);

  // Trigger: Admin -> Public Portfolio (Moon rotates back to Light Side)
  const triggerReturnToPortfolio = useCallback(() => {
    if (isAccessingMainframe || isReturning) return;
    setIsReturning(true);
    setReturnProgress(0);

    const DURATION = 1200; // ms
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, Math.max(0, elapsed / DURATION));
      setReturnProgress(progress);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Complete return: navigate to /
        navigate('/');
        setTimeout(() => {
          setIsReturning(false);
          setReturnProgress(0);
        }, 200);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [isAccessingMainframe, isReturning, navigate]);

  return (
    <MainframeContext.Provider
      value={{
        isAccessingMainframe,
        mainframeProgress,
        isReturning,
        returnProgress,
        triggerMainframeAccess,
        triggerReturnToPortfolio,
      }}
    >
      {children}
    </MainframeContext.Provider>
  );
}

export default MainframeContext;
