import { useEffect, useRef } from "react";

// Subtle 3D tilt for cards while the pointer moves over them (event delegation: one listener per grid).
// Skipped on touch devices and when the person asked for reduced motion.
export default function useTilt<T extends HTMLElement>(selector: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let active: HTMLElement | null = null;

    const clear = () => {
      cancelAnimationFrame(raf);
      if (!active) return;
      active.style.removeProperty("--tilt-x");
      active.style.removeProperty("--tilt-y");
      active.removeAttribute("data-tilt");
      active = null;
    };

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(selector);
      if (!card || !root.contains(card)) return clear();
      if (active && active !== card) clear();
      active = card;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--tilt-x", `${(-y * 9).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * 11).toFixed(2)}deg`);
        card.setAttribute("data-tilt", "on");
      });
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", clear);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", clear);
      clear();
    };
  }, [selector]);

  return ref;
}
