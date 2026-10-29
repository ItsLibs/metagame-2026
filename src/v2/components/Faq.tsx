"use client";

import { useId, useState, type ReactNode } from "react";
import {
  Accessibility,
  ArrowLeftRight,
  Baby,
  BedDouble,
  Car,
  Clock,
  Dices,
  LifeBuoy,
  Mail,
  MapPin,
  MessagesSquare,
  Plus,
  RotateCcw,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import AnagramEmail from "./AnagramEmail";
import CrypticsLightbox from "./CrypticsLightbox";
import { DISPLAY, KICKER, TOKEN } from "./styles";

// What each question is about: its icon and the colour of its token.
const TOPICS = {
  when: { Icon: Clock, tile: "bg-sky" },
  where: { Icon: MapPin, tile: "bg-sky" },
  lodging: { Icon: BedDouble, tile: "bg-sky" },
  meals: { Icon: UtensilsCrossed, tile: "bg-peach" },
  refunds: { Icon: RotateCcw, tile: "bg-tan" },
  transfers: { Icon: ArrowLeftRight, tile: "bg-tan" },
  kids: { Icon: Baby, tile: "bg-peach" },
  parking: { Icon: Car, tile: "bg-sky" },
  games: { Icon: Dices, tile: "bg-moss" },
  access: { Icon: Accessibility, tile: "bg-sky" },
  help: { Icon: LifeBuoy, tile: "bg-peach" },
  more: { Icon: MessagesSquare, tile: "bg-moss" },
} satisfies Record<string, { Icon: LucideIcon; tile: string }>;

export type FaqTopic = keyof typeof TOPICS;
export type FaqItem = {
  id?: string;
  topic: FaqTopic;
  question: string;
  answer: ReactNode;
};

const BODY_LINK = "font-semibold text-navy underline underline-offset-2";

// The FAQ: the questions in two ruled columns on the page, each opening to
// its answer. Under the list, the team's email, and the 2025 cryptic
// crossword board: just a photo, unlabelled, that opens the clue form.
export default function Faq({ items }: { items: FaqItem[] }) {
  const uid = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());

  const toggle = (i: number) =>
    setOpen((o) => {
      const next = new Set(o);
      if (!next.delete(i)) next.add(i);
      return next;
    });

  // Two columns of questions, each its own stack so opening one never moves
  // the other column.
  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];

  return (
    <div>
      <div className="grid gap-x-10 md:grid-cols-2 md:items-start">
        {columns.map((column, c) => (
          <ul
            key={c}
            className={`divide-y divide-navy/15 border-b border-navy/15 ${
              c ? "md:border-t-2 md:border-navy" : "border-t-2 border-navy"
            }`}
          >
            {column.map(({ id, topic, question, answer }, k) => {
              const i = c * half + k;
              const { Icon, tile } = TOPICS[topic];
              const isOpen = open.has(i);
              return (
                <li key={question} id={id} className="scroll-mt-28">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`${uid}-a${i}`}
                      onClick={() => toggle(i)}
                      className="group flex w-full items-center gap-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-meeple focus-visible:ring-inset"
                    >
                      <span
                        className={`${TOKEN} size-8 transition-transform duration-300 group-hover:-rotate-12 ${tile}`}
                      >
                        <Icon aria-hidden className="size-[17px] text-navy" />
                      </span>
                      <span className="min-w-0 flex-1 text-base leading-snug font-semibold text-navy decoration-meeple decoration-2 underline-offset-4 group-hover:underline">
                        {question}
                      </span>
                      <Plus
                        aria-hidden
                        className={`size-5 shrink-0 transition-transform duration-300 ${
                          isOpen
                            ? "rotate-45 text-navy"
                            : "text-navy/45 group-hover:text-navy"
                        }`}
                      />
                    </button>
                  </h3>
                  <div
                    id={`${uid}-a${i}`}
                    inert={!isOpen}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pr-4 pb-3.5 pl-11 text-[15px] leading-relaxed text-ink/75">
                        {answer}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ))}
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-x-10 gap-y-7">
        <div className="flex items-center gap-4">
          <span className={`${TOKEN} size-14 bg-peach`}>
            <Mail aria-hidden className="size-6 text-navy" />
          </span>
          <div className="min-w-0">
            <p className={`${KICKER} text-[10.5px] text-meeple`}>
              Still stuck?
            </p>
            <h3
              className={`${DISPLAY} mt-1 text-[26px] leading-none text-navy`}
            >
              Ask the team
            </h3>
            <p className="mt-1.5 text-[15px] leading-snug text-ink/75">
              <AnagramEmail className={BODY_LINK} />
            </p>
          </div>
        </div>
        {/* Deliberately unlabelled: the board is its own invitation. */}
        <CrypticsLightbox className="block w-36 sm:w-44" />
      </div>
    </div>
  );
}
