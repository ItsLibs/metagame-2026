import type { Metadata } from "next";
import Link from "next/link";
import LastYearViews from "@/v2/components/last-year/LastYearViews";
import { DISPLAY } from "@/v2/components/styles";
import { Button } from "@/v2/components/ui/button";
import { LAST_YEAR_SITE_URL } from "@/v2/lib/links";

export const metadata: Metadata = {
  title: "Last year — Metagame 2026",
  description:
    "What was on at Metagame 2025: see any moment of the weekend, or browse the full schedule.",
};

const PAGE = "mx-auto w-full max-w-[1192px] px-4 sm:px-8";

// Last year's program: a short blurb, then the weekend at any moment (with
// the full schedule grid a toggle away), and two links out.
export default function LastYearPage() {
  return (
    <div className={`${PAGE} pt-24 pb-20 lg:pt-28`}>
      <header className="max-w-[40em]">
        <p className="font-space-mono text-xs font-bold tracking-[0.14em] text-meeple uppercase">
          What happened last year?
        </p>
        <h1
          className={`${DISPLAY} mt-3.5 text-[clamp(56px,8vw,112px)] leading-[0.86] text-navy`}
        >
          Metagame 2025<span className="text-meeple">.</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink/80 sm:text-xl">
          Three days of talks, workshops and games at Lighthaven, with one
          megagame running through all of it. Pick any moment of the weekend to
          see what was on, or browse the full schedule.
        </p>
      </header>

      <div className="mt-10 border-t-2 border-navy pt-8">
        <LastYearViews />
      </div>

      <div className="mt-16 flex flex-wrap gap-3 border-t-2 border-navy pt-10">
        <Button asChild>
          <Link href="/">Back to Metagame 2026</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="border-2 border-navy text-navy hover:border-navy hover:bg-navy/5"
        >
          <a
            href={LAST_YEAR_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            The 2025 site <span aria-hidden="true">&#8599;</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
