"use client";

import {
  useEffect,
  useReducer,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Pause, Play } from "lucide-react";
import {
  days,
  formatPacificTime,
  pacificMinutes,
  scheduleLocations,
  slotLabel,
  SLOT_MINUTES,
  type Session,
} from "@/v2/lib/last-year-schedule";
import { LEGEND, sessionStyle } from "@/v2/lib/schedule-styles";
import LastYearSessionModal from "../schedule/LastYearSessionModal";
import { DISPLAY } from "../styles";

// How far the clock moves per tick of playback, and how often it ticks.
const STEP = 15;
const TICK_MS = 700;

// Each day's sessions as minutes since Pacific midnight, the day's span, and
// how many sessions were running at each step of it.
const DAYS = days.map((d) => {
  const start = d.slots[0];
  const end = d.slots[d.slots.length - 1] + SLOT_MINUTES;
  const timed = d.sessions.map((s) => {
    const a = pacificMinutes(s.start_time);
    const b = pacificMinutes(s.end_time);
    return { s, a, b: b <= a ? b + 24 * 60 : b };
  });
  const steps: { t: number; n: number }[] = [];
  for (let t = start; t < end; t += STEP)
    steps.push({ t, n: timed.filter((x) => x.a <= t && t < x.b).length });
  const peak = Math.max(...steps.map((s) => s.n));
  return { name: d.name, start, end, timed, steps, peak };
});
const LAST = DAYS.length - 1;

// It opens on the weekend's busiest moment, so the board starts full.
const OPENING = DAYS.reduce(
  (best, d, day) =>
    d.peak > best.n
      ? { day, t: d.steps.find((s) => s.n === d.peak)!.t, n: d.peak }
      : best,
  { day: 0, t: DAYS[0].start, n: -1 },
);

// Radius of the open circles that bookend the timeline, in px. The time axis
// runs between their centres, so the track is inset by this much each side.
const END_R = 7;

