import { useState, useEffect } from 'react';

/**
 * useInputDevice — Hook detecting input modalities (touch vs pointer) and screen breakpoints.
 * Reactive to resize and capability changes (e.g. plugging in a mouse, tablet orientation change).
 */
export default function useInputDevice() {
  const [deviceInfo, setDeviceInfo] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        isTouch: false,
        hasHover: true,
        isFinePointer: true,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1200,
        height: 800,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasHover = window.matchMedia ? window.matchMedia('(hover: hover)').matches : true;
    const isFinePointer = window.matchMedia ? window.matchMedia('(pointer: fine)').matches : true;

    return {
      isTouch,
      hasHover,
      isFinePointer,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      width,
      height,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasHover = window.matchMedia ? window.matchMedia('(hover: hover)').matches : true;
      const isFinePointer = window.matchMedia ? window.matchMedia('(pointer: fine)').matches : true;

      setDeviceInfo({
        isTouch,
        hasHover,
        isFinePointer,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
      });
    };

    const hoverQuery = window.matchMedia ? window.matchMedia('(hover: hover)') : null;
    const pointerQuery = window.matchMedia ? window.matchMedia('(pointer: fine)') : null;

    window.addEventListener('resize', updateDeviceInfo, { passive: true });
    hoverQuery?.addEventListener?.('change', updateDeviceInfo);
    pointerQuery?.addEventListener?.('change', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      hoverQuery?.removeEventListener?.('change', updateDeviceInfo);
      pointerQuery?.removeEventListener?.('change', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}
