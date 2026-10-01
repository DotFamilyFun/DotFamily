"use client";

import { useEffect } from "react";

/**
 * Every character's eyes follow the pointer. One listener writes two custom
 * properties on <html>; the eyes read them in CSS, so nothing re-renders.
 */
export function GazeTracker() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        document.documentElement.style.setProperty("--gx", x.toFixed(3));
        document.documentElement.style.setProperty("--gy", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return null;
}
