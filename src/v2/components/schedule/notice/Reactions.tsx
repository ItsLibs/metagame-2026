"use client";

import { SmilePlusIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Reaction } from "@/lib/unconference";

// The full picker is a few hundred KB of emoji data, so it loads only when
// someone opens it.
const Picker = dynamic(() => import("./EmojiPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] w-[300px] items-center justify-center rounded-lg border border-[#1b1530]/15 bg-cream text-xs text-[#1b1530]/55">
      Loading emoji…
    </div>
  ),
});

const QUICK = ["👍", "❤️", "🎉", "😂", "🙋", "🔥"];

const who = (r: Reaction) => {
  const more = r.count - r.names.length;
  return `${r.names.join(", ")}${more > 0 ? ` and ${more} more` : ""} reacted ${r.emoji}`;
};

/** Discord-style chips under the poster, with a picker to add any emoji. */
export function ReactionBar({
  reactions,
  canReact,
  onToggle,
}: {
  reactions: Reaction[];
  canReact: boolean;
  onToggle: (emoji: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!picking) return;
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setPicking(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [picking]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          title={who(r)}
          disabled={!canReact}
          onClick={() => onToggle(r.emoji)}
          aria-pressed={r.mine}
          className={`flex h-7 items-center gap-1 rounded-full border-[1.5px] px-2 text-sm transition-colors disabled:cursor-default ${
            r.mine
              ? "border-[#3f6fd1] bg-[#dcebfb] text-[#1b1530]"
              : "border-[#1b1530]/20 bg-white/70 text-[#1b1530] enabled:hover:border-[#1b1530]/45"
          }`}
        >
          <span className="leading-none">{r.emoji}</span>
          <span className="text-xs font-semibold tabular-nums">{r.count}</span>
        </button>
      ))}
      {canReact && (
        <div ref={box} className="relative">
          <button
            type="button"
            aria-label="Add a reaction"
            aria-expanded={picking}
            onClick={() => setPicking((p) => !p)}
            className="flex h-7 items-center gap-1 rounded-full border-[1.5px] border-dashed border-[#1b1530]/30 bg-white/50 px-2 text-[#1b1530]/65 transition-colors hover:border-[#1b1530]/55 hover:text-[#1b1530]"
          >
            <SmilePlusIcon className="size-4" />
          </button>
          {picking && (
            <div className="absolute bottom-full left-0 z-30 mb-2 flex flex-col gap-1.5 rounded-xl border-[1.5px] border-[#1b1530]/20 bg-cream p-1.5 shadow-xl">
              <div className="flex gap-1">
                {QUICK.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      onToggle(e);
                      setPicking(false);
                    }}
                    className="flex size-9 items-center justify-center rounded-lg text-xl hover:bg-[#1b1530]/10"
                  >
                    {e}
                  </button>
                ))}
              </div>
              <Picker
                onPick={(e) => {
                  onToggle(e);
                  setPicking(false);
                }}
              />
            </div>
          )}
        </div>
      )}
      {!canReact && reactions.length === 0 && (
        <span className="text-xs text-[#1b1530]/45">No reactions yet.</span>
      )}
    </div>
  );
}

/** The board's tiny version: the top few emoji, hanging off the note. */
export function ReactionCrumbs({
  reactions,
  max = 3,
}: {
  reactions: Reaction[];
  max?: number;
}) {
  if (reactions.length === 0) return null;
  const top = [...reactions].sort((a, b) => b.count - a.count).slice(0, max);
  const rest = reactions.length - top.length;
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-[#1b1530]/25 bg-cream px-1 py-px text-[9px] leading-none font-semibold text-[#1b1530] shadow-[1px_1.5px_0_rgba(27,21,48,0.25)]">
      {top.map((r) => (
        <span key={r.emoji} className="flex items-center gap-px">
          <span className="text-[10px]">{r.emoji}</span>
          {r.count > 1 && <span className="tabular-nums">{r.count}</span>}
        </span>
      ))}
      {rest > 0 && <span className="text-[#1b1530]/55">+{rest}</span>}
    </div>
  );
}
