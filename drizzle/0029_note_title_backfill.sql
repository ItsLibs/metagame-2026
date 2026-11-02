-- Notes written before a note had a heading carry everything in `body`. The
-- first line becomes the title, the rest stays the body, and a note that was
-- one line becomes a heading on its own.
--
-- A no-op on production, where this table arrives empty in the same deploy.
UPDATE "unconference_notes"
SET
  "title" = left(split_part("body", E'\n', 1), 120),
  "body" = nullif(
    btrim(substr("body", length(split_part("body", E'\n', 1)) + 2)),
    ''
  )
WHERE "title" IS NULL;
--> statement-breakpoint
-- Nothing may be left without a heading: a body of only newlines would have
-- produced an empty title, which the length check refuses.
UPDATE "unconference_notes"
SET "title" = 'Untitled note'
WHERE "title" IS NULL OR btrim("title") = '';
