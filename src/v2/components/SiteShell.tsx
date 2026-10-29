"use client";

import { usePathname } from "next/navigation";
import {
  LAST_YEAR_SECTIONS,
  SECTIONS,
  SESSIONS_SECTIONS,
  type Section,
} from "@/v2/data/sections";
import ExpandingNav from "./nav/ExpandingNav";
import SiteHeader from "./SiteHeader";

// The long pages, each under the sticky header with its own sections.
const SECTIONED: Record<string, Section[]> = {
  "/": Object.values(SECTIONS),
  "/sessions": Object.values(SESSIONS_SECTIONS),
  "/last-year": Object.values(LAST_YEAR_SECTIONS),
};

// Those pages get the section header. Every other page keeps the corner die
// that unfolds into the links.
export default function SiteShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const sections = SECTIONED[pathname];
  return (
    <>
      {sections ? (
        // The home page opens on the landing screen alone; the header slides
        // in once you scroll past it.
        <SiteHeader sections={sections} hideAtTop={pathname === "/"} />
      ) : (
        <ExpandingNav />
      )}
      {/* Symmetric gutter so the page's center doesn't shift under the corner nav. */}
      <main
        className={`flex-1 overflow-x-clip ${sections ? "" : "md:px-20 lg:px-24"}`}
      >
        {children}
      </main>
    </>
  );
}
