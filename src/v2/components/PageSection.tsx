import { cn } from "@/v2/lib/utils";
import type { Section } from "@/v2/data/sections";
import { SectionRule } from "./dividers/DividerRow";
import { DISPLAY, SECTION_ANCHOR } from "./styles";

// The page column: the brand mock's 1160px.
export const PAGE = "mx-auto w-full max-w-[1192px] px-4 sm:px-8";

// A section head: the title in Bebas, with a line of plain words beside it
// (under it on phones).
export function SectionHead({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "page-rise flex flex-wrap items-baseline gap-x-6 gap-y-1.5",
        className,
      )}
    >
      <h2
        className={`${DISPLAY} text-[clamp(44px,6vw,72px)] leading-[0.9] tracking-[0.01em] text-balance text-navy`}
      >
        {section.title}
      </h2>
      <p className="w-full text-[17px] leading-snug text-ink/60 md:ml-auto md:w-auto md:max-w-[24em] md:text-right">
        {section.aka}
      </p>
    </div>
  );
}

// One section of a page: a navy rule across the column, then the head and
// the content. With `rule`, a game divider is that rule (its minigame and the
// cover puzzle both play on it).
export default function PageSection({
  section,
  rule,
  children,
}: {
  section: Section;
  rule?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={section.id} className={SECTION_ANCHOR}>
      <div className={PAGE}>
        {rule && <SectionRule>{rule}</SectionRule>}
        <div
          className={rule ? "pt-4 pb-14" : "border-t-2 border-navy pt-11 pb-14"}
        >
          <SectionHead section={section} />
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </section>
  );
}
