"use client";

import { useEffect, useState } from "react";
import { Layers, Search } from "lucide-react";
import ChapterSection, { PAGE } from "@/v2/components/ChapterHeading";
import { SESSIONS_CHAPTERS } from "@/v2/data/chapters";
import {
  SESSIONS_2026,
  type Session2026,
  type SessionKind,
  type SessionStatus,
} from "@/v2/data/sessions-2026";
import { cn } from "@/v2/lib/utils";
import { DISPLAY, SECTION_ANCHOR } from "../styles";
import { hostLine, KINDS, STATUS } from "./kinds";
import SessionDialog from "./SessionDialog";

// One chapter per status, in page order.
const GROUPS = [
  { status: "confirmed", chapter: SESSIONS_CHAPTERS.confirmed },
  { status: "review", chapter: SESSIONS_CHAPTERS.review },
  { status: "unconference", chapter: SESSIONS_CHAPTERS.unconference },
] as const;

// The kinds that appear, most common first, for the filter chips.
const KIND_COUNTS = (Object.keys(KINDS) as SessionKind[])
  .map((kind) => ({
    kind,
    n: SESSIONS_2026.filter((s) => s.kinds.includes(kind)).length,
  }))
  .filter((k) => k.n > 0)
  .sort((a, b) => b.n - a.n);

// What the search box looks through.
const TEXT = new Map(
  SESSIONS_2026.map((s) => [
    s.slug,
    [
      s.title ?? "",
      ...s.hosts,
      s.org ?? "",
      s.blurb,
      ...s.kinds.map((k) => KINDS[k].label),
    ]
      .join(" ")
      .toLowerCase(),
  ]),
);

// Confirmed cards are the solid ones; in-review cards are dashed and
// unshadowed, so nobody mistakes them for the program.
const CARD: Record<SessionStatus, string> = {
  confirmed:
    "border-navy bg-white shadow-[4px_4px_0_0_var(--color-navy)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--color-navy)]",
  review:
    "border-dashed border-navy/45 bg-white/40 hover:-translate-y-0.5 hover:border-navy",
  unconference:
    "border-navy/70 bg-white hover:-translate-y-0.5 hover:border-navy",
};
function SessionCard({
  s,
  onOpen,
}: {
  s: Session2026;
  onOpen: (s: Session2026) => void;
}) {
  const { Icon, label, band } = KINDS[s.kinds[0]];
  const review = s.status === "review";
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(s)}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-[14px] border-2 text-left transition-[translate,box-shadow,border-color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-meeple focus-visible:ring-offset-2",
          CARD[s.status],
        )}
      >
        <span
          className={cn(
            "flex items-center justify-between gap-2 border-b-2 px-3.5 py-2",
            review
              ? "border-dashed border-navy/25"
              : cn(
                  band,
                  s.status === "confirmed" ? "border-navy" : "border-navy/70",
                ),
          )}
        >
          <span className="flex items-center gap-1.5 font-space-mono text-[10.5px] font-bold tracking-[0.12em] text-navy uppercase">
            <Icon aria-hidden className="size-4" />
            {label}
          </span>
          {s.duration && (
            <span className="text-right font-space-mono text-[10.5px] tracking-[0.06em] text-navy/70 uppercase">
              {s.duration}
            </span>
          )}
        </span>
        <span className="flex flex-1 flex-col gap-2 p-3.5">
          <span
            className={cn(
              "text-[16.5px] leading-snug font-bold",
              s.title ? "text-navy" : "text-ink/45 italic",
            )}
          >
            {s.title ?? "Title to come"}
          </span>
          <span className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="font-space-mono text-[11px] tracking-[0.06em] text-ink/60 uppercase">
              {hostLine(s)}
            </span>
            {s.status !== "confirmed" && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 font-space-mono text-[10px] font-bold tracking-[0.1em] uppercase",
                  STATUS[s.status].chip,
                )}
              >
                {STATUS[s.status].label}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

