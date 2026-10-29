import { airtableConfig } from "@/lib/airtable-config";
import {
  CHILD_REGISTRATION_AIRTABLE_FORM,
  CHILD_REGISTRATION_FORM_URL,
} from "@/v2/lib/links";
import type { Answers, FormDef, Step } from "./engine";
import { opts } from "./shared";

const kids = (a: Answers) => Number(a.count) || 0;

const TIMES = opts(
  "Friday afternoon (3pm-7pm, includes dinner)",
  "Saturday morning (9:45am-2:45pm, includes lunch)",
  "Saturday afternoon (5pm-7:30pm, includes dinner)",
  "Sunday morning (9:45am-3pm, includes lunch)",
  "Sunday afternoon (5pm-7:30pm, includes dinner)",
  "Other",
);

// Airtable has five fields for each of the first four children.
const CHILD_FIELDS = [
  [
    "fldbwI0byxE0Ehe8F",
    "fldcFNTARVwgMalTM",
    "fldsPPUcLgY1gamSP",
    "fldQ7Y4QY8vI8H8Wm",
    "fldqVRzRJmUnQQ8Jl",
  ],
  [
    "fldwNkH4SK6QhSRch",
    "fldP0UwiNTEjFPG1l",
    "fldifJWLCK1si9Pms",
    "fldEtbPCObtK2Trfb",
    "fldeCy3b1NvVvwXaL",
  ],
  [
    "fldpMDsRGHQbKg1Ii",
    "fld0vGk7H8Btue6aY",
    "fldrgiMVT5aIrHjrG",
    "fldGYiFtk3drHhtAM",
    "fldshenNhxZXQtgka",
  ],
  [
    "fldvfNyd37BogTxOr",
    "fldWhEoTwVPv9Tzss",
    "fldyNb9Z70QSnxmj7",
    "fldRZi4rY5HCiYVuE",
    "fldRLA9UFtUmOY8x5",
  ],
];
const ORDINAL = ["first", "second", "third", "fourth"];

const childStep = (i: number): Step => {
  const [name, age, times, medical, other] = CHILD_FIELDS[i];
  const n = i + 1;
  return {
    key: `child${n}`,
    title: `Child ${n}`,
    intro:
      n === 1 ? "Tell us about your first child." : `And your ${ORDINAL[i]}.`,
    show: (a) => kids(a) >= n,
    items: [
      {
        key: `child${n}Name`,
        field: name,
        type: "text",
        label: "Name",
        required: true,
      },
      {
        key: `child${n}Age`,
        field: age,
        type: "number",
        label: "Age",
        help: "Halves are fine: 4.5.",
        decimals: 1,
        max: 17.9,
        required: true,
      },
      {
        key: `child${n}Times`,
        field: times,
        type: "choices",
        label: "Which childcare sessions?",
        help: "Childcare is free for ages 5–12. Skip this if you won't need it.",
        options: TIMES,
      },
      {
        key: `child${n}Medical`,
        field: medical,
        type: "longtext",
        label: "Allergies and medical info",
      },
      {
        key: `child${n}Other`,
        field: other,
        type: "longtext",
        label: "Anything else about them?",
      },
    ],
  };
};

// Children at Metagame: the Airtable form asks for every child under 18 who's
// coming, childcare or not. Each child gets a step of their own.
export const children: FormDef = {
  slug: "children",
  path: CHILD_REGISTRATION_FORM_URL,
  tableId: airtableConfig.childrenTableId,
  airtableForm: CHILD_REGISTRATION_AIRTABLE_FORM,
  name: "Child registration",
  eyebrow: "Childcare · Metagame 2026",
  title: "Bring the kids.",
  pitch:
    "Bringing anyone under 18? Register them here. Children under 13 come free, and there's free childcare for ages 5–12 on Friday afternoon and Saturday and Sunday, mornings and late afternoons. Outside 5–12 but want childcare? Mention it and we'll do our best.",
  facts: [
    { label: "Takes", value: "About 3 minutes" },
    { label: "Due", value: "Oct 15" },
    { label: "Under 13", value: "Free" },
  ],
  notice:
    "Childcare hours: Friday 3–7 pm (drop-off and pick-up flexible); Saturday and Sunday 9:45 am–3 pm (drop-off 9:45–10, pick-up 2:45–3) and 5–7:30 pm (drop-off 5–5:15, pick-up 7:15–7:30).",
  glyph: "board-games",
  token: "bg-peach text-navy",
  steps: [
    {
      key: "contact",
      title: "Emergency contact",
      intro: "Who should we reach if we need you during the weekend?",
      items: [
        {
          key: "name",
          field: "fldGLpEn4Bg00bnzo",
          type: "text",
          label: "Name",
          required: true,
          autoComplete: "name",
        },
        {
          key: "email",
          field: "fldC3WWHFqQsm1FSl",
          type: "email",
          label: "Email",
          required: true,
          autoComplete: "email",
        },
        {
          key: "phone",
          field: "fldLdQNIQq48wqWCJ",
          type: "phone",
          label: "Phone number",
          required: true,
          autoComplete: "tel",
        },
        {
          key: "relationship",
          field: "fld0o0mWZeGE2bbqT",
          type: "text",
          label: "Relationship to the child(ren)",
          placeholder: "Parent, aunt, guardian…",
        },
        {
          key: "discord",
          field: "fld2rv0eiORYjCylO",
          type: "text",
          label: "Discord handle",
          placeholder: "@yourname",
        },
      ],
    },
    {
      key: "count",
      title: "How many are coming?",
      items: [
        {
          key: "count",
          field: "fld6tSDSTGDIzfYIO",
          type: "number",
          label: "Children you're bringing",
          min: 1,
          max: 20,
          required: true,
        },
      ],
    },
    ...[0, 1, 2, 3].map(childStep),
    {
      key: "more",
      title: "Children five and up",
      intro:
        "The form has room for four in detail. Tell us about the rest here.",
      show: (a) => kids(a) >= 5,
      items: [
        {
          key: "moreChildren",
          field: "flde6wEG681bPeqjV",
          type: "longtext",
          label:
            "Their names, ages, childcare sessions, and allergies or medical info",
          required: true,
        },
      ],
    },
    {
      key: "else",
      title: "Anything else?",
      items: [
        {
          key: "anythingElse",
          field: "fldl4KxzyKfctsPVJ",
          type: "longtext",
          label: "Anything else you'd like us to know, or questions for us?",
        },
      ],
    },
  ],
  done: {
    title: "They're on the list.",
    body: "Thanks for registering them. We'll be in touch with childcare details before the weekend.",
    links: [
      { label: "Read about childcare", href: "/childcare" },
      { label: "Back to the rulebook", href: "/" },
    ],
  },
};
