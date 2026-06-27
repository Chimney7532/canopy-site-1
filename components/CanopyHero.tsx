import Link from "next/link";
import { CanopyLogo } from "@/components/CanopyLogo";

export function CanopyHero() {
  return (
    <main className="relative flex min-h-svh overflow-hidden bg-[#f4f1ea] px-4 sm:px-8">
      <section className="mx-auto flex w-full flex-col items-center pt-[17svh] text-center sm:pt-[15svh]">
        <CanopyLogo>
          <div className="canopy-intro mt-10 max-w-[40rem] text-center sm:mt-11">
            <p className="canopy-copy canopy-copy-primary text-balance text-[17px] font-medium leading-[1.62] sm:text-[20px]">
              Built at <span className="canopy-stanford">Stanford</span> for the earliest stage of student ambition.
            </p>
            <p className="canopy-copy canopy-copy-secondary mx-auto mt-4 max-w-[34rem] text-balance text-[14px] leading-[1.9] sm:text-[16px]">
              CANOPY helps emerging teams shape raw ideas into focused projects, while giving sponsors a first look at builders before their companies exist.
            </p>
          </div>
          <Link
            className="canopy-cta mt-8 inline-flex min-h-11 items-center gap-3 px-5 py-3 text-[13px] font-bold uppercase leading-none outline-none sm:text-[14px]"
            href="/interest"
          >
            <span>View Current Update</span>
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
