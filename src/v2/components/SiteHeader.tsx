"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Section } from "@/v2/data/sections";
import { ACCOUNT_LINK, LOGIN_LINK } from "./nav/links";
import { LogoDie } from "./nav/LogoDice";
import { useAccountStatus } from "./nav/useAccountStatus";
import { Button } from "./ui/button";
import { DISPLAY } from "./styles";

const SECTION_LINK =
  "rounded-md px-2 py-1.5 font-space-mono text-[11px] font-bold tracking-[0.06em] whitespace-nowrap uppercase transition-colors hover:bg-sky";

// The links after the sections, quieter than them.
const AFTER_SECTIONS = `${SECTION_LINK} text-ink/60`;

// A long page's sticky header, in place of the corner die nav: the brand,
// the page's sections (scrolling sideways on phones, the one in view lit),
// and tickets. With hideAtTop it floats over the page instead, out of sight
// until the reader scrolls past the first screen.
export default function SiteHeader({
  sections,
  hideAtTop = false,
}: {
  sections: Section[];
  hideAtTop?: boolean;
}) {
  // Null until /api/admin-status answers, so neither account link flashes.
  const account = useAccountStatus();
  const accountLink = account && (account.signedIn ? ACCOUNT_LINK : LOGIN_LINK);
  const current = useCurrentSection(sections);
  const scrolled = useScrolledPastFirstScreen(hideAtTop);
  const hidden = hideAtTop && !scrolled;
  return (
    <header
      inert={hidden}
      className={`top-0 z-40 border-b-2 border-navy bg-background ${
        hideAtTop
          ? `fixed inset-x-0 transition-transform duration-300 motion-reduce:transition-none ${hidden ? "-translate-y-[calc(100%+3px)]" : ""}`
          : "sticky"
      }`}
    >
      {/* How far down the page you are. */}
      <span
        aria-hidden
        className="page-progress absolute inset-x-0 -bottom-[2px] h-[3px] bg-meeple"
      />
      <div className="mx-auto flex max-w-[1192px] items-center gap-3 px-4 py-2.5 sm:gap-5 sm:px-8">
        <Link
          href="/#home"
          className={`${DISPLAY} group flex shrink-0 items-center gap-2 text-[28px] leading-none tracking-[0.05em] text-navy`}
        >
          <LogoDie className="size-9 transition-transform duration-500 group-hover:rotate-[360deg] motion-reduce:transition-none" />
          <span className="max-[420px]:sr-only">Metagame</span>
        </Link>
        <nav
          aria-label="Sections"
          className="flex min-w-0 flex-1 [scrollbar-width:none] gap-0.5 overflow-x-auto"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={current === s.id ? "true" : undefined}
              className={`${SECTION_LINK} text-navy ${current === s.id ? "bg-sky" : ""}`}
            >
              {s.short}
            </a>
          ))}
          {account?.admin && (
            <Link href="/admin" className={AFTER_SECTIONS}>
              Admin
            </Link>
          )}
          {/* Always last: sign in when signed out, the account page once
              signed in. */}
          {accountLink && (
            <Link href={accountLink.href} className={AFTER_SECTIONS}>
              {accountLink.label}
            </Link>
          )}
        </nav>
        <Button asChild size="sm" className="max-[900px]:hidden">
          <Link href="/#tickets">Get tickets</Link>
        </Button>
      </div>
    </header>
  );
}

// Whether the page is scrolled most of a screen down, past the landing hero.
function useScrolledPastFirstScreen(enabled: boolean) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const check = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [enabled]);
  return scrolled;
}

// The section crossing the upper middle of the screen, for the nav highlight.
function useCurrentSection(sections: Section[]) {
  const [current, setCurrent] = useState<string | null>(null);
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setCurrent(hit.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);
  return current;
}
