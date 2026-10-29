import {
  activeClasses,
  classLevelLabel,
  type MegagameLevels,
} from "@/lib/megagame-levels";

/** The person's non-zero Megagame classes, e.g. "Level 5 Wizard"; nothing if none. */
export default function MegagameClassLevels({
  levels,
}: {
  levels: MegagameLevels;
}) {
  const active = activeClasses(levels);
  if (active.length === 0) return null;
  return (
    <ul aria-label="Megagame classes" className="flex flex-wrap gap-2">
      {active.map(({ class: c, level }) => (
        <li
          key={c}
          className="rounded-full bg-navy px-3 py-1 text-sm font-semibold text-cream"
        >
          {classLevelLabel(c, level)}
        </li>
      ))}
    </ul>
  );
}
