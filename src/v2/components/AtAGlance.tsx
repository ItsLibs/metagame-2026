import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import lastYear from "@/v2/data/last-year-schedule.json";
import crossword from "../../../public/images/email/general_crossword.jpg";
import megagamePuzzle from "../../../public/images/email/megagame_puzzle.jpg";
import nightMarket from "../../../public/images/email/night_market_cooks.jpg";
import talks from "../../../public/images/email/strip_jay_dragon.jpg";
import games from "../../../public/images/email/strip_round_robin.jpg";
import workshops from "../../../public/images/misc_photos/utility_monster.jpg";
import { HEADING } from "./styles";

const TILES: {
  label: string;
  photo: StaticImageData;
  alt: string;
  href: string;
}[] = [
  {
    label: "Talks",
    photo: talks,
    alt: "A speaker on an outdoor panel",
    href: "/last-year",
  },
  {
    label: "Workshops",
    photo: workshops,
    alt: "A workshop in progress",
    href: "/last-year",
  },
  {
    label: "Games",
    photo: games,
    alt: "A board game round robin",
    href: "/last-year",
  },
  {
    label: "Puzzles",
    photo: crossword,
    alt: "A giant crossword on the wall",
    href: "/last-year",
  },
  {
    label: "The Megagame",
    photo: megagamePuzzle,
    alt: "Players solving a Megagame puzzle at night",
    href: "/#megagame",
  },
  {
    label: "Night Market",
    photo: nightMarket,
    alt: "A booth at the Night Market",
    href: "/#night-market",
  },
];

const STATS = [
  { value: "3", label: "days" },
  { value: String(lastYear.sessions.length), label: "sessions in 2025" },
  { value: "Free", label: "for kids under 13" },
];

// The home page's "what is this" in pictures: one tile per kind of thing that
// happens, each linking to more.
export default function AtAGlance() {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3">
        {TILES.map(({ label, photo, alt, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src={photo}
                alt={alt}
                sizes="(min-width: 768px) 380px, 50vw"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
              <span
                className={`${HEADING} absolute bottom-3 left-4 text-xl text-cream sm:bottom-4 sm:left-5 sm:text-3xl`}
              >
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-6 grid grid-cols-3 gap-2 text-center sm:gap-4">
        {STATS.map(({ value, label }) => (
          <li
            key={label}
            className="rounded-2xl border border-navy/[0.16] bg-white px-2 py-4"
          >
            <p className={`${HEADING} text-3xl text-meeple sm:text-5xl`}>
              {value}
            </p>
            <p className="mt-1 font-space-mono text-[10px] tracking-[0.08em] text-ink/60 uppercase sm:text-xs">
              {label}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
