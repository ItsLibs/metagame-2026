"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import type { Session2026 } from "@/v2/data/sessions-2026";
import type { Person } from "@/v2/data/team";
import HatImage from "@/v2/hat-trick/HatImage";
import { KINDS, STATUS } from "./sessions/kinds";
import SessionDialog from "./sessions/SessionDialog";
import { DISPLAY, PLAYER_PHOTO } from "./styles";

// Sessions that fit on a card's back.
const ON_BACK = 3;

const label = (s: Session2026) =>
  s.title ?? `${KINDS[s.kinds[0]].label}, title to come`;
const tag = (s: Session2026) =>
  s.status === "confirmed" ? null : STATUS[s.status].label;

const FLIP =
  "grid size-7 shrink-0 place-items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-meeple";

// One speaker in the rulebook's §4 Players, as a two-sided player card. All
// cards are one size. The front is the brand mock's compact card (photo
// square, name, affiliation) with their first session and "+n more". Flip it
// for every session on the back. Any session opens its details in a pop-up.
export default function PlayerCard({
  name,
  title,
  titleUrl,
  photo,
  hats,
  sessions = [],
}: Person & { sessions?: Session2026[] }) {
  const [flipped, setFlipped] = useState(false);
  const [open, setOpen] = useState<Session2026 | null>(null);
  // Where focus goes once the card has turned.
  const turned = useRef(false);
  const toBack = useRef<HTMLButtonElement>(null);
  const toFront = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!turned.current) return;
    turned.current = false;
    (flipped ? toFront : toBack).current?.focus({ preventScroll: true });
  }, [flipped]);

  const flip = (to: boolean) => {
    turned.current = true;
    setFlipped(to);
  };
  const first = sessions[0];
  const more = sessions.length - 1;

  return (
    <div className="h-[104px] transition-transform duration-200 [perspective:1200px] hover:-translate-y-1">
      <div
        // One shrinkable column, so a long title truncates instead of
        // widening the card.
        className={`grid h-full grid-cols-1 transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div
          inert={flipped}
          className="relative flex h-full min-w-0 gap-3 rounded-xl border-2 border-navy bg-white p-3 [backface-visibility:hidden] [grid-area:1/1]"
        >
          {photo && hats?.length ? (
            <HatImage
              src={photo}
              alt={name}
              hats={hats}
              className={PLAYER_PHOTO}
              sizes="144px"
            />
          ) : photo ? (
            <Image
              src={photo}
              alt={name}
              className={`${PLAYER_PHOTO} object-cover`}
              sizes="144px"
            />
          ) : (
            <div
              aria-hidden
              className={`${PLAYER_PHOTO} ${DISPLAY} grid place-items-center bg-navy text-3xl text-cream`}
            >
              {name
                .split(/\s+/)
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3
              className={`${DISPLAY} truncate leading-none tracking-[0.02em] text-navy ${
                name.length > 14 ? "text-[21px]" : "text-2xl"
              }`}
            >
              {name}
            </h3>
            <p className="truncate font-space-mono text-[11px] tracking-[0.08em] text-ink/60 uppercase">
              {titleUrl ? (
                <a
                  href={titleUrl}
                  {...(titleUrl.startsWith("/")
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="underline underline-offset-2 transition-colors hover:text-navy"
                >
                  {title}
                </a>
              ) : (
                title
              )}
            </p>
            {first && (
              <div className="mt-auto flex min-w-0 items-center gap-1.5 text-sm leading-snug">
                <button
                  type="button"
                  onClick={() => setOpen(first)}
                  className="min-w-0 truncate text-left text-ink/80 italic underline-offset-2 hover:text-navy hover:underline"
                >
                  {label(first)}
                </button>
                {more === 0 && tag(first) && (
                  <span className="shrink-0 font-space-mono text-[10px] tracking-[0.08em] text-ink/50 uppercase">
                    {tag(first)}
                  </span>
                )}
                {/* One control flips the card: "+n" when the back holds more. */}
                <button
                  ref={toBack}
                  type="button"
                  onClick={() => flip(true)}
                  aria-label={
                    more > 0
                      ? `${more} more: flip ${name}'s card for all their sessions`
                      : `Flip ${name}'s card`
                  }
                  className={`-my-1 ml-auto flex h-7 min-w-7 shrink-0 items-center justify-center gap-0.5 rounded-full px-1.5 font-space-mono text-[10.5px] font-bold transition-colors outline-none hover:bg-sky focus-visible:ring-2 focus-visible:ring-meeple ${
                    more > 0 ? "text-meeple" : "text-navy/45 hover:text-navy"
                  }`}
                >
                  {more > 0 && <span>+{more}</span>}
                  <RotateCcw aria-hidden className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {first && (
          <div
            inert={!flipped}
            className="flex h-full min-w-0 [transform:rotateY(180deg)] flex-col rounded-xl border-2 border-navy bg-navy px-3 py-2.5 text-cream [backface-visibility:hidden] [grid-area:1/1]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-space-mono text-[10.5px] font-bold tracking-[0.12em] text-tan uppercase">
                {name.split(" ")[0]}&apos;s sessions
              </span>
              <button
                ref={toFront}
                type="button"
                onClick={() => flip(false)}
                aria-label={`Flip back to ${name}`}
                className={`${FLIP} text-cream/60 hover:bg-white/10 hover:text-cream`}
              >
                <RotateCcw aria-hidden className="size-3.5" />
              </button>
            </div>
            <ul className="mt-0.5 flex min-h-0 flex-col gap-0.5">
              {sessions.slice(0, ON_BACK).map((s) => {
                const { Icon } = KINDS[s.kinds[0]];
                return (
                  <li
                    key={s.slug}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    <Icon aria-hidden className="size-3.5 shrink-0 text-tan" />
                    <button
                      type="button"
                      onClick={() => setOpen(s)}
                      className="min-w-0 truncate text-left text-[13.5px] leading-snug hover:underline"
                    >
                      {label(s)}
                    </button>
                    {tag(s) && (
                      <span className="shrink-0 font-space-mono text-[9.5px] tracking-[0.08em] text-sky uppercase">
                        {tag(s)}
                      </span>
                    )}
                  </li>
                );
              })}
              {sessions.length === 1 && (
                <li className="font-space-mono text-[10.5px] tracking-[0.06em] text-cream/60 uppercase">
                  {KINDS[first.kinds[0]].label}
                  {first.duration && ` · ${first.duration}`}
                </li>
              )}
              {sessions.length > ON_BACK && (
                <li className="font-space-mono text-[10.5px] text-cream/60 uppercase">
                  +{sessions.length - ON_BACK} more on the sessions page
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <SessionDialog session={open} onClose={() => setOpen(null)} browse />
    </div>
  );
}
