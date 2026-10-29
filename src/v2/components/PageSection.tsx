import { cn } from "@/v2/lib/utils";
import { DISPLAY, SECTION_ANCHOR } from "./styles";

// The page column for the editorial pages (/last-year): the brand mock's
// 1160px measure.
export const PAGE = "mx-auto w-full max-w-[1192px] px-4 sm:px-8";

export type Section = {
  /** The section's anchor. */
  id: string;
  title: string;
  /** Plain words beside the title. */
  aka?: string;
};

// A section head: the title in Bebas, and a plain-words gloss at the right
// (under the title on phones).
export function SectionHeading({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "page-rise flex flex-wrap items-baseline gap-x-5 gap-y-1",
        className,
      )}
    >
      <h2
        className={`${DISPLAY} text-[clamp(44px,6vw,72px)] leading-[0.9] tracking-[0.01em] text-balance text-navy`}
      >
        {section.title}
      </h2>
      {section.aka && (
        <span className="w-full text-lg text-ink/60 md:ml-auto md:w-auto md:text-right">
          {section.aka}
        </span>
      )}
    </div>
  );
}

// One section of the page: a navy rule across the column, then the head and
// the section's content.
export default function PageSection({
  section,
  children,
}: {
  section: Section;
  children: React.ReactNode;
}) {
  return (
    <section id={section.id} className={SECTION_ANCHOR}>
      <div className={PAGE}>
        <div className="border-t-2 border-navy pt-11 pb-14">
          <SectionHeading section={section} />
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </section>
  );
}
