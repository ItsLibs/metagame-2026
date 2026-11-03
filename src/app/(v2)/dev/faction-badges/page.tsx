import { notFound } from "next/navigation";
import { type MegagameClass } from "@/lib/megagame-levels";
import CastlingDivider from "@/v2/components/dividers/castling";
import SpeakersSection from "@/v2/components/SpeakersSection";

export const metadata = { title: "Faction badges", robots: { index: false } };

// Stand-in picks for the speaker cards, so the medals can be judged against
// photos. A real card's medals come from the factions that speaker has joined
// on their own account.
const STAND_INS: MegagameClass[][] = [
  ["pirate"],
  ["wizard"],
  ["alien"],
  ["pirate", "alien"],
  ["wizard"],
  ["wizard", "pirate", "alien"],
  [],
  ["alien"],
  ["wizard", "alien"],
  [],
  ["pirate"],
  ["alien", "pirate", "wizard"],
];

// Dev-only preview of the speaker cards' faction medals: the home page's
// speakers section as it is, with stand-in picks on the cards. 404s in
// production builds.
export default function FactionBadgesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <>
      <CastlingDivider />
      <SpeakersSection
        factionsFor={(_, i) => STAND_INS[i % STAND_INS.length]}
        note={
          <p className="mt-3 text-center font-space-mono text-xs tracking-[0.12em] text-meeple uppercase">
            Dev preview · stand-in faction picks, not these speakers&apos; real
            ones
          </p>
        }
      />
    </>
  );
}
