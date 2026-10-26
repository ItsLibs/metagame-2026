"use client";

import { useEffect, useId, useRef, useState } from "react";
import DividerRow from "../DividerRow";
import { CARD_SET as CARD_SIZE, LAYER, SHADOW } from "../sizing";
import { trackEgg } from "../track";

// SET cards rendered in the weirdchess/dice language: a solid charcoal card with
// the symbols punched out as negative space. Colour is the one SET attribute we
// drop in b/w — shape (diamond/oval/squiggle), count (1–3) and shading
// (solid = cut, open = cut outline, striped = cut stripes) carry it.
//
// The cards are a game. The first tap clears the four away and deals the
// first of six levels, each a fixed hand of the 27 cards laid out as a small
// table. Tap three cards (they glow); a set fades out, anything else shakes.
// Clear the table to move up a level; clear the last and it spells a
// discount code.
const CHARCOAL = "#4d4d4d";
const EXIT_MS = 500; // a found set fading out
const DEAL_MS = 600; // a dealt card fading in
const SHAKE_MS = 400;
const STAGGER_MS = 60;
const LEVEL_PAUSE_MS = 250; // before a new table deals in

// portrait card, rounded corners, centred in the viewBox
const CARD =
  "M35 10 L65 10 A9 9 0 0 1 74 19 L74 81 A9 9 0 0 1 65 90 L35 90 A9 9 0 0 1 26 81 L26 19 A9 9 0 0 1 35 10 Z";

const HW = 16; // symbol half-width
const HH = 7; // symbol half-height

const SHAPE_NAMES = ["diamond", "oval", "squiggle"] as const;
const COUNT_NAMES = [1, 2, 3] as const;
const SHADING_NAMES = ["solid", "striped", "open"] as const;
type Shape = (typeof SHAPE_NAMES)[number];
type Count = (typeof COUNT_NAMES)[number];
type Shading = (typeof SHADING_NAMES)[number];

// A smooth squiggle: a sine centreline offset to a constant thickness with
// semicircle end-caps, so there are no sharp corners at any scale. Sampled as a
// fine polyline (the wave joins are shallow; only the caps need to be true arcs).
function squigglePath(cy: number): string {
  const x0 = 37,
    x1 = 63,
    amp = 5.2,
    ht = 4.6,
    N = 26;
  const f = (p: [number, number]) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  const up: [number, number][] = [];
  const lo: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const cx = x0 + (x1 - x0) * s;
    const cyy = cy - amp * Math.sin(2 * Math.PI * s);
    const dy = -amp * 2 * Math.PI * Math.cos(2 * Math.PI * s);
    const len = Math.hypot(x1 - x0, dy);
    const nx = -dy / len,
      ny = (x1 - x0) / len;
    up.push([cx + nx * ht, cyy + ny * ht]);
    lo.push([cx - nx * ht, cyy - ny * ht]);
  }
  return (
    `M${f(up[0])} ` +
    up
      .slice(1)
      .map((p) => `L${f(p)}`)
      .join(" ") +
    ` A${ht} ${ht} 0 0 0 ${f(lo[N])} ` +
    lo
      .slice(0, N)
      .reverse()
      .map((p) => `L${f(p)}`)
      .join(" ") +
    ` A${ht} ${ht} 0 0 0 ${f(up[0])} Z`
  );
}

const SHAPES: Record<Shape, (cy: number) => string> = {
  diamond: (cy) =>
    `M${50 - HW} ${cy} L50 ${cy - HH} L${50 + HW} ${cy} L50 ${cy + HH} Z`,
  oval: (cy) =>
    `M41 ${cy - HH} L59 ${cy - HH} A${HH} ${HH} 0 0 1 59 ${cy + HH} L41 ${cy + HH} A${HH} ${HH} 0 0 1 41 ${cy - HH} Z`,
  squiggle: squigglePath,
};

// vertical centres of the symbols, evenly stacked, for each count
const COUNTS: Record<Count, number[]> = {
  1: [50],
  2: [38, 62],
  3: [29, 50, 71],
};

type Card = { shape: Shape; count: Count; shading: Shading };

const key = (c: Card) => `${c.shape}-${c.count}-${c.shading}`;

// With three attributes there are 27 cards, and any two fix the third that
// completes their set: per attribute, the shared value or the one left over.
const third = (a: Card, b: Card): Card => ({
  shape:
    a.shape === b.shape
      ? a.shape
      : SHAPE_NAMES.find((s) => s !== a.shape && s !== b.shape)!,
  count:
    a.count === b.count
      ? a.count
      : COUNT_NAMES.find((n) => n !== a.count && n !== b.count)!,
  shading:
    a.shading === b.shading
      ? a.shading
      : SHADING_NAMES.find((s) => s !== a.shading && s !== b.shading)!,
});

