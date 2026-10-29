import Glyph, { GLYPH_LABELS, type GlyphName } from "./Glyph";
import ShelfFigure from "./ShelfFigure";
import { DISPLAY, KICKER } from "./styles";

// The weekend's facts. Same facts as the FAQ.
const FACTS = [
  { label: "When", value: "Fri 2 pm – Sun 9 pm" },
  { label: "Where", value: "Lighthaven, Berkeley" },
  { label: "Ages", value: "All · under 13 free" },
  { label: "Who", value: "Everyone who shows up" },
];

// Token colours from the brand guide, with the glyph colour for each.
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

// The web: twelve hexes on a triangular lattice, three staggered rows of
// four, every one joined to its neighbours. Coordinates are in the SVG's
// space; the hexes are laid over it by percentage so the whole thing
// scales with the column.
const W = 432;
const H = 232;
const HEX = 50;
const ROWS = [
  [48, 144, 240, 336],
  [96, 192, 288, 384],
  [48, 144, 240, 336],
];
const Y = [40, 116, 192];
const NODES = ROWS.flatMap((xs, r) => xs.map((x) => ({ x, y: Y[r], r })));
// Neighbours: along a row, and down to the two hexes that straddle it.
const EDGES = NODES.flatMap((a, i) =>
  NODES.flatMap((b, j) => {
    if (j <= i) return [];
    const dx = Math.abs(a.x - b.x);
    const dy = b.r - a.r;
    const near = (dy === 0 && dx === 96) || (dy === 1 && dx === 48);
    return near ? [[i, j] as const] : [];
  }),
);

const HEX_CLIP = "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)";

// The weekend at a glance, beside the hero: the game library photo (the
// cover puzzle), the facts, and the kinds of play as a web of hexes, each
// one named on hover.
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
      <h3 className={`${KICKER} mt-5 mb-2 text-navy`}>Kinds of play</h3>
      <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden
          className="absolute inset-0 size-full"
        >
          {EDGES.map(([i, j]) => (
            <line
              key={`${i}-${j}`}
              x1={NODES[i].x}
              y1={NODES[i].y}
              x2={NODES[j].x}
              y2={NODES[j].y}
              className="stroke-navy/30"
              strokeWidth={1.5}
            />
          ))}
        </svg>
        <ul>
          {KINDS.map(({ name, bg, fg }, i) => {
            const { x, y } = NODES[i];
            return (
              <li
                key={name}
                className="group absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:z-10 hover:-translate-y-[60%]"
                style={{
                  left: `${(x / W) * 100}%`,
                  top: `${(y / H) * 100}%`,
                  width: `${(HEX / W) * 100}%`,
                }}
              >
                {/* A navy hex with the coloured one inset, for an outline the
                    clip can't cut. */}
                <span
                  className="grid aspect-[1/0.87] w-full place-items-center bg-navy"
                  style={{ clipPath: HEX_CLIP }}
                >
                  <span
                    className={`grid size-[calc(100%-5px)] place-items-center text-[22px] ${bg} ${fg}`}
                    style={
                      {
                        clipPath: HEX_CLIP,
                        "--glyph-bg": "var(--color-peach)",
                      } as React.CSSProperties
                    }
                  >
                    <Glyph
                      name={name}
                      label={GLYPH_LABELS[name]}
                      className="size-[58%]"
                    />
                  </span>
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-navy px-2 py-1 font-space-mono text-[10px] font-bold tracking-[0.1em] whitespace-nowrap text-cream uppercase opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {GLYPH_LABELS[name]}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
