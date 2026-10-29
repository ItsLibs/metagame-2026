import { dayPasses } from "@/v2/lib/tickets";
import AtAGlance from "./AtAGlance";
import { PAGE } from "./PageSection";
import SiteHero from "./SiteHero";
import { DISPLAY, KICKER, SECTION_ANCHOR } from "./styles";
import { Button } from "./ui/button";

const FROM_USD = Math.min(...dayPasses.map((p) => p.usd));

// The home page's opening. First the landing screen kept from the live site
// (SiteHero): the METAGAME dice over the cover puzzle's library photo, with
// the dates and tickets on a cream card. Then the title, a one-paragraph
// pitch and the CTAs, with the weekend at a glance beside it.
export default function HomeHero() {
  return (
    <section id="home" className={SECTION_ANCHOR}>
      <SiteHero />
      <div
        className={`${PAGE} grid items-center gap-10 pt-6 pb-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12 lg:pt-8`}
      >
        <div>
          <p className={`${KICKER} text-[13px] text-meeple`}>
            Nov 6–8, 2026 · Lighthaven, Berkeley
          </p>
          <h1
            className={`${DISPLAY} mt-3.5 text-[clamp(76px,11vw,150px)] leading-[0.84] text-navy`}
          >
            Every kind
            <br />
            of play<span className="text-meeple">.</span>
          </h1>
          <p className="mt-5 max-w-[34em] text-lg leading-relaxed text-ink/80 sm:text-xl">
            A weekend conference devoted to games, and to the people who make,
            study and play them. Three days at Lighthaven, with a Megagame
            running through all of it.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <a href="#tickets">Get tickets · from ${FROM_USD}</a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="border-2 border-navy text-navy hover:border-navy hover:bg-navy/5"
            >
              <a href="#about">Learn more ↓</a>
            </Button>
          </div>
        </div>
        <AtAGlance />
      </div>
    </section>
  );
}
