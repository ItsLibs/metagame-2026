import { airtableConfig } from "@/lib/airtable-config";
import { MEGAGAME_PROPOSAL_FORM_URL, RFP_FORM_URL } from "@/v2/lib/links";
import type { FormDef } from "./engine";
import { opts } from "./shared";

// A puzzle or game for the Megagame, as the Airtable form asks it. The
// spoilers (the factions and the elements they're after) only show to those
// who ask for them.
export const megagame: FormDef = {
  slug: "megagame",
  path: MEGAGAME_PROPOSAL_FORM_URL,
  tableId: airtableConfig.megagameSubmissionsTableId,
  name: "Megagame puzzle or game",
  eyebrow: "The Megagame · puzzles & games",
  title: "Build part of the Megagame.",
  pitch:
    "The Megagame starts when you step through the gate and runs all weekend: one part puzzle hunt, one part game gauntlet, one part interlocking story, threaded through the rest of Metagame. Last year about 30 people contributed puzzles and games. We're after more, especially ones that work in alliances, maps, alchemy, space travel, gems or stars.",
  facts: [
    { label: "Takes", value: "About 10 minutes" },
    { label: "Was due", value: "Oct 10" },
    { label: "Attending?", value: "Not required" },
  ],
  notice: `On difficulty: as a crossword, a Friday or Saturday NYT. The late MIT Mystery Hunt is too hard, the early rounds about right, and we'll want plenty of easier 15-minute puzzles too. Got a session and want the Megagame in it? Say so on the [session proposal](${RFP_FORM_URL}).`,
  steps: [
    {
      key: "game",
      title: "What are you making?",
      intro:
        "Tell us as much as you like. It helps most to say which parts are fixed and which could easily change if we asked.",
      items: [
        {
          key: "kind",
          field: "flddvKrskxNgGNCl9",
          type: "choice",
          label: "What kind of thing is it?",
          required: true,
          // The first four and Other are Airtable's; the rest are added to
          // the field (by typecast) the first time someone picks them.
          options: [
            { value: "Tabletop Board/Card Game", glyph: "board-games" },
            { value: "Puzzle", glyph: "puzzles" },
            { value: "Role-playing Game", glyph: "larps" },
            { value: "Video Game", glyph: "video-games" },
            { value: "LARP", glyph: "larps" },
            { value: "Escape Room", glyph: "escape-rooms" },
            { value: "Scavenger Hunt" },
            { value: "Word Game", glyph: "crosswords" },
            { value: "Trivia", glyph: "trivia" },
            { value: "Party/Social Game", glyph: "party-games" },
            { value: "Physical Challenge" },
            {
              value: "Other",
              more: {
                key: "kindOther",
                label: "What kind of thing it is",
                into: "description",
              },
            },
          ],
        },
        {
          key: "title",
          field: "fldKe1Q2avmln1MXl",
          type: "text",
          label: "Its title",
          help: "A working title is fine.",
        },
        {
          key: "description",
          field: "fldLbUVlw9RcMLEUR",
          type: "longtext",
          label: "Describe it",
          required: true,
        },
      ],
    },
    {
      key: "play",
      title: "How does it play?",
      items: [
        {
          key: "age",
          field: "fldKyyMBfS0hxDJx2",
          type: "choices",
          label: "Who's it for?",
          required: true,
          options: [
            ...opts(
              "All ages",
              "Primarily for children/teens?",
              "Adults only (18+)",
            ),
            {
              value: "Other",
              more: {
                key: "ageOther",
                label: "Who it's for",
                into: "description",
              },
            },
          ],
        },
        {
          key: "minPlayers",
          field: "fldE111n1ccDpMr4w",
          type: "number",
          label: "Fewest players",
          min: 1,
          max: 1000,
        },
        {
          key: "maxPlayers",
          field: "fldJ2mK2mcxm3YDWr",
          type: "number",
          label: "Most players",
          help: "No maximum? Say 100, or leave it blank.",
          min: 1,
          max: 1000,
        },
        {
          key: "teams",
          field: "fldj2tswW75BJciI4",
          type: "choices",
          label: "Played in teams? How many?",
          options: opts(
            "0 (individuals only)",
            "1 (cooperative)",
            "2",
            "3",
            "4",
            "5",
            "6",
            ">6",
          ),
        },
        {
          key: "minutes",
          field: "fldjuIJl7dNI3oocb",
          type: "number",
          label: "How many minutes does it take?",
          help: "Assume half the players don't know the rules, if it uses existing ones.",
          min: 1,
          max: 10000,
        },
      ],
    },
    {
      key: "needs",
      title: "What does it need?",
      items: [
        {
          key: "materials",
          field: "fldjogoPanvFzks1Z",
          type: "longtext",
          label: "Materials and requirements",
          help: "What do you need to make it happen? What will you bring, and what would we need to provide?",
        },
        {
          key: "preexisting",
          field: "fldoPLQxwYoqHhwh5",
          type: "choice",
          label:
            "Will it happen at Metagame even if it's not part of the Megagame?",
          options: opts(
            "Definitely Happening",
            "May Happen",
            "Will Not Happen",
          ),
        },
      ],
    },
    {
      key: "output",
      title: "What does solving it give?",
      intro:
        "The Megagame chains puzzles together. Could yours hand out a result we can use as a clue or lead for another step?",
      items: [
        {
          key: "output",
          field: "fldmnRZvkyd3GX0EP",
          type: "choices",
          label: "Which kinds of result could it give?",
          required: true,
          options: opts(
            "Word",
            "String of letters",
            "String of numbers",
            "Coordinates",
            "Image",
            "Physical token",
            "None of the above",
          ),
        },
      ],
    },
    {
      key: "spoilers",
      title: "Spoilers?",
      intro:
        "We know more about this year's themes, but knowing them spoils the surprise. Some people would rather not, and still want to make something.",
      items: [
        {
          key: "spoilers",
          field: "fld57efCgXtANO2kJ",
          type: "toggle",
          label: "Show me the spoilers",
          text: "Yes, tell me the themes. I don't mind knowing.",
        },
        {
          type: "note",
          key: "themes",
          tone: "info",
          title: "Pirates, Wizards and Aliens",
          body: "Players join three factions and can move between them: Pirates, Wizards, and Aliens/Astronauts. Each pursues its own goal, and they can collaborate as much as they compete: repairing the crashed spaceship with recovered parts, finding and hoarding treasure, completing star charts and a lost tome. Word games lean wizard, logic puzzles alien, physical tasks and searches pirate, but none of that is a rule: a word game about the Caribbean goes to the pirates.",
          show: (a) => a.spoilers === true,
        },
        {
          key: "elements",
          field: "flds2AXpXTJDHRZ4s",
          type: "choices",
          label: "Elements you could include or adapt",
          options: opts(
            "Pirates",
            "Wizards",
            "Aliens",
            "Stars",
            "Navigation",
            "Word games/Ciphers",
            "Logic/Deduction",
            "Dexterity/Speed/Strength",
            "Exploration/Searching",
            "Construction",
            "Trading/Negotiation",
            "Jigsaws",
          ),
          show: (a) => a.spoilers === true,
        },
        {
          key: "themeIdeas",
          field: "fldCTZWoV4PjkezbW",
          type: "longtext",
          label: "Theme ideas",
          help: "What themes would you like to include, or be willing to? If you read the spoilers, skip those and add anything else that seems helpful.",
        },
      ],
    },
    {
      key: "contact",
      title: "How do we reach you?",
      intro: "We'll want to talk to you!",
      items: [
        {
          key: "name",
          field: "fldTqzxnASesmYX4X",
          type: "text",
          label: "Your name",
          required: true,
          autoComplete: "name",
        },
        {
          key: "email",
          field: "fldgegcVZpKUTiu7I",
          type: "email",
          label: "Email",
          required: true,
          autoComplete: "email",
        },
        {
          key: "phone",
          field: "fldrkSLCbbb1gbNVM",
          type: "phone",
          label: "Phone",
          autoComplete: "tel",
        },
        {
          key: "otherContact",
          field: "fldBuhCqNVLwNhYwE",
          type: "text",
          label: "Other contact info",
          help: "Say which app, like Discord @cool_designer or Signal designer.1337.",
        },
      ],
    },
    {
      key: "lastYear",
      title: "Were you here last year?",
      items: [
        {
          key: "lastYear",
          field: "fldCHYyOzYiMqkeXX",
          type: "choices",
          label: "Your part in Metagame 2025",
          options: opts(
            "Ran a Megagame Session",
            "Ran a Session/Game, not part of the Megagame",
            "Contributed Part of the Megagame",
            "Attended (but not the others)",
            "Did not attend",
          ),
        },
      ],
    },
  ],
  done: {
    title: "Your piece is in the pile.",
    body: "The Megagame team will look it over and be in touch about where it fits.",
    links: [
      { label: "Read about the Megagame", href: "/#megagame" },
      { label: "Propose a session too", href: RFP_FORM_URL },
    ],
  },
};
