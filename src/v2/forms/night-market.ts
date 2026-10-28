import { airtableConfig } from "@/lib/airtable-config";
import {
  NIGHT_MARKET_AIRTABLE_FORM,
  NIGHT_MARKET_FORM_URL,
  NIGHT_PARTIFUL_URL,
} from "@/v2/lib/links";
import type { FormDef } from "./engine";

// A Night Market booth application, as the Airtable form asks it.
export const nightMarket: FormDef = {
  slug: "night-market",
  path: NIGHT_MARKET_FORM_URL,
  tableId: airtableConfig.nightMarketBoothsTableId,
  airtableForm: NIGHT_MARKET_AIRTABLE_FORM,
  eyebrow: "Night Market · Friday, Nov 6, 7–10 pm",
  title: "Open a booth.",
  pitch: `Run a booth at the Night Market: Friday night, open to the public, with priority for Metagame sponsors and attendees. Each booth comes with a six-foot table. Going as a visitor? [RSVP on Partiful](${NIGHT_PARTIFUL_URL}).`,
  facts: [
    { label: "Takes", value: "About 3 minutes" },
    { label: "Booth", value: "A six-foot table" },
    { label: "Costs", value: "Supporter ticket or $250" },
  ],
  notice:
    "A booth needs a Metagame Supporter ticket or $250 for the booth only. Applications depend on approval and space: applying, or buying a ticket, doesn't reserve a booth. Agreed something different with the team? Pick that option at the end and describe it; it still has to be confirmed.",
  glyph: "card-games",
  token: "bg-navy text-cream",
  steps: [
    {
      key: "you",
      title: "Who's running it?",
      items: [
        {
          key: "name",
          field: "fldL1ROlMbKNrn8zX",
          type: "text",
          label: "Your name",
          required: true,
          autoComplete: "name",
        },
        {
          key: "email",
          field: "fldt7pBJ2JaaRInLL",
          type: "email",
          label: "Email",
          required: true,
          autoComplete: "email",
        },
      ],
    },
    {
      key: "booth",
      title: "Your booth",
      items: [
        {
          key: "title",
          field: "fldvvxVaT14R0QR1q",
          type: "text",
          label: "Booth name",
          required: true,
          max: 120,
        },
        {
          key: "section",
          field: "fldpAokik4nK0MSpJ",
          type: "choices",
          label: "Which part of the market does it fit?",
          layout: "list",
          options: [
            {
              value: "Games and Puzzles",
              hint: "Your indie TTRPG, jigsaw, 5-dimensional Rubik's cube or escape room in a box. For sale! Right here!",
              glyph: "puzzles",
            },
            {
              value: "Other Physical Stuff",
              hint: "Arts, crafts, food, books: take-home things that aren't games or puzzles.",
              glyph: "card-games",
            },
            {
              value: "Experiences",
              hint: "Try on a weird VR bodysuit, get your fortune told, have a phenomenological time.",
              glyph: "escape-rooms",
            },
            {
              value: "Job Market",
              hint: "Hire, get hired, or promote your company or yourself. Open to both sides.",
              glyph: "talks",
            },
            {
              value: "Information Market",
              label: "Information Booth",
              hint: "Like a poster session, without the standards.",
              glyph: "crosswords",
            },
            {
              value: "Black Market",
              hint: "Rights to middle names, tickets to cheat in your next RPG… Black market goods must still be legal!",
              glyph: "larps",
            },
            { value: "Other", hint: "Too weird for any of the above." },
          ],
        },
        {
          key: "description",
          field: "fldHo9XH1DRRELl31",
          type: "longtext",
          label: "Describe your booth",
          help: "A short description. Visitors will see it, so keep it kosher.",
          required: true,
          max: 1000,
        },
      ],
    },
    {
      key: "setup",
      title: "Setting up",
      items: [
        {
          key: "notes",
          field: "fldqd3HuyaqfvjRWA",
          type: "longtext",
          label: "Anything else we should know?",
          help: "For the organizing team only: space, seating, power, loading or access needs. Requests are subject to confirmation. If you agreed something different with the team, say who you spoke with and what.",
        },
      ],
    },
    {
      key: "table",
      title: "Claim your table",
      items: [
        {
          key: "option",
          field: "fldgtJPt1LvtSBrzr",
          type: "choice",
          label: "How are you covering the booth?",
          required: true,
          layout: "list",
          options: [
            {
              value: "Supporter ticket",
              hint: "Your weekend ticket covers the booth. It's on the home page with the other tickets.",
            },
            {
              value: "$250 booth-only",
              hint: "Just the booth, for the Night Market.",
            },
            {
              value: "Separate arrangement discussed with the team",
              hint: "Describe it in the last step's notes.",
            },
          ],
        },
        {
          key: "acknowledged",
          field: "fldnV1WxTkQ5NV6dJ",
          type: "toggle",
          label: "The fine print",
          text: "I understand the pricing and the approval and space requirements above. Any separate arrangement must be confirmed by the team; this isn't a payment or a new fee agreement.",
          required: true,
        },
      ],
    },
  ],
  done: {
    title: "Your stall is on the map.",
    body: "Booths depend on approval and space, so this doesn't reserve one yet. We'll be in touch.",
    links: [
      { label: "RSVP on Partiful", href: NIGHT_PARTIFUL_URL },
      { label: "See the Supporter ticket", href: "/#tickets" },
    ],
  },
};
