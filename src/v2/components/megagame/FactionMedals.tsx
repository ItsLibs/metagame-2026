import { FACTION_NAMES, type MegagameClass } from "@/lib/megagame-levels";
import { FactionMedal } from "./FactionPatch";

/**
 * A person's faction medals inline with their name: one small disc per
 * faction joined, text-height, named for screen readers and on hover.
 * Nothing when they've joined none, so bylines without picks don't change.
 */
export default function FactionMedals({
  factions,
  className,
}: {
  factions: MegagameClass[];
  className?: string;
}) {
  if (factions.length === 0) return null;
  return (
    <ul
      aria-label="Megagame factions"
      className={`inline-flex items-center gap-0.5 align-[-0.2em] ${className ?? ""}`}
    >
      {factions.map((f) => (
        <li key={f} title={FACTION_NAMES[f]} className="flex">
          <FactionMedal faction={f} className="size-[1.15em] rounded-full" />
          <span className="sr-only">{FACTION_NAMES[f]}</span>
        </li>
      ))}
    </ul>
  );
}
