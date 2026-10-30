import type { Metadata } from "next";
import Journey from "@/v2/components/journey/Journey";

export const metadata: Metadata = {
  title: "Sponsor interest — Metagame 2026",
  description:
    "Interested in sponsoring Metagame 2026? Tell us a little and we'll reach out.",
};

export default function SponsorInterestPage() {
  return <Journey slug="sponsor" />;
}
