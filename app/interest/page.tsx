import { CanopyLogo } from "@/components/CanopyLogo";

const OPTIONS = [
  {
    description: "Send a note about sponsorships, partnerships, or speaking with the CANOPY team.",
    href: "mailto:hello@canopy.co?subject=Contact%20CANOPY",
    label: "Contact",
  },
  {
    description: "Share your project or team for early access to the CANOPY circle.",
    href: "mailto:hello@canopy.co?subject=Express%20Interest%20in%20CANOPY",
    label: "Interest",
  },
];

export default function InterestPage() {
  return (
    <main className="relative flex min-h-svh overflow-hidden px-5 sm:px-8">
      <section className="mx-auto grid w-full max-w-[980px] content-center gap-10 pt-[2svh] sm:gap-12">
        <div className="mx-auto">
          <CanopyLogo className="w-[min(60vw,390px)] sm:w-[min(34vw,460px)]" />
        </div>

        <div className="mx-auto max-w-[640px] text-center">
          <p className="canopy-copy canopy-copy-primary text-balance text-[18px] font-semibold leading-[1.5] sm:text-[22px]">
            Choose the way you want to enter CANOPY.
          </p>
          <p className="canopy-copy canopy-copy-secondary mx-auto mt-4 max-w-[520px] text-balance text-[14px] leading-[1.75] sm:text-[15px]">
            Sponsors, collaborators, and early student teams can start from the same quiet door.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-[900px] border-y border-current sm:grid-cols-2">
          {OPTIONS.map((option) => (
            <a
              className="canopy-option group flex min-h-[150px] flex-col justify-between border-b border-current px-5 py-5 text-left outline-none last:border-b-0 sm:min-h-[188px] sm:border-r sm:border-b-0 sm:px-7 sm:py-7 sm:last:border-r-0"
              href={option.href}
              key={option.label}
            >
              <span className="flex items-start justify-between gap-8 text-[25px] font-semibold leading-none sm:text-[30px]">
                {option.label}
                <span
                  aria-hidden="true"
                  className="canopy-option-arrow text-[22px] leading-none sm:text-[27px]"
                >
                  -&gt;
                </span>
              </span>
              <span className="canopy-option-description mt-8 max-w-[25rem] text-[15px] leading-[1.65] sm:text-[17px]">
                {option.description}
              </span>
            </a>
          ))}
        </div>
      </section>
      <footer className="canopy-footer fixed bottom-7 left-0 w-full px-4 text-center text-[11px]">
        &copy; 2026 CANOPY
      </footer>
    </main>
  );
}
