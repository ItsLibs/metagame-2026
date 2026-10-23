"use client";

import { useRef, useState, type ReactNode } from "react";
import { Scale } from "lucide-react";
import { DISPLAY } from "./styles";

export type Rule = { id?: string; question: string; answer: ReactNode };

// A d12's outline: a decagon around a pentagon face, joined at the corners.
const ring = (n: number, r: number, turn = 0) =>
  Array.from({ length: n }, (_, k) => {
    const a = ((-90 + turn + (360 / n) * k) * Math.PI) / 180;
    return [24 + r * Math.cos(a), 24 + r * Math.sin(a)] as const;
  });
const OUTER = ring(10, 22);
const FACE = ring(5, 12);
const pts = (p: readonly (readonly [number, number])[]) =>
  p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function D12({ face, spinning }: { face: string; spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      className={`size-12 shrink-0 ${spinning ? "motion-safe:animate-[spin_0.4s_linear_infinite]" : "transition-transform duration-300 group-hover:rotate-[36deg]"}`}
    >
      <polygon
        points={pts(OUTER)}
        className="fill-tan stroke-navy"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {FACE.map(([x, y], k) => (
        <line
          key={k}
          x1={x}
          y1={y}
          x2={OUTER[2 * k][0]}
          y2={OUTER[2 * k][1]}
          className="stroke-navy"
          strokeWidth={1.5}
        />
      ))}
      <polygon
        points={pts(FACE)}
        className="fill-background stroke-navy"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <text
        x="24"
        y="25"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-navy font-[family-name:var(--font-bebas)]"
        fontSize="13"
      >
        {face}
      </text>
    </svg>
  );
}

const words = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean);

// §7 of the rulebook, the FAQ, with two ways to play it: roll the d12 to land
// on a random rule (there are twelve), or ask the rules lawyer, which dims
// every rule that doesn't mention what you typed. Every answer stays on the
// page either way.
export default function SpecialRules({ rules }: { rules: Rule[] }) {
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const texts = useRef<string[] | null>(null);
  const [query, setQuery] = useState("");
  // Which rules mention every word typed; null while the box is empty.
  const [matches, setMatches] = useState<boolean[] | null>(null);
  const [face, setFace] = useState("?");
  const [rolling, setRolling] = useState(false);
  const [lit, setLit] = useState<number | null>(null);

  const search = (q: string) => {
    setQuery(q);
    setLit(null);
    const terms = words(q);
    if (!terms.length) return setMatches(null);
    // The answers are rich text, so search what's on the page.
    texts.current ??= items.current.map(
      (el) => el?.textContent?.toLowerCase() ?? "",
    );
    const t = texts.current;
    setMatches(rules.map((_, i) => terms.every((w) => t[i].includes(w))));
  };
  const hits = matches ? matches.filter(Boolean).length : rules.length;

  const roll = () => {
    if (rolling) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = Math.floor(Math.random() * rules.length);
    const land = () => {
      setFace(String(n + 1));
      setRolling(false);
      setQuery("");
      setMatches(null);
      setLit(n);
      items.current[n]?.scrollIntoView({
        behavior: still ? "auto" : "smooth",
        block: "center",
      });
      window.setTimeout(() => setLit((l) => (l === n ? null : l)), 2600);
    };
    if (still) return land();
    setRolling(true);
    const tick = window.setInterval(
      () => setFace(String(1 + Math.floor(Math.random() * rules.length))),
      70,
    );
    window.setTimeout(() => {
      window.clearInterval(tick);
      land();
    }, 700);
  };

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-3">
        <button
          type="button"
          onClick={roll}
          className="group flex items-center gap-3 rounded-xl border-2 border-navy bg-white py-1.5 pr-4 pl-2 shadow-[4px_4px_0_0_var(--color-navy)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <D12 face={face} spinning={rolling} />
          <span className={`${DISPLAY} text-[22px] leading-none text-navy`}>
            Roll for a rule
          </span>
        </button>
        <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border-2 border-navy/30 bg-white px-3 py-2.5 focus-within:border-navy">
          <Scale aria-hidden className="size-5 shrink-0 text-navy/60" />
          <input
            type="search"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Ask the rules lawyer: parking, kids, refunds…"
            aria-label="Search the special rules"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink/40"
          />
        </label>
        <span
          aria-live="polite"
          className="font-space-mono text-xs tracking-[0.1em] text-ink/60 uppercase"
        >
          {lit !== null
            ? `Rolled a ${lit + 1}: rule 7.${lit + 1}`
            : matches
              ? `${hits} of ${rules.length} rules`
              : `${rules.length} rules`}
        </span>
      </div>

      {matches && hits === 0 && (
        <p className="mb-6 rounded-xl border-2 border-dashed border-navy/30 p-4 text-ink/70">
          The rules lawyer finds nothing on that. Email the team below and
          we&apos;ll add a rule.
        </p>
      )}

      {/* Columns, not a grid, so the rules read down each column. */}
      <ol className="md:columns-2 md:gap-11">
        {rules.map(({ id, question, answer }, i) => (
          <li
            key={question}
            id={id}
            ref={(el) => {
              items.current[i] = el;
            }}
            className={`grid scroll-mt-28 break-inside-avoid grid-cols-[52px_minmax(0,1fr)] rounded-md border-b border-line py-3.5 transition-[opacity,background-color,outline-color] duration-300 ${
              matches && !matches[i] ? "opacity-25" : ""
            } ${lit === i ? "bg-tan/25 outline-2 outline-offset-4 outline-tan" : "outline-transparent"}`}
          >
            <b className="font-space-mono text-[13px] leading-[1.9] text-meeple">
              7.{i + 1}
            </b>
            <div>
              <h3 className="text-[16.5px] leading-snug font-bold text-navy">
                {question}
              </h3>
              <div className="mt-1 text-[15px] text-ink/70">{answer}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
