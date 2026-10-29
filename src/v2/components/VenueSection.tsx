import {
  Accessibility,
  BedDouble,
  Car,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { HATS } from "@/v2/hat-trick/hats";
import { HOTELS_SEARCH_URL, HOUSING_URL, LIGHTHAVEN_URL } from "@/v2/lib/links";
import fairyLights from "../../../public/images/carousel/6_fairy_lights.jpg";
import ContactLink from "./contact/ContactLink";
import Figure from "./Figure";
import { TOKEN } from "./styles";

const LINK = "font-semibold text-navy underline underline-offset-2";
const EXT = { target: "_blank", rel: "noopener noreferrer" } as const;

// Venue, beds, parking and access, each with its token (the FAQ's colours
// for the same topics).
const POINTS: {
  Icon: LucideIcon;
  tile: string;
  lead: string;
  body: React.ReactNode;
}[] = [
  {
    Icon: MapPin,
    tile: "bg-sky",
    lead: "Getting there.",
    body: (
      <>
        <a href={LIGHTHAVEN_URL} {...EXT} className={LINK}>
          Lighthaven Campus
        </a>
        , 2740 Telegraph Ave, Berkeley, CA 94705. Easter eggs are wedged into
        every nook, and some games hide behind secret doors.
      </>
    ),
  },
  {
    Icon: BedDouble,
    tile: "bg-peach",
    lead: "Staying over.",
    body: (
      <>
        On-site housing can be{" "}
        <a href={HOUSING_URL} {...EXT} className={LINK}>
          booked directly with Lighthaven
        </a>
        , so you can roll out of bed and into a game. Berkeley has{" "}
        <a href={HOTELS_SEARCH_URL} {...EXT} className={LINK}>
          plenty of hotels
        </a>{" "}
        too.
      </>
    ),
  },
  {
    Icon: Car,
    tile: "bg-tan",
    lead: "Leave the car.",
    body: (
      <>
        Street parking is very limited. Please avoid the two blocks around
        Lighthaven so the neighbors stay happy.
      </>
    ),
  },
  {
    Icon: Accessibility,
    tile: "bg-sky",
    lead: "Tell us what you need.",
    body: (
      <>
        Some parts of the campus are easier to get around than others. If
        accessibility is a concern,{" "}
        <ContactLink subject="Accessibility" className={LINK}>
          reach out
        </ContactLink>{" "}
        and we&apos;ll make it work.
      </>
    ),
  },
];

// The venue: the practical points in a list, beside a photo (which hides a
// Hat Trick hat).
export default function VenueSection() {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-11">
      <ul className="border-t-2 border-navy">
        {POINTS.map(({ Icon, tile, lead, body }) => (
          <li
            key={lead}
            className="flex items-start gap-4 border-b border-navy/15 py-4"
          >
            <span className={`${TOKEN} mt-0.5 size-10 ${tile}`}>
              <Icon aria-hidden className="size-5 text-navy" />
            </span>
            <p className="text-ink/80">
              <strong className="text-navy">{lead}</strong> {body}
            </p>
          </li>
        ))}
      </ul>
      <Figure
        caption="Evening games under the fairy lights at Metagame 2025."
        src={fairyLights}
        alt="Evening games under fairy lights"
        hats={[HATS.beanie]}
      />
    </div>
  );
}
