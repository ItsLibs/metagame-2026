import PlayWeb from "./PlayWeb";
import { DISPLAY, KICKER } from "./styles";

// The weekend's facts. Same facts as the FAQ.
const FACTS = [
  { label: "When", value: "Fri 2 pm – Sun 9 pm" },
  { label: "Where", value: "Lighthaven, Berkeley" },
  { label: "Ages", value: "All · under 13 free" },
  { label: "Who", value: "Everyone who shows up" },
];

// The weekend at a glance, beside the hero: the facts, and the kinds of play
// as a web to spin. The cover puzzle's photo is behind the dice above it.
export default function AtAGlance() {
  return (
    <aside aria-label="At a glance">
      <dl className="grid grid-cols-2 gap-x-6 border-t-2 border-navy">
        {FACTS.map(({ label, value }) => (
          <div key={label} className="border-b border-navy/15 py-3">
            <dt className={`${KICKER} text-[10.5px] text-meeple`}>{label}</dt>
            <dd
              className={`${DISPLAY} mt-1 text-[22px] leading-[1.05] tracking-[0.02em] text-navy sm:text-[26px]`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <h3 className={`${KICKER} mt-5 mb-1 text-navy`}>Kinds of play</h3>
      <PlayWeb />
    </aside>
  );
}
