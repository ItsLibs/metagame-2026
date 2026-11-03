import { notFound } from "next/navigation";
import {
  FACTION_NAMES,
  MEGAGAME_CLASSES,
  type MegagameClass,
} from "@/lib/megagame-levels";
import { FactionMedal } from "@/v2/components/megagame/FactionPatch";
import SpeakerCard from "@/v2/components/SpeakerCard";
import { SPEAKERS } from "@/v2/data/speakers";

export const metadata = { title: "Faction badges", robots: { index: false } };

// Stand-in picks on the first few real speaker cards, so the medals can be
// judged against photos. A real card's medals come from the factions that
// speaker has joined on their own account.
const STAND_INS: MegagameClass[][] = [
  ["pirate"],
  ["wizard"],
  ["alien"],
  ["pirate", "alien"],
  ["wizard"],
  ["wizard", "pirate", "alien"],
  [],
  ["alien"],
];

// The home page's speaker grid widths, so the cards here match it.
const CELL =
  "w-[calc(33.333%-0.3334rem)] sm:w-[calc(33.333%-0.8334rem)] lg:w-[calc(25%-0.9375rem)]";

// Dev-only preview of the speaker cards' faction medals: each at a large size
// and at the sizes a card uses, then pinned on real speaker cards. 404s in
// production builds.
export default function FactionBadgesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="min-h-dvh bg-background px-4 py-12 font-[family-name:var(--font-inter)] text-ink">
      <div className="mx-auto max-w-[1180px]">
        <p className="font-space-mono text-xs font-bold tracking-[0.16em] text-meeple uppercase">
          Megagame · Speakers
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-6xl leading-none text-navy">
          Faction badges
        </h1>

        <ul className="mt-10 flex flex-wrap gap-x-12 gap-y-8">
          {MEGAGAME_CLASSES.map((c) => (
            <li key={c} className="flex flex-col items-center gap-3">
              <div className="flex items-end gap-4">
                <FactionMedal faction={c} className="size-40" />
                <FactionMedal faction={c} className="size-12" />
                <FactionMedal faction={c} className="size-9" />
              </div>
              <span className="font-space-mono text-xs font-bold tracking-[0.12em] text-ink/70 uppercase">
                {FACTION_NAMES[c]}
              </span>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-[family-name:var(--font-bebas)] text-4xl leading-none text-navy">
          On speaker cards
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Stand-in picks, not these speakers&apos; real ones.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 sm:gap-5">
          {SPEAKERS.slice(0, STAND_INS.length).map((s, i) => (
            <div key={s.name} className={CELL}>
              <SpeakerCard
                name={s.name}
                title={s.title}
                titleUrl={s.titleUrl}
                photo={s.photo}
                hats={s.hats}
                logo={s.logo}
                factions={STAND_INS[i]}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
