"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { CanopyLogo } from "@/components/CanopyLogo";

type Language = "en" | "zh";

const COPY = {
  en: {
    account: "Account",
    contact:
      "CANOPY helps emerging teams shape raw ideas into focused projects, while giving sponsors a first look at builders before their companies exist.",
    headlineAfter: "for the earliest stage of student ambition.",
    headlineBefore: "Built at",
    settings: "Settings",
    settingsSoon: "Settings panel coming soon.",
    update: "View Current Update",
  },
  zh: {
    account: "账户",
    contact: "CANOPY 帮助早期团队把原始想法推进成清晰项目，也让赞助方更早看到 builders 的潜力。",
    headlineAfter: "为最早期的学生野心而建。",
    headlineBefore: "诞生于",
    settings: "设置",
    settingsSoon: "设置面板即将开放。",
    update: "查看当前更新",
  },
};

const panelTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function CanopyHero() {
  const [language, setLanguage] = useState<Language>("en");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const copy = COPY[language];

  return (
    <main className="relative flex min-h-svh overflow-hidden bg-[#f4f1ea] px-4 sm:px-8">
      <div className="canopy-site-controls fixed right-5 top-5 z-20 flex items-center sm:right-8 sm:top-7">
        <button
          className="canopy-control-button"
          onClick={() => setLanguage((current) => (current === "en" ? "zh" : "en"))}
          type="button"
        >
          {language === "en" ? "中文" : "EN"}
        </button>
        <Link className="canopy-control-button" href="/register?mode=register">
          {copy.account}
        </Link>
        <button
          aria-expanded={settingsOpen}
          className="canopy-control-button"
          onClick={() => setSettingsOpen((open) => !open)}
          type="button"
        >
          {copy.settings}
        </button>
      </div>

      <AnimatePresence>
        {settingsOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="canopy-settings-popover fixed right-5 top-[4.25rem] z-30 max-w-[14rem] border border-current bg-[var(--canopy-surface)] px-4 py-3 text-[12px] leading-[1.6] sm:right-8 sm:top-[4.75rem]"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: -6 }}
            transition={panelTransition}
          >
            {copy.settingsSoon}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section className="mx-auto flex w-full flex-col items-center pt-[17svh] text-center sm:pt-[15svh]">
        <CanopyLogo>
          <div className="canopy-intro mt-10 max-w-[40rem] text-center sm:mt-11">
            <p className="canopy-copy canopy-copy-primary canopy-text-reveal text-balance text-[17px] font-medium leading-[1.62] sm:text-[20px]">
              {copy.headlineBefore} <span className="canopy-stanford">Stanford</span> {copy.headlineAfter}
            </p>
            <p className="canopy-copy canopy-copy-secondary canopy-text-reveal mx-auto mt-4 max-w-[34rem] text-balance text-[14px] leading-[1.9] sm:text-[16px]">
              {copy.contact}
            </p>
          </div>
          <Link
            className="canopy-cta mt-8 inline-flex min-h-11 items-center gap-3 px-5 py-3 text-[13px] font-bold uppercase leading-none outline-none sm:text-[14px]"
            href="/interest"
          >
            <span>{copy.update}</span>
            <span aria-hidden="true" className="canopy-cta-mark">
              -&gt;
            </span>
          </Link>
        </CanopyLogo>
      </section>
      <footer className="canopy-footer fixed bottom-7 left-0 w-full px-4 text-center text-[11px]">
        &copy; 2026 CANOPY
      </footer>
    </main>
  );
}
