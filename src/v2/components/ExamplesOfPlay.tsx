"use client";

import { useState } from "react";
import Link from "next/link";
import { SESSIONS_2026, type Session2026 } from "@/v2/data/sessions-2026";
import { SPEAKERS } from "@/v2/data/speakers";
import { HATS } from "@/v2/hat-trick/hats";
import roundRobin from "../../../public/images/misc_photos/board_game_round_robin_2.jpg";
import Glyph, { type GlyphName } from "./Glyph";
import RulebookFigure from "./RulebookFigure";
import { hostLine, isPlayed, KINDS } from "./sessions/kinds";
import SessionDialog from "./sessions/SessionDialog";
import { DISPLAY } from "./styles";

// Featured speakers' sessions first in each pile, so the opening hand
// shows them.
const FEATURED = new Set(SPEAKERS.map((p) => p.name));
const featured = (s: Session2026) =>
  s.hosts.some((h) => FEATURED.has(h)) ? 0 : 1;
const CONFIRMED = SESSIONS_2026.filter(
  (s) => s.status === "confirmed" && s.title,
).sort((a, b) => featured(a) - featured(b));

// The three piles a hand is dealt from, by each session's main kind.
const PILES: {
  chip: string;
  tile: string;
  glyph: GlyphName;
  sessions: Session2026[];
}[] = [
  {
    chip: "Talk",
    tile: "bg-sky text-navy",
    glyph: "talks",
    sessions: CONFIRMED.filter((s) => s.kinds[0] === "talk"),
  },
  {
    chip: "Workshop",
    tile: "bg-peach text-navy",
    glyph: "workshops",
    sessions: CONFIRMED.filter((s) => s.kinds[0] === "workshop"),
  },
  {
    chip: "Game",
    tile: "bg-moss text-cream",
    glyph: "party-games",
    sessions: CONFIRMED.filter(
      (s) => isPlayed(s) && s.kinds[0] !== "talk" && s.kinds[0] !== "workshop",
    ),
  },
];

// Dealt cards sit a little askew, like a hand on the table.
const TILT = ["-rotate-2", "rotate-1", "rotate-2"];

// §2's examples of play: a hand of three confirmed 2026 sessions, one talk,
// one workshop and one game, beside Fig. 2 (which hides the Hat Trick's
// wizard hat). Deal again for a new hand; a card opens its session. The
// first hand is fixed so the server and client agree.
export default function ExamplesOfPlay() {
  const [hand, setHand] = useState(() => PILES.map(() => 0));
  const [deals, setDeals] = useState(0);
  const [open, setOpen] = useState<Session2026 | null>(null);

  const deal = () => {
    setHand((h) =>
      PILES.map(({ sessions }, k) => {
        if (sessions.length < 2) return 0;
        let n = h[k];
        while (n === h[k]) n = Math.floor(Math.random() * sessions.length);
        return n;
      }),
    );
    setDeals((d) => d + 1);
  };

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
      <RulebookFigure
        fig="2"
        caption="The board game round robin at Metagame 2025."
        src={roundRobin}
        alt="A crowd leaning over a long table of abstract games during the board game round robin"
        hats={[HATS.wizard]}
      />
      <div>
        <ul className="grid gap-4 sm:grid-cols-3 sm:gap-3">
          {PILES.map(({ chip, tile, glyph, sessions }, k) => {
            const s = sessions[hand[k]];
            return (
              <li
                key={`${deals}-${chip}`}
                className="animate-in duration-500 fill-mode-backwards fade-in slide-in-from-bottom-8"
                style={{ animationDelay: `${k * 110}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(s)}
                  className={`flex h-full min-h-[140px] w-full flex-col rounded-xl border-2 border-navy bg-white p-4 text-left shadow-[4px_4px_0_0_var(--color-navy)] transition-transform duration-300 outline-none hover:-translate-y-1 hover:rotate-0 focus-visible:ring-2 focus-visible:ring-meeple sm:min-h-[220px] ${TILT[k % TILT.length]}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-md px-2 py-1 font-space-mono text-[10.5px] font-bold tracking-[0.12em] uppercase ${tile}`}
                    >
                      {chip === "Game" ? KINDS[s.kinds[0]].label : chip}
                    </span>
                    <Glyph name={glyph} className="size-7 text-navy/70" />
                  </span>
                  <span className="mt-4 text-[17px] leading-snug font-bold text-navy">
                    {s.title}
                  </span>
                  <span className="mt-auto pt-4 font-space-mono text-[11px] tracking-[0.06em] text-ink/60 uppercase">
                    {hostLine(s)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={deal}
            className={`${DISPLAY} rounded-lg bg-navy px-5 py-2.5 text-xl leading-none tracking-[0.04em] text-cream transition-transform hover:-translate-y-0.5 active:translate-y-0`}
          >
            Deal again ↻
          </button>
          <Link
            href="/sessions"
            className="text-sm font-bold text-navy underline underline-offset-4 hover:text-meeple"
          >
            See every 2026 session →
          </Link>
        </div>
      </div>
      <SessionDialog session={open} onClose={() => setOpen(null)} browse />
    </div>
  );
}