const hourLabel = (t: number) => {
  const h = Math.floor(t / 60) % 24;
  return `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
};

type State = { day: number; t: number; playing: boolean };
type Action =
  | { type: "tick" | "toggle" | "pause" }
  | { type: "seek"; t: number }
  | { type: "day"; day: number };

const clamp = (day: number, t: number) =>
  Math.min(DAYS[day].end - STEP, Math.max(DAYS[day].start, t));
const atEnd = ({ day, t }: State) => day === LAST && t + STEP >= DAYS[LAST].end;

function playback(s: State, a: Action): State {
  switch (a.type) {
    case "tick":
      if (s.t + STEP < DAYS[s.day].end) return { ...s, t: s.t + STEP };
      if (s.day < LAST)
        return { ...s, day: s.day + 1, t: DAYS[s.day + 1].start };
      return { ...s, playing: false };
    case "toggle":
      if (s.playing) return { ...s, playing: false };
      // From the end, play again from Friday afternoon.
      return atEnd(s)
        ? { day: 0, t: DAYS[0].start, playing: true }
        : { ...s, playing: true };
    case "pause":
      return { ...s, playing: false };
    case "seek":
      return { ...s, t: clamp(s.day, a.t) };
    // Same time of day, another day.
    case "day":
      return { ...s, day: a.day, t: clamp(a.day, s.t) };
  }
}

// The 2025 weekend at any moment: an alternative to the schedule grid. Press
// play and the clock runs fifteen minutes at a time across all three days;
// drag along the day's timeline to jump to a moment. The board shows every
// venue and what was on there just then;
// click a session for its card.
export default function WhatWasOn() {
  const [state, dispatch] = useReducer(playback, {
    day: OPENING.day,
    t: OPENING.t,
    playing: false,
  });
  const { day, t, playing } = state;
  const [open, setOpen] = useState<Session | null>(null);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => dispatch({ type: "tick" }), TICK_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  const d = DAYS[day];
  const running = d.timed.filter((x) => x.a <= t && t < x.b);
  // A tick every two hours, on even clock hours, strictly inside the day.
  const ticks: number[] = [];
  for (let h = Math.ceil(d.start / 120) * 120; h < d.end; h += 120)
    if (h > d.start) ticks.push(h);
  const at = (m: number) => `${((m - d.start) / (d.end - d.start)) * 100}%`;

  const scrub = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - r.left - END_R) / (r.width - 2 * END_R);
    dispatch({
      type: "seek",
      t: d.start + Math.round((frac * (d.end - d.start)) / STEP) * STEP,
    });
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const jump: Record<string, number> = {
      ArrowRight: STEP,
      ArrowUp: STEP,
      ArrowLeft: -STEP,
      ArrowDown: -STEP,
      PageUp: 60,
      PageDown: -60,
      Home: -24 * 60,
      End: 24 * 60,
    };
    if (!(e.key in jump)) return;
    e.preventDefault();
    dispatch({ type: "seek", t: t + jump[e.key] });
  };

  return (
    <div>
      {/* Play on the left, the day in the middle, the clock on the right; on
          a phone the clock takes its own row above. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "toggle" })}
          aria-label={
            playing ? "Pause" : atEnd(state) ? "Play it again" : "Play"
          }
          className="-ml-2 justify-self-start rounded-full p-2 text-navy/45 transition-colors hover:text-navy focus-visible:text-navy"
        >
          {playing ? (
            <Pause aria-hidden className="size-6" fill="currentColor" />
          ) : (
            <Play aria-hidden className="size-6" fill="currentColor" />
          )}
        </button>
        <div
          role="group"
          aria-label="Day"
          className="flex divide-x divide-navy/30 border-2 border-navy"
        >
          {DAYS.map((x, i) => (
            <button
              key={x.name}
              type="button"
              aria-pressed={i === day}
              onClick={() => dispatch({ type: "day", day: i })}
              className={`${DISPLAY} px-3.5 py-2 text-[20px] leading-none tracking-[0.04em] transition-colors sm:px-5 ${
                i === day ? "bg-navy text-cream" : "text-navy hover:bg-sky"
              }`}
            >
              {x.name.slice(0, 3)}
            </button>
          ))}
        </div>
        <p
          className={`${DISPLAY} order-first col-span-3 justify-self-end text-[clamp(30px,4vw,44px)] leading-none text-navy sm:order-none sm:col-span-1`}
        >
          {d.name} · {slotLabel(t)}
        </p>
      </div>

      {/* The day as a timeline, which is also the scrubber: an open circle at
          each end, a tick every two hours, a red line for the current time. */}
      <div className="mt-6">
        <div
          role="slider"
          tabIndex={0}
          aria-label={`Time of day, ${d.name}`}
          aria-valuemin={d.start}
          aria-valuemax={d.end - STEP}
          aria-valuenow={t}
          aria-valuetext={`${d.name} ${slotLabel(t)}, ${running.length} sessions running`}
          onKeyDown={key}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            scrub(e);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) scrub(e);
          }}
          className="relative h-10 cursor-pointer touch-pan-y rounded-md outline-none focus-visible:ring-2 focus-visible:ring-meeple focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          {/* The axis runs between the centres of the two end circles. */}
          <div
            className="absolute inset-y-0"
            style={{ left: END_R, right: END_R }}
          >
            <span
              aria-hidden
              className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-ink/30"
            />
            {ticks.map((h) => (
              <span
                key={h}
                aria-hidden
                className="absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-ink/40"
                style={{ left: at(h) }}
              />
            ))}
            {[d.start, d.end].map((m) => (
              <span
                key={m}
                aria-hidden
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-navy bg-background"
                style={{ left: at(m), width: END_R * 2, height: END_R * 2 }}
              />
            ))}
            <span
              aria-hidden
              className="absolute top-1/2 h-7 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-meeple transition-[left] duration-150 ease-out"
              style={{ left: at(t) }}
            />
          </div>
        </div>
        <div
          className="relative h-4 font-space-mono text-[10.5px] text-ink/55"
          style={{ marginLeft: END_R, marginRight: END_R }}
        >
          {ticks.map((h) => (
            <span
              key={h}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: at(h) }}
            >
              {hourLabel(h)}
            </span>
          ))}
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink/70">
        {LEGEND.map((entry) => (
          <li key={entry.label} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-3.5 rounded-sm border"
              style={entry.style}
            />
            {entry.label}
          </li>
        ))}
      </ul>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
        {scheduleLocations.map((loc) => {
          const here = running.filter((x) => x.s.location_id === loc.id);
          return (
            <li
              key={loc.id}
              className={`flex min-h-[96px] flex-col border-t-2 pt-2 transition-colors duration-300 sm:min-h-[116px] ${
                here.length ? "border-navy" : "border-navy/15"
              }`}
            >
              <h3 className="font-space-mono text-[10.5px] leading-tight font-bold tracking-[0.1em] text-navy uppercase">
                {loc.name}
              </h3>
              <div className="mt-2 flex flex-1 flex-col gap-1.5">
                {here.length ? (
                  here.map(({ s }) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        dispatch({ type: "pause" });
                        setOpen(s);
                      }}
                      style={sessionStyle(s)}
                      className="rounded-md border-[1.5px] px-2 py-1.5 text-left text-[#1b1530] transition-transform duration-300 hover:-translate-y-0.5 motion-safe:animate-in motion-safe:zoom-in-90 motion-safe:fade-in"
                    >
                      <span className="line-clamp-2 text-[13px] leading-tight font-semibold">
                        {s.title}
                      </span>
                      <span className="mt-0.5 block font-space-mono text-[10px] text-[#1b1530]/75">
                        until {formatPacificTime(s.end_time)}
                      </span>
                    </button>
                  ))
                ) : (
                  <span className="font-space-mono text-[11px] tracking-[0.12em] text-ink/35 uppercase">
                    Quiet
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {open && (
        <LastYearSessionModal
          session={open}
          dayName={d.name}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
