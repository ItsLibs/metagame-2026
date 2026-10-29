import { airtableConfig } from "@/lib/airtable-config";
import {
  JOIN_TEAM_AIRTABLE_FORM,
  JOIN_TEAM_FORM_URL,
  RFP_FORM_URL,
  VOLUNTEER_APPLY_PATH,
} from "@/v2/lib/links";
import type { FormDef } from "./engine";
import { picked } from "./engine";

// The interest form from /team, as the Airtable form asks it. Like the email
// signups, it writes to Interest Intake.
export const joinTeam: FormDef = {
  slug: "join-team",
  path: JOIN_TEAM_FORM_URL,
  tableId: airtableConfig.signupsTableId,
  airtableForm: JOIN_TEAM_AIRTABLE_FORM,
  name: "Get involved",
  eyebrow: "Get involved · Metagame 2026",
  title: "Help make Metagame.",
  pitch:
    "Metagame 2026 is November 6–8 in Berkeley, California. If you'd like to get involved, this is the best place to say so, and we'll follow up with more.",
  facts: [
    { label: "Takes", value: "About a minute" },
    { label: "Then", value: "We follow up" },
  ],
  glyph: "party-games",
  token: "bg-sky text-navy",
  steps: [
    {
      key: "you",
      title: "Who are you?",
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
      ],
    },
    {
      key: "interest",
      title: "What would you like to do?",
      intro: "Pick all that apply.",
      items: [
        {
          key: "interests",
          field: "fldmLx6E4fpMxaVHw",
          type: "choices",
          label: "I'm interested in…",
          options: [
            {
              value: "volunteering",
              label: "Volunteering",
              glyph: "party-games",
            },
            { value: "speaking", label: "Speaking", glyph: "talks" },
            { value: "organizing", label: "Organizing", glyph: "workshops" },
            { value: "sponsoring", label: "Sponsoring", glyph: "megagame" },
            {
              value: "email list",
              label: "The email list",
              glyph: "crosswords",
            },
          ],
        },
        {
          key: "skills",
          field: "fldhoOZd0qyAwizuS",
          type: "longtext",
          label: "Any cool skills that'd help at a conference?",
          help: "Photography, EMT training, you've run conferences before… Leave it blank if you like: we're thrilled you want to help.",
          show: (a) =>
            picked(a.interests, "volunteering") ||
            picked(a.interests, "organizing"),
        },
        {
          key: "company",
          field: "fldb4I32HWFaiFWWd",
          type: "text",
          label: "What name would you sponsor as?",
          help: "Your company, organization, or self, as you'd like it listed.",
          show: (a) => picked(a.interests, "sponsoring"),
        },
      ],
    },
    {
      key: "else",
      title: "Anything else?",
      items: [
        {
          key: "notes",
          field: "fldBaSmooUULI2bbe",
          type: "longtext",
          label: "Anything else you want to share?",
          help: "Jokes? Insults? Puns?",
        },
      ],
    },
  ],
  done: {
    title: "You're in.",
    body: "Thanks! We'll follow up with more soon. Can't wait? Jump straight in:",
    links: [
      { label: "Apply to volunteer", href: VOLUNTEER_APPLY_PATH },
      { label: "Propose a session", href: RFP_FORM_URL },
    ],
  },
};