// Every 2026 session so far, as a deck: a control bar (deal a random one,
// search, filter by kind), then one chapter per status. A card opens its
// details; /sessions#slug links straight to one, and ?q= prefills the search.
export default function SessionDeck() {
  const [kind, setKind] = useState<SessionKind | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Session2026 | null>(null);

  // Read the link once mounted (the timer keeps setState out of the effect
  // body), and open whatever session a later #slug names.
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const s = SESSIONS_2026.find((x) => x.slug === slug);
      if (s) setOpen(s);
    };
    const t = setTimeout(() => {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setQuery(q);
      fromHash();
    }, 0);
    window.addEventListener("hashchange", fromHash);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = SESSIONS_2026.filter(
    (s) =>
      (!kind || s.kinds.includes(kind)) &&
      terms.every((w) => TEXT.get(s.slug)!.includes(w)),
  );
  const filtered = kind !== null || terms.length > 0;

  const show = (s: Session2026) => {
    setOpen(s);
    history.replaceState(null, "", `#${s.slug}`);
  };
  const hide = () => {
    setOpen(null);
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  };
  // Deals from the confirmed sessions in view, or from whatever is in view.
  const deal = () => {
    const confirmed = shown.filter((s) => s.status === "confirmed");
    const pool = confirmed.length ? confirmed : shown;
    if (pool.length) show(pool[Math.floor(Math.random() * pool.length)]);
  };

  const chip = (active: boolean) =>
    cn(
      "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-space-mono text-[11px] font-bold tracking-[0.08em] whitespace-nowrap uppercase transition-colors",
      active ? "bg-tan text-navy" : "bg-white/10 text-cream hover:bg-white/20",
    );

  return (
    <>
      <div id="deck" className={cn(PAGE, SECTION_ANCHOR, "pb-4")}>
        <div className="flex flex-col gap-3 rounded-2xl bg-navy p-2.5 sm:p-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={deal}
              className={`${DISPLAY} flex items-center gap-2 rounded-xl bg-tan py-2 pr-4 pl-3 text-[22px] leading-none text-navy transition-transform hover:-translate-y-0.5 active:translate-y-0`}
            >
              <Layers aria-hidden className="size-5" />
              Deal me a session
            </button>
            <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-tan">
              <Search aria-hidden className="size-5 shrink-0 text-tan" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, hosts, descriptions…"
                aria-label="Search the sessions"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-cream outline-none placeholder:text-cream/50"
              />
            </label>
            <span
              aria-live="polite"
              className="px-1 font-space-mono text-xs tracking-[0.1em] text-sky uppercase"
            >
              {filtered
                ? `${shown.length} of ${SESSIONS_2026.length} sessions`
                : `${SESSIONS_2026.length} sessions`}
            </span>
          </div>
          <div
            role="group"
            aria-label="Filter by kind"
            className="-mx-1 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-1 pb-0.5 sm:flex-wrap"
          >
            <button
              type="button"
              aria-pressed={kind === null}
              onClick={() => setKind(null)}
              className={chip(kind === null)}
            >
              All
            </button>
            {KIND_COUNTS.map(({ kind: k, n }) => {
              const { Icon, label } = KINDS[k];
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={kind === k}
                  onClick={() => setKind(kind === k ? null : k)}
                  className={chip(kind === k)}
                >
                  <Icon aria-hidden className="size-3.5" />
                  {label}
                  <span className="opacity-60">{n}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {GROUPS.map(({ status, chapter }) => {
        const all = SESSIONS_2026.filter((s) => s.status === status).length;
        const cards = shown.filter((s) => s.status === status);
        return (
          <ChapterSection
            key={status}
            chapter={{
              ...chapter,
              aka: `${filtered ? `${cards.length} of ` : ""}${all} · ${chapter.aka}`,
            }}
          >
            {cards.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cards.map((s) => (
                  <SessionCard key={s.slug} s={s} onOpen={show} />
                ))}
              </ul>
            ) : (
              <p className="text-ink/60">Nothing here matches.</p>
            )}
          </ChapterSection>
        );
      })}

      <SessionDialog session={open} onClose={hide} />
    </>
  );
}
