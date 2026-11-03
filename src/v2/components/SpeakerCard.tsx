"use client";

import { Dices, Mic, Sparkles, Undo, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import {
  formatPacificDay,
  formatPacificTime,
  sessionHref,
  type Category,
  type HostedSession,
} from "@/lib/schedule";
import { FACTION_NAMES, type MegagameClass } from "@/lib/megagame-levels";
import type { Speaker } from "@/v2/data/speakers";
import HatImage from "@/v2/hat-trick/HatImage";
import { FactionMedal } from "./megagame/FactionPatch";
import { HEADING } from "./styles";

const CATEGORY_ICON: Record<Category, typeof Mic> = {
  talk: Mic,
  workshop: Wrench,
  game: Dices,
  other: Sparkles,
};

const SIZES = "(min-width: 1024px) 220px, 33vw";
const FACE =
  "flex h-full flex-col overflow-hidden rounded-lg border border-navy/[0.16] shadow-[0_8px_24px_rgba(23,48,89,0.08)] [backface-visibility:hidden]";
const MONO =
  "font-space-mono text-[9px] uppercase sm:text-xs sm:tracking-[0.08em]";

// Medal centres in medal widths (--s) from the photo's top-right corner, by
// how many a speaker has; `spread` is how far a hovered one eases outward.
type Slot = { x: number; y: number; spread: number; tilt: string };
const CORNER: Slot = { x: 0.55, y: 0.55, spread: 0, tilt: "rotate-[-6deg]" };
const ALONG: Slot = { x: 1.32, y: 0.68, spread: 0.22, tilt: "rotate-[6deg]" };
const DOWN: Slot = { x: 0.68, y: 1.32, spread: 0.22, tilt: "rotate-[-6deg]" };
const ARCS: Slot[][] = [[], [CORNER], [CORNER, ALONG], [CORNER, ALONG, DOWN]];

// Each faction's tooltip words and hover motion (lift and glow, roll, hover).
const LORE: Record<
  MegagameClass,
  { line: (first: string) => string; cta: string; motion: string }
> = {
  wizard: {
    line: (first) =>
      `${first} studies with the wizards and witches, spelling their way through word puzzles.`,
    cta: "Enrol too",
    motion:
      "hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_0_16px_rgba(59,0,184,0.75)] focus-visible:-translate-y-1.5 focus-visible:rotate-0",
  },
  pirate: {
    line: (first) =>
      `${first} sails with the pirates, hunting the treasure hidden in Lighthaven.`,
    cta: "Sign the articles too",
    motion:
      "motion-safe:hover:animate-[mg-roll_1.4s_ease-in-out_infinite] motion-safe:focus-visible:animate-[mg-roll_1.4s_ease-in-out_infinite]",
  },
  alien: {
    line: (first) =>
      `${first} is with the crashed survey crew, puzzling out the way home.`,
    cta: "Beam aboard too",
    motion:
      "hover:rotate-0 focus-visible:rotate-0 motion-safe:hover:animate-[mg-hover_1.8s_ease-in-out_infinite] motion-safe:focus-visible:animate-[mg-hover_1.8s_ease-in-out_infinite]",
  },
};

// The dog-eared corner that turns the card: a clipped triangle in the
// bottom-right with a turn-over arrow on it.
function Corner({
  ref,
  label,
  title,
  onClick,
  className,
}: {
  ref: RefObject<HTMLButtonElement | null>;
  label: string;
  title?: string;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title}
      className={`absolute right-0 bottom-0 size-6 transition-colors outline-none [clip-path:polygon(100%_0,100%_100%,0_100%)] sm:size-10 ${className}`}
    >
      <Undo
        aria-hidden
        className="absolute right-0.5 bottom-0.5 size-2.5 rotate-[100deg] sm:right-1.5 sm:bottom-1.5 sm:size-3.5"
      />
    </button>
  );
}