const isSet = (a: Card, b: Card, c: Card) => key(third(a, b)) === key(c);

const shuffle = <T,>(xs: readonly T[]): T[] => {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// A card in a slot. `seq` keys it, so every deal mounts fresh art; `delay` is
// its fade-in, or null for the four the page loads with.
type Slot = { card: Card; seq: number; delay: number | null };

// Cards are numbered 1–27 by their base-3 digits (n − 1): 1–9 share the first
// attribute, 1–3/10–12/19–21 the second, n mod 3 the third. Every level is
// designed to clear exactly, though a careless set can strand it.
const LEVEL_2 = [1, 2, 3, 5, 7, 9, 12, 15, 18, 21, 25, 26];
const ALL = Array.from({ length: 27 }, (_, i) => i + 1);
const LEVELS = [
  { cols: 9, cards: [1, 7, 14, 16, 20, 23, 25, 26, 27] },
  { cols: 6, cards: LEVEL_2 },
  { cols: 6, cards: [...LEVEL_2, 11, 14, 17, 22, 23, 24] },
  {
    cols: 7,
    cards: [
      1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 14, 16, 17, 18, 19, 21, 23, 24, 25, 26,
      27,
    ],
  },
  { cols: 8, cards: ALL.filter((n) => ![1, 5, 9].includes(n)) },
  { cols: 9, cards: ALL },
];

// Which digit drives which attribute, and which value each digit means, are
// shuffled per level (any such relabelling keeps every set a set), and so is
// the order on the table. Cards fade in corner to corner.
function dealLevel(level: number, mint: () => number): Slot[] {
  const { cols, cards } = LEVELS[level];
  const attrs = shuffle(["shape", "count", "shading"] as const);
  const values = {
    shape: shuffle(SHAPE_NAMES),
    count: shuffle(COUNT_NAMES),
    shading: shuffle(SHADING_NAMES),
  };
  return shuffle(cards).map((n, i) => {
    const digits = [
      Math.floor((n - 1) / 9),
      Math.floor((n - 1) / 3) % 3,
      (n - 1) % 3,
    ];
    const card = Object.fromEntries(
      attrs.map((a, d) => [a, values[a][digits[d]]]),
    ) as Card;
    const diagonal = Math.floor(i / cols) + (i % cols);
    return {
      card,
      seq: mint(),
      delay: LEVEL_PAUSE_MS + diagonal * STAGGER_MS,
    };
  });
}

// The deal the page loads with.
const FIRST: Slot[] = (
  [
    { shape: "diamond", count: 1, shading: "solid" },
    { shape: "oval", count: 2, shading: "striped" },
    { shape: "squiggle", count: 3, shading: "open" },
    { shape: "diamond", count: 2, shading: "solid" },
  ] as Card[]
).map((card, seq) => ({ card, seq, delay: null }));

function CardGlyph({
  card,
  seq,
  selected,
  leaving,
  shaking,
  delay,
  style,
  onClick,
  ref,
}: {
  card: Card;
  seq: number;
  selected: boolean;
  leaving: boolean;
  shaking: boolean;
  delay: number | null;
  style?: React.CSSProperties;
  onClick: () => void;
  ref?: React.Ref<SVGSVGElement>;
}) {
  const { shape, count, shading } = card;
  const maskId = `set-${useId()}`;
  const glowId = `${maskId}-glow`;
  const clips: React.ReactNode[] = [];
  const cut: React.ReactNode[] = [];

  COUNTS[count].forEach((cy, i) => {
    const d = SHAPES[shape](cy);
    if (shading === "solid") {
      cut.push(<path key={i} d={d} fill="#000" />);
    } else if (shading === "open") {
      // round joins on the squiggle only; the diamond keeps its sharp points
      cut.push(
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#000"
          strokeWidth={3.2}
          strokeLinejoin={shape === "squiggle" ? "round" : "miter"}
          strokeLinecap={shape === "squiggle" ? "round" : "butt"}
        />,
      );
    } else {
      // striped: clip a run of thin bars to the symbol so only it shows stripes
      const clipId = `${maskId}-c${i}`;
      const bars: React.ReactNode[] = [];
      for (let y = cy - HH; y <= cy + HH; y += 3.4) {
        bars.push(
          <rect key={y} x={26} y={y} width={48} height={1.8} fill="#000" />,
        );
      }
      clips.push(
        <clipPath key={i} id={clipId}>
          <path d={d} />
        </clipPath>,
      );
      cut.push(
        <g key={i} clipPath={`url(#${clipId})`}>
          {bars}
        </g>,
      );
    }
  });

  // Tapping is the whole interaction, so it has to survive iOS: no
  // double-tap-to-zoom, and the cursor Safari wants before it delivers a click
  // to a plain <svg>. The invisible rect widens the target into the gutters —
  // a 24px-wide card is a small thing to hit with a thumb.
  return (
    <svg
      ref={ref}
      viewBox="22 6 56 88"
      aria-hidden
      onClick={onClick}
      className={`${CARD_SIZE} ${SHADOW} ${LAYER} shrink-0 touch-manipulation overflow-visible pointer-coarse:cursor-pointer ${shaking ? `animate-[shake_${SHAKE_MS}ms_ease-in-out]` : ""}`}
      style={{
        opacity: leaving ? 0 : 1,
        // Only on the way out — coming back the redealt art fades itself in.
        transition: leaving ? `opacity ${EXIT_MS}ms ease-out` : "none",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      <defs>
        {clips}
        {/* The selection glow: the card's solid silhouette blurred, with the
            silhouette itself cut back out — a halo round the outside only, so
            nothing shines through the punched-out symbols. */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          <feComposite in="blur" in2="SourceAlpha" operator="out" />
        </filter>
      </defs>
      {/* The deal's fade-in lives here, not on the <svg>: an inline animation
          there would outrank the shake's class. `seq` keys this rather than the
          <svg>, so a redeal remounts the art without relaying out the row. */}
      <g
        key={seq}
        style={{
          animation:
            delay === null
              ? undefined
              : `set-deal ${DEAL_MS}ms ease-out ${delay}ms both`,
        }}
      >
        <path
          d={CARD}
          fill="var(--color-meeple)"
          filter={`url(#${glowId})`}
          style={{
            opacity: selected ? 1 : 0,
            transition: "opacity 300ms ease-out",
          }}
        />
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100"
          height="100"
        >
          <path d={CARD} fill="#fff" />
          {cut}
        </mask>
        <path d={CARD} fill={CHARCOAL} mask={`url(#${maskId})`} />
      </g>
      <rect x={6} y={-4} width={88} height={108} fill="transparent" />
    </svg>
  );
}

// The prize: a card with a letter punched out where the symbols would be.
function LetterGlyph({ letter, delay }: { letter: string; delay: number }) {
  const maskId = `set-${useId()}`;
  return (
    <svg
      viewBox="22 6 56 88"
      aria-hidden
      className={`${CARD_SIZE} ${SHADOW} ${LAYER} shrink-0`}
      style={{ animation: `set-deal ${DEAL_MS}ms ease-out ${delay}ms both` }}
    >
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="100"
        height="100"
      >
        <path d={CARD} fill="#fff" />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-space-grotesk), system-ui, sans-serif"
          fontWeight="700"
          fontSize="40"
          fill="#000"
        >
          {letter}
        </text>
      </mask>
      <path d={CARD} fill={CHARCOAL} mask={`url(#${maskId})`} />
    </svg>
  );
}

const CODE = "PERFECTSET";

type Play = { level: number; board: (Slot | null)[] };

export default function SetCardDivider() {
  // null until the first tap: the row rests on FIRST's four like any other.
  const [play, setPlay] = useState<Play | null>(null);
  const [won, setWon] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [leaving, setLeaving] = useState<number[]>([]);
  const [shaking, setShaking] = useState(false);
  // The resting four's box, held once play starts so the row around it (the
  // hairlines) never relays out; the table hangs from it, centred.
  const [frame, setFrame] = useState<{ width: number; height: number }>();
  // The table's height, and how far it runs over each hairline.
  const [table, setTable] = useState<{ height: number; overhang: number }>();
  // Counts up from FIRST's keys. Kept here, not at module level, so a hot
  // reload can't restart it under a board that's still holding old keys.
  const seq = useRef(FIRST.length);
  const mint = () => seq.current++;
  const centre = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  const playing = play !== null;
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    // The table sits over the hairlines, which give way (and keep the gap
    // they had to the icons).
    const ro = new ResizeObserver(() => {
      const box = centre.current!.getBoundingClientRect();
      const icons = centre.current!.closest("[data-puzzle-game]")!;
      const row = icons.parentElement!;
      const hairline = row.firstElementChild!.getBoundingClientRect().right;
      const reach = box.left - hairline;
      const keep = icons.getBoundingClientRect().left - hairline;
      const excess = (el.offsetWidth - box.width) / 2;
      setTable({
        height: el.offsetHeight,
        overhang: Math.max(0, excess - reach + keep),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [playing]);

  const onClick = (i: number) => {
    if (leaving.length || shaking || won) return;
    if (!play) {
      const { width, height } = centre.current!.getBoundingClientRect();
      setFrame({ width, height });
      setLeaving(FIRST.map((_, j) => j));
      setTimeout(() => {
        setPlay({ level: 0, board: dealLevel(0, mint) });
        setLeaving([]);
      }, EXIT_MS);
      return;
    }
    if (!play.board[i]) return;
    if (picked.includes(i)) {
      setPicked(picked.filter((p) => p !== i));
      return;
    }
    const next = [...picked, i];
    setPicked(next);
    if (next.length < 3) return;
    const [a, b, c] = next.map((p) => play.board[p]!.card);
    if (!isSet(a, b, c)) {
      setShaking(true);
      setTimeout(() => {
        setShaking(false);
        setPicked([]);
      }, SHAKE_MS);
      return;
    }
    // A found set leaves a gap. A table with no set left on it is a dead end;
    // a reload starts over.
    setLeaving(next);
    setTimeout(() => {
      const board = play.board.map((s, j) => (next.includes(j) ? null : s));
      const level = play.level + 1;
      if (board.some(Boolean)) {
        setPlay({ ...play, board });
      } else if (level < LEVELS.length) {
        setPlay({ level, board: dealLevel(level, mint) });
      } else {
        setPlay({ ...play, board });
        setWon(true);
        trackEgg({ egg: "set", event: "win" });
      }
      setPicked([]);
      setLeaving([]);
    }, EXIT_MS);
  };

  const glyph = (slot: Slot, i: number) => (
    <CardGlyph
      key={slot.seq}
      card={slot.card}
      seq={slot.seq}
      delay={slot.delay}
      selected={picked.includes(i)}
      leaving={leaving.includes(i)}
      shaking={shaking && picked.includes(i)}
      onClick={() => onClick(i)}
    />
  );

  return (
    <DividerRow game="set" overhang={playing ? table?.overhang : undefined}>
      <div
        ref={centre}
        className="relative flex items-center gap-[22px] md:gap-[34px]"
        style={
          play && frame
            ? {
                width: frame.width,
                height: table?.height ?? frame.height,
                transition: "height 400ms ease-out",
              }
            : undefined
        }
      >
        {!play && FIRST.map(glyph)}
        {play && (
          <div
            ref={stage}
            className="absolute top-0 left-1/2 w-max -translate-x-1/2"
          >
            {won ? (
              <div className="flex flex-col items-center gap-3">
                <span className="sr-only">{`${CODE} for $27 off`}</span>
                <div className="flex gap-1.5 md:gap-2">
                  {[...CODE].map((ch, i) => (
                    <LetterGlyph
                      key={i}
                      letter={ch}
                      delay={LEVEL_PAUSE_MS + i * STAGGER_MS}
                    />
                  ))}
                </div>
                <p
                  aria-hidden
                  className="text-xs leading-4 font-semibold whitespace-nowrap text-ink/70 md:text-sm"
                  style={{
                    animation: `set-deal ${DEAL_MS}ms ease-out ${LEVEL_PAUSE_MS + CODE.length * STAGGER_MS}ms both`,
                  }}
                >
                  3<sup>3</sup> = $27 off your ticket at checkout
                </p>
              </div>
            ) : (
              // Tighter on a phone, so nine across fit.
              <div
                className="grid gap-3 md:gap-x-[34px] md:gap-y-4"
                style={{
                  gridTemplateColumns: `repeat(${LEVELS[play.level].cols}, auto)`,
                }}
              >
                {play.board.map((slot, i) =>
                  slot ? (
                    glyph(slot, i)
                  ) : (
                    <span key={`gap-${i}`} className={CARD_SIZE} />
                  ),
                )}
              </div>
            )}
          </div>
        )}
        {/* Levels cleared, one pip each, hung under the table so nothing
            shifts. */}
        {play && !won && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-full left-1/2 mt-3 flex -translate-x-1/2 gap-2"
          >
            {LEVELS.map((_, i) => (
              <span
                key={i}
                className="size-1 rounded-full transition-opacity duration-500"
                style={{
                  background: CHARCOAL,
                  opacity: i < play.level ? 1 : 0.2,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </DividerRow>
  );
}
