import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";
import HeroComponent from "./HeroComponent";
import {
  HERO_AUTOPLAY_MS,
  HERO_SLIDES,
  HERO_SWIPE_THRESHOLD,
} from "./constants";

function HeroContainer() {
  const total = HERO_SLIDES.length;
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
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
    if (!playing || total < 2) return;
    const timer = window.setTimeout(next, HERO_AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [current, playing, total, next]);

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
      playing={playing}
      autoplayMs={HERO_AUTOPLAY_MS}
      onPrev={prev}
      onNext={next}
      onGoTo={goTo}
      onTogglePlay={() => setPlaying((p) => !p)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  );
}

export default HeroContainer;
