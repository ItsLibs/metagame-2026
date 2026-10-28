"use client";

import { useEffect, useState } from "react";
import {
  SESSIONS_2026,
  type Session2026,
  type SessionKind,
} from "@/v2/data/sessions-2026";
import { hostLine, isPlayed, KINDS } from "./sessions/kinds";
import SessionDialog from "./sessions/SessionDialog";
import { DISPLAY } from "./styles";

// Rule one, played rather than listed: a hand of things to call "counts" or
// "doesn't count", judged by the site's own definition of a game (designed
// to be played, not passively consumed). Each hand is dealt fresh from the
// confirmed 2026 sessions and from everyday things that aren't games.

const SESSION_CARDS = 4;
const THING_CARDS = 3;

// Why a session counts, by the first kind of play it lists.
const PLAYED_WHY: Partial<Record<SessionKind, string>> = {
  larp: "A LARP: you decide what your character does next.",
  game: "A game: every turn asks what you'll do next.",
  ttrpg: "A tabletop RPG: the story waits on your next move.",
  deception: "Social deception: every round asks whom you'll trust.",
  puzzle: "A puzzle: every clue was set for you to solve.",
  immersive: "Immersive play: the whole thing is built around your choices.",
  megagame: "Part of the Megagame, which runs all weekend.",
  physical: "Physical play: your moves are actual moves.",
  playtest: "A game in progress: you help decide what players do next.",
};
const TALKED_WHY: Partial<Record<SessionKind, string>> = {
  talk: "A talk: about games, not one. It's on the program anyway.",
  workshop:
    "A workshop: you make things more than you play them. It's on the program anyway.",
};

const NON_GAMES: { thing: string; why: string }[] = [
  { thing: "A movie", why: "Made to be watched, not played." },
  { thing: "A podcast", why: "Made to be listened to. No moves to make." },
  {
    thing: "A tax return",
    why: "It has rules and a final number, but nobody designed it to be played.",
  },
  { thing: "A traffic jam", why: "Plenty of players, no designer." },
  { thing: "A sunset", why: "Lovely, and not designed at all." },
  {
    thing: "A spreadsheet",
    why: "Not unless someone builds a game in it. People have.",
  },
  {
    thing: "A weather forecast",
    why: "It says what will happen; it never asks what you'll do.",
  },
  {
    thing: "A nap",
    why: "Restful, not played. The team has one booked for Nov 9.",
  },
  {
    thing: "A grocery list",
    why: "A plan, not a game. Racing someone around the aisles would count.",
  },
  { thing: "A screensaver", why: "It moves; you don't." },
  { thing: "A recipe", why: "Made to be followed, not played." },
  { thing: "A software update", why: "It decides everything for you." },
  { thing: "An elevator ride", why: "One button, and no real choices." },
  {
    thing: "A museum audio guide",
    why: "A set path, made to be listened to.",
  },
  {
    thing: "A line at the DMV",
    why: "Turns and waiting, but nobody's playing.",
  },
];

type Card = {
  title: string;
  counts: boolean;
  why: string;
  session?: Session2026;
};

// Confirmed sessions with a title whose kind decides the call.
const SESSION_POOL: Card[] = SESSIONS_2026.flatMap((s): Card[] => {
  if (s.status !== "confirmed" || !s.title) return [];
  if (isPlayed(s)) {
    const k = s.kinds.find((k) => PLAYED_WHY[k]);
    return [{ title: s.title, counts: true, why: PLAYED_WHY[k!]!, session: s }];
  }
  // Only sessions that are purely talks or workshops make a clear "no".
  const why = s.kinds.every((k) => TALKED_WHY[k])
    ? TALKED_WHY[s.kinds[0]]
    : undefined;
  return why ? [{ title: s.title, counts: false, why, session: s }] : [];
});
const THING_POOL: Card[] = NON_GAMES.map((n) => ({
  title: n.thing,
  counts: false,
  why: n.why,
}));

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const deal = () =>
  shuffle([
    ...shuffle(SESSION_POOL).slice(0, SESSION_CARDS),
    ...shuffle(THING_POOL).slice(0, THING_CARDS),
  ]);

