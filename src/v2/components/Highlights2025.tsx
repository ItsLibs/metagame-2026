import { HIGHLIGHTS_2025 } from "@/v2/data/highlights-2025";
import RulebookFigure from "./RulebookFigure";
import { DISPLAY } from "./styles";

// Last year's sessions as the rulebook's "examples of play": each session type
// is a numbered figure beside its ruled list of sessions, sides alternating.
// Rows stack (figure first) on phones. Photos keep their full column width:
// the Games one hides a Hat Trick faction hat.
export default function Highlights2025({ chapter = 2 }: { chapter?: number }) {
  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {HIGHLIGHTS_2025.map((g, i) => (
        <div
          key={g.label}
          className="grid items-start gap-6 md:grid-cols-2 md:gap-10"
        >
          <RulebookFigure
            fig={`${chapter}.${i + 1}`}
            caption={`${g.label} at Metagame 2025`}
            src={g.photo}
            alt={g.alt}
            hats={g.hats}
            className={i % 2 ? "md:order-2" : ""}
          />
          <div>
            <p className="font-space-mono text-xs font-bold tracking-[0.14em] text-meeple uppercase">
              Example {chapter}.{i + 1}
            </p>
            <h4
              className={`${DISPLAY} mt-1 text-[clamp(30px,3.4vw,40px)] leading-none tracking-[0.01em] text-navy`}
            >
              {g.label}
            </h4>
            <ul className="mt-4 border-t-2 border-navy">
              {g.sessions.map((s) => (
                <li
                  key={s.title}
                  className="border-b border-line py-2 leading-snug"
                >
                  <span className="font-semibold text-navy">{s.title}</span>
                  {s.hosts && (
                    <span className="block font-space-mono text-[11px] tracking-[0.06em] text-ink/60 uppercase">
                      {s.hosts}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
