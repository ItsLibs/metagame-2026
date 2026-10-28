"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { Check } from "lucide-react";
import type { Answer, Answers } from "@/v2/forms/engine";
import { cn } from "@/v2/lib/utils";
import { DISPLAY } from "../styles";

// The volunteer application's availability, asked as the weekend's schedule:
// each window is a block on its day's line, marked by clicking it or by
// dragging across several. The marks are written to the four Airtable fields
// the form always had (Friday, Saturday and Sunday by shift; Thursday, Monday
// and the weeks before as other times), with Airtable's option names.

type Slot = { key: string; value: string };
type Window = Slot & { from: number; to: number };
type Day = { name: string; date: string; note?: string; windows: Window[] };

const SHIFTS: [string, number, number][] = [
  ["9am-1pm", 9, 13],
  ["1pm-5pm", 13, 17],
  ["5pm-9pm", 17, 21],
  ["9pm-1am", 21, 25],
];
const shifts = (key: string) =>
  SHIFTS.map(([value, from, to]) => ({ key, value, from, to }));

const DAYS: Day[] = [
  {
    name: "Thursday",
    date: "Nov 5",
    note: "The day before",
    windows: [
      { key: "otherTimes", value: "2pm-6pm Thursday (11/5)", from: 14, to: 18 },
      {
        key: "otherTimes",
        value: "6pm-10pm Thursday (11/5)",
        from: 18,
        to: 22,
      },
    ],
  },
  { name: "Friday", date: "Nov 6", windows: shifts("friday") },
  { name: "Saturday", date: "Nov 7", windows: shifts("saturday") },
  { name: "Sunday", date: "Nov 8", windows: shifts("sunday") },
  {
    name: "Monday",
    date: "Nov 9",
    note: "The day after",
    windows: [
      { key: "otherTimes", value: "9am-1pm Monday (11/9)", from: 9, to: 13 },
      { key: "otherTimes", value: "1pm-5pm Monday (11/9)", from: 13, to: 17 },
    ],
  },
];
const WINDOWS = DAYS.flatMap((d) => d.windows);
const WEEKEND = DAYS.slice(1, 4).flatMap((d) => d.windows);

// The weekend's fixed moments, drawn under their day's windows for context.
const MOMENTS: Record<string, { at: number; to?: number; label: string }[]> = {
  Friday: [
    { at: 14, label: "Gates open" },
    { at: 19, to: 22, label: "Night Market" },
  ],
  Sunday: [{ at: 21, label: "The end" }],
};

// The weeks before have no times, just whether.
const AHEAD: (Slot & { label: string })[] = [
  {
    key: "otherTimes",
    value: "Further in advance (onsite)",
    label: "On site, in the weeks before",
  },
  {
    key: "otherTimes",
    value: "Further in advance (virtual)",
    label: "Online, in the weeks before",
  },
];

/** The questions this board asks. */
export const SCHEDULE_KEYS = ["friday", "saturday", "sunday", "otherTimes"];

// Each line runs from 9 am to 1 am.
const START = 9;
const END = 25;
const pos = (h: number) => ((h - START) / (END - START)) * 100;
const hour = (h: number, gap = " ") => {
  const x = h % 24;
  return `${x % 12 || 12}${gap}${x < 12 ? "am" : "pm"}`;
};

// Airtable's order, so the row reads tidily.
const ORDER = [...WINDOWS, ...AHEAD].map((s) => s.value);
const list = (v: Answer) => (Array.isArray(v) ? v : []);
const tidy = (xs: string[]) =>
  [...new Set(xs)].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));

const CONTROL =
  "font-space-mono text-[11px] font-bold tracking-[0.12em] text-meeple uppercase hover:underline disabled:opacity-40 disabled:no-underline";

