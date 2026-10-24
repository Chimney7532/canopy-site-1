"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

type Prepare = (url: URL, signal: AbortSignal) => Promise<() => void>;
type Position = { windowY: number; readingY: number };
const position = (): Position => ({ windowY: window.scrollY, readingY: document.getElementById("main-content")?.scrollTop || 0 });
const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

/** Keep the application and fonts mounted; only exchange the reading surface. */
export function usePageNavigation(initialPath: string, prepare: Prepare) {
  const [route, setRoute] = useState(initialPath);
  const prepareRef = useRef(prepare);
  prepareRef.current = prepare;

  useEffect(() => {
    setRoute(location.pathname + location.search);
    history.replaceState({ ...history.state, canopy: true }, "");
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let sequence = 0;
    let controller: AbortController | undefined;
    let clearLayers: (() => void) | undefined;
    let disposed = false;

    const navigate = async (url: URL, back = false, restore?: Position) => {
      const id = ++sequence;
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      clearLayers?.();
      window.dispatchEvent(new Event("canopy:navigation-start"));
      try {
        // Scope changes (public/member) are ready before the old page leaves.
        const [commit] = await Promise.all([prepareRef.current(url, signal), document.fonts.ready]);
        if (disposed || id !== sequence) return;
        const exchange = () => {
          if (disposed || id !== sequence) return;
          if (!back) {
            history.replaceState({ ...history.state, canopy: true, canopyScroll: position() }, "");
            history.pushState({ canopy: true }, "", url.pathname + url.search + url.hash);
          }
          // Commit route and prepared data before the next frame is captured.
          flushSync(() => { commit(); setRoute(url.pathname + url.search); });
          const main = document.getElementById("main-content");
          main?.setAttribute("tabindex", "-1");
          main?.focus({ preventScroll: true });
          window.scrollTo({ top: restore?.windowY || 0, behavior: "instant" });
          main?.scrollTo({ top: restore?.readingY || 0, behavior: "instant" });
        };
        const outgoing = document.querySelector<HTMLElement>(".publication-surface > .public-story, .publication-surface > .quiet-edition");
        if (!reduced.matches && outgoing) {
          // An inert visual copy keeps the navigation live during the overlap.
          const bounds = outgoing.getBoundingClientRect();
          const layer = document.createElement("div");
          layer.className = "page-departure " + (outgoing.closest(".publication")?.className || "");
          layer.inert = true;
          layer.setAttribute("aria-hidden", "true");
          const copy = outgoing.cloneNode(true) as HTMLElement;
          copy.style.cssText += `;position:absolute;left:${bounds.left}px;top:${bounds.top}px;width:${bounds.width}px;height:${bounds.height}px;margin:0;flex:none;`;
          layer.appendChild(copy);
          document.body.appendChild(layer);
          const sources = [outgoing, ...outgoing.querySelectorAll<HTMLElement>("*")];
          const copies = [copy, ...copy.querySelectorAll<HTMLElement>("*")];
          sources.forEach((source, index) => {
            copies[index].scrollTop = source.scrollTop;
            copies[index].scrollLeft = source.scrollLeft;
            copies[index].removeAttribute("id");
          });
          let arrival: Animation | undefined;
          let departure: Animation | undefined;
          let titleArrival: Animation | undefined;
          let incoming: HTMLElement | null = null;
          let cleaned = false;
          const cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            arrival?.cancel();
            departure?.cancel();
            titleArrival?.cancel();
            layer.remove();
            incoming?.classList.remove("page-arrival");
          };
          clearLayers = cleanup;
          exchange();
          incoming = document.querySelector<HTMLElement>(".publication-surface > .public-story, .publication-surface > .quiet-edition");
          incoming?.classList.add("page-arrival");
          document.documentElement.dataset.navigation = "crossfade";
          departure = copy.animate([
            { opacity: 1, transform: "translateY(0)" },
            { opacity: 0, transform: "translateY(-8px)" },
          ], { duration: 180, easing: "cubic-bezier(.4,0,1,1)", fill: "both" });
          arrival = incoming?.animate([
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ], { duration: 460, delay: 70, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" });
          const heading = incoming?.querySelector<HTMLElement>(".public-display-heading h1 .brand-word");
          titleArrival = heading?.animate([
            { transform: "translateY(28px)" },
            { transform: "translateY(0)" },
          ], { duration: 560, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" });
          await Promise.all([departure.finished.catch(() => {}), arrival?.finished.catch(() => {}), titleArrival?.finished.catch(() => {})]);
          cleanup();
        } else {
          exchange();
        }
        if (disposed || id !== sequence) return;
        clearLayers = undefined;
        delete document.documentElement.dataset.navigation;
        await nextFrame();
        if (disposed || id !== sequence) return;
        if (url.hash) document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
      } catch (error) {
        if (!signal.aborted && !disposed && id === sequence) {
          console.warn("Canopy navigation recovered with a document load:", error);
          location.assign(url.href);
        }
      }
    };

    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self") || link.dataset.documentNavigation !== undefined) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
      // Only application routes belong to this navigator; assets and APIs stay native.
      if (!/^\/(?:$|about(?:\/|$)|join(?:\/|$)|signin(?:\/|$)|contact(?:\/|$)|people(?:\/|$)|events(?:\/|$)|updates(?:\/|$)|explore(?:\/|$)|privacy(?:\/|$)|setup(?:\/|$)|community(?:\/|$)|preview(?:\/|$))/.test(url.pathname)) return;
      if (url.pathname + url.search === location.pathname + location.search) {
        if (!url.hash) event.preventDefault();
        return;
      }
      event.preventDefault();
      void navigate(url);
    };
    const pop = (event: PopStateEvent) => {
      if (!/^\/(?:$|about(?:\/|$)|join(?:\/|$)|signin(?:\/|$)|contact(?:\/|$)|people(?:\/|$)|events(?:\/|$)|updates(?:\/|$)|explore(?:\/|$)|privacy(?:\/|$)|setup(?:\/|$)|community(?:\/|$)|preview(?:\/|$))/.test(location.pathname)) return;
      // This app already contains every view; prevent an unnecessary RSC request.
      event.stopImmediatePropagation();
      void navigate(new URL(location.href), true, event.state?.canopyScroll);
    };
    document.addEventListener("click", click);
    window.addEventListener("popstate", pop, { capture: true });
    return () => {
      disposed = true;
      sequence++;
      controller?.abort();
      clearLayers?.();
      delete document.documentElement.dataset.navigation;
      history.scrollRestoration = previousRestoration;
      document.removeEventListener("click", click);
      window.removeEventListener("popstate", pop, { capture: true });
    };
  }, []);
  return route;
}
