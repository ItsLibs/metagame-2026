import type { Metadata } from "next";
import Journey from "@/v2/components/journey/Journey";

export const metadata: Metadata = {
  title: "Register your children — Metagame 2026",
  description:
    "Register every child coming to Metagame 2026. Under 13 is free, with free childcare for ages 5–12.",
};

export default function ChildRegistrationPage() {
  return <Journey slug="children" />;
}
