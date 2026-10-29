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

// The web is an icosahedron, flat on the page: twelve corners, one kind of
// play on each, and its thirty edges between them. It's turned so that no
// two corners land near each other (the angles came from a search), and
// the edges on the far side draw fainter, which is all the depth it needs.
const PHI = (1 + Math.sqrt(5)) / 2;
const CORNERS = [-1, 1].flatMap((a) =>
  [-1, 1].flatMap((b) => [
    [0, a, b * PHI],
    [a, b * PHI, 0],
    [a * PHI, 0, b],
  ]),
);
const TILT = 2.897;
const TURN = 1.955;
const turned = CORNERS.map(([x, y, z]) => {
  const y1 = y * Math.cos(TILT) - z * Math.sin(TILT);
  const z1 = y * Math.sin(TILT) + z * Math.cos(TILT);
  return [
    x * Math.cos(TURN) + z1 * Math.sin(TURN),
    y1,
    -x * Math.sin(TURN) + z1 * Math.cos(TURN),
  ];
});
// Laid into a box W wide, with room for a hex at every edge.
const W = 432;
const HEX = 50;
const PAD = HEX * 0.6;
const xs = turned.map((c) => c[0]);
const ys = turned.map((c) => c[1]);
const SCALE = (W - 2 * PAD) / (Math.max(...xs) - Math.min(...xs));
const H = Math.round((Math.max(...ys) - Math.min(...ys)) * SCALE + 2 * PAD);
const NODES = turned.map(([x, y, z]) => ({
  x: PAD + (x - Math.min(...xs)) * SCALE,
  y: PAD + (y - Math.min(...ys)) * SCALE,
  z,
}));
// An edge joins corners two units apart.
const EDGES = CORNERS.flatMap((a, i) =>
  CORNERS.flatMap((b, j) =>
    j > i && Math.abs(Math.hypot(...a.map((v, k) => v - b[k])) - 2) < 1e-6
      ? [[i, j] as const]
      : [],
  ),
);
const zs = NODES.map((n) => n.z);
const depth = (z: number) =>
  (z - Math.min(...zs)) / (Math.max(...zs) - Math.min(...zs));

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
      <h3 className={`${KICKER} mt-5 mb-1 text-navy`}>Kinds of play</h3>
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
              className="stroke-navy"
              strokeWidth={1.5}
              strokeOpacity={0.12 + 0.3 * depth((NODES[i].z + NODES[j].z) / 2)}
            />
          ))}
        </svg>
        <ul>
          {KINDS.map(({ name, bg, fg }, i) => {
            const { x, y, z } = NODES[i];
            return (
              <li
                key={name}
                className="group absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:z-20 hover:-translate-y-[60%]"
                style={{
                  left: `${(x / W) * 100}%`,
                  top: `${(y / H) * 100}%`,
                  width: `${(HEX / W) * 100}%`,
                  zIndex: Math.round(depth(z) * 10),
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
