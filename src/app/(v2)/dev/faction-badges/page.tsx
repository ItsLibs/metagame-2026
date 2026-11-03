import { notFound } from "next/navigation";
import { type MegagameClass } from "@/lib/megagame-levels";
import CastlingDivider from "@/v2/components/dividers/castling";
import SectionHeading from "@/v2/components/SectionHeading";
import SpeakerCard from "@/v2/components/SpeakerCard";
import SpeakerCtaCard from "@/v2/components/SpeakerCtaCard";
import { SECTION } from "@/v2/components/styles";
import { SPEAKERS } from "@/v2/data/speakers";
import { RFP_FORM_URL } from "@/v2/lib/links";

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
      <section id="speakers" className={`${SECTION} md:py-14`}>
        <div className="mx-auto max-w-[1180px] px-8">
          <SectionHeading eyebrow="Who will be there?" title="Speakers" />
          <p className="mt-3 text-center font-space-mono text-xs tracking-[0.12em] text-meeple uppercase">
            Dev preview · stand-in faction picks, not these speakers&apos; real
            ones
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-5">
            {SPEAKERS.map((speaker, i) => (
              <div
                key={speaker.name}
                className="w-[calc(33.333%-0.3334rem)] sm:w-[calc(33.333%-0.8334rem)] lg:w-[calc(25%-0.9375rem)]"
              >
                <SpeakerCard
                  {...speaker}
                  factions={STAND_INS[i % STAND_INS.length]}
                />
              </div>
            ))}
            <div className="w-[calc(33.333%-0.3334rem)] sm:w-[calc(33.333%-0.8334rem)] lg:w-[calc(25%-0.9375rem)]">
              <SpeakerCtaCard href={RFP_FORM_URL} />
            </div>
          </div>
          <p className="mt-8 text-center text-base text-ink/70">
            And many more coming soon&hellip;
          </p>
        </div>
      </section>
    </>
  );
}
