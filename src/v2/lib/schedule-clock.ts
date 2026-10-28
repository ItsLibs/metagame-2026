import {
  CONFERENCE_DAYS,
  isPlaced,
  pacificDayKey,
  pacificMinutes,
} from "@/lib/schedule";
import { loadSchedule } from "@/lib/schedule-store";

// The home page's clock replay runs on the team's draft 2026 schedule (Libi,
// Oct 28): every placed session, published or not. It carries only what the
// clock shows, so no hosts, emails or descriptions leave the server.

export type ClockSession = {
  id: string;
  title: string;
  category: string | null;
  /** "2026-11-07", in Pacific time. */
  day: string;
  /** Minutes since Pacific midnight; an end past midnight runs over 1440. */
  start: number;
  end: number;
  location: string | null;
};

export async function loadClockSessions(): Promise<ClockSession[]> {
  try {
    const { sessions, locations } = await loadSchedule();
    const rooms = new Map(locations.map((l) => [l.id, l.name]));
    const days = new Set<string>(CONFERENCE_DAYS.map((d) => d.key));
    return sessions.filter(isPlaced).flatMap((s) => {
      const day = pacificDayKey(s.startsAt);
      if (!days.has(day)) return [];
      const start = pacificMinutes(s.startsAt);
      const end = pacificMinutes(s.endsAt);
      return [
        {
          id: s.id,
          title: s.title,
          category: s.category,
          day,
          start,
          end: end <= start ? end + 24 * 60 : end,
          location: s.locationId ? (rooms.get(s.locationId) ?? null) : null,
        },
      ];
    });
  } catch {
    // No database here (local dev, CI builds): the clock runs on the
    // weekend's fixed moments instead.
    return [];
  }
}