export default function ScheduleBoard({
  answers,
  update,
}: {
  answers: Answers;
  update: (key: string, fn: (v: Answer) => Answer) => void;
}) {
  const isOn = (s: Slot) => list(answers[s.key]).includes(s.value);
  const mark = (s: Slot, on: boolean) =>
    update(s.key, (v) =>
      tidy(on ? [...list(v), s.value] : list(v).filter((x) => x !== s.value)),
    );

  // Press a window and drag across others to paint them the same way.
  const paint = useRef<boolean | null>(null);
  useEffect(() => {
    const stop = () => {
      paint.current = null;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);
  const press = (w: Window) => (e: PointerEvent) => {
    if (e.button !== 0) return;
    paint.current = !isOn(w);
    mark(w, paint.current);
  };
  const drag = (e: PointerEvent) => {
    if (paint.current === null) return;
    const el = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-window]");
    const w = el && WINDOWS[Number(el.dataset.window)];
    if (w && isOn(w) !== paint.current) mark(w, paint.current);
  };

  const whole = (d: Day) => d.windows.every(isOn);
  const marked = WINDOWS.filter(isOn);
  const hours = marked.reduce((n, w) => n + w.to - w.from, 0);

  return (
    <div>
      <p className="text-[14.5px] leading-snug text-ink/60">
        Click a window, or drag across several. Click a day to mark all of it.
      </p>

      <div aria-hidden className="mt-4 flex gap-4">
        <span className="hidden w-28 shrink-0 sm:block" />
        <div className="relative h-4 flex-1 font-space-mono text-[10.5px] text-ink/50">
          {[9, 13, 17, 21, 25].map((h, i, all) => (
            <span
              key={h}
              className={cn(
                "absolute whitespace-nowrap",
                i === 0
                  ? ""
                  : i === all.length - 1
                    ? "-translate-x-full"
                    : "-translate-x-1/2",
              )}
              style={{ left: `${pos(h)}%` }}
            >
              {hour(h)}
            </span>
          ))}
        </div>
      </div>

      <ul
        onPointerMove={drag}
        className="mt-1.5 touch-pan-y border-t-2 border-navy select-none"
      >
        {DAYS.map((d) => (
          <li
            key={d.name}
            className="flex flex-col gap-2 border-b border-navy/15 py-3 sm:flex-row sm:items-start sm:gap-4"
          >
            <button
              type="button"
              onClick={() => d.windows.forEach((w) => mark(w, !whole(d)))}
              aria-label={`${whole(d) ? "Clear" : "Mark"} all of ${d.name}`}
              className="group w-28 shrink-0 pt-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-meeple"
            >
              <span
                className={`${DISPLAY} block text-[23px] leading-none text-navy transition-colors group-hover:text-meeple`}
              >
                {d.name.slice(0, 3)}{" "}
                <span className="text-ink/40 group-hover:text-meeple/60">
                  {d.date}
                </span>
              </span>
              {d.note && (
                <span className="font-space-mono text-[10px] tracking-[0.08em] text-ink/50 uppercase">
                  {d.note}
                </span>
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div className="relative h-11">
                {[13, 17, 21].map((h) => (
                  <span
                    key={h}
                    aria-hidden
                    className="absolute inset-y-0 w-px bg-navy/10"
                    style={{ left: `${pos(h)}%` }}
                  />
                ))}
                {d.windows.map((w) => {
                  const on = isOn(w);
                  return (
                    <button
                      key={w.value}
                      type="button"
                      data-window={WINDOWS.indexOf(w)}
                      aria-pressed={on}
                      aria-label={`${d.name}, ${d.date}, ${hour(w.from)} to ${hour(w.to)}`}
                      onPointerDown={press(w)}
                      // Keyboard presses only: a pointer has already marked it.
                      onClick={(e) => {
                        if (e.detail === 0) mark(w, !on);
                      }}
                      className={cn(
                        "absolute inset-y-0 flex items-center justify-center gap-1 rounded-lg border-2 font-space-mono text-[11px] font-bold transition-[background-color,border-color,color,scale] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-meeple focus-visible:ring-offset-2 active:scale-95",
                        on
                          ? "border-moss bg-moss text-cream"
                          : "border-dashed border-navy/30 bg-background text-navy/55 hover:border-navy hover:text-navy",
                      )}
                      style={{
                        left: `calc(${pos(w.from)}% + 2px)`,
                        width: `calc(${pos(w.to) - pos(w.from)}% - 4px)`,
                      }}
                    >
                      {on && (
                        <Check
                          aria-hidden
                          className="size-3.5 shrink-0"
                          strokeWidth={3}
                        />
                      )}
                      <span className="truncate">
                        {hour(w.from, "")}–{hour(w.to, "")}
                      </span>
                    </button>
                  );
                })}
              </div>
              {MOMENTS[d.name] && (
                <div
                  aria-hidden
                  className="relative mt-1.5 h-5 font-space-mono text-[10px] tracking-[0.06em] text-meeple uppercase"
                >
                  {MOMENTS[d.name].map((m) => (
                    <span key={m.label}>
                      <span
                        className={cn(
                          "absolute top-0 h-1 rounded-full bg-meeple",
                          !m.to && "w-1",
                        )}
                        style={{
                          left: `${pos(m.at)}%`,
                          width: m.to ? `${pos(m.to) - pos(m.at)}%` : undefined,
                        }}
                      />
                      <span
                        className="absolute top-1.5 whitespace-nowrap"
                        style={{ left: `${pos(m.at)}%` }}
                      >
                        {m.label}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <p className="text-[16px] font-semibold text-navy">
          And in the weeks before?
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AHEAD.map((a) => {
            const on = isOn(a);
            return (
              <button
                key={a.value}
                type="button"
                aria-pressed={on}
                onClick={() => mark(a, !on)}
                className={cn(
                  "flex items-center gap-2 rounded-full border-2 px-3.5 py-2 text-[15px] font-semibold transition-[background-color,border-color,color,translate] duration-150 select-none active:translate-y-px",
                  on
                    ? "border-moss bg-moss text-cream"
                    : "border-navy/20 text-navy hover:-translate-y-0.5 hover:border-navy",
                )}
              >
                {on && <Check aria-hidden className="size-4" strokeWidth={3} />}
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-navy/15 pt-3">
        <p aria-live="polite" className="text-[15px] text-ink/70">
          <b className={`${DISPLAY} text-[26px] leading-none text-navy`}>
            {marked.length}
          </b>{" "}
          {marked.length === 1 ? "window" : "windows"} marked
          {hours > 0 && <>, up to {hours} hours</>}
        </p>
        <button
          type="button"
          onClick={() => WEEKEND.forEach((w) => mark(w, true))}
          disabled={WEEKEND.every(isOn)}
          className={CONTROL}
        >
          Mark all of Fri–Sun
        </button>
        <button
          type="button"
          onClick={() => [...WINDOWS, ...AHEAD].forEach((s) => mark(s, false))}
          disabled={!marked.length && !AHEAD.some(isOn)}
          className={CONTROL}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
