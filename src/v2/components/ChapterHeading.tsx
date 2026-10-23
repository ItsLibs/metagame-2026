import { cn } from "@/v2/lib/utils";
import { DISPLAY } from "./styles";

// The home page reads as the game's rulebook: each section opens on a
// numbered chapter head over a navy rule, with a plain-words gloss at the right.
export default function ChapterHeading({
  num,
  title,
  aka,
  className,
}: {
  /** e.g. 3 renders "§3"; omit for unnumbered back matter. */
  num?: number;
  title: React.ReactNode;
  aka?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-2 border-navy pb-3",
        className,
      )}
    >
      {num !== undefined && (
        <span className="font-space-mono text-sm font-bold tracking-[0.1em] text-meeple">
          §{num}
        </span>
      )}
      <h2
        className={`${DISPLAY} text-[clamp(44px,6vw,72px)] leading-[0.9] tracking-[0.01em] text-balance text-navy`}
      >
        {title}
      </h2>
      {aka && (
        <span className="w-full font-space-mono text-xs tracking-[0.12em] text-ink/60 uppercase md:ml-auto md:w-auto">
          {aka}
        </span>
      )}
    </div>
  );
}
