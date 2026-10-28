import { airtableConfig } from "@/lib/airtable-config";
import { RFP_AIRTABLE_FORM, RFP_FORM_URL } from "@/v2/lib/links";
import type { FormDef } from "./engine";
import { opts } from "./shared";

// The request for proposals: a session (talk, game, workshop, anything) for
// the program, as the Airtable form asks it. Lands in RFP Submissions, where
// the speaker committee grades it.
export const propose: FormDef = {
  slug: "propose",
  path: RFP_FORM_URL,
  tableId: airtableConfig.rfpSubmissionsTableId,
  airtableForm: RFP_AIRTABLE_FORM,
  eyebrow: "Request for proposals · Metagame 2026",
  title: "Run something at Metagame.",
  pitch:
    "A talk, a game, a workshop, or something stranger: if you'd like to run it at Metagame this November 6–8, pitch it here. For inspiration, see [last year's program](/last-year) and [what's already on this year's](/sessions).",
  facts: [
    { label: "Takes", value: "About 10 minutes" },
    { label: "Was due", value: "Oct 5" },
    { label: "This is", value: "Not a puzzle" },
  ],
  notice:
    "The proposal deadline has passed. You can still submit, and we may consider it, but we're less committed to doing so. Need an answer quickly? Say so in the last step.",
  glyph: "talks",
  token: "bg-sky text-navy",
  steps: [
    {
      key: "host",
      title: "Who's running it?",
      items: [
        {
          key: "name",
          field: "fldniBh49aomPd5hd",
          type: "text",
          label: "Your name",
          required: true,
          autoComplete: "name",
        },
        {
          key: "email",
          field: "fldNNl1m58zR43KUB",
          type: "email",
          label: "Email address",
          required: true,
          autoComplete: "email",
        },
        {
          key: "cohosts",
          field: "fldXxvUxOJbApec8G",
          type: "text",
          label: "Cohosts",
          help: "Running it with others? Their names here. It might just be you.",
        },
      ],
    },
    {
      key: "kind",
      title: "What kind of thing is it?",
      intro: "Pick everything that applies.",
      items: [
        {
          key: "category",
          field: "fldYq5ZlqNDwRKLRu",
          type: "choices",
          label: "Category",
          options: [
            { value: "Lecture / talk", glyph: "talks" },
            { value: "Panel", glyph: "talks" },
            { value: "Workshop", glyph: "workshops" },
            { value: "Board/card game", glyph: "board-games" },
            { value: "Playtesting something in progress", glyph: "card-games" },
            { value: "TTRPG", glyph: "larps" },
            { value: "Immersive experience", glyph: "escape-rooms" },
            { value: "LARP", glyph: "larps" },
            { value: "Competition / tournament", glyph: "trivia" },
            { value: "Social deception game", glyph: "party-games" },
            { value: "Puzzle", glyph: "puzzles" },
            { value: "Puzzle huntish thing", glyph: "crosswords" },
            { value: "Jubensha", glyph: "party-games" },
            { value: "Icebreakery activity", glyph: "party-games" },
            { value: "Physical activity" },
            { value: "Q&A", glyph: "talks" },
            { value: "Selling or demoing a product", glyph: "video-games" },
            {
              value: "Part of the Megagame (see more info below)",
              label: "Part of the Megagame",
              glyph: "megagame",
            },
            {
              value: "Something weirder than any of the above options",
              label: "Something weirder than all of these",
            },
            {
              value: "Other",
              more: {
                key: "categoryOther",
                label: "What kind of thing it is",
                into: "context",
              },
            },
          ],
        },
      ],
    },
    {
      key: "pitch",
      title: "Name it and pitch it",
      intro:
        "This is how it'll read on the schedule. You can edit it all later.",
      items: [
        {
          key: "title",
          field: "fldUiKcH1uUsVqig6",
          type: "text",
          label: "Title",
          help: "A working title is fine: it's what goes on the schedule until you change it.",
          required: true,
          max: 120,
        },
        {
          key: "description",
          field: "fldndEfMtSxIRBld0",
          type: "longtext",
          label: "Description for the schedule",
          help: "A brief blurb, two or three sentences. It'll be public.",
          required: true,
          max: 800,
        },
        {
          key: "context",
          field: "fldCdTcIyzpR20bJG",
          type: "longtext",
          label: "Tell us everything",
          help: "Your vision, how you plan to run it, how far along the idea is. Only the team sees this.",
        },
      ],
    },
    {
      key: "logistics",
      title: "When and where",
      items: [
        {
          key: "duration",
          field: "fldjX0LtQNCdGFisr",
          type: "text",
          label: "How long does it run?",
          placeholder: "1 hour",
          required: true,
          max: 80,
        },
        {
          key: "timing",
          field: "fldPhrhxovWJ3V5kn",
          type: "longtext",
          label: "Timing needs",
          help: 'For example, "I can\'t run this on Friday" or "it must be at night, but any night works."',
        },
        {
          key: "space",
          field: "fldITeLEeSaeZOfhl",
          type: "longtext",
          label: "Space needs",
          help: 'For example, "indoors, with a projector," "a round table for 7," "the room must go fully dark," or "a secret trapdoor that only opens when spoken to in Aramaic under a crescent moon."',
        },
      ],
    },
    {
      key: "players",
      title: "Who can play?",
      items: [
        {
          key: "minimum",
          field: "fldcG8kpbYamOUFMr",
          type: "number",
          label: "Fewest players it needs",
          help: "Not counting hosts. Leave it blank if anyone can drop in.",
          min: 0,
          max: 1000,
        },
        {
          key: "maximum",
          field: "fldRpAuLCHje72Z3b",
          type: "number",
          label: "Most players it can take",
          help: "Not counting hosts.",
          min: 0,
          max: 1000,
        },
        {
          key: "age",
          field: "fldICHNOyMQJq7RUz",
          type: "choices",
          label: "Who's it for?",
          required: true,
          options: [
            ...opts(
              "Appropriate for all ages",
              "Primarily for children",
              "Adults only (18+)",
            ),
            {
              value: "Other",
              more: { key: "ageOther", label: "Who it's for", into: "context" },
            },
          ],
        },
        {
          key: "application",
          field: "fldXgOwFbED8kH1Lj",
          type: "longtext",
          label: "Handpicking players?",
          help: "If people need to apply, link the application or describe the process and its timeline. Otherwise leave this blank.",
        },
        {
          key: "constraints",
          field: "fldlG50bYU7g1v8Qu",
          type: "longtext",
          label: "Anything that limits who'd want to come?",
          help: "Ability constraints, content warnings, anything else we should know.",
        },
      ],
    },
    {
      key: "profile",
      title: "Your host profile",
      intro:
        "Optional, but it saves us chasing you later. It shows on the public schedule.",
      items: [
        {
          key: "discord",
          field: "fldAlMupeupZbJUFk",
          type: "text",
          label: "Discord handle",
          placeholder: "@yourname",
        },
        {
          key: "picture",
          field: "fldxZvtxqGBAHEBO1",
          type: "file",
          label: "Picture",
          help: "It's public, so pick one you're happy for the internet to see. Not a fan of your face? Your cat or cactus works.",
          accept: ["image/jpeg", "image/png", "image/webp"],
          maxBytes: 3_000_000,
        },
        {
          key: "link",
          field: "fldKAUgbBp7BLGuwU",
          type: "text",
          label: "A link for your profile",
          help: "Ideally something games-related you do, though nearly any link is fine. Leave it blank for none.",
          placeholder: "https://",
        },
      ],
    },
    {
      key: "else",
      title: "Anything else?",
      items: [
        {
          key: "bespoke",
          field: "fldKp1AZCiV0TGNnc",
          type: "longtext",
          label: "Bespoke needs",
          help: 'Anything not covered yet, like "two giant chess sets on opposite ends of campus," or "this is really an ad for my product, which I\'ll also sell during the session."',
        },
        {
          key: "anythingElse",
          field: "fld4jmHBnJTAcy8Md",
          type: "longtext",
          label: "Anything else?",
          help: "Need an answer soon? Say so here and we'll try to speed it up.",
        },
      ],
    },
  ],
  done: {
    title: "Your proposal is in the deck.",
    body: "The speaker committee reads every proposal and will get back to you. Meanwhile, see what's already on this year's program.",
    links: [
      { label: "Browse the 2026 sessions", href: "/sessions" },
      { label: "See what happened last year", href: "/last-year" },
    ],
  },
};
