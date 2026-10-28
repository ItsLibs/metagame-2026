import { airtableConfig } from "@/lib/airtable-config";
import {
  FINANCIAL_AID_AIRTABLE_FORM,
  FINANCIAL_AID_FORM_URL,
  TEAM_EMAIL,
  VOLUNTEER_APPLY_PATH,
} from "@/v2/lib/links";
import type { Answers, FormDef } from "./engine";
import { isEmpty, picked } from "./engine";
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

const OFF_100 = "$100 off (ticket price: $325)";
const TRAVEL =
  "I would need travel assistance as well as a free ticket to be able to attend";
const OTHER = "Other";

const price = (a: Answers) => a.price;
// $100 off is honor-system: without a ticket yet, it's a coupon code away.
const instant100 = (a: Answers) =>
  price(a) === OFF_100 &&
  (picked(a.ticket, "No") ||
    picked(a.ticket, "I'm not sure / none of the above"));
const canVolunteer = (a: Answers) =>
  a.volunteer === "Yes" || a.volunteer === "Unsure";

// The financial aid application, as the Airtable form asks it. It shares the
// volunteer table, and asks the volunteer questions of anyone who could help.
export const financialAid: FormDef = {
  slug: "financial-aid",
  path: FINANCIAL_AID_FORM_URL,
  tableId: airtableConfig.volunteersTableId,
  airtableForm: FINANCIAL_AID_AIRTABLE_FORM,
  eyebrow: "Financial aid · Metagame 2026",
  title: "Make it affordable.",
  pitch:
    "There's a scholarship fund with a limited number of free and reduced-price tickets, for anyone for whom Metagame would be a financial hardship. Applications are processed in the order they arrive, so apply as soon as you can.",
  facts: [
    { label: "Takes", value: "About 5 minutes" },
    { label: "Due", value: "Oct 19" },
    { label: "Full price", value: "$425" },
  ],
  notice: `Several people on the Metagame team will see your answers. For anything you'd rather keep more private, email ricki@metagame.games. You can also [apply to volunteer](${VOLUNTEER_APPLY_PATH}), which is how most reduced-price tickets are earned.`,
  glyph: "trivia",
  token: "bg-tan text-navy",
  utmFields: VOLUNTEER_UTM_FIELDS,
  steps: [
    {
      key: "you",
      title: "Who's applying?",
      items: basicFacts("Leave it blank if it's the same."),
    },
    {
      key: "ticket",
      title: "Your ticket",
      items: [
        ticketStatus(
          "Already have one? Carry on with the ticket you'd like instead, and we'll work out the reimbursement when we review your application.",
        ),
      ],
    },
    {
      key: "price",
      title: "What would work?",
      intro:
        "A full-price ticket is $425. Pick the highest price that would still let you come.",
      items: [
        {
          key: "price",
          field: "fldBdxOA9RX6B8OEl",
          type: "choice",
          label: "Highest viable price",
          layout: "list",
          options: [
            {
              value: OFF_100,
              label: "$325 · $100 off",
              hint: "Open to anyone who needs it, on the honor system.",
            },
            {
              value: "50% off (ticket price: $212.50)",
              label: "$212.50 · 50% off",
              hint: "If $325 wouldn't work but half price would. We'll likely accept most of these.",
            },
            {
              value: "75% off ticket (ticket price: $106.25)",
              label: "$106.25 · 75% off",
              hint: "If the first two don't work but $106 would.",
            },
            {
              value: "100% off ticket (ticket price: $0)",
              label: "$0 · free",
              hint: "If paying for the conference isn't feasible.",
            },
            {
              value: TRAVEL,
              label: "$0 + travel help",
              hint: "A free ticket plus some scholarship money for travel. How much we can grant depends on the fund.",
            },
            { value: OTHER, label: "Something else" },
          ],
        },
        {
          type: "note",
          key: "approved",
          tone: "win",
          title: "Approved. Your $325 ticket is waiting.",
          body: `Use the coupon code DEFAULTDISCOUNT at checkout; the button applies it for you. No need to finish this application. Already have a ticket and want the $100 back? Email ${TEAM_EMAIL}.`,
          cta: { label: "Get my $325 ticket", href: "/buy/DEFAULTDISCOUNT" },
          show: instant100,
        },
        {
          key: "otherWhy",
          field: "fldRpWM4U2ldHsOie",
          type: "longtext",
          label: "Why something else?",
          help: "Tell us a little about what would work for you.",
          show: (a) => price(a) === OTHER,
        },
        {
          key: "details",
          field: "fldWRqImN3mrMmkFx",
          type: "longtext",
          label: "Tell us more about your situation",
          help: "We're trying to send the fund where it's needed most, so some context helps. If you'd rather talk it through on a call with someone from the team, say so here and we'll send you some times.",
          show: (a) => !isEmpty(price(a)) && price(a) !== OFF_100,
        },
        {
          key: "travelFrom",
          field: "fldxO7ojOEYt7wseJ",
          type: "text",
          label: "Where will you be traveling to and from?",
          show: (a) => price(a) === TRAVEL || price(a) === OTHER,
        },
        {
          key: "travelFunding",
          field: "fldvA5ryRLY5JevOe",
          type: "longtext",
          label: "How much travel funding are you asking for?",
          help: "Break down your travel costs and the amount you'd like covered. Often we can cover some but not all of it.",
          show: (a) => price(a) === TRAVEL || price(a) === OTHER,
        },
      ],
    },
    {
      key: "volunteer",
      title: "Could you volunteer?",
      intro:
        "Most reduced-price tickets come from volunteering. Financial aid is a smaller fund, for people who can't volunteer or who need help with travel too.",
      items: [
        {
          key: "volunteer",
          field: "fldZjtgeJ9rcvMlUf",
          type: "choice",
          label: "Are you able to volunteer at or in the lead-up to Metagame?",
          options: [{ value: "Yes" }, { value: "No" }, { value: "Unsure" }],
        },
        ...teams(
          "What kind of work are you most excited about? You'll likely be slotted onto at most two teams.",
          canVolunteer,
        ),
        ...availability((day) => `${day}: when could you help?`, canVolunteer),
        ...aboutYou(canVolunteer),
      ],
    },
    {
      key: "more",
      title: "A few more things",
      items: [
        ...disability,
        reference(
          "If we don't already know you, is there anyone who does that you'd recommend we talk to?",
        ),
        howFound,
        questions,
      ],
    },
  ],
  done: {
    title: "Your application is in.",
    body: "Applications are processed in the order they arrive. We'll email you once we've reviewed yours.",
    links: [
      { label: "Apply to volunteer too", href: VOLUNTEER_APPLY_PATH },
      { label: "Back to the tickets", href: "/#tickets" },
    ],
  },
};
