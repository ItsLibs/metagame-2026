// Shared class strings for the mock design system (headings, eyebrows, fields).
// Buttons now live in the shadcn <Button> (src/components/ui/button.tsx) and the
// shared dark form field in the shadcn <Input> (src/components/ui/input.tsx).

export const HEADING =
  "font-grotesk font-bold leading-[1.05] tracking-[-0.01em]";

export const EYEBROW = "font-space-mono text-xl tracking-[0.12em] uppercase";

export const NEWSLETTER_LINK = "font-bold text-salmon";

// Section rhythm, shared by every one-pager section.
// scroll-mt clears the mobile top bar (h-14) so a jump doesn't park the section
// under it; the desktop value is the designed offset. Padding is deliberately
// tight on mobile — the desktop rhythm reads as dead air between a divider and
// the heading it introduces — and sections layer their own values back on at md.
export const SECTION_ANCHOR = "scroll-mt-16 md:scroll-mt-24";
export const SECTION = `${SECTION_ANCHOR} py-8`;

// Light-background override for the shared <Input> (cream sections). The Input's
// own classes are the dark default; these win via tailwind-merge.
export const FIELD_LIGHT =
  "border-navy/20 bg-white text-ink placeholder:text-ink/40 focus:border-meeple";

// The site's display face (Bebas Neue): section heads, at-a-glance facts,
// card titles.
export const DISPLAY = "font-[family-name:var(--font-bebas)] font-normal";

// A small label over a title, a list or a figure: mono, bold, tracked,
// uppercase. Colour is the caller's (meeple over a title, navy over a list).
export const KICKER =
  "font-space-mono text-xs font-bold tracking-[0.14em] uppercase";

// The photo square beside a speaker; the "You?" silhouette matches it.
export const PLAYER_PHOTO = "size-[72px] shrink-0 overflow-hidden rounded-lg";

// Content sits on the page itself, not in boxes: rules and hairlines set
// things apart, and colour comes in tokens, round game pieces that hold a
// glyph or an icon. Size and colour are the caller's.
export const TOKEN = "grid shrink-0 place-items-center rounded-full";
