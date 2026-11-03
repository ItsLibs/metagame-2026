import { and, asc, count, eq, inArray, lte, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { can } from "./access";
import { currentSession } from "./auth";
import type { NoticeDoc } from "./notice-doc";
import {
  clampNotePosition,
  noteEditor,
  noteRateWindowExpiry,
  summarizeReactions,
  type NoteColor,
  type NoteEditor,
  type NoteFields,
  type Reaction,
  type UnconferenceNote,
} from "./unconference";

const { unconferenceNotes, unconferenceNoteReactions, user, verification } =
  schema;

// Notes are read by anyone who can see the schedule, so the author's email is
// never part of the name; a code sign-in can leave the account name blank.
const authorName = sql<string>`coalesce(nullif(trim(${user.name}), ''), 'Someone')`;

const noteColumns = {
  id: unconferenceNotes.id,
  locationId: unconferenceNotes.locationId,
  title: unconferenceNotes.title,
  sticky: unconferenceNotes.sticky,
  poster: unconferenceNotes.poster,
  color: unconferenceNotes.color,
  x: unconferenceNotes.x,
  y: unconferenceNotes.y,
  authorUserId: unconferenceNotes.authorUserId,
  authorName,
  createdAt: unconferenceNotes.createdAt,
  updatedAt: unconferenceNotes.updatedAt,
};

type NoteRow = {
  id: string;
  locationId: string;
  title: string | null;
  sticky: NoticeDoc;
  poster: NoticeDoc;
  color: NoteColor;
  x: number;
  y: number;
  authorUserId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
};

const toNote = (row: NoteRow, reactions: Reaction[]): UnconferenceNote => ({
  id: row.id,
  locationId: row.locationId,
  title: row.title,
  sticky: row.sticky,
  poster: row.poster,
  color: row.color,
  x: row.x,
  y: row.y,
  author: { userId: row.authorUserId, name: row.authorName },
  reactions,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

/** Each note's reaction chips, as `viewerId` sees them. */
async function reactionsFor(
  noteIds: readonly string[],
  viewerId: string | null,
): Promise<Map<string, Reaction[]>> {
  const out = new Map<string, Reaction[]>();
  if (noteIds.length === 0) return out;
  const rows = await getDb()
    .select({
      noteId: unconferenceNoteReactions.noteId,
      emoji: unconferenceNoteReactions.emoji,
      userId: unconferenceNoteReactions.userId,
      name: authorName,
      createdAt: unconferenceNoteReactions.createdAt,
    })
    .from(unconferenceNoteReactions)
    .innerJoin(user, eq(user.id, unconferenceNoteReactions.userId))
    .where(inArray(unconferenceNoteReactions.noteId, [...noteIds]));
  const byNote = new Map<string, typeof rows>();
  for (const r of rows) {
    byNote.set(r.noteId, [...(byNote.get(r.noteId) ?? []), r]);
  }
  for (const [id, list] of byNote) {
    out.set(id, summarizeReactions(list, viewerId));
  }
  return out;
}

/** Every note in these rooms, oldest first. The board restacks for painting. */
export async function listNotesIn(
  locationIds: readonly string[],
  viewerId: string | null,
): Promise<UnconferenceNote[]> {
  if (locationIds.length === 0) return [];
  const rows = await getDb()
    .select(noteColumns)
    .from(unconferenceNotes)
    .innerJoin(user, eq(user.id, unconferenceNotes.authorUserId))
    .where(inArray(unconferenceNotes.locationId, [...locationIds]))
    .orderBy(asc(unconferenceNotes.createdAt), asc(unconferenceNotes.id));
  const reactions = await reactionsFor(
    rows.map((r) => r.id),
    viewerId,
  );
  return rows.map((r) => toNote(r, reactions.get(r.id) ?? []));
}

/**
 * One note as it stands. A partial edit (just the sticky, just the colour)
 * reads this rather than trusting the client for the other half.
 */
export async function noteById(
  noteId: string,
  viewerId: string | null = null,
): Promise<UnconferenceNote | null> {
  const [row] = await getDb()
    .select(noteColumns)
    .from(unconferenceNotes)
    .innerJoin(user, eq(user.id, unconferenceNotes.authorUserId))
    .where(eq(unconferenceNotes.id, noteId))
    .limit(1);
  if (!row) return null;
  const reactions = await reactionsFor([noteId], viewerId);
  return toNote(row, reactions.get(noteId) ?? []);
}

export type NewNote = NoteFields & {
  locationId: string;
  authorUserId: string;
  x: number;
  y: number;
};

export async function createNote(note: NewNote): Promise<UnconferenceNote> {
  const db = getDb();
  const { x, y } = clampNotePosition(note.x, note.y);
  const [[row], [who]] = await Promise.all([
    db
      .insert(unconferenceNotes)
      .values({
        locationId: note.locationId,
        authorUserId: note.authorUserId,
        title: note.title,
        sticky: note.sticky,
        poster: note.poster,
        color: note.color,
        x,
        y,
      })
      .returning(),
    db
      .select({ authorName })
      .from(user)
      .where(eq(user.id, note.authorUserId))
      .limit(1),
  ]);
  if (!row) throw new Error("That note could not be pinned up.");
  return toNote({ ...row, authorName: who?.authorName ?? "Someone" }, []);
}

/**
 * What the author may rewrite. Names the documents, title and colour only,
 * so nothing built from a form can move a note to another room or hand it to
 * someone else.
 */
export async function updateNote(
  noteId: string,
  fields: NoteFields,
): Promise<void> {
  const [updated] = await getDb()
    .update(unconferenceNotes)
    .set({
      title: fields.title,
      sticky: fields.sticky,
      poster: fields.poster,
      color: fields.color,
    })
    .where(eq(unconferenceNotes.id, noteId))
    .returning({ id: unconferenceNotes.id });
  if (!updated) throw new Error("That note is no longer on the board.");
}

/** Position only, clamped: the board's check constraints refuse the rest. */
export async function moveNote(
  noteId: string,
  position: { x: number; y: number },
): Promise<{ x: number; y: number }> {
  const { x, y } = clampNotePosition(position.x, position.y);
  const [updated] = await getDb()
    .update(unconferenceNotes)
    .set({ x, y })
    .where(eq(unconferenceNotes.id, noteId))
    .returning({ id: unconferenceNotes.id });
  if (!updated) throw new Error("That note is no longer on the board.");
  return { x, y };
}

/** True when a note was there to take down. */
export async function deleteNote(noteId: string): Promise<boolean> {
  const [gone] = await getDb()
    .delete(unconferenceNotes)
    .where(eq(unconferenceNotes.id, noteId))
    .returning({ id: unconferenceNotes.id });
  return gone !== undefined;
}

export async function noteAuthorId(noteId: string): Promise<string | null> {
  const [row] = await getDb()
    .select({ authorUserId: unconferenceNotes.authorUserId })
    .from(unconferenceNotes)
    .where(eq(unconferenceNotes.id, noteId))
    .limit(1);
  return row?.authorUserId ?? null;
}

/** How this request may change `noteId`, or null. See noteEditor(). */
export async function noteAccess(noteId: string): Promise<NoteEditor | null> {
  const [session, team, authorId] = await Promise.all([
    currentSession(),
    can("schedule.manage"),
    noteAuthorId(noteId),
  ]);
  if (!authorId) return null;
  return noteEditor(session?.user.id ?? null, authorId, !!team);
}

/** How many different emoji a notice already carries. */
export async function distinctEmojiCount(noteId: string): Promise<number> {
  const [row] = await getDb()
    .select({
      n: sql<number>`count(distinct ${unconferenceNoteReactions.emoji})::int`,
    })
    .from(unconferenceNoteReactions)
    .where(eq(unconferenceNoteReactions.noteId, noteId));
  return row?.n ?? 0;
}

/**
 * Adds the viewer's emoji, or takes it back off if it was already there.
 * Returns the note's chips afterwards.
 */
export async function toggleReaction(
  noteId: string,
  userId: string,
  emoji: string,
): Promise<{ added: boolean; reactions: Reaction[] }> {
  const db = getDb();
  const key = and(
    eq(unconferenceNoteReactions.noteId, noteId),
    eq(unconferenceNoteReactions.userId, userId),
    eq(unconferenceNoteReactions.emoji, emoji),
  );
  const removed = await db
    .delete(unconferenceNoteReactions)
    .where(key)
    .returning({ emoji: unconferenceNoteReactions.emoji });
  if (removed.length === 0) {
    await db
      .insert(unconferenceNoteReactions)
      .values({ noteId, userId, emoji })
      .onConflictDoNothing();
  }
  const chips = await reactionsFor([noteId], userId);
  return { added: removed.length === 0, reactions: chips.get(noteId) ?? [] };
}

// The posting budget is spent on pinning a note up, not on leaving it up:
// counting live rows would hand it back for every note the author deleted.
// Kept in Better Auth's verification table, like claimTicket's failure cap.
const postLog = (authorUserId: string) => `note-pinned:${authorUserId}`;

/** How many notes this account has pinned up inside the rate-limit window. */
export async function recentNoteCount(
  authorUserId: string,
  now = new Date(),
): Promise<number> {
  const db = getDb();
  const identifier = postLog(authorUserId);
  await db
    .delete(verification)
    .where(
      and(
        eq(verification.identifier, identifier),
        lte(verification.expiresAt, now),
      ),
    );
  const [row] = await db
    .select({ n: count() })
    .from(verification)
    .where(eq(verification.identifier, identifier));
  return row?.n ?? 0;
}

/** Spends one of this account's posts, whatever becomes of the note. */
export async function recordNotePost(
  authorUserId: string,
  now = new Date(),
): Promise<void> {
  await getDb()
    .insert(verification)
    .values({
      id: crypto.randomUUID(),
      identifier: postLog(authorUserId),
      value: "pinned",
      expiresAt: noteRateWindowExpiry(now),
    });
}
