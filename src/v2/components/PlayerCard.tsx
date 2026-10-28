import Image from "next/image";
import Link from "next/link";
import type { Session2026 } from "@/v2/data/sessions-2026";
import type { Person } from "@/v2/data/team";
import HatImage from "@/v2/hat-trick/HatImage";
import { KINDS } from "./sessions/kinds";
import { DISPLAY, PLAYER_PHOTO } from "./styles";

// Sessions shown on a card before "+n more".
const SHOWN = 2;

// One speaker in the rulebook's §5 Players: the brand mock's compact card
// (name, affiliation, their 2026 sessions) with the photo as a square beside
// the text. Sessions not confirmed yet say so.
export default function PlayerCard({
  name,
  title,
  titleUrl,
  photo,
  hats,
  sessions = [],
}: Person & { sessions?: Session2026[] }) {
  return (
    <div className="flex h-full gap-3 rounded-xl border-2 border-navy bg-white p-3 transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--color-navy)]">
      {photo && hats?.length ? (
        <HatImage
          src={photo}
          alt={name}
          hats={hats}
          className={PLAYER_PHOTO}
          sizes="144px"
        />
      ) : photo ? (
        <Image
          src={photo}
          alt={name}
          className={`${PLAYER_PHOTO} object-cover`}
          sizes="144px"
        />
      ) : (
        <div
          aria-hidden
          className={`${PLAYER_PHOTO} ${DISPLAY} grid place-items-center bg-navy text-3xl text-cream`}
        >
          {name
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <h3
          className={`${DISPLAY} text-2xl leading-none tracking-[0.02em] text-navy`}
        >
          {name}
        </h3>
        <p className="font-space-mono text-[11px] tracking-[0.08em] break-words text-ink/60 uppercase">
          {titleUrl ? (
            <a
              href={titleUrl}
              {...(titleUrl.startsWith("/")
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="underline underline-offset-2 transition-colors hover:text-navy"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </p>
        {sessions.length > 0 && (
          <ul className="mt-0.5 flex flex-col gap-0.5 text-sm leading-snug">
            {sessions.slice(0, SHOWN).map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/sessions#${s.slug}`}
                  className="text-ink/80 italic underline-offset-2 hover:text-navy hover:underline"
                >
                  {s.title ?? `${KINDS[s.kinds[0]].label}, title to come`}
                </Link>
                {/* The space lets the tag drop to its own line on a narrow card. */}
                {s.status !== "confirmed" && (
                  <>
                    {" "}
                    <span className="font-space-mono text-[10px] tracking-[0.08em] whitespace-nowrap text-ink/50 uppercase">
                      {s.status === "review" ? "In review" : "Unconference"}
                    </span>
                  </>
                )}
              </li>
            ))}
            {sessions.length > SHOWN && (
              <li>
                <Link
                  href={`/sessions?q=${encodeURIComponent(name)}`}
                  className="font-space-mono text-[10.5px] tracking-[0.08em] text-meeple uppercase hover:underline"
                >
                  +{sessions.length - SHOWN} more
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