// One speaker as a two-sided card: the photo on top (with any Hat Trick
// hats and the Megagame factions they've joined, as badges on its corner),
// name and affiliation under it. Turn it over for their sessions, each
// linking to its page. The front sets the height; the back lies over it and
// scrolls if it has to. With no sessions there's nothing to turn to.
export default function SpeakerCard({
  name,
  title,
  titleUrl,
  photo,
  hats,
  logo,
  factions = [],
  sessions = [],
}: Omit<Speaker, "userId"> & {
  factions?: MegagameClass[];
  sessions?: HostedSession[];
}) {
  const [flipped, setFlipped] = useState(false);
  const frontCorner = useRef<HTMLButtonElement>(null);
  const backCorner = useRef<HTMLButtonElement>(null);
  const n = sessions.length;
  const canFlip = n > 0;
  const first = name.split(" ")[0];
  // Flipping makes the old face inert, which would drop focus to the body, so
  // after a flip focus moves to the new face's corner.
  const refocus = useRef(false);
  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    const corner = flipped ? backCorner.current : frontCorner.current;
    corner?.focus({ preventScroll: true });
  }, [flipped]);
  const flip = (to: boolean) => {
    refocus.current = true;
    setFlipped(to);
  };
  // Clicks on the face flip it, but not ones on things inside it that do
  // their own job (hats, the title link, the sessions, the corner).
  const onFace = (e: MouseEvent, to: boolean) => {
    if (!(e.target as Element).closest("button, a")) flip(to);
  };

  return (
    <div className="h-full [perspective:1200px]">
      <div
        className={`relative h-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div
          inert={flipped}
          onClick={canFlip ? (e) => onFace(e, true) : undefined}
          className={`${FACE} relative bg-white ${canFlip ? "cursor-pointer" : ""}`}
        >
          <div className="relative">
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
                className={`${HEADING} flex aspect-square w-full items-center justify-center bg-navy text-3xl text-cream sm:text-6xl`}
              >
                {name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            {/* Medals for the factions joined, on the corner so they cover
                little face; each links to the Megagame tab to join. */}
            {factions.length > 0 && (
              <ul
                aria-label="Megagame factions"
                className="absolute top-0 right-0 [--s:1.75rem] sm:[--s:2.5rem]"
              >
                {factions.map((f, i) => {
                  const slot = ARCS[Math.min(factions.length, 3)][i];
                  const lore = LORE[f];
                  const line = lore.line(first);
                  // The li keeps its place as the hover target; the wrapper
                  // inside eases outward, so the medal can't slide out from
                  // under the pointer and drop its own hover.
                  return (
                    <li
                      key={f}
                      className="absolute [--k:0] focus-within:[--k:1] hover:[--k:1]"
                      style={{
                        zIndex: factions.length - i,
                        top: `calc(var(--s) * ${slot.y - 0.5})`,
                        right: `calc(var(--s) * ${slot.x - 0.5})`,
                      }}
                    >
                      <div
                        className="transition-[translate] duration-400 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none"
                        style={{
                          translate: `calc(var(--s) * ${-slot.spread} * var(--k)) calc(var(--s) * ${slot.spread} * var(--k))`,
                        }}
                      >
                        <a
                          href={`/account?tab=megagame&join=${f}#faction-${f}`}
                          aria-label={`${FACTION_NAMES[f]}: ${line} ${lore.cta}`}
                          className={`group peer block rounded-full shadow-[0_2px_6px_rgba(23,48,89,0.4)] ring-2 ring-[#FFFBF2] transition-[rotate,scale,translate,box-shadow] duration-300 outline-none hover:scale-110 focus-visible:scale-110 focus-visible:ring-meeple motion-reduce:transition-none ${slot.tilt} ${lore.motion}`}
                        >
                          <FactionMedal
                            faction={f}
                            className="size-[var(--s)] rounded-full"
                          />
                        </a>
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute top-full right-0 z-10 mt-2 w-max max-w-[11rem] translate-y-1 rounded-lg bg-navy px-2.5 py-1.5 text-left text-[11px] leading-snug text-cream opacity-0 shadow-[0_4px_12px_rgba(23,48,89,0.35)] transition duration-200 peer-hover:translate-y-0 peer-hover:opacity-100 peer-focus-visible:translate-y-0 peer-focus-visible:opacity-100 motion-reduce:transition-none"
                        >
                          <b className="block font-[family-name:var(--font-bebas)] text-sm tracking-[0.04em]">
                            {FACTION_NAMES[f]}
                          </b>
                          {line}
                          <span className="block text-tan">{lore.cta} →</span>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center px-1 py-2 text-center sm:px-4 sm:py-3">
            <h3
              className={`${HEADING} text-xs break-words text-navy sm:text-lg`}
            >
              {name}
            </h3>
            <p
              className={`${MONO} mt-1 flex max-w-full items-center justify-center gap-1 text-ink/60 sm:gap-1.5`}
            >
              {logo && (
                <Image
                  src={logo}
                  alt=""
                  className="hidden size-3.5 shrink-0 rounded-[3px] object-contain sm:block"
                />
              )}
              {titleUrl ? (
                <a
                  href={titleUrl}
                  {...(titleUrl.startsWith("/")
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  className="min-w-0 break-words underline underline-offset-2 transition-colors hover:text-navy"
                >
                  {title}
                </a>
              ) : (
                <span className="min-w-0 break-words">{title}</span>
              )}
            </p>
          </div>
          {canFlip && (
            <Corner
              ref={frontCorner}
              label={`Turn over for ${name}'s ${n === 1 ? "session" : `${n} sessions`}`}
              title={`${n} ${n === 1 ? "session" : "sessions"}`}
              onClick={() => flip(true)}
              className="bg-navy text-cream hover:bg-meeple focus-visible:bg-meeple"
            />
          )}
        </div>

        {canFlip && (
          <div
            inert={!flipped}
            onClick={(e) => onFace(e, false)}
            className={`${FACE} absolute inset-0 [transform:rotateY(180deg)] cursor-pointer bg-navy p-2 text-cream sm:p-3`}
          >
            <span
              className={`${MONO} block truncate font-bold tracking-[0.1em] text-tan`}
            >
              {name.split(" ")[0]}&apos;s sessions
            </span>
            <ul className="mt-1.5 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto [backface-visibility:hidden] sm:mt-2 sm:gap-2">
              {sessions.map((s) => {
                const Icon = CATEGORY_ICON[s.category ?? "other"];
                return (
                  <li key={s.slug} className="flex min-w-0 items-start gap-1.5">
                    <Icon
                      aria-hidden
                      className="mt-0.5 hidden size-3.5 shrink-0 text-tan sm:block"
                    />
                    <Link
                      href={sessionHref(s)}
                      scroll={false}
                      className="min-w-0 text-left text-[11px] leading-snug outline-none hover:underline focus-visible:ring-2 focus-visible:ring-tan sm:text-[13px]"
                    >
                      <span className="line-clamp-3">{s.title}</span>
                      <span className="block font-space-mono text-[8px] tracking-[0.06em] text-sky uppercase sm:text-[9px]">
                        {formatPacificDay(s.startsAt).split(",")[0]}{" "}
                        {formatPacificTime(s.startsAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Corner
              ref={backCorner}
              label={`Turn ${name}'s card back`}
              onClick={() => flip(false)}
              className="bg-cream text-navy hover:bg-tan focus-visible:bg-tan"
            />
          </div>
        )}
      </div>
    </div>
  );
}
