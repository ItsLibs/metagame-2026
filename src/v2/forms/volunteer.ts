import { airtableConfig } from "@/lib/airtable-config";
import {
  FINANCIAL_AID_FORM_URL,
  MEGAGAME_PROPOSAL_FORM_URL,
  VOLUNTEER_AIRTABLE_FORM,
  VOLUNTEER_APPLY_PATH,
  VOLUNTEER_TEAMS_DOC_URL,
} from "@/v2/lib/links";
import { SOCIAL_LINKS } from "@/v2/lib/urls";
import type { FormDef } from "./engine";
import {
  aboutYou,
  availability,
  basicFacts,
  disability,
  howFound,
  questions,
  reference,
  teams,
  ticketStatus,
  VOLUNTEER_UTM_FIELDS,
} from "./shared";

// The volunteer application, as the Airtable form asks it.
export const volunteer: FormDef = {
  slug: "volunteer",
  path: VOLUNTEER_APPLY_PATH,
  tableId: airtableConfig.volunteersTableId,
  airtableForm: VOLUNTEER_AIRTABLE_FORM,
  eyebrow: "Volunteer · Metagame 2026",
  title: "Join the crew.",
  pitch:
    "Volunteer at Metagame (or in the lead-up to it) and help run the weekend. Applications are processed in the order they arrive, and there are a limited number of volunteer tickets, so the sooner you apply, the better your chances of the shifts and teams you want.",
  facts: [
    { label: "Takes", value: "About 5 minutes" },
    { label: "Due", value: "Oct 29" },
    { label: "Perk", value: "$0 tickets, while they last" },
  ],
  notice: `Several people on the Metagame team will see your answers. For anything you'd rather keep more private, email ricki@metagame.games. Need help with the ticket price instead? [Apply for financial aid](${FINANCIAL_AID_FORM_URL}).`,
  glyph: "party-games",
  token: "bg-moss text-cream",
  utmFields: VOLUNTEER_UTM_FIELDS,
  steps: [
    {
      key: "you",
      title: "Who's joining?",
      intro: "The basics, so we can reach you and print your badge.",
      items: basicFacts("Leave it blank if it's the same."),
    },
    {
      key: "ticket",
      title: "Your ticket",
      items: [
        ticketStatus("So we can make sure to reimburse you if we need to."),
      ],
    },
    {
      key: "shifts",
      title: "When could you play?",
      intro:
        "Mark every window you could possibly help in, not just your favorites. Marking a window doesn't mean you'll be on shift for all of them: we'll only schedule you for some.",
      view: "schedule",
      items: availability((day) => day),
    },
    {
      key: "teams",
      title: "Pick your teams",
      intro: `This helps us slot you in. Not sure what a team involves? Open its examples, or [read the team commitments](${VOLUNTEER_TEAMS_DOC_URL}).`,
      view: "teams",
      items: [
        ...teams(
          "What kind of work are you most excited about? Every volunteer attends a 1–2 hour orientation before the event.",
        ),
        {
          key: "timeLimits",
          field: "fldxkBihmM83NONQ2",
          type: "longtext",
          label: "Time limitations",
          help: "Any time constraints we should know about? Include it if you're leading or responsible for a session at Metagame.",
        },
      ],
    },
    {
      key: "more",
      title: "A few more things",
      items: [
        ...disability,
        ...aboutYou(),
        howFound,
        reference(
          "If somebody referred you to volunteer, put their name and email here. Totally optional.",
        ),
        questions,
      ],
    },
  ],
  done: {
    title: "You're on the crew list.",
    body: "Applications are processed in the order they arrive. We'll be in touch about teams and shifts, and every volunteer gets a 1–2 hour orientation before the weekend.",
    links: [
      { label: "Join the Discord", href: SOCIAL_LINKS.DISCORD },
      {
        label: "Make a puzzle for the Megagame",
        href: MEGAGAME_PROPOSAL_FORM_URL,
      },
    ],
  },
};
