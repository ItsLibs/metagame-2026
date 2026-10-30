import type { Metadata } from "next";
import Journey from "@/v2/components/journey/Journey";

export const metadata: Metadata = {
  title: "Night Market booth application — Metagame 2026",
  description:
    "Apply to run a booth at the Metagame Night Market, Friday, Nov 6, 7–10 pm, open to the public.",
};

export default function NightMarketApplyPage() {
  return <Journey slug="night-market" />;
}
