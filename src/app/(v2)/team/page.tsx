import type { Metadata } from "next";
import { env } from "@/env";
import {
  activeFactions,
  NO_LEVELS,
  type MegagameLevels,
} from "@/lib/megagame-levels";
import { loadMegagameLevelsFor } from "@/lib/megagame-store";
import ContentPage from "@/v2/components/ContentPage";
import PersonCard from "@/v2/components/PersonCard";
import { HEADING } from "@/v2/components/styles";
import { Button } from "@/v2/components/ui/button";
import { ADVISORS, TEAM, type Person } from "@/v2/data/team";
import { JOIN_TEAM_FORM_URL } from "@/v2/lib/links";

export const metadata: Metadata = {
  title: "Team — Metagame 2026",
  description: "The people running Metagame 2026.",
};

// The cards' medals come from the database, so the page is rebuilt every ten
// minutes, and at once when someone on it picks a faction (account actions).
export const revalidate = 600;

// The accounts to look up: everyone on the page with a real id (TODO
// placeholders in team-accounts.ts have nothing to find).
const accountIds = (people: Person[]) =>
  people.flatMap((p) =>
    p.userId && !p.userId.startsWith("TODO") ? [p.userId] : [],
  );

export default async function TeamPage() {
  // The medals are decoration: with no database (CI's prerender) or a failing
  // query the cards just go without, as the home page's speakers do.
  const levels: Map<string, MegagameLevels> | null = env.DATABASE_URL
    ? await loadMegagameLevelsFor(accountIds([...TEAM, ...ADVISORS])).catch(
        (e: unknown) => {
          console.error("team megagame levels", e);
          return null;
        },
      )
    : null;
  const factionsFor = ({ userId }: Person) =>
    activeFactions((userId && levels?.get(userId)) || NO_LEVELS);

  return (
    <ContentPage
      eyebrow="Who's behind this?"
      title="The team"
      intro={
        <p>
          Metagame is run by a small group of game-lovers and powered by
          countless volunteers. Here are some of our faces.
        </p>
      }
    >
      <ul className="grid grid-cols-3 gap-2 sm:gap-6">
        {TEAM.map((person) => (
          <li key={person.name}>
            <PersonCard {...person} factions={factionsFor(person)} />
          </li>
        ))}
      </ul>

      <h2
        className={`${HEADING} mt-16 mb-6 text-[clamp(24px,3vw,34px)] text-navy`}
      >
        Advisors
      </h2>
      <ul className="grid grid-cols-3 gap-2 sm:gap-6">
        {ADVISORS.map((person) => (
          <li key={person.name}>
            <PersonCard {...person} factions={factionsFor(person)} />
          </li>
        ))}
      </ul>

      <p className={`${HEADING} mt-16 text-[clamp(24px,3vw,34px)] text-navy`}>
        Want to join the team? Let us know here:
      </p>
      <Button asChild variant="navy" size="lg" className="mt-6 text-lg">
        <a href={JOIN_TEAM_FORM_URL}>Get involved</a>
      </Button>
    </ContentPage>
  );
}
