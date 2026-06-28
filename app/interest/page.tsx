"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { CanopyLogo } from "@/components/CanopyLogo";

const APPLY_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfY4vgWCwECx-PmGNYC0jJ-UZTDXMk_4AX2AS04W4KQCZn62A/viewform";
const EVENT_PAGE_URL = "https://luma.com/u8j9b0a6";
const CONTACT_EMAIL = "canyonli@iscanopy.com";

type Language = "en" | "zh";
type Mode = "event" | "update";

const COPY = {
  en: {
    account: "Account",
    applyDescription:
      "Apply to be considered for pitch opportunities, investor exposure, 1:1 meetings, and follow-up.",
    applyLabel: "Apply",
    back: "CANOPY",
    contactDescription: "Email CANOPY about sponsors, partners, press, or event questions.",
    contactLabel: "Contact",
    currentEvent: "Current Event",
    date: "July 26, 2026 at",
    eventDescription: "View the summit details, date, venue, and public event information on Luma.",
    eventLabel: "Event Page",
    settings: "Settings",
    settingsSoon: "Settings panel coming soon.",
    soon: "Coming Soon",
    soonBody: "The next CANOPY update will appear here.",
    soonReturn: "Back to Current Event",
    summary:
      "A closed-door founder-investor summit for robotics, Physical AI, and real-world intelligence.",
    title: "x Physical AI Founder-Investor Summit",
    update: "2026 Update",
  },
  zh: {
    account: "账户",
    applyDescription: "申请获得 pitch 机会、投资人曝光、1:1 会议和后续跟进。",
    applyLabel: "申请",
    back: "CANOPY",
    contactDescription: "赞助、合作、媒体或活动问题，请联系 CANOPY。",
    contactLabel: "联系",
    currentEvent: "当前活动",
    date: "2026 年 7 月 26 日，地点",
    eventDescription: "查看活动时间、地点和公开信息。",
    eventLabel: "活动页面",
    settings: "设置",
    settingsSoon: "设置面板即将开放。",
    soon: "敬请期待",
    soonBody: "下一条 CANOPY 更新会出现在这里。",
    soonReturn: "返回当前活动",
    summary: "一个面向机器人、Physical AI 和真实世界智能的闭门创始人投资人峰会。",
    title: "x Physical AI 创始人投资人峰会",
    update: "2026 更新",
  },
};

const panelTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function InterestPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [mode, setMode] = useState<Mode>("event");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const copy = COPY[language];
  const options = [
    {
      description: copy.applyDescription,
      href: APPLY_FORM_URL,
      label: copy.applyLabel,
      target: "_blank",
    },
    {
      description: copy.eventDescription,
      href: EVENT_PAGE_URL,
      label: copy.eventLabel,
      target: "_blank",
    },
    {
      description: copy.contactDescription,
      href: `mailto:${CONTACT_EMAIL}?subject=Stanford%20Robotics%20x%20Physical%20AI%20Summit`,
      label: copy.contactLabel,
    },
  ];

  return (
    <main className="canopy-page-shell relative h-svh overflow-y-auto px-5 sm:px-8">
      <Link
        className="canopy-back-link fixed left-5 top-5 z-20 inline-flex min-h-9 items-center gap-2 px-3 py-2 text-[12px] font-semibold uppercase leading-none sm:left-8 sm:top-7"
        href="/"
      >
        <span aria-hidden="true">&lt;-</span>
        <span>{copy.back}</span>
      </Link>

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

      <section className="mx-auto flex min-h-svh w-full max-w-[920px] flex-col items-center gap-7 pb-14 pt-36 sm:gap-8 sm:pt-[13svh]">
        <div className="mx-auto">
          <CanopyLogo className="w-[min(62vw,340px)] sm:w-[min(29vw,390px)]" />
        </div>

        <div className="mx-auto max-w-[760px] text-center">
          <div className="canopy-event-badge mx-auto inline-flex items-stretch overflow-hidden">
            <button
              className={`canopy-mode-tab ${mode === "event" ? "is-active" : ""}`}
              onClick={() => setMode("event")}
              type="button"
            >
              {copy.currentEvent}
            </button>
            <button
              className={`canopy-mode-tab ${mode === "update" ? "is-active" : ""}`}
              onClick={() => setMode("update")}
              type="button"
            >
              {copy.update}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "event" ? (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                initial={{ opacity: 0, x: 16 }}
                key={`event-${language}`}
                transition={panelTransition}
              >
                <h1 className="canopy-copy canopy-copy-primary canopy-interest-heading canopy-text-reveal mt-4 text-[18px] font-semibold leading-[1.45] sm:text-[22px]">
                  <span className="canopy-stanford">Stanford Robotics</span> {copy.title}
                </h1>
                <p className="canopy-copy canopy-copy-secondary canopy-interest-date canopy-text-reveal mx-auto mt-3 text-[13px] leading-[1.75] sm:max-w-[520px] sm:text-[15px]">
                  {copy.date} <span className="canopy-stanford">Stanford Faculty Club</span>.
                </p>
                <p className="canopy-copy canopy-copy-secondary canopy-interest-summary canopy-text-reveal mx-auto mt-3 max-w-[21rem] text-[13px] leading-[1.75] sm:max-w-[560px] sm:text-[14px]">
                  {copy.summary}
                </p>
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="mx-auto mt-5 max-w-[30rem] border-y border-current px-6 py-8"
                exit={{ opacity: 0, x: 16 }}
                initial={{ opacity: 0, x: -16 }}
                key={`update-${language}`}
                transition={panelTransition}
              >
                <p className="canopy-copy canopy-copy-primary canopy-text-reveal text-[22px] font-semibold leading-none sm:text-[28px]">
                  {copy.soon}
                </p>
                <p className="canopy-copy canopy-copy-secondary canopy-text-reveal mx-auto mt-5 max-w-[22rem] text-[14px] leading-[1.75]">
                  {copy.soonBody}
                </p>
                <button
                  className="canopy-inline-action mt-6"
                  onClick={() => setMode("event")}
                  type="button"
                >
                  {copy.soonReturn} -&gt;
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {mode === "event" ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="canopy-options-grid mx-auto grid w-full max-w-[24rem] sm:max-w-[860px] sm:grid-cols-3"
              exit={{ opacity: 0, y: 10 }}
              initial={{ opacity: 0, y: 10 }}
              key={`options-${language}`}
              transition={panelTransition}
            >
              {options.map((option) => (
                <a
                  className="canopy-option group flex min-h-[118px] flex-col justify-between px-5 py-5 text-left outline-none sm:min-h-[164px] sm:px-6 sm:py-6"
                  href={option.href}
                  key={option.label}
                  rel={option.target ? "noreferrer" : undefined}
                  target={option.target}
                >
                  <span className="canopy-text-reveal flex items-start justify-between gap-8 text-[24px] font-semibold leading-none sm:gap-6 sm:text-[25px]">
                    {option.label}
                    <span aria-hidden="true" className="canopy-option-arrow text-[21px] leading-none sm:text-[23px]">
                      -&gt;
                    </span>
                  </span>
                  <span className="canopy-option-description canopy-text-reveal mt-6 max-w-[22rem] text-[14px] leading-[1.65] sm:mt-8 sm:max-w-[17rem]">
                    {option.description}
                  </span>
                </a>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <footer className="canopy-footer px-4 pb-3 pt-3 text-center text-[11px]">
          &copy; 2026 CANOPY
        </footer>
      </section>
    </main>
  );
}
