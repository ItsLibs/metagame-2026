import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { NO_LEVELS, type MegagameLevels } from "./megagame-levels";

/**
 * Several accounts' levels at once, by user id (the home page's speakers).
 * Ids with no account are left out of the map.
 */
export async function loadMegagameLevelsFor(
  userIds: string[],
): Promise<Map<string, MegagameLevels>> {
  const out = new Map<string, MegagameLevels>();
  if (userIds.length === 0) return out;
  const { user } = schema;
  const rows = await getDb()
    .select({
      id: user.id,
      wizard: user.wizardLevel,
      pirate: user.pirateLevel,
      alien: user.alienLevel,
    })
    .from(user)
    .where(inArray(user.id, userIds));
  for (const { id, ...levels } of rows) out.set(id, levels);
  return out;
}

export async function loadMegagameLevels(
  userId: string,
): Promise<MegagameLevels> {
  const { user } = schema;
  const [row] = await getDb()
    .select({
      wizard: user.wizardLevel,
      pirate: user.pirateLevel,
      alien: user.alienLevel,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return row ?? NO_LEVELS;
}

/** Callers check the levels are in range; the columns' checks back that up. */
export async function setMegagameLevels(
  userId: string,
  levels: MegagameLevels,
): Promise<void> {
  const { user } = schema;
  await getDb()
    .update(user)
    .set({
      wizardLevel: levels.wizard,
      pirateLevel: levels.pirate,
      alienLevel: levels.alien,
    })
    .where(eq(user.id, userId));
}
