import type { Metadata } from "next";
import Journey from "@/v2/components/journey/Journey";

export const metadata: Metadata = {
  title: "Build part of the Megagame — Metagame 2026",
  description:
    "Submit a puzzle or game for the Megagame, the puzzle hunt, game gauntlet and story that runs all weekend at Metagame 2026.",
};

export default function MegagameBuildPage() {
  return <Journey slug="megagame" />;
}
