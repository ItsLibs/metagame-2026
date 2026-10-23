// The Friday-night public event. The 2025 site called it the Night Market;
// the rulebook brand calls it MetaGame Night. The rename still needs the
// team's sign-off, so every home-page mention reads it from here.
export const NIGHT_NAME = "MetaGame Night";

export type Chapter = {
  num?: number;
  /** The section's anchor, kept from the one-pager so old links still land. */
  id: string;
  title: string;
  /** The header nav's label. */
  short: string;
  /** Plain words beside the title. */
  aka: string;
};

// The home page as the game's rulebook, in page order.
export const CHAPTERS = {
  object: {
    num: 1,
    id: "about",
    title: "Object of the game",
    short: "Object",
    aka: "What Metagame is",
  },
  components: {
    num: 2,
    id: "highlights",
    title: "Components",
    short: "Components",
    aka: "What's in the box",
  },
  setup: {
    num: 3,
    id: "venue",
    title: "Setup",
    short: "Setup",
    aka: "Getting there and staying over",
  },
  turns: {
    num: 4,
    id: "key-dates",
    title: "Turn order",
    short: "Turn order",
    aka: "Key dates and the weekend",
  },
  players: {
    num: 5,
    id: "speakers",
    title: "Players",
    short: "Players",
    aka: "Speakers and session hosts",
  },
  expansions: {
    num: 6,
    id: "megagame",
    title: "Expansions",
    short: "Expansions",
    aka: `${NIGHT_NAME} and the Megagame`,
  },
  special: {
    num: 7,
    id: "faq",
    title: "Special rules",
    short: "Special rules",
    aka: "FAQ",
  },
  join: {
    num: 8,
    id: "tickets",
    title: "Join the game",
    short: "Join",
    aka: "Tickets",
  },
} satisfies Record<string, Chapter>;

export const CREDITS: Chapter = {
  id: "sponsors",
  title: "Credits",
  short: "Credits",
  aka: "Our sponsors, with gratitude",
};
