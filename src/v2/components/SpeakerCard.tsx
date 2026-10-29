"use client";

import { useState } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import type { Session2026 } from "@/v2/data/sessions-2026";
import type { Person } from "@/v2/data/team";
import HatImage from "@/v2/hat-trick/HatImage";
import { KINDS, STATUS } from "./sessions/kinds";
import SessionDialog from "./sessions/SessionDialog";
import { DISPLAY } from "./styles";

const label = (s: Session2026) =>
  s.title ?? `${KINDS[s.kinds[0]].label}, title to come`;
const tag = (s: Session2026) =>
  s.status === "confirmed" ? null : STATUS[s.status].label;

const SIZES = "(min-width: 1024px) 200px, (min-width: 640px) 25vw, 33vw";
const FACE =
  "flex min-w-0 flex-col overflow-hidden rounded-xl border-2 border-navy [backface-visibility:hidden]";

// One speaker as a small two-sided card: the photo on top (with any Hat
// Trick hats), name and affiliation under it. Click it to turn it over for
// their sessions; a session opens its details in a pop-up. The front sets
// the card's height; the back lies over it and scrolls if it has to.
export default function SpeakerCard({
  name,
  title,
  titleUrl,
  photo,
  hats,
  logo,
  sessions = [],
}: Person & { sessions?: Session2026[] }) {
  const [flipped, setFlipped] = useState(false);
  const [open, setOpen] = useState<Session2026 | null>(null);
  const n = sessions.length;
  const canFlip = n > 0;

  return (
    <div className="h-full [perspective:1200px]">
      <div
        className={`relative h-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div
          inert={flipped}
          onClick={canFlip ? () => setFlipped(true) : undefined}
          className={`${FACE} h-full bg-white ${canFlip ? "cursor-pointer" : ""}`}
        >
          {photo && hats?.length ? (
            <HatImage
              src={photo}
              alt={name}
              hats={hats}
              className="aspect-square w-full"
              sizes={SIZES}
            />
          ) : photo ? (
            <Image
              src={photo}
              alt={name}
              className="aspect-square w-full object-cover"
              sizes={SIZES}
            />
          ) : (
            <div
              aria-hidden
              className={`${DISPLAY} grid aspect-square w-full place-items-center bg-navy text-5xl text-cream`}
            >
              {name
                .split(/\s+/)
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col px-2.5 pt-2 pb-2.5">
            <h3
              className={`${DISPLAY} truncate text-[clamp(17px,1.5vw,22px)] leading-none tracking-[0.02em] text-navy`}
            >
              {name}
            </h3>
            <p className="mt-1.5 flex min-w-0 items-center gap-1.5 font-space-mono text-[10px] tracking-[0.06em] text-ink/60 uppercase">
              {logo && (
                <Image
                  src={logo}
                  alt=""
                  className="size-3.5 shrink-0 rounded-[3px] object-contain"
                />
              )}
              {titleUrl ? (
                <a
                  href={titleUrl}
                  onClick={(e) => e.stopPropagation()}
                  {...(titleUrl.startsWith("/")
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="truncate underline underline-offset-2 transition-colors hover:text-navy"
                >
                  {title}
                </a>
              ) : (
                <span className="truncate">{title}</span>
              )}
            </p>
            {canFlip && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(true);
                }}
                aria-label={`Turn over for ${name}'s ${n === 1 ? "session" : `${n} sessions`}`}
                className="mt-auto flex items-center gap-1 pt-2 font-space-mono text-[10px] font-bold tracking-[0.08em] text-meeple uppercase outline-none hover:underline focus-visible:ring-2 focus-visible:ring-meeple"
              >
                <RotateCcw aria-hidden className="size-3" />
                {n} {n === 1 ? "session" : "sessions"}
              </button>
            )}
          </div>
        </div>

        {canFlip && (
          <div
            inert={!flipped}
            onClick={() => setFlipped(false)}
            className={`${FACE} absolute inset-0 [transform:rotateY(180deg)] cursor-pointer bg-navy p-2.5 text-cream`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-space-mono text-[10px] font-bold tracking-[0.1em] text-tan uppercase">
                {name.split(" ")[0]}&apos;s sessions
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(false);
                }}
                aria-label={`Turn ${name}'s card back`}
                className="grid size-6 shrink-0 place-items-center rounded-full text-cream/60 outline-none hover:bg-white/10 hover:text-cream focus-visible:ring-2 focus-visible:ring-tan"
              >
                <RotateCcw aria-hidden className="size-3" />
              </button>
            </div>
            <ul className="mt-1.5 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
              {sessions.map((s) => {
                const { Icon } = KINDS[s.kinds[0]];
                return (
                  <li key={s.slug} className="flex min-w-0 items-start gap-1.5">
                    <Icon
                      aria-hidden
                      className="mt-0.5 size-3.5 shrink-0 text-tan"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(s);
                      }}
                      className="min-w-0 text-left text-[12.5px] leading-snug outline-none hover:underline focus-visible:ring-2 focus-visible:ring-tan"
                    >
                      <span className="line-clamp-3">{label(s)}</span>
                      {tag(s) && (
                        <span className="font-space-mono text-[9px] tracking-[0.08em] text-sky uppercase">
                          {tag(s)}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <SessionDialog session={open} onClose={() => setOpen(null)} browse />
    </div>
  );
}
