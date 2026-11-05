import { FACTION_NAMES, type MegagameClass } from "@/lib/megagame-levels";
import { FactionMedal } from "./FactionPatch";

// Medals sit on a quarter-arc around the photo's top-right corner, overlapping
// like a hand of coins; hovering the group fans them apart along the arc with
// only a little push outward. Angles are degrees from the top edge, radii in
// medal widths (--s) from the corner.
type Arc = { rest: number[]; fanned: number[] };
const ARCS: Arc[] = [
  { rest: [], fanned: [] },
  { rest: [45], fanned: [45] },
  { rest: [34, 56], fanned: [14, 76] },
  { rest: [30, 45, 60], fanned: [6, 45, 84] },
];
const RADIUS = { rest: 0.58, fanned: 0.82 };
const TILTS = ["rotate-[-6deg]", "rotate-[6deg]", "rotate-[-4deg]"];
// Centre offsets (right, top) from the corner for an angle and radius.
const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
};

// Each faction's hover motion: lift and glow, roll like a ship, hover like a saucer.
const MOTION: Record<MegagameClass, string> = {
  wizard:
    "hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_0_16px_rgba(59,0,184,0.75)] focus-visible:-translate-y-1.5 focus-visible:rotate-0",
  pirate:
    "motion-safe:hover:animate-[mg-roll_1.4s_ease-in-out_infinite] motion-safe:focus-visible:animate-[mg-roll_1.4s_ease-in-out_infinite]",
  alien:
    "hover:rotate-0 focus-visible:rotate-0 motion-safe:hover:animate-[mg-hover_1.8s_ease-in-out_infinite] motion-safe:focus-visible:animate-[mg-hover_1.8s_ease-in-out_infinite]",
};

/**
 * The medals for the factions someone has joined, pinned to the top-right
 * corner of a card's photo: render it inside a `relative` wrapper around the
 * photo (speaker cards on the home page, the team's cards on /team). Each
 * medal names its faction in a tooltip and links to the Megagame tab, where
 * the viewer can join one too. Nothing when no faction is joined.
 */
export default function FactionMedals({
  factions,
}: {
  factions: MegagameClass[];
}) {
  if (factions.length === 0) return null;
  return (
    <ul
      aria-label="Megagame factions"
      className="absolute top-0 right-0 [--k:0] [--s:1.75rem] focus-within:[--k:1] hover:[--k:1] sm:[--s:2.5rem]"
    >
      {factions.map((f, i) => {
        const arc = ARCS[Math.min(factions.length, 3)];
        const at = polar(arc.rest[i], RADIUS.rest);
        const to = polar(arc.fanned[i], RADIUS.fanned);
        // The li holds the rest position; the wrapper inside eases
        // along the arc as the group's --k goes to 1.
        return (
          <li
            key={f}
            className="absolute"
            style={{
              zIndex: factions.length - i,
              top: `calc(var(--s) * ${at.y - 0.5})`,
              right: `calc(var(--s) * ${at.x - 0.5})`,
            }}
          >
            <div
              className="transition-[translate] duration-400 ease-[cubic-bezier(0.34,1.4,0.64,1)] motion-reduce:transition-none"
              style={{
                translate: `calc(var(--s) * ${(at.x - to.x).toFixed(3)} * var(--k)) calc(var(--s) * ${(to.y - at.y).toFixed(3)} * var(--k))`,
              }}
            >
              <a
                href="/account?tab=megagame"
                aria-label={`${FACTION_NAMES[f]} · Megagame`}
                className={`group peer block rounded-full shadow-[0_2px_6px_rgba(23,48,89,0.4)] ring-2 ring-[#FFFBF2] transition-[rotate,scale,translate,box-shadow] duration-300 outline-none hover:scale-110 focus-visible:scale-110 focus-visible:ring-meeple motion-reduce:transition-none ${TILTS[i]} ${MOTION[f]}`}
              >
                <FactionMedal
                  faction={f}
                  className="size-[var(--s)] rounded-full"
                />
              </a>
              <span
                role="tooltip"
                className="pointer-events-none absolute top-full right-0 z-10 mt-2 translate-y-1 rounded-md bg-navy px-2 py-1 font-[family-name:var(--font-bebas)] text-sm tracking-[0.04em] whitespace-nowrap text-cream opacity-0 shadow-[0_4px_12px_rgba(23,48,89,0.35)] transition duration-200 peer-hover:translate-y-0 peer-hover:opacity-100 peer-focus-visible:translate-y-0 peer-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                {FACTION_NAMES[f]}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
