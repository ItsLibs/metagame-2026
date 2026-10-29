import type { Metadata } from "next";
import Link from "next/link";
import { Play } from "lucide-react";
import HowItPlayed from "@/v2/components/last-year/HowItPlayed";
import TriviaDeck from "@/v2/components/last-year/TriviaDeck";
import WhatWasOn from "@/v2/components/last-year/WhatWasOn";
import YearInNumbers from "@/v2/components/last-year/YearInNumbers";
import PageSection, { PAGE, type Section } from "@/v2/components/PageSection";
import LastYearSchedule from "@/v2/components/schedule/LastYearSchedule";
import { DISPLAY, SECTION_ANCHOR } from "@/v2/components/styles";
import { Button } from "@/v2/components/ui/button";
import { LAST_YEAR_SITE_URL } from "@/v2/lib/links";

export const metadata: Metadata = {
  title: "Last year — Metagame 2026",
  description:
    "What happened at Metagame 2025: how the megagame played, the weekend at any moment, the full schedule, and a round of trivia on the program.",
};

const SECTIONS = {
  played: {
    id: "how-it-played",
    title: "How it played",
    aka: "The 2025 megagame, in four steps",
  },
  moments: {
    id: "replay",
    title: "What was on, when",
    aka: "Pick any moment of the weekend",
  },
  schedule: {
    id: "schedule",
    title: "The full schedule",
    aka: "Every session, by day and venue",
  },
  trivia: {
    id: "trivia",
    title: "Trivia",
    aka: "Talk, workshop or game?",
  },
} satisfies Record<string, Section>;

const OUTLINE =
  "border-2 border-navy text-navy hover:border-navy hover:bg-navy/5";

// What happened last year: a cover with 2025 in numbers, how the megagame
// played, the weekend at any moment (the schedule's alternative view), the
// schedule grid, a round of trivia on the program, and a pointer at 2026.
export default function LastYearPage() {
  return (
    <>
      <section id="top" className={SECTION_ANCHOR}>
        <div
          className={`${PAGE} grid items-center gap-10 pt-24 pb-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 lg:pt-28`}
        >
          <div>
            <p className="font-space-mono text-xs font-bold tracking-[0.14em] text-meeple uppercase">
              What happened last year?
            </p>
            <h1
              className={`${DISPLAY} mt-3.5 text-[clamp(64px,9vw,128px)] leading-[0.86] text-navy`}
            >
              Metagame
              <br />
              2025<span className="text-meeple">.</span>
            </h1>
            <p className="mt-5 font-space-mono text-sm font-bold tracking-[0.12em] text-navy uppercase">
              Sep 12–14, 2025 · Lighthaven, Berkeley
            </p>
            <p className="mt-3 max-w-[34em] text-lg leading-relaxed text-ink/80 sm:text-xl">
              Three days of games, with one megagame running through all of it.
              Read how it played, see what was on at any moment of the weekend,
              then find out how well you know the program.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <a href={`#${SECTIONS.moments.id}`}>
                  <Play aria-hidden className="size-4" fill="currentColor" />
                  Play the weekend back
                </a>
              </Button>
              <Button asChild variant="ghost" className={OUTLINE}>
                <Link href="/#tickets">Get 2026 tickets</Link>
              </Button>
            </div>
          </div>
          <YearInNumbers />
        </div>
      </section>

      <PageSection section={SECTIONS.played}>
        <HowItPlayed />
      </PageSection>

      <PageSection section={SECTIONS.moments}>
        <WhatWasOn />
      </PageSection>

      <PageSection section={SECTIONS.schedule}>
        <LastYearSchedule />
      </PageSection>

      <PageSection section={SECTIONS.trivia}>
        <TriviaDeck />
      </PageSection>

      <section aria-labelledby="next-up" className={SECTION_ANCHOR}>
        <div className={`${PAGE} pb-20`}>
          <div className="grid gap-8 border-t-2 border-navy pt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <p className="font-space-mono text-xs font-bold tracking-[0.14em] text-meeple uppercase">
                Next up
              </p>
              <h2
                id="next-up"
                className={`${DISPLAY} mt-2 text-[clamp(44px,6vw,72px)] leading-[0.9] tracking-[0.01em] text-navy`}
              >
                Metagame 2026
              </h2>
              <p className="mt-3 font-space-mono text-sm font-bold tracking-[0.12em] text-navy uppercase">
                Nov 6–8, 2026 · Lighthaven, Berkeley
              </p>
              <p className="mt-3 max-w-[460px] text-ink/80">
                Three more days of games at Lighthaven, with a Megagame running
                through all of it.
              </p>
            </div>
            <div className="flex flex-col items-start gap-5">
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/#tickets">Get tickets</Link>
                </Button>
                <Button asChild variant="ghost" className={OUTLINE}>
                  <Link href="/">See what&apos;s on in 2026</Link>
                </Button>
              </div>
              <a
                href={LAST_YEAR_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-space-mono text-[12.5px] text-ink/65 underline underline-offset-4 hover:text-navy"
              >
                The 2025 site, archived: 2025.metagame.games ↗
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
