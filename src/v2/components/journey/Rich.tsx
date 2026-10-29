import Link from "next/link";

const LINK =
  "font-semibold text-navy underline decoration-navy/30 underline-offset-2 hover:decoration-meeple";

// A journey's copy: plain text where [words](url) becomes a link. Site paths
// stay in the tab; anything else opens a new one.
export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
        const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (!m) return part;
        const [, label, href] = m;
        return href.startsWith("/") ? (
          <Link key={i} href={href} className={LINK}>
            {label}
          </Link>
        ) : (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            {label}
          </a>
        );
      })}
    </>
  );
}
