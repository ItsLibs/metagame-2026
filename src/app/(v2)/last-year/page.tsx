import type { Metadata } from "next";
import Link from "next/link";
import { Play } from "lucide-react";
import HowItPlayed from "@/v2/components/last-year/HowItPlayed";
import TriviaDeck from "@/v2/components/last-year/TriviaDeck";
import WeekendReplay from "@/v2/components/last-year/WeekendReplay";
import YearInNumbers from "@/v2/components/last-year/YearInNumbers";
import PageSection, { PAGE } from "@/v2/components/PageSection";
import { DISPLAY, KICKER, SECTION_ANCHOR } from "@/v2/components/styles";
import { Button } from "@/v2/components/ui/button";
import { LAST_YEAR_SECTIONS } from "@/v2/data/sections";
import { LAST_YEAR_SITE_URL } from "@/v2/lib/links";

export const metadata: Metadata = {
  title: "Last year — Metagame 2026",
  description:
    "What happened at Metagame 2025: how the megagame played, a replay of the weekend, and a trivia round on the program.",
};

// What happened last year: an opener with 2025 in numbers, three sections
// (how the megagame played, the weekend on a clock, a trivia round on the
// program) and a closing pointer at 2026.
export default function LastYearPage() {
  return (
    <>
      <section id="top" className={SECTION_ANCHOR}>
        <div
          className={`${PAGE} grid items-center gap-10 pt-10 pb-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 lg:pt-14`}
        >
          <div>
            <p className={`${KICKER} text-[13px] text-meeple`}>
              Sep 12–14, 2025 · Lighthaven, Berkeley
            </p>
            <h1
              className={`${DISPLAY} mt-3.5 text-[clamp(64px,9vw,128px)] leading-[0.86] text-navy`}
            >
              What happened
              <br />
              last year<span className="text-meeple">?</span>
            </h1>
            <p className="mt-5 max-w-[34em] text-lg leading-relaxed text-ink/80 sm:text-xl">
              Three days of games, with one megagame running through all of it.
              Read how it played, replay the weekend, then see how well you know
              the program.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <a href="#replay">
                  <Play aria-hidden className="size-4" fill="currentColor" />
                  Replay the weekend
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="border-2 border-navy text-navy hover:border-navy hover:bg-navy/5"
              >
                <Link href="/#tickets">Get 2026 tickets</Link>
              </Button>
            </div>
          </div>
          <YearInNumbers />
        </div>
      </section>

      <PageSection section={LAST_YEAR_SECTIONS.report}>
        <HowItPlayed />
      </PageSection>

      <PageSection section={LAST_YEAR_SECTIONS.replay}>
        <WeekendReplay />
      </PageSection>

      <PageSection section={LAST_YEAR_SECTIONS.trivia}>
        <TriviaDeck />
      </PageSection>

      {/* The pointer at 2026. */}
      <section aria-labelledby="next-up" className={SECTION_ANCHOR}>
        <div className={`${PAGE} pb-20`}>
          <div className="grid gap-8 border-t-2 border-navy pt-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <p className={`${KICKER} text-meeple`}>Next up</p>
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
                <Button
                  asChild
                  variant="ghost"
                  className="border-2 border-navy text-navy hover:border-navy hover:bg-navy/5"
                >
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
