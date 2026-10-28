import { HATS } from "@/v2/hat-trick/hats";
import crossword from "../../../public/images/carousel/4_crossword.jpg";
import RulebookFigure from "./RulebookFigure";

// §1 of the rulebook opens with rule one beside Fig. 1 (which hides three
// Hat Trick hats); the examples of play follow it in the chapter.
export default function RulebookObject() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-11">
      <p className="max-w-[22em] text-[clamp(24px,2.8vw,32px)] leading-[1.3] text-navy">
        Rule one: if it&apos;s designed to be{" "}
        <mark className="bg-transparent bg-[linear-gradient(transparent_58%,var(--color-tan)_58%,var(--color-tan)_92%,transparent_92%)] text-inherit">
          played
        </mark>
        , it counts. If building it means asking &ldquo;what would the player
        choose to do next?&rdquo;, it&apos;s a game.
      </p>
      <RulebookFigure
        fig="1"
        caption="Players solving the wall crossword. Metagame 2025."
        src={crossword}
        alt="A group solving a crossword written on a wall"
        hats={[HATS.skyCap, HATS.navyCap, HATS.redHat]}
      />
    </div>
  );
}
