"use client";

import { useEffect, useRef, useState } from "react";
import { CHAPTERS, NIGHT_NAME } from "@/v2/data/chapters";
import { SESSIONS_2026, type Session2026 } from "@/v2/data/sessions-2026";
import Glyph, { type GlyphName } from "./Glyph";
import { isPlayed, KINDS } from "./sessions/kinds";
import SessionDialog from "./sessions/SessionDialog";
import { DISPLAY } from "./styles";

const CONFIRMED = SESSIONS_2026.filter(
  (s) => s.status === "confirmed" && s.title,
);
const SEE_EXPANSIONS = `See §${CHAPTERS.expansions.num}.`;

type Component = {
  glyph: GlyphName;
  tile: string;
  /** The example strip, against the tile's colour. */
  strip: string;
  title: string;
  body: string;
  /** Confirmed 2026 sessions of this kind, if it has any. */
  sessions?: Session2026[];
};

const COMPONENTS: Component[] = [
  {
    glyph: "talks",
    tile: "bg-sky text-navy",
    strip: "bg-white/60 hover:bg-white",
    title: "Talks",
    body: "Main-room talks from game designers, puzzle makers and people who study play.",
    sessions: CONFIRMED.filter((s) => s.kinds[0] === "talk"),
  },
  {
    glyph: "workshops",
    tile: "bg-peach text-navy",
    strip: "bg-white/60 hover:bg-white",
    title: "Workshops",
    body: "Design a horror scenario, dream up a roleplaying theme park, train as a troll.",
    sessions: CONFIRMED.filter((s) => s.kinds.includes("workshop")),
  },
  {
    glyph: "party-games",
    tile: "bg-moss text-cream",
    strip: "bg-white/15 hover:bg-white/25",
    title: "Games",
    body: "Sessions run by attendees: tournaments, LARPs, social deduction, indie TTRPGs and more.",
    sessions: CONFIRMED.filter(
      (s) => isPlayed(s) && !s.kinds.includes("megagame"),
    ),
  },
  {
    glyph: "megagame",
    tile: "bg-tan text-navy",
    strip: "bg-white/50 hover:bg-white/80",
    title: "The Megagame",
    body: `A puzzle hunt, game gauntlet and story that runs all weekend. ${SEE_EXPANSIONS}`,
    sessions: CONFIRMED.filter((s) => s.kinds.includes("megagame")),
  },
  {
    glyph: "card-games",
    tile: "bg-navy text-cream",
    strip: "",
    title: NIGHT_NAME,
    body: `Friday night's booths: games to play, things to try, makers to meet. ${SEE_EXPANSIONS}`,
  },
  {
    glyph: "trivia",
    tile: "bg-brand-blue text-navy",
    strip: "",
    title: "Snacks & drinks",
    body: "Free for the taking, with food trucks on site for meals.",
  },
];
const LIVE = COMPONENTS.flatMap((c, i) => (c.sessions?.length ? [i] : []));

// One live card's example changes at a time, round the table.
const TURN_MS = 1700;

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// §2 of the rulebook: what's in the box. The session components count their
// confirmed 2026 sessions and keep dealing real examples (click one for its
// details); the rest are plain cards.
export default function RulebookComponents() {
  const list = useRef<HTMLUListElement>(null);
  // Each card's examples, shuffled once mounted; the server shows them in order.
  const [decks, setDecks] = useState(() =>
    COMPONENTS.map((c) => c.sessions ?? []),
  );
  const [shown, setShown] = useState(() => COMPONENTS.map(() => 0));
  // The card under the pointer keeps its example.
  const hovered = useRef<number | null>(null);
  const [open, setOpen] = useState<Session2026 | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDecks((d) => d.map(shuffle)), 0);
    return () => clearTimeout(t);
  }, []);

  // Deal only while the grid is on screen, the tab is visible and motion is
  // welcome.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    if (list.current) io.observe(list.current);
    let turn = 0;
    const id = window.setInterval(() => {
      if (!visible || document.hidden) return;
      const card = LIVE[turn++ % LIVE.length];
      if (card === hovered.current) return;
      setShown((s) => s.map((n, i) => (i === card ? n + 1 : n)));
    }, TURN_MS);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, []);

  return (
    <>
      <ul
        ref={list}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {COMPONENTS.map(({ glyph, tile, strip, title, body, sessions }, i) => {
          const deck = decks[i];
          const s = deck.length ? deck[shown[i] % deck.length] : null;
          return (
            <li
              key={title}
              onMouseEnter={() => {
                hovered.current = i;
              }}
              onMouseLeave={() => {
                hovered.current = null;
              }}
              className={`rulebook-rise group flex min-h-[170px] flex-col gap-2 rounded-[14px] p-5 transition-[translate,rotate] duration-300 hover:-translate-y-1.5 hover:-rotate-1 ${tile}`}
              // The card-games glyph's front card matches its tile.
              style={
                { "--glyph-bg": "var(--color-navy)" } as React.CSSProperties
              }
            >
              <div className="flex items-start justify-between gap-3">
                <Glyph
                  name={glyph}
                  className="size-11 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                />
                {sessions && (
                  <p className="text-right leading-none">
                    <span className={`${DISPLAY} block text-[34px]`}>
                      {sessions.length}
                    </span>
                    <span className="font-space-mono text-[10px] font-bold tracking-[0.12em] uppercase opacity-70">
                      confirmed
                    </span>
                  </p>
                )}
              </div>
              <h3
                className={`${DISPLAY} mt-auto text-[28px] leading-none tracking-[0.02em]`}
              >
                {title}
              </h3>
              <p className="text-[14.5px] leading-[1.4]">{body}</p>
              {s && (
                <button
                  type="button"
                  onClick={() => setOpen(s)}
                  aria-label={`${s.title}: details`}
                  className={`mt-1 flex items-center gap-2 overflow-hidden rounded-lg px-3 py-2 text-left transition-colors ${strip}`}
                >
                  <span className="shrink-0 font-space-mono text-[10px] font-bold tracking-[0.12em] uppercase opacity-60">
                    e.g.
                  </span>
                  <span
                    key={s.slug}
                    className="min-w-0 flex-1 animate-in truncate text-[14px] font-semibold duration-500 fade-in slide-in-from-bottom-3"
                  >
                    {s.title}
                  </span>
                  {title === "Games" && (
                    <span className="hidden shrink-0 font-space-mono text-[10px] tracking-[0.08em] uppercase opacity-60 sm:inline">
                      {KINDS[s.kinds[0]].label}
                    </span>
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <SessionDialog session={open} onClose={() => setOpen(null)} browse />
    </>
  );
}
