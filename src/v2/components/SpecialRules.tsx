"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  Accessibility,
  ArrowLeftRight,
  Baby,
  BedDouble,
  Car,
  Clock,
  Dices,
  LifeBuoy,
  Mail,
  MapPin,
  MessagesSquare,
  RotateCcw,
  Scale,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import AnagramEmail from "./AnagramEmail";
import CrypticsLightbox from "./CrypticsLightbox";
import { DISPLAY } from "./styles";

// What each rule is about: its icon and the colour of its card's band.
const TOPICS = {
  when: { Icon: Clock, band: "bg-sky" },
  where: { Icon: MapPin, band: "bg-sky" },
  lodging: { Icon: BedDouble, band: "bg-sky" },
  meals: { Icon: UtensilsCrossed, band: "bg-peach" },
  refunds: { Icon: RotateCcw, band: "bg-tan" },
  transfers: { Icon: ArrowLeftRight, band: "bg-tan" },
  kids: { Icon: Baby, band: "bg-peach" },
  parking: { Icon: Car, band: "bg-sky" },
  games: { Icon: Dices, band: "bg-moss" },
  access: { Icon: Accessibility, band: "bg-sky" },
  help: { Icon: LifeBuoy, band: "bg-peach" },
  more: { Icon: MessagesSquare, band: "bg-moss" },
} satisfies Record<string, { Icon: LucideIcon; band: string }>;

export type RuleTopic = keyof typeof TOPICS;
export type Rule = {
  id?: string;
  topic: RuleTopic;
  question: string;
  answer: ReactNode;
};

const BODY_LINK = "font-semibold text-navy underline underline-offset-2";
const CARD =
  "flex flex-col overflow-hidden rounded-[14px] border-2 border-navy bg-white shadow-[4px_4px_0_0_var(--color-navy)]";

// A d12's outline: a decagon around a pentagon face, joined at the corners.
const ring = (n: number, r: number) =>
  Array.from({ length: n }, (_, k) => {
    const a = ((-90 + (360 / n) * k) * Math.PI) / 180;
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
      className={`size-11 shrink-0 ${spinning ? "motion-safe:animate-[spin_0.4s_linear_infinite]" : "transition-transform duration-300 group-hover:rotate-[36deg]"}`}
    >
      <polygon
        points={pts(OUTER)}
        className="fill-background stroke-navy"
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
        className="fill-tan stroke-navy"
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

// §7 of the rulebook, the FAQ, as a hand of rule cards. Two ways to play it:
// roll the d12 to land on a random rule (there are twelve), or ask the rules
// lawyer, which dims every card that doesn't mention what you typed. Every
// answer stays face up either way. Two last cards: the cryptic-clue bonus
// round and the team's email.
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
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl bg-navy p-3 sm:p-4">
        <button
          type="button"
          onClick={roll}
          className="group flex items-center gap-2.5 rounded-xl bg-tan py-1.5 pr-4 pl-2 text-navy transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <D12 face={face} spinning={rolling} />
          <span className={`${DISPLAY} text-[22px] leading-none`}>
            Roll for a rule
          </span>
        </button>
        <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl bg-white/10 px-3 py-3 focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-tan">
          <Scale aria-hidden className="size-5 shrink-0 text-tan" />
          <input
            type="search"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Ask the rules lawyer: parking, kids, refunds…"
            aria-label="Search the special rules"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-cream outline-none placeholder:text-cream/50"
          />
        </label>
        <span
          aria-live="polite"
          className="px-1 font-space-mono text-xs tracking-[0.1em] text-sky uppercase"
        >
          {lit !== null
            ? `Rolled a ${lit + 1}`
            : matches
              ? `${hits} of ${rules.length} rules`
              : `${rules.length} rules`}
        </span>
      </div>

      {matches && hits === 0 && (
        <p className="mb-6 rounded-xl border-2 border-dashed border-navy/30 p-4 text-ink/70">
          The rules lawyer finds nothing on that. Email the team (the last card)
          and we&apos;ll add a rule.
        </p>
      )}

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rules.map(({ id, topic, question, answer }, i) => {
          const { Icon, band } = TOPICS[topic];
          return (
            <li
              key={question}
              id={id}
              ref={(el) => {
                items.current[i] = el;
              }}
              className={`${CARD} scroll-mt-28 transition-[opacity,translate,box-shadow,filter] duration-300 ${
                matches && !matches[i] ? "opacity-30 grayscale" : ""
              } ${lit === i ? "rule-pop -translate-y-1 shadow-[6px_6px_0_0_var(--color-meeple)]" : ""}`}
            >
              <div
                className={`flex items-center justify-between gap-3 border-b-2 border-navy px-4 py-2 ${band}`}
              >
                <span className="font-space-mono text-[11px] font-bold tracking-[0.14em] text-navy uppercase">
                  Rule 7.{i + 1}
                </span>
                <Icon aria-hidden className="size-5 text-navy" />
              </div>
              <div className="flex-1 p-4">
                <h3 className="text-[17px] leading-snug font-bold text-navy">
                  {question}
                </h3>
                <div className="mt-2 text-[14.5px] leading-relaxed text-ink/75">
                  {answer}
                </div>
              </div>
            </li>
          );
        })}

        <li className={`${CARD} sm:col-span-2`}>
          <div className="flex items-center justify-between gap-3 border-b-2 border-navy bg-navy px-4 py-2 text-cream">
            <span className="font-space-mono text-[11px] font-bold tracking-[0.14em] uppercase">
              Bonus round
            </span>
            <span aria-hidden className="text-tan">
              ★
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <CrypticsLightbox className="block w-28 shrink-0 sm:w-32" />
            <div>
              <h3 className={`${DISPLAY} text-[30px] leading-none text-navy`}>
                Write a clue for META
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink/75">
                Every clue on the 2025 cryptic crossword board resolves to META.
                Click the board to add yours.
              </p>
            </div>
          </div>
        </li>

        <li className={CARD}>
          <div className="flex items-center justify-between gap-3 border-b-2 border-navy bg-peach px-4 py-2">
            <span className="font-space-mono text-[11px] font-bold tracking-[0.14em] text-navy uppercase">
              Rule 7.13
            </span>
            <Mail aria-hidden className="size-5 text-navy" />
          </div>
          <div className="flex-1 p-4">
            <h3 className="text-[17px] leading-snug font-bold text-navy">
              Still stuck?
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink/75">
              Ask the team at <AnagramEmail className={BODY_LINK} />.
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
