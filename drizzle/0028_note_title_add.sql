ALTER TABLE "unconference_notes" DROP CONSTRAINT "unconference_notes_body_length";--> statement-breakpoint
ALTER TABLE "unconference_notes" ALTER COLUMN "body" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "unconference_notes" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "unconference_notes" ADD CONSTRAINT "unconference_notes_title_length" CHECK (char_length("unconference_notes"."title") > 0 AND char_length("unconference_notes"."title") <= 120);--> statement-breakpoint
ALTER TABLE "unconference_notes" ADD CONSTRAINT "unconference_notes_body_length" CHECK ("unconference_notes"."body" is null OR (char_length("unconference_notes"."body") > 0 AND char_length("unconference_notes"."body") <= 1000));