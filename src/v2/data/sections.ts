// The Friday-night public event. The name is final: the Night Market, as in
// 2025 (Libi, Oct 27; the proposed "MetaGame Night" rename was dropped).
// Every mention reads it from here; the night band sets its last word as
// glowing letter tiles.
export const NIGHT_NAME = "Night Market";

export type Section = {
  /** The section's anchor, kept from the one-pager so old links still land. */
  id: string;
  title: string;
  /** The header nav's label. */
  short: string;
  /** Plain words beside the title. */
  aka: string;
};

// The home page's sections, in page order.
export const SECTIONS = {
  about: {
    id: "about",
    title: "About",
    short: "About",
    aka: "What Metagame is",
  },
  whatsOn: {
    id: "highlights",
    title: "What's on",
    short: "What's on",
    aka: "Talks, workshops, games and more",
  },
  venue: {
    id: "venue",
    title: "The venue",
    short: "Venue",
    aka: "Getting there and staying over",
  },
  speakers: {
    id: "speakers",
    title: "Speakers",
    short: "Speakers",
    aka: "Some of this year's session hosts",
  },
  events: {
    id: "megagame",
    title: `${NIGHT_NAME} & the Megagame`,
    short: NIGHT_NAME,
    aka: "Friday night, and all weekend long",
  },
  faq: {
    id: "faq",
    title: "FAQ",
    short: "FAQ",
    aka: "Questions, answered",
  },
  tickets: {
    id: "tickets",
    title: "Tickets",
    short: "Tickets",
    aka: "Weekend tickets and day passes",
  },
} satisfies Record<string, Section>;

export const SPONSORS: Section = {
  id: "sponsors",
  title: "Sponsors",
  short: "Sponsors",
  aka: "The people who make it possible",
};

// /sessions: every 2026 session so far, one section per status.
export const SESSIONS_SECTIONS = {
  confirmed: {
    id: "confirmed",
    title: "Confirmed",
    short: "Confirmed",
    aka: "On the program",
  },
  review: {
    id: "in-review",
    title: "In review",
    short: "In review",
    aka: "Submitted, not confirmed yet",
  },
  unconference: {
    id: "unconference",
    title: "Unconference",
    short: "Unconference",
    aka: "On the unconference schedule",
  },
} satisfies Record<string, Section>;

// /last-year, in page order.
export const LAST_YEAR_SECTIONS = {
  report: {
    id: "match-report",
    title: "How it played",
    short: "How it played",
    aka: "The 2025 megagame, start to finish",
  },
  replay: {
    id: "replay",
    title: "The weekend, replayed",
    short: "Replay",
    aka: "Fifteen minutes at a time",
  },
  trivia: {
    id: "trivia",
    title: "Trivia",
    short: "Trivia",
    aka: "Talk, workshop or game?",
  },
} satisfies Record<string, Section>;
