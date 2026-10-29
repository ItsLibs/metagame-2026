"use client";

import { useState } from "react";
import {
  Baby,
  ChevronDown,
  Code,
  Crown,
  DoorOpen,
  Flag,
  Flame,
  Hammer,
  Heart,
  HeartHandshake,
  Info,
  Megaphone,
  Mic,
  MicVocal,
  Package,
  PenTool,
  Projector,
  Shuffle,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Answer, Answers } from "@/v2/forms/engine";
import { cn } from "@/v2/lib/utils";
import { DISPLAY, TOKEN } from "./look";

// The volunteer teams as a board: each team a token, a line on what it
// does, and examples to open, with three ways to mark it. The marks are
// written to the three Airtable fields the form always had, whose option
// lists differ a little, so each team names its option in each (`want`,
// `avoid`, `lead`); a team missing from a list just doesn't offer that mark.

export type Team = {
  name: string;
  blurb: string;
  Icon: LucideIcon;
  token: string;
  /** Some of the work happens in the weeks before the con. */
  ahead?: boolean;
  examples: string[];
  want?: string;
  avoid?: string;
  lead?: string;
};

const same = (value: string) => ({ want: value, avoid: value, lead: value });

export const TEAMS: Team[] = [
  {
    name: "Registration desk",
    blurb: "The first friendly face at the gate.",
    Icon: Ticket,
    token: "bg-peach text-navy",
    examples: [
      "Check people in and hand out their badges",
      "Answer the first questions anyone has on arrival",
      "Keep the line moving when a crowd arrives at once",
    ],
    ...same("Registration desk"),
  },
  {
    name: "Info desk",
    blurb: "Where everyone goes to ask.",
    Icon: Info,
    token: "bg-sky text-navy",
    examples: [
      "Answer “where is…?” and “what's on now?” all day",
      "Keep the printed schedule and signs up to date",
      "Look after lost and found",
    ],
    ...same("Info desk"),
  },
  {
    name: "Room check",
    blurb: "Keeps rooms ready and sessions starting on time.",
    Icon: DoorOpen,
    token: "bg-tan text-navy",
    examples: [
      "Check a room is set before its session starts",
      "Make sure the host has what they need, then let it begin",
      "Flag missing chairs or a projector that won't wake up",
    ],
    ...same("Room check (for sessions)"),
  },
  {
    name: "Physical labor",
    blurb: "Carry, set up and tear down. Strong arms appreciated.",
    Icon: Package,
    token: "bg-peach text-navy",
    examples: [
      "Carry tables, chairs and games between rooms",
      "Set up before the gates open",
      "Pack everything away at the end",
    ],
    ...same("Physical labor"),
  },
  {
    name: "Childcare",
    blurb: "Games and care for kids aged 5 to 12.",
    Icon: Baby,
    token: "bg-sky text-navy",
    examples: [
      "Run games and crafts in the kids' room",
      "Help with drop-off and pick-up",
      "Keep an eye on a group during the day",
    ],
    ...same("Childcare"),
  },
  {
    name: "AV and tech",
    blurb: "Screens, mics and sound for the sessions.",
    Icon: Projector,
    token: "bg-brand-blue text-navy",
    examples: [
      "Set up projectors and mics before talks",
      "Get a speaker's laptop onto the screen",
      "Fix the sound when it drops mid-session",
    ],
    want: "AV support (e.g. setting up projectors)",
    avoid: "Tech support (e.g. setting up projectors)",
    lead: "Tech support (e.g. setting up projectors)",
  },
  {
    name: "Web development",
    blurb: "Code for the site and its games.",
    Icon: Code,
    token: "bg-navy text-cream",
    ahead: true,
    examples: [
      "Program a minigame for the site",
      "Fix bugs on the website before the weekend",
      "Help build the tools the team runs the con with",
    ],
    avoid: "Web development (e.g. programming mini games)",
    lead: "Web development (e.g. programming mini games)",
  },
  {
    name: "Marketing",
    blurb: "Spread the word before the weekend.",
    Icon: Megaphone,
    token: "bg-meeple text-cream",
    ahead: true,
    examples: [
      "Put up posters around your neighborhood",
      "Share Metagame in your communities and group chats",
      "Bring your friends",
    ],
    want: "Marketing (requires advance work)",
    avoid: "Marketing",
    lead: "Marketing",
  },
  {
    name: "Megagame design",
    blurb: "Build puzzles and games for the all-weekend Megagame.",
    Icon: PenTool,
    token: "bg-tan text-navy",
    ahead: true,
    examples: [
      "Write a puzzle for the Megagame",
      "Playtest puzzles before the weekend",
      "Help thread the story from one puzzle to the next",
    ],
    want: "Megagame design (requires advance work)",
    avoid: "Helping design the megagame (requires advance work)",
    lead: "Helping design the megagame (requires advance work)",
  },
  {
    name: "Running the Megagame",
    blurb: "Keep the Megagame going during the con.",
    Icon: Flag,
    token: "bg-moss text-cream",
    examples: [
      "Staff a Megagame station for a shift",
      "Hand out clues and check answers",
      "Keep the scoreboard up to date",
    ],
    avoid: "Helping run the megagame (during the conference)",
    lead: "Helping run the megagame (during the conference)",
  },
  {
    name: "Set design",
    blurb: "Dress Lighthaven so the whole campus feels like a game.",
    Icon: Hammer,
    token: "bg-moss text-cream",
    ahead: true,
    examples: [
      "Build signs and props",
      "Paint and put together set pieces",
      "Help turn a room into part of the game",
    ],
    ...same("Set design / physical fabrication / hardware / construction"),
  },
  {
    name: "Generalist",
    blurb: "Put out fires wherever they start.",
    Icon: Flame,
    token: "bg-meeple text-cream",
    examples: [
      "Fill in wherever a team is short",
      "Run errands across campus",
      "Sort out whatever comes up",
    ],
    ...same("Generalist (putting out fires as needed)"),
  },
  {
    name: "Community health and safety",
    blurb: "Help everyone have a good, safe time.",
    Icon: HeartHandshake,
    token: "bg-peach text-navy",
    examples: [
      "Be a friendly person to come to if something's wrong",
      "Walk the campus and check everyone's okay",
      "Know who to call when someone needs help",
    ],
    ...same("Community health and safety"),
  },
  {
    name: "Speaker coordination",
    blurb: "Help session hosts get what they need and find their rooms.",
    Icon: Mic,
    token: "bg-sky text-navy",
    examples: [
      "Show session hosts to their rooms",
      "Remind hosts before their sessions start",
      "Check hosts have what they need",
    ],
    ...same("Speaker coordination"),
  },
  {
    name: "MCing sessions",
    blurb: "Introduce the speakers and keep things on time.",
    Icon: MicVocal,
    token: "bg-brand-blue text-navy",
    examples: [
      "Introduce a speaker and keep time",
      "Run the Q&A at the end",
      "Warm up the room before a talk",
    ],
    want: "MCing sessions",
    avoid: "MCing sessions",
  },
];

