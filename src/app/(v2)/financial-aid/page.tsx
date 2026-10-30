import type { Metadata } from "next";
import Journey from "@/v2/components/journey/Journey";

export const metadata: Metadata = {
  title: "Financial aid — Metagame 2026",
  description:
    "Apply for a free or reduced-price ticket to Metagame 2026 from the scholarship fund.",
};

export default function FinancialAidPage() {
  return <Journey slug="financial-aid" />;
}
