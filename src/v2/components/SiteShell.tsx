"use client";

import { usePathname } from "next/navigation";
import ExpandingNav from "./nav/ExpandingNav";
import RulebookHeader from "./RulebookHeader";

// The home page reads as the game's rulebook, under its own sticky chapter
// header. Every other page keeps the corner die that unfolds into the links.
export default function SiteShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const home = usePathname() === "/";
  return (
    <>
      {home ? <RulebookHeader /> : <ExpandingNav />}
      {/* Symmetric gutter so the page's center doesn't shift under the corner nav. */}
      <main
        className={`flex-1 overflow-x-clip ${home ? "" : "md:px-20 lg:px-24"}`}
      >
        {children}
      </main>
    </>
  );
}
