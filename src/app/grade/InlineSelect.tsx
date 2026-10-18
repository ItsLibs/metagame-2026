"use client";

import { useState, useTransition } from "react";
import { addShepherd, setOverviewField } from "./actions";
import { swatch } from "@/lib/airtable-colors";

// Can't collide with a real option: Airtable trims choice names.
const ADD = " add";

/**
 * A select painted as its Airtable pill. Browsers won't style the options in
 * the open menu — that's a native menu — but the closed control carries the
 * colour of the current value, which is the part that has to be scannable.
 *
 * Saves on change, optimistically: the pill recolours immediately and reverts
 * if Airtable says no.
 *
 * With `allowAdd` (the Shepherd column) the menu also offers a new name, which
 * Airtable adds to the column's options as it saves.
 */
export default function InlineSelect({
  recordId,
  field,
  value,
  options,
  colors,
  allowAdd = false,
}: {
  recordId: string;
  field: string;
  value: string | null;
  options: readonly string[];
  colors: Record<string, string>;
  allowAdd?: boolean;
}) {
  const [current, setCurrent] = useState(value ?? "");
  const [failed, setFailed] = useState(false);
  const [saving, startSaving] = useTransition();
  const [adding, setAdding] = useState(false);
  // Names added from this row; the rest of the list catches up on reload.
  const [added, setAdded] = useState<string[]>([]);

  const tone = swatch(colors[current]);

  function add(name: string) {
    setAdding(false);
    if (!name.trim()) return;
    const previous = current;
    setCurrent(name.trim());
    setFailed(false);
    startSaving(async () => {
      const result = await addShepherd(recordId, name);
      if (result.name) {
        const saved = result.name;
        setCurrent(saved);
        setAdded((names) =>
          names.includes(saved) ? names : [...names, saved],
        );
      } else {
        setCurrent(previous);
        setFailed(true);
      }
    });
  }

  if (adding) {
    return (
      <input
        autoFocus
        aria-label={`New ${field}`}
        placeholder="Name"
        maxLength={60}
        onBlur={(event) => add(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          // Emptied first, so the blur this triggers saves nothing.
          if (event.key === "Escape") {
            event.currentTarget.value = "";
            event.currentTarget.blur();
          }
        }}
        className="w-full rounded-full border border-navy bg-white px-2.5 py-1 text-xs outline-none"
      />
    );
  }

  const shown = [
    ...options,
    ...added.filter((name) => !options.includes(name)),
    // Covers a name saved here before the page's option list knew about it.
    ...(current && !options.includes(current) && !added.includes(current)
      ? [current]
      : []),
  ];

  function change(next: string) {
    if (next === ADD) {
      setAdding(true);
      return;
    }
    const previous = current;
    setCurrent(next);
    setFailed(false);
    startSaving(async () => {
      const result = await setOverviewField(recordId, field, next);
      if (result?.error) {
        setCurrent(previous);
        setFailed(true);
      }
    });
  }

  return (
    <span className="relative block min-w-0">
      <select
        aria-label={field}
        title={failed ? "Couldn’t save — try again" : current || "Not set"}
        value={current}
        disabled={saving}
        onChange={(event) => change(event.target.value)}
        style={tone ?? undefined}
        className={`w-full cursor-pointer appearance-none truncate rounded-full py-1 pr-5 pl-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
          saving ? "opacity-60" : ""
        } ${failed ? "ring-2 ring-meeple" : ""} ${
          tone ? "" : "bg-ink/6 text-ink/55"
        }`}
      >
        <option value="">—</option>
        {shown.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        {allowAdd && <option value={ADD}>+ Add shepherd…</option>}
      </select>
      <span
        aria-hidden
        style={tone ? { color: tone.color } : undefined}
        className="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-[8px] opacity-70"
      >
        ▼
      </span>
    </span>
  );
}
