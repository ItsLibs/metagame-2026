import { airtableConfig } from "@/lib/airtable-config";
import { SPONSOR_FORM_URL } from "@/v2/lib/links";
import type { FormDef } from "./engine";
import { opts } from "./shared";

// Sponsor interest, as the Airtable form asks it. It writes to Interest
// Intake, like the email signups.
export const sponsor: FormDef = {
  slug: "sponsor",
  path: SPONSOR_FORM_URL,
  tableId: airtableConfig.signupsTableId,
  name: "Sponsor interest",
  eyebrow: "Sponsor Metagame 2026",
  title: "Back the game.",
  pitch:
    "Thanks for thinking of sponsoring Metagame. Give us a few details and we'll reach out. What each tier includes is on the [sponsor page](/sponsor).",
  facts: [
    { label: "Takes", value: "About a minute" },
    { label: "Then", value: "We reach out" },
  ],
  steps: [
    {
      key: "you",
      title: "Who's sponsoring?",
      items: [
        {
          key: "name",
          field: "fld42qY2zzbMKiZAC",
          type: "text",
          label: "Your name",
          required: true,
          autoComplete: "name",
        },
        {
          key: "email",
          field: "fld0okgOArTQTNUir",
          type: "email",
          label: "Email",
          required: true,
          autoComplete: "email",
        },
        {
          key: "company",
          field: "fldb4I32HWFaiFWWd",
          type: "text",
          label: "Company or sponsoring entity",
          autoComplete: "organization",
        },
      ],
    },
    {
      key: "tier",
      title: "Pick a tier",
      intro: "Not sure yet? Pick Other and tell us what you have in mind.",
      items: [
        {
          key: "tier",
          field: "fldvRIark8ZyTFpNf",
          type: "choice",
          label: "Sponsorship tier",
          options: opts(
            "Headline",
            "Platinum",
            "Gold",
            "Silver",
            "Patron",
            "Other",
          ),
        },
        {
          key: "notes",
          field: "fldBaSmooUULI2bbe",
          type: "longtext",
          label: "Notes",
        },
      ],
    },
  ],
  done: {
    title: "We'll be in touch.",
    body: "Thanks for backing Metagame. Someone from the team will reach out soon.",
    links: [
      { label: "See the sponsor tiers", href: "/sponsor" },
      { label: "Back to the rulebook", href: "/" },
    ],
  },
};
