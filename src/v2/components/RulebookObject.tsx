import { HATS } from "@/v2/hat-trick/hats";
import crossword from "../../../public/images/carousel/4_crossword.jpg";
import RulebookFigure from "./RulebookFigure";
import RulebookRules from "./RulebookRules";

// §1 of the rulebook: what counts as a game, as numbered rules, beside
// Fig. 1 (which hides three Hat Trick hats).
export default function RulebookObject() {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-11">
      <div>
        <p className="max-w-[30em] text-[clamp(19px,2.2vw,22px)] leading-[1.4] text-navy">
          Rule one: if it&apos;s designed to be{" "}
          <mark className="bg-transparent bg-[linear-gradient(transparent_58%,var(--color-tan)_58%,var(--color-tan)_92%,transparent_92%)] text-inherit">
            played
          </mark>
          , it counts. If building it means asking &ldquo;what would the player
          choose to do next?&rdquo;, it&apos;s a game.
        </p>
        <RulebookRules
          chapter={1}
          className="mt-5"
          rules={[
            "Puzzles count.",
            "Video games count.",
            "LARPs and immersive theater count.",
            "Crosswords, trivia and design jams count.",
            "Card games and social deduction count.",
            "Rock-climbing routes count.",
            <strong key="twist" className="text-navy">
              Board games count, too.
            </strong>,
          ]}
        />
      </div>
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
