"use client";

import Link from "next/link";
import { CanopyLogo } from "@/components/CanopyLogo";

const COPY = {
  contact:
    "CANOPY helps emerging teams shape raw ideas into focused projects, while giving sponsors a first look at builders before their companies exist.",
  headlineAfter: "for the earliest stage of student ambition.",
  headlineBefore: "Built at",
  update: "View Current Update",
};

export function CanopyHero() {
  return (
    <main className="relative flex min-h-svh overflow-hidden bg-[#f4f1ea] px-4 sm:px-8">
      <section className="mx-auto flex w-full flex-col items-center pt-[19svh] text-center sm:pt-[17svh]">
        <CanopyLogo className="w-[min(76vw,500px)] sm:w-[min(40vw,560px)]">
          <div className="canopy-intro mt-12 max-w-[40rem] text-center sm:mt-14">
            <p className="canopy-copy canopy-copy-primary canopy-text-reveal text-balance text-[17px] font-medium leading-[1.62] sm:text-[20px]">
              {COPY.headlineBefore} <span className="canopy-stanford">Stanford</span> {COPY.headlineAfter}
            </p>
            <p className="canopy-copy canopy-copy-secondary canopy-text-reveal mx-auto mt-6 max-w-[34rem] text-balance text-[14px] leading-[1.95] sm:text-[16px]">
              {COPY.contact}
            </p>
          </div>
          <Link
            className="canopy-cta mt-10 inline-flex min-h-11 items-center gap-3 px-5 py-3 text-[13px] font-bold uppercase leading-none outline-none sm:mt-11 sm:text-[14px]"
            href="/interest"
          >
            <span>{COPY.update}</span>
            <span aria-hidden="true" className="canopy-cta-mark">
              -&gt;
            </span>
          </Link>
        </CanopyLogo>
      </section>
      <footer className="canopy-footer fixed bottom-8 left-0 w-full px-4 text-center text-[11px]">
        &copy; 2026 CANOPY
      </footer>
    </main>
  );
}
