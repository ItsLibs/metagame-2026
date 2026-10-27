import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PAGE } from "@/v2/components/ChapterHeading";
import { KINDS } from "@/v2/components/sessions/kinds";
import SessionDeck from "@/v2/components/sessions/SessionDeck";
import { DISPLAY, SECTION_ANCHOR } from "@/v2/components/styles";
import { Button } from "@/v2/components/ui/button";
import {
  SESSIONS_2026,
  type SessionKind,
  type SessionStatus,
} from "@/v2/data/sessions-2026";

export const metadata: Metadata = {
  title: "Sessions — Metagame 2026",
  description:
    "Every session submitted for Metagame 2026 so far, marked confirmed, in review or unconference.",
};

const count = (status: SessionStatus) =>
  SESSIONS_2026.filter((s) => s.status === status).length;

// The box back's numbers, counted from the session list.
const STATS = [
  { label: "Confirmed", value: count("confirmed") },
  { label: "In review", value: count("review") },
  { label: "Unconference", value: count("unconference") },
];

// The commonest kinds of play among the confirmed sessions ("something
// else" says nothing on its own).
const TOP_KINDS = (Object.keys(KINDS) as SessionKind[])
  .filter((kind) => kind !== "other")
  .map((kind) => ({
    kind,
    n: SESSIONS_2026.filter(
      (s) => s.status === "confirmed" && s.kinds.includes(kind),
    ).length,
  }))
  .filter((k) => k.n > 0)
  .sort((a, b) => b.n - a.n)
  .slice(0, 6);

// /sessions: every 2026 session so far, sorted by where it stands. A cover
// with the counts, the deck (see SessionDeck), and a back cover to tickets.
export default function SessionsPage() {
  return (
    <>
      <section id="top" className={SECTION_ANCHOR}>
        <div
          className={`${PAGE} grid items-center gap-10 pt-10 pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 lg:pt-14`}
        >
          <div>
            <p className="font-space-mono text-xs font-bold tracking-[0.14em] text-meeple uppercase">
              The rulebook · 2026 edition
            </p>
            <h1
              className={`${DISPLAY} mt-3.5 text-[clamp(64px,9vw,128px)] leading-[0.86] text-navy`}
            >
              Sessions
              <br />
              so far<span className="text-meeple">.</span>
            </h1>
            <p className="mt-5 font-space-mono text-sm font-bold tracking-[0.12em] text-navy uppercase">
              Nov 6–8, 2026 · Lighthaven, Berkeley
            </p>
            <p className="mt-3 max-w-[34em] text-lg leading-relaxed text-ink/80 sm:text-xl">
              Everything submitted for Metagame 2026, sorted by where it stands:
              confirmed, still in review, or on the unconference schedule. Times
              and rooms aren&apos;t set yet.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <a href="#deck">Browse the deck ↓</a>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="border-2 border-navy text-navy hover:border-navy hover:bg-navy/5"
              >
                <Link href="/#tickets">Get tickets</Link>
              </Button>
            </div>
          </div>

          <aside
            aria-label="Sessions in numbers"
            className="rounded-[18px] bg-navy p-5 text-cream sm:p-6"
          >
            <p className="font-space-mono text-xs font-bold tracking-[0.14em] text-sky uppercase">
              The deck so far
            </p>
            <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-[10px] bg-white/20">
              {STATS.map(({ label, value }, i) => (
                <div key={label} className="bg-navy px-3.5 py-3">
                  <dt className="font-space-mono text-[10.5px] font-bold tracking-[0.14em] text-tan uppercase">
                    {label}
                  </dt>
                  <dd
                    className={`${DISPLAY} mt-1 text-[clamp(40px,4.4vw,52px)] leading-none tracking-[0.02em]`}
                  >
                    <span className="sr-only">{value}</span>
                    <span
                      aria-hidden
                      className="count-up"
                      style={
                        {
                          "--to": value,
                          animationDelay: `${150 + i * 90}ms`,
                        } as CSSProperties
                      }
                    />
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 font-space-mono text-xs font-bold tracking-[0.14em] text-sky uppercase">
              Confirmed, by kind
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {TOP_KINDS.map(({ kind, n }) => {
                const { Icon, label } = KINDS[kind];
                return (
                  <li
                    key={kind}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-2"
                  >
                    <Icon aria-hidden className="size-4 shrink-0 text-tan" />
                    <span className="min-w-0 truncate text-sm">{label}</span>
                    <span className={`${DISPLAY} ml-auto text-xl leading-none`}>
                      {n}
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </section>

      <SessionDeck />

      {/* The back cover. */}
      <section aria-labelledby="see-you" className={SECTION_ANCHOR}>
        <div className={`${PAGE} pb-20`}>
          <div className="grid gap-8 rounded-[22px] bg-navy p-6 text-cream sm:p-8 md:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <p className="font-space-mono text-xs font-bold tracking-[0.14em] text-tan uppercase">
                Your move
              </p>
              <h2
                id="see-you"
                className={`${DISPLAY} mt-2 text-[clamp(44px,6vw,72px)] leading-[0.9] tracking-[0.01em]`}
              >
                Play them in person
              </h2>
              <p className="mt-3 font-space-mono text-sm font-bold tracking-[0.12em] text-sky uppercase">
                Nov 6–8, 2026 · Lighthaven, Berkeley
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/#tickets">Get tickets</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/last-year">What happened last year?</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