export default function DoesItCount() {
  // Dealt once mounted, so the server and the first client render agree.
  const [hand, setHand] = useState<Card[] | null>(null);
  const [i, setI] = useState(0);
  const [call, setCall] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [open, setOpen] = useState<Session2026 | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setHand(deal()), 0);
    return () => clearTimeout(t);
  }, []);

  const total = SESSION_CARDS + THING_CARDS;
  const done = i === total;
  const card = hand?.[Math.min(i, total - 1)];

  const answer = (counts: boolean) => {
    if (!card) return;
    setCall(counts);
    if (counts === card.counts) setScore((s) => s + 1);
  };
  const next = () => {
    setI((n) => n + 1);
    setCall(null);
  };
  const again = () => {
    setHand(deal());
    setI(0);
    setCall(null);
    setScore(0);
  };

  return (
    <div className="relative overflow-hidden rounded-[14px] border-2 border-navy bg-white p-5 shadow-[6px_6px_0_0_var(--color-navy)] sm:p-6">
      <div className="flex items-baseline justify-between gap-3 font-space-mono text-xs font-bold tracking-[0.14em] uppercase">
        <span className="text-meeple">Does it count?</span>
        <span className="text-ink/50">
          {done ? "Final score" : `Card ${i + 1} of ${total}`}
        </span>
      </div>

      {!card ? (
        <p
          className={`${DISPLAY} mt-3 text-[clamp(36px,4.4vw,54px)] text-navy/30`}
        >
          Shuffling…
        </p>
      ) : done ? (
        <div key="done" className="animate-in duration-300 fade-in">
          <p
            className={`${DISPLAY} mt-3 text-[clamp(40px,5vw,60px)] leading-none text-navy`}
          >
            {score} / {total}
          </p>
          <p className="mt-2 text-ink/80">
            {score === total
              ? "Perfect. You already know rule one."
              : "Rule one again: if it's designed to be played, it counts."}
          </p>
          <button
            type="button"
            onClick={again}
            className="mt-5 rounded-lg border-2 border-navy px-4 py-2 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-cream"
          >
            Deal a new hand
          </button>
        </div>
      ) : (
        <div
          key={`${i}-${card.title}`}
          className="animate-in duration-300 fade-in slide-in-from-right-6"
        >
          {card.session && (
            <p className="mt-3 font-space-mono text-[10.5px] font-bold tracking-[0.12em] text-ink/50 uppercase">
              On the 2026 program
            </p>
          )}
          <p
            className={`${DISPLAY} mt-2 leading-[0.95] text-balance text-navy ${
              card.title.length > 40
                ? "text-[clamp(28px,3.2vw,38px)]"
                : "text-[clamp(36px,4.4vw,54px)]"
            }`}
          >
            {card.title}
          </p>
          {call === null ? (
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => answer(true)}
                className="rounded-lg bg-moss px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Counts
              </button>
              <button
                type="button"
                onClick={() => answer(false)}
                className="rounded-lg bg-meeple px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Doesn&apos;t count
              </button>
            </div>
          ) : (
            <div aria-live="polite" className="mt-4">
              <div className="flex flex-wrap items-center gap-4">
                <span
                  className={`${DISPLAY} inline-block -rotate-6 animate-in rounded-md border-[3px] px-3 py-1 text-[28px] leading-none duration-200 fade-in zoom-in-150 ${
                    card.counts
                      ? "border-moss text-moss"
                      : "border-meeple text-meeple"
                  }`}
                >
                  {card.counts ? "Counts" : "Doesn't count"}
                </span>
                <span className="font-space-mono text-xs tracking-[0.08em] text-ink/60 uppercase">
                  {call === card.counts ? "✓ You got it" : "✗ Not quite"}
                </span>
              </div>
              <p className="mt-3 text-ink/80">{card.why}</p>
              {card.session && (
                <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-space-mono text-[11px] tracking-[0.06em] text-ink/55 uppercase">
                  <span>
                    {KINDS[card.session.kinds[0]].label} ·{" "}
                    {hostLine(card.session)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(card.session!)}
                    className="font-bold text-navy underline underline-offset-2 hover:text-meeple"
                  >
                    Details
                  </button>
                </p>
              )}
              <button
                type="button"
                onClick={next}
                className="mt-4 text-sm font-bold text-navy underline underline-offset-4 hover:text-meeple"
              >
                {i === total - 1 ? "See your score →" : "Next card →"}
              </button>
            </div>
          )}
        </div>
      )}
      <SessionDialog session={open} onClose={() => setOpen(null)} browse />
    </div>
  );
}
