import Glyph, { GLYPH_LABELS, type GlyphName } from "./Glyph";
import { DISPLAY } from "./ChapterHeading";

const RULES = [
  "Puzzles count.",
  "Video games count.",
  "LARPs and immersive theater count.",
  "Crosswords, trivia and design jams count.",
  "Card games and social deduction count.",
  "Rock-climbing routes count.",
];

// The box back's stats, as printed on a game box. Same facts as the FAQ.
const STATS = [
  { label: "Players", value: "Everyone who shows up" },
  { label: "Play time", value: "Fri 2 pm – Sun 9 pm" },
  { label: "Ages", value: "All · under 13 free" },
  { label: "Board", value: "Lighthaven, Berkeley" },
];

// Tile colours from the brand guide.
const CONTENTS: { name: GlyphName; bg: string; fg: string }[] = [
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

// §1 of the rulebook: what counts as a game, beside the "box back" with the
// weekend's stats and a contents grid of the kinds of play.
export default function RulebookObject() {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
      <div>
        <p className="max-w-[30em] text-[clamp(19px,2.2vw,22px)] leading-[1.4] text-navy">
          Rule one: if it&apos;s designed to be{" "}
          <mark className="bg-transparent bg-[linear-gradient(transparent_58%,var(--color-tan)_58%,var(--color-tan)_92%,transparent_92%)] text-inherit">
            played
          </mark>
          , it counts. If building it means asking &ldquo;what would the player
          choose to do next?&rdquo;, it&apos;s a game.
        </p>
        <ol className="mt-5 border-t-2 border-navy">
          {[...RULES, "Board games count, too."].map((rule, i) => (
            <li
              key={rule}
              className={`grid grid-cols-[52px_minmax(0,1fr)] gap-1 border-b border-line py-3 ${
                i === RULES.length ? "font-bold text-navy" : "text-ink/80"
              }`}
            >
              <b className="font-space-mono text-[13px] leading-[1.9] text-meeple">
                1.{i + 1}
              </b>
              <span>{rule}</span>
            </li>
          ))}
        </ol>
      </div>
      <aside
        aria-label="At a glance"
        className="order-first rounded-[18px] bg-navy p-5 text-cream sm:p-6 lg:order-none"
      >
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] bg-white/20">
          {STATS.map(({ label, value }) => (
            <div key={label} className="bg-navy px-3.5 py-3">
              <dt className="font-space-mono text-[10.5px] font-bold tracking-[0.14em] text-tan uppercase">
                {label}
              </dt>
              <dd
                className={`${DISPLAY} mt-1 text-[22px] leading-[1.05] tracking-[0.02em] sm:text-[26px]`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-5 mb-2.5 font-space-mono text-xs font-bold tracking-[0.14em] text-sky uppercase">
          Contents
        </h3>
        <ul className="grid grid-cols-6 gap-1.5">
          {CONTENTS.map(({ name, bg, fg }) => (
            <li
              key={name}
              title={GLYPH_LABELS[name]}
              className={`grid aspect-square place-items-center rounded-lg text-[28px] ${bg} ${fg} ${
                bg === "bg-navy" ? "ring-1 ring-cream/30" : ""
              }`}
              // The card-games glyph's front card matches its tile.
              style={
                { "--glyph-bg": "var(--color-peach)" } as React.CSSProperties
              }
            >
              <Glyph name={name} label={GLYPH_LABELS[name]} />
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
