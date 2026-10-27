/**
 * Reusable carousel hooks for the homepage.
 * Extracted to keep page components focused on rendering.
 */

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Index-based crossfade carousel hook.
 * Cycles through `total` slides on a timer with manual prev/next/go controls.
 */
export function useCarousel(total: number, interval = 5000) {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      () => setIdx((i) => (i + 1) % total),
      interval,
    );
  }, [total, interval]);

  useEffect(() => {
    reset();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reset]);

  const next = () => {
    setIdx((i) => (i + 1) % total);
    reset();
  };
  const prev = () => {
    setIdx((i) => (i - 1 + total) % total);
    reset();
  };
  const go = (n: number) => {
    setIdx(n);
    reset();
  };

  return { idx, next, prev, go };
}

/**
 * Continuous horizontal scroll carousel hook.
 * Pauses on hover/touch for manual browsing.
 */
export function useScrollCarousel(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  speed = 1,
) {
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let paused = false;

    const scroll = () => {
      if (!paused && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(scroll);
    };
    animId = requestAnimationFrame(scroll);

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause);
    el.addEventListener("touchend", resume);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, [scrollRef, speed]);
}
