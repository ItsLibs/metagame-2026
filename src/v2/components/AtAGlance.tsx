import Glyph, { GLYPH_LABELS, type GlyphName } from "./Glyph";
import ShelfFigure from "./ShelfFigure";
import { DISPLAY, KICKER, TOKEN } from "./styles";

// The weekend's facts. Same facts as the FAQ.
const FACTS = [
  { label: "When", value: "Fri 2 pm – Sun 9 pm" },
  { label: "Where", value: "Lighthaven, Berkeley" },
  { label: "Ages", value: "All · under 13 free" },
  { label: "Who", value: "Everyone who shows up" },
];

// Token colours from the brand guide. The cream ones get a navy edge so they
// show on the page.
const KINDS: { name: GlyphName; bg: string; fg: string }[] = [
  { name: "puzzles", bg: "bg-navy", fg: "text-cream" },
  { name: "video-games", bg: "bg-brand-blue", fg: "text-navy" },
  { name: "larps", bg: "bg-meeple", fg: "text-cream" },
  { name: "talks", bg: "bg-sky", fg: "text-navy" },
  { name: "megagame", bg: "bg-tan", fg: "text-navy" },
  { name: "party-games", bg: "bg-moss", fg: "text-cream" },
  { name: "card-games", bg: "bg-peach", fg: "text-navy" },
  { name: "crosswords", bg: "bg-sky", fg: "text-navy" },
  { name: "workshops", bg: "bg-tan", fg: "text-navy" },
  { name: "escape-rooms", bg: "bg-background", fg: "text-navy" },
  { name: "trivia", bg: "bg-brand-blue", fg: "text-navy" },
  { name: "board-games", bg: "bg-background", fg: "text-navy" },
];
// Each token in the pile sits a little askew.
const TILT = [
  "-rotate-6",
  "rotate-3",
  "-rotate-2",
  "rotate-6",
  "-rotate-3",
  "rotate-2",
];

// The weekend at a glance, beside the hero: the game library photo (the
// cover puzzle), the facts, and the kinds of play as a pile of tokens.
export default function AtAGlance() {
  return (
    <aside aria-label="At a glance">
      <ShelfFigure />
      <dl className="mt-5 grid grid-cols-2 gap-x-6 border-t-2 border-navy">
        {FACTS.map(({ label, value }) => (
          <div key={label} className="border-b border-navy/15 py-3">
            <dt className={`${KICKER} text-[10.5px] text-meeple`}>{label}</dt>
            <dd
              className={`${DISPLAY} mt-1 text-[22px] leading-[1.05] tracking-[0.02em] text-navy sm:text-[26px]`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <h3 className={`${KICKER} mt-5 mb-3 text-navy`}>Kinds of play</h3>
      {/* The tokens deal in one by one on load and overlap like chips in a
          pile; hovering one lifts it out and names it. */}
      <ul className="flex flex-wrap gap-y-2 pl-2">
        {KINDS.map(({ name, bg, fg }, i) => (
          <li
            key={name}
            className={`page-deal group relative -ml-2 ${TOKEN} size-11 text-[25px] ring-[3px] ring-background transition-[translate,rotate] duration-200 hover:z-10 hover:-translate-y-1.5 hover:rotate-0 ${TILT[i % TILT.length]} ${bg} ${fg} ${
              bg === "bg-background" ? "border-2 border-navy" : ""
            }`}
            // The card-games glyph's front card matches its token.
            style={
              {
                "--glyph-bg": "var(--color-peach)",
                animationDelay: `${300 + i * 60}ms`,
              } as React.CSSProperties
            }
          >
            <Glyph name={name} label={GLYPH_LABELS[name]} />
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-navy px-2 py-1 font-space-mono text-[10px] font-bold tracking-[0.1em] whitespace-nowrap text-cream uppercase opacity-0 transition-opacity group-hover:opacity-100"
            >
              {GLYPH_LABELS[name]}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
