import Link from "next/link";
import { CanopyLogo } from "@/components/CanopyLogo";

const APPLY_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfY4vgWCwECx-PmGNYC0jJ-UZTDXMk_4AX2AS04W4KQCZn62A/viewform";
const EVENT_PAGE_URL = "https://luma.com/u8j9b0a6";
const CONTACT_EMAIL = "canyonli@iscanopy.com";

const OPTIONS = [
  {
    description: "Apply to be considered for pitch opportunities, investor exposure, 1:1 meetings, and follow-up.",
    href: APPLY_FORM_URL,
    label: "Apply",
    target: "_blank",
  },
  {
    description: "View the summit details, date, venue, and public event information on Luma.",
    href: EVENT_PAGE_URL,
    label: "Event Page",
    target: "_blank",
  },
  {
    description: "Email CANOPY about sponsors, partners, press, or event questions.",
    href: `mailto:${CONTACT_EMAIL}?subject=Stanford%20Robotics%20x%20Physical%20AI%20Summit`,
    label: "Contact",
  },
];

export default function InterestPage() {
  return (
    <main className="canopy-page-shell relative h-svh overflow-y-auto px-5 sm:px-8">
      <Link
        className="canopy-back-link fixed left-5 top-5 z-10 inline-flex min-h-9 items-center gap-2 px-3 py-2 text-[12px] font-semibold uppercase leading-none sm:left-8 sm:top-7"
        href="/"
      >
        <span aria-hidden="true">&lt;-</span>
        <span>CANOPY</span>
      </Link>
      <section className="mx-auto flex min-h-svh w-full max-w-[920px] flex-col justify-center gap-7 py-14 sm:gap-8 sm:py-10">
        <div className="mx-auto">
          <CanopyLogo className="w-[min(62vw,340px)] sm:w-[min(29vw,390px)]" />
        </div>

        <div className="sm:hidden">
          <div className="mx-auto max-w-[24rem] text-center">
            <div className="canopy-event-badge mx-auto inline-flex items-stretch overflow-hidden">
              <span className="canopy-event-kicker px-5 py-2.5 text-[12px] font-bold uppercase leading-none">
                Current Event
              </span>
              <span className="px-5 py-2.5 text-[12px] font-bold uppercase leading-none">
                2026 Update
              </span>
            </div>
            <h1 className="canopy-copy canopy-copy-primary mt-4 text-[18px] font-semibold leading-[1.45]">
              <span className="canopy-stanford">Stanford Robotics</span> x Physical AI Founder-Investor Summit
            </h1>
            <p className="canopy-copy canopy-copy-secondary mx-auto mt-3 text-[13px] leading-[1.75]">
              July 26, 2026 at <span className="canopy-stanford">Stanford Faculty Club</span>.
            </p>
            <p className="canopy-copy canopy-copy-secondary mx-auto mt-3 max-w-[21rem] text-[13px] leading-[1.75]">
              A closed-door founder-investor summit for robotics, Physical AI, and real-world intelligence.
            </p>
          </div>

          <div className="mx-auto mt-8 grid w-full max-w-[24rem] border-y border-current">
            {OPTIONS.map((option) => (
              <a
                className="canopy-option group flex min-h-[118px] flex-col justify-between border-b border-current px-5 py-5 text-left outline-none last:border-b-0"
                href={option.href}
                key={option.label}
                rel={option.target ? "noreferrer" : undefined}
                target={option.target}
              >
                <span className="flex items-start justify-between gap-8 text-[24px] font-semibold leading-none">
                  {option.label}
                  <span aria-hidden="true" className="canopy-option-arrow text-[21px] leading-none">
                    -&gt;
                  </span>
                </span>
                <span className="canopy-option-description mt-6 max-w-[22rem] text-[14px] leading-[1.65]">
                  {option.description}
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="mx-auto max-w-[760px] text-center">
            <div className="canopy-event-badge mx-auto inline-flex items-stretch overflow-hidden">
              <span className="canopy-event-kicker px-6 py-2.5 text-[14px] font-bold uppercase leading-none">
                Current Event
              </span>
              <span className="px-6 py-2.5 text-[14px] font-bold uppercase leading-none">
                2026 Update
              </span>
            </div>
            <h1 className="canopy-copy canopy-copy-primary mt-4 text-[22px] font-semibold leading-[1.45]">
              <span className="canopy-stanford">Stanford Robotics</span> x Physical AI Founder-Investor Summit
            </h1>
            <p className="canopy-copy canopy-copy-secondary mx-auto mt-3 max-w-[520px] text-[15px] leading-[1.75]">
              July 26, 2026 at <span className="canopy-stanford">Stanford Faculty Club</span>.
            </p>
            <p className="canopy-copy canopy-copy-secondary mx-auto mt-3 max-w-[560px] text-[14px] leading-[1.75]">
              A closed-door founder-investor summit for robotics, Physical AI, and real-world intelligence.
            </p>
          </div>

          <div className="mx-auto mt-8 grid w-full max-w-[860px] grid-cols-3 border-y border-current">
            {OPTIONS.map((option) => (
              <a
                className="canopy-option group flex min-h-[164px] flex-col justify-between border-r border-current px-6 py-6 text-left outline-none last:border-r-0"
                href={option.href}
                key={option.label}
                rel={option.target ? "noreferrer" : undefined}
                target={option.target}
              >
                <span className="flex items-start justify-between gap-6 text-[25px] font-semibold leading-none">
                  {option.label}
                  <span aria-hidden="true" className="canopy-option-arrow text-[23px] leading-none">
                    -&gt;
                  </span>
                </span>
                <span className="canopy-option-description mt-8 max-w-[17rem] text-[14px] leading-[1.65]">
                  {option.description}
                </span>
              </a>
            ))}
          </div>
        </div>

        <footer className="canopy-footer px-4 pb-3 pt-3 text-center text-[11px]">
          &copy; 2026 CANOPY
        </footer>
      </section>
    </main>
  );
}
