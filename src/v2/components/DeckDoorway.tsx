import Link from "next/link";
import { SESSIONS_2026, type SessionStatus } from "@/v2/data/sessions-2026";
import { HATS } from "@/v2/hat-trick/hats";
import roundRobin from "../../../public/images/misc_photos/board_game_round_robin_2.jpg";
import RulebookFigure from "./RulebookFigure";
import { STATUS } from "./sessions/kinds";
import { DISPLAY } from "./styles";
import { Button } from "./ui/button";

const STATUSES: SessionStatus[] = ["confirmed", "review", "unconference"];
const count = (status: SessionStatus) =>
  SESSIONS_2026.filter((s) => s.status === status).length;

// The end of §2: a game from 2025 that's back for 2026 (Fig. 2, which hides
// the Hat Trick's wizard hat), beside the way into every 2026 session.
export default function DeckDoorway() {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
      <RulebookFigure
        fig="2"
        caption="Board Game Round Robin at Metagame 2025. It's back for 2026."
        src={roundRobin}
        alt="A crowd leaning over a long table of abstract games during the board game round robin"
        hats={[HATS.wizard]}
      />
      <div className="rounded-[18px] bg-navy p-5 text-cream sm:p-6">
        <p className="font-space-mono text-xs font-bold tracking-[0.14em] text-sky uppercase">
          The deck so far
        </p>
        <h3
          className={`${DISPLAY} mt-2 text-[clamp(34px,4vw,48px)] leading-[0.95] tracking-[0.01em]`}
        >
          Every 2026 session, and where it stands
        </h3>
        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-[10px] bg-white/20">
          {STATUSES.map((st) => (
            <div key={st} className="bg-navy px-3 py-2.5">
              <dt className="font-space-mono text-[10px] font-bold tracking-[0.14em] text-tan uppercase">
                {STATUS[st].label}
              </dt>
              <dd className={`${DISPLAY} mt-1 text-[34px] leading-none`}>
                {count(st)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/sessions">Browse every session</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/last-year">What 2025 looked like</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
