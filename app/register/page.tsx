"use client";

import Link from "next/link";
import { useState } from "react";
import { CanopyLogo } from "@/components/CanopyLogo";

type Mode = "login" | "register";

export default function RegisterPage() {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") {
      return "register";
    }

    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "login" || requestedMode === "register") {
      return requestedMode;
    }

    return "register";
  });

  return (
    <main className="canopy-page-shell relative flex min-h-svh overflow-y-auto px-5 sm:px-8">
      <Link
        className="canopy-back-link fixed left-5 top-5 z-20 inline-flex min-h-9 items-center gap-2 px-3 py-2 text-[12px] font-semibold uppercase leading-none sm:left-8 sm:top-7"
        href="/interest"
      >
        <span aria-hidden="true">&lt;-</span>
        <span>BACK</span>
      </Link>

      <section className="mx-auto flex w-full max-w-[560px] flex-col items-center justify-center py-16 text-center">
        <CanopyLogo className="w-[min(58vw,300px)] sm:w-[min(28vw,360px)]" />

        <div className="canopy-auth-panel mt-10 w-full border-y border-current px-0 py-8 text-left">
          <div className="canopy-event-badge mx-auto flex w-fit items-stretch overflow-hidden">
            <button
              className={`canopy-mode-tab ${mode === "login" ? "is-active" : ""}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`canopy-mode-tab ${mode === "register" ? "is-active" : ""}`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>

          <div className="mx-auto mt-8 grid max-w-[24rem] gap-4">
            <div className="canopy-field">
              <label htmlFor="canopy-email">Email</label>
              <input id="canopy-email" placeholder="you@company.com" type="email" />
            </div>
            {mode === "register" ? (
              <div className="canopy-field">
                <label htmlFor="canopy-name">Name</label>
                <input id="canopy-name" placeholder="Your name" type="text" />
              </div>
            ) : null}
            <div className="canopy-field">
              <label htmlFor="canopy-password">Password</label>
              <input id="canopy-password" placeholder="password" type="password" />
            </div>

            <button className="canopy-cta mt-2 inline-flex min-h-11 items-center justify-center gap-3 px-5 py-3 text-[13px] font-bold uppercase leading-none outline-none" type="button">
              <span>{mode === "login" ? "Enter CANOPY" : "Create Account"}</span>
              <span aria-hidden="true" className="canopy-cta-mark">
                -&gt;
              </span>
            </button>
            <p className="canopy-copy canopy-copy-secondary text-center text-[12px] leading-[1.7]">
              Interface preview only. Account storage is not connected yet.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
