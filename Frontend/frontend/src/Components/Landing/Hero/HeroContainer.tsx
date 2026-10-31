import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import HeroComponent from "./HeroComponent";
import {
  HERO_AUTOPLAY_MS,
  HERO_SLIDES,
  HERO_SWIPE_THRESHOLD,
} from "./constants";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function HeroContainer() {
  const total = HERO_SLIDES.length;
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => setCurrent(((index % total) + total) % total),
    [total],
  );
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + total) % total),
    [total],
  );

  // One timer per slide: changing slide (auto or manual) restarts the countdown.
  useEffect(() => {
    if (!playing || hovered || total < 2) return;
    const timer = window.setTimeout(next, HERO_AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [current, playing, hovered, total, next]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < HERO_SWIPE_THRESHOLD) return;
    if (delta < 0) {
      next();
    } else {
      prev();
    }
  };

  return (
    <HeroComponent
      slides={HERO_SLIDES}
      current={current}
      playing={playing && !hovered}
      autoplayMs={HERO_AUTOPLAY_MS}
      onPrev={prev}
      onNext={next}
      onGoTo={goTo}
      onTogglePlay={() => setPlaying((p) => !p)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
}

export default HeroContainer;
