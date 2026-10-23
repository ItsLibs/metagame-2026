import Image from "next/image";
import { HIGHLIGHTS_2025 } from "@/v2/data/highlights-2025";
import HatImage from "@/v2/hat-trick/HatImage";
import { DISPLAY } from "./styles";

// Last year's sessions as the rulebook's "examples of play": each session type
// is a numbered figure (framed photo, mono caption) beside its ruled list of
// sessions, sides alternating. Rows stack (figure first) on phones. Photos
// keep their full column width: the Games one hides a Hat Trick faction hat.
export default function Highlights2025({ chapter = 2 }: { chapter?: number }) {
  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {HIGHLIGHTS_2025.map((g, i) => (
        <div
          key={g.label}
          className="grid items-start gap-6 md:grid-cols-2 md:gap-10"
        >
          <figure
            className={`rounded-[4px] border-2 border-navy bg-white p-2 ${
              i % 2 ? "md:order-2" : ""
            }`}
          >
            {g.hats?.length ? (
              <HatImage
                src={g.photo}
                alt={g.alt}
                hats={g.hats}
                style={{ aspectRatio: `${g.photo.width} / ${g.photo.height}` }}
                className="w-full"
                sizes="(min-width: 768px) 560px, 100vw"
              />
            ) : (
              <Image
                src={g.photo}
                alt={g.alt}
                // Cropped to the Games photo's 4:3 so the figures match.
                className="aspect-[4/3] w-full object-cover"
                sizes="(min-width: 768px) 560px, 100vw"
              />
            )}
            <figcaption className="mt-2 font-space-mono text-xs leading-[1.45] text-ink/60">
              <b className="text-navy">
                Fig. {chapter}.{i + 1}
              </b>{" "}
              · {g.label} at Metagame 2025
            </figcaption>
          </figure>
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
