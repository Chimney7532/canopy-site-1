"use client";

import { useEffect, type RefObject } from "react";
import Lenis from "lenis";

/** One animation clock coordinates wheel smoothing and chapter ink. */
export function useChapterScroll(
  readingRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  revision = "",
) {
  useEffect(() => {
    const reading = readingRef.current;
    if (!enabled || !reading) return;
    const content = reading.querySelector<HTMLElement>(".reading-flow");
    const can = reading.parentElement?.querySelector<HTMLElement>(".chapter-can");
    if (!content || !can) return;
    const motion = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    const entries = [...reading.querySelectorAll<HTMLElement>(".feed-chapter")].map((chapter) => ({
      chapter,
      header: chapter.querySelector<HTMLElement>(".chapter-heading"),
      top: 0,
      height: 0,
      travel: 1,
      ink: "",
    }));
    let frame = 0;
    let disposed = false;
    let needsMeasure = true;
    let baseline = 0;
    let capHeight = 0;
    let scroller: Lenis | undefined;

    const measure = () => {
      const top = reading.getBoundingClientRect().top;
      const position = reading.scrollTop;
      baseline = can.getBoundingClientRect().top - top;
      capHeight = can.offsetHeight;
      for (const entry of entries) {
        entry.top = entry.chapter.getBoundingClientRect().top - top + position;
        entry.height = entry.chapter.offsetHeight;
        entry.travel = (entry.header?.offsetHeight ?? 0) + parseFloat(getComputedStyle(entry.chapter).paddingBottom);
      }
      scroller?.resize();
      needsMeasure = false;
    };
    const paint = (time: number) => {
      frame = 0;
      if (needsMeasure) measure();
      scroller?.raf(time);
      const position = reading.scrollTop;
      const last = entries.at(-1);
      if (last) {
        const end = last.top + last.height - position - baseline - capHeight;
        can.parentElement!.style.opacity = motion.matches ? String(Math.max(0, Math.min(1, end / 100))) : String(Number(end > 0));
      }
      entries.forEach((entry, index) => {
        if (!entry.header) return;
        const next = entries[index + 1];
        let ink = "";
        if (motion.matches && next && index > 0) {
          const distance = next.top - position - baseline;
          const progress = Math.max(0, Math.min(1, 1 - distance / entry.travel));
          ink = (1 - progress * progress * (3 - 2 * progress) * 0.85).toFixed(3);
        }
        // Most headings are outside the handoff: don't restyle them every frame.
        if (ink === entry.ink) return;
        entry.ink = ink;
        if (ink) entry.header.style.setProperty("--chapter-ink", ink);
        else entry.header.style.removeProperty("--chapter-ink");
      });
      if (scroller?.isScrolling === "smooth") schedule();
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(paint);
    };
    const invalidate = () => {
      needsMeasure = true;
      schedule();
    };
    const cancelTravel = () => {
      if (scroller?.isScrolling === "smooth") {
        scroller.scrollTo(scroller.actualScroll, { immediate: true });
      }
    };
    const configure = () => {
      scroller?.destroy();
      scroller = undefined;
      if (motion.matches) {
        scroller = new Lenis({
          wrapper: reading,
          content,
          autoRaf: false,
          autoResize: false,
          smoothWheel: true,
          syncTouch: false,
          lerp: 0.2,
          allowNestedScroll: true,
          stopInertiaOnNavigate: true,
          prevent: (node) => node.matches("input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='dialog'], [data-native-scroll]"),
          virtualScroll: ({ deltaY, deltaX, event }) => {
            if (event instanceof WheelEvent) {
              if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(deltaX) > Math.abs(deltaY)) return false;
              // Drop old-direction momentum, never the new gesture's distance.
              if (scroller && deltaY * scroller.velocity < 0) cancelTravel();
            }
            return true;
          },
        });
        scroller.on("virtual-scroll", () => {
          // Idle frames are suspended. Start a new gesture's clock before it animates.
          if (scroller?.isScrolling !== "smooth") scroller?.raf(performance.now());
          schedule();
        });
      }
      invalidate();
    };
    const onVisibility = () => {
      if (document.hidden) cancelTravel();
    };
    const resize = new ResizeObserver(invalidate);
    resize.observe(reading);
    resize.observe(content);
    entries.forEach(({ chapter }) => resize.observe(chapter));
    reading.addEventListener("scroll", schedule, { passive: true });
    reading.addEventListener("pointerdown", cancelTravel, { passive: true });
    reading.addEventListener("touchstart", cancelTravel, { passive: true });
    reading.addEventListener("keydown", cancelTravel);
    motion.addEventListener("change", configure);
    document.addEventListener("visibilitychange", onVisibility);
    void document.fonts.ready.then(invalidate);
    configure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      scroller?.destroy();
      resize.disconnect();
      reading.removeEventListener("scroll", schedule);
      reading.removeEventListener("pointerdown", cancelTravel);
      reading.removeEventListener("touchstart", cancelTravel);
      reading.removeEventListener("keydown", cancelTravel);
      motion.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", onVisibility);
      can.parentElement?.style.removeProperty("opacity");
      entries.forEach(({ header }) => header?.style.removeProperty("--chapter-ink"));
    };
  }, [enabled, readingRef, revision]);
}