const ANYWHERE = "Indifferent: Slot me in anywhere, coach!";

/** The questions this board asks. */
export const TEAM_KEYS = ["teams", "notTeams", "leadTeams"];

const MARKS = [
  { mark: "want", key: "teams", label: "Sounds fun", Icon: Heart },
  { mark: "avoid", key: "notTeams", label: "Not for me", Icon: X },
  { mark: "lead", key: "leadTeams", label: "I'd lead it", Icon: Crown },
] as const;
type Mark = (typeof MARKS)[number]["mark"];

const list = (v: Answer) => (Array.isArray(v) ? v : []);

export default function TeamBoard({
  answers,
  update,
}: {
  answers: Answers;
  update: (key: string, fn: (v: Answer) => Answer) => void;
}) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const has = (t: Team, m: Mark) => {
    const value = t[m];
    const { key } = MARKS.find((x) => x.mark === m)!;
    return !!value && list(answers[key]).includes(value);
  };
  const put = (t: Team, m: Mark, on: boolean) => {
    const value = t[m];
    const { key } = MARKS.find((x) => x.mark === m)!;
    if (!value) return;
    update(key, (v) =>
      on
        ? [...new Set([...list(v), value])]
        : list(v).filter((x) => x !== value),
    );
  };
  // "Not for me" rules out the other two, and they rule it out.
  const flip = (t: Team, m: Mark) => {
    const on = !has(t, m);
    put(t, m, on);
    if (!on) return;
    if (m === "avoid") {
      put(t, "want", false);
      put(t, "lead", false);
    } else put(t, "avoid", false);
  };
  const anywhere = list(answers.teams).includes(ANYWHERE);

  const fun = TEAMS.filter((t) => has(t, "want") || has(t, "lead"));
  const not = TEAMS.filter((t) => has(t, "avoid")).length;
  const leading = TEAMS.filter((t) => has(t, "lead")).length;

  return (
    <div>
      <p className="text-[14.5px] leading-snug text-ink/60">
        Mark the teams that sound fun, any you&apos;d rather skip, and any
        you&apos;d lead. Every volunteer attends a 1–2 hour orientation before
        the event.
      </p>

      {/* The picks so far, as a pile of tokens. */}
      <div
        aria-live="polite"
        className="mt-5 flex min-h-14 flex-wrap items-center gap-x-5 gap-y-3 border-y-2 border-navy py-3"
      >
        <div className="flex items-center pl-2">
          {fun.length ? (
            fun.map((t) => (
              <span
                key={t.name}
                title={t.name}
                className={cn(
                  TOKEN,
                  "-ml-2 size-9 animate-in ring-[3px] ring-background duration-300 zoom-in-50 fade-in",
                  t.token,
                )}
              >
                <t.Icon aria-hidden className="size-[18px]" />
              </span>
            ))
          ) : (
            <span className="font-space-mono text-[11px] tracking-[0.1em] text-ink/45 uppercase">
              Your crew shows up here
            </span>
          )}
        </div>
        <p className="text-[15px] text-ink/70">
          <b className={`${DISPLAY} text-[24px] leading-none text-navy`}>
            {fun.length}
          </b>{" "}
          sound fun
          {not > 0 && <> · {not} not for you</>}
          {leading > 0 && <> · leading {leading}</>}
        </p>
        <button
          type="button"
          aria-pressed={anywhere}
          onClick={() =>
            update("teams", (v) =>
              anywhere
                ? list(v).filter((x) => x !== ANYWHERE)
                : [...list(v), ANYWHERE],
            )
          }
          className={cn(
            "ml-auto flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-[14.5px] font-semibold transition-colors",
            anywhere
              ? "border-navy bg-navy text-cream"
              : "border-navy/20 text-navy hover:border-navy",
          )}
        >
          <Shuffle aria-hidden className="size-4" />
          Slot me in anywhere, coach!
        </button>
      </div>

      <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
        {TEAMS.map((t) => {
          const shown = open.has(t.name);
          const avoided = has(t, "avoid");
          const keen = has(t, "want") || has(t, "lead");
          return (
            <li
              key={t.name}
              className={cn(
                "flex gap-3 border-b border-navy/15 py-4 transition-opacity duration-300",
                avoided && "opacity-55",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  TOKEN,
                  "size-12 transition-[rotate,scale] duration-300",
                  t.token,
                  keen && "scale-110 -rotate-12",
                )}
              >
                <t.Icon className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="flex flex-wrap items-baseline gap-x-2 text-[17px] leading-snug font-semibold text-navy">
                  {t.name}
                  {t.ahead && (
                    <span className="font-space-mono text-[10px] font-bold tracking-[0.1em] text-meeple uppercase">
                      Starts before the con
                    </span>
                  )}
                </h3>
                <p className="text-[14.5px] leading-snug text-ink/65">
                  {t.blurb}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {MARKS.filter(({ mark }) => t[mark]).map(
                    ({ mark, label, Icon }) => {
                      const on = has(t, mark);
                      return (
                        <button
                          key={mark}
                          type="button"
                          aria-pressed={on}
                          aria-label={`${t.name}: ${label}`}
                          onClick={() => flip(t, mark)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-[13px] font-semibold transition-[background-color,border-color,color,translate] duration-150 select-none active:translate-y-px",
                            on
                              ? mark === "avoid"
                                ? "border-ink/60 bg-ink/60 text-cream"
                                : "border-navy bg-navy text-cream"
                              : "border-navy/20 text-navy hover:border-navy",
                          )}
                        >
                          <Icon
                            aria-hidden
                            className={cn(
                              "size-3.5",
                              on && mark === "want" && "fill-current",
                            )}
                          />
                          {label}
                        </button>
                      );
                    },
                  )}
                  <button
                    type="button"
                    aria-expanded={shown}
                    onClick={() =>
                      setOpen((o) => {
                        const next = new Set(o);
                        if (!next.delete(t.name)) next.add(t.name);
                        return next;
                      })
                    }
                    className="ml-auto flex items-center gap-1 font-space-mono text-[11px] font-bold tracking-[0.1em] text-meeple uppercase hover:underline"
                  >
                    Examples
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        shown && "rotate-180",
                      )}
                    />
                  </button>
                </div>
                {shown && (
                  <ul className="mt-2.5 animate-in space-y-1 border-l-2 border-tan pl-3 text-[14.5px] leading-snug text-ink/80 duration-300 fade-in slide-in-from-top-1">
                    {t.examples.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
