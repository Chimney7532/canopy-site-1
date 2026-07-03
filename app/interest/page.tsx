"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CanopyLogo } from "@/components/CanopyLogo";

const APPLY_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfY4vgWCwECx-PmGNYC0jJ-UZTDXMk_4AX2AS04W4KQCZn62A/viewform";
const EVENT_PAGE_URL = "https://luma.com/u8j9b0a6";
const CONTACT_EMAIL = "canyonli@iscanopy.com";

type Mode = "event" | "update";

const COPY = {
  applyCta: "Open Application",
  applyDescription: "For founders building physical-world AI systems.",
  applyEyebrow: "Primary action",
  applyTitle: "Apply to join the summit",
  back: "CANOPY",
  contactDescription: "Sponsors, partners, press, or event questions.",
  contactKicker: "Direct line",
  contactLabel: "Contact CANOPY",
  currentEvent: "Current Event",
  date: "July 26, 2026",
  eventDescription: "Open Luma for schedule, venue, and public updates.",
  eventKicker: "Public details",
  eventLabel: "View Event",
  soon: "Coming Soon",
  soonBody: "The next CANOPY update will appear here.",
  soonReturn: "Back to Current Event",
  summary: "A focused room for selected founders, investors, operators, and industry partners.",
  title: "Stanford Robotics x Physical AI Founder-Investor Summit",
  update: "2026 Update",
};

const panelTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function InterestPage() {
  const [mode, setMode] = useState<Mode>("event");
  const pageRef = useRef<HTMLElement>(null);
  const secondaryOptions = [
    {
      description: COPY.eventDescription,
      href: EVENT_PAGE_URL,
      kicker: COPY.eventKicker,
      label: COPY.eventLabel,
      target: "_blank",
    },
    {
      description: COPY.contactDescription,
      href: `mailto:${CONTACT_EMAIL}?subject=Stanford%20Robotics%20x%20Physical%20AI%20Summit`,
      kicker: COPY.contactKicker,
      label: COPY.contactLabel,
    },
  ];

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const resetScroll = () => {
      if (pageRef.current) {
        pageRef.current.scrollTop = 0;
      }
    };

    resetScroll();
    const frame = window.requestAnimationFrame(resetScroll);
    const timers = [120, 520, 900].map((delay) => window.setTimeout(resetScroll, delay));

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <main ref={pageRef} className="canopy-page-shell relative h-svh overflow-y-auto px-5 sm:px-8">
      <Link
        className="canopy-back-link fixed left-5 top-5 z-20 inline-flex min-h-9 items-center gap-2 px-3 py-2 text-[12px] font-semibold uppercase leading-none sm:left-8 sm:top-7"
        href="/"
      >
        <span aria-hidden="true">&lt;-</span>
        <span>{COPY.back}</span>
      </Link>

      <section className="mx-auto flex min-h-svh w-full max-w-[860px] flex-col items-center pb-16 pt-[10.5rem] sm:pt-[11.5svh]">
        <div className="mx-auto">
          <CanopyLogo className="w-[min(70vw,380px)] sm:w-[min(34vw,440px)]" />
        </div>

        <div className="mx-auto mt-9 max-w-[760px] text-center sm:mt-10">
          <div className="canopy-event-badge canopy-mode-switch mx-auto inline-flex items-stretch overflow-hidden">
            <button
              className={`canopy-mode-tab ${mode === "event" ? "is-active" : ""}`}
              onClick={() => setMode("event")}
              type="button"
            >
              {COPY.currentEvent}
            </button>
            <button
              className={`canopy-mode-tab ${mode === "update" ? "is-active" : ""}`}
              onClick={() => setMode("update")}
              type="button"
            >
              {COPY.update}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "event" ? (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                initial={{ opacity: 0, x: 16 }}
                key="event"
                transition={panelTransition}
              >
                <h1 className="canopy-copy canopy-copy-primary canopy-interest-heading canopy-text-reveal mx-auto mt-9 max-w-[660px] text-[21px] font-semibold leading-[1.24] sm:text-[28px]">
                  <span className="canopy-stanford">Stanford</span> {COPY.title.replace("Stanford ", "")}
                </h1>
                <p className="canopy-copy canopy-copy-secondary canopy-interest-date canopy-text-reveal mx-auto mt-5 text-[14px] leading-[1.8] sm:text-[16px]">
                  {COPY.date} at <span className="canopy-stanford">Stanford Faculty Club</span>.
                </p>
                <p className="canopy-copy canopy-copy-secondary canopy-interest-summary canopy-text-reveal mx-auto mt-4 max-w-[30rem] text-[15px] leading-[1.7] sm:text-[17px]">
                  {COPY.summary}
                </p>
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="mx-auto mt-10 max-w-[30rem] border-y border-current px-6 py-10"
                exit={{ opacity: 0, x: 16 }}
                initial={{ opacity: 0, x: -16 }}
                key="update"
                transition={panelTransition}
              >
                <p className="canopy-copy canopy-copy-primary canopy-text-reveal text-[24px] font-semibold leading-none sm:text-[30px]">
                  {COPY.soon}
                </p>
                <p className="canopy-copy canopy-copy-secondary canopy-text-reveal mx-auto mt-5 max-w-[22rem] text-[16px] leading-[1.7]">
                  {COPY.soonBody}
                </p>
                <button className="canopy-inline-action mt-7" onClick={() => setMode("event")} type="button">
                  {COPY.soonReturn} -&gt;
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {mode === "event" ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-14 flex w-full max-w-[760px] flex-col gap-6 sm:mt-16 sm:gap-7"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              key="options"
              transition={panelTransition}
            >
              <div className="canopy-action-card canopy-action-primary canopy-mobile-snap grid gap-8 px-6 py-7 text-left sm:grid-cols-[1fr_auto] sm:items-end sm:px-9 sm:py-8">
                <div>
                  <span className="canopy-action-kicker block text-[12px] font-bold uppercase leading-none">
                    {COPY.applyEyebrow}
                  </span>
                  <h2 className="canopy-action-title mt-5 max-w-[25rem] text-[30px] font-semibold leading-[1.05] sm:text-[42px]">
                    {COPY.applyTitle}
                  </h2>
                  <p className="canopy-action-description mt-5 max-w-[27rem] text-[16px] leading-[1.62] sm:text-[18px]">
                    {COPY.applyDescription}
                  </p>
                </div>
                <a
                  className="canopy-action-button inline-flex min-h-11 w-fit items-center justify-center gap-3 px-4 text-[12px] font-bold uppercase leading-none"
                  href={APPLY_FORM_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  {COPY.applyCta}
                  <span aria-hidden="true" className="canopy-apply-arrow text-[18px]">
                    -&gt;
                  </span>
                </a>
              </div>

              <div className="canopy-support-grid grid gap-4 sm:grid-cols-2 sm:gap-5">
                {secondaryOptions.map((option) => (
                  <a
                    className="canopy-action-card canopy-action-secondary canopy-mobile-snap group flex min-h-[148px] flex-col justify-between px-6 py-6 text-left outline-none sm:px-7 sm:py-7"
                    href={option.href}
                    key={option.label}
                    rel={option.target ? "noreferrer" : undefined}
                    target={option.target}
                  >
                    <span>
                      <span className="canopy-action-kicker block text-[11px] font-bold uppercase leading-none">
                        {option.kicker}
                      </span>
                      <span className="canopy-action-secondary-title mt-4 flex items-start justify-between gap-5 text-[22px] font-semibold leading-none sm:text-[24px]">
                        {option.label}
                        <span aria-hidden="true" className="canopy-option-arrow text-[22px] leading-none">
                          -&gt;
                        </span>
                      </span>
                    </span>
                    <span className="canopy-action-description mt-7 max-w-[19rem] text-[14px] leading-[1.58] sm:text-[15px]">
                      {option.description}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <footer className="canopy-footer px-4 pb-3 pt-12 text-center text-[11px] sm:pt-14">
          &copy; 2026 CANOPY
        </footer>
      </section>
    </main>
  );
}
