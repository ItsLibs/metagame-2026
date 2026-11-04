import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { NO_LEVELS, type MegagameLevels } from "./megagame-levels";

export async function loadMegagameLevels(
  userId: string,
): Promise<MegagameLevels> {
  const { profiles } = schema;
  const [row] = await getDb()
    .select({
      wizard: profiles.wizardLevel,
      pirate: profiles.pirateLevel,
      alien: profiles.alienLevel,
    })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return row ?? NO_LEVELS;
}

/** Callers check the levels are in range; the columns' checks back that up. */
export async function setMegagameLevels(
  userId: string,
  levels: MegagameLevels,
): Promise<void> {
  const { profiles } = schema;
  const values = {
    wizardLevel: levels.wizard,
    pirateLevel: levels.pirate,
    alienLevel: levels.alien,
  };
  await getDb()
    .insert(profiles)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: profiles.userId, set: values });
}
