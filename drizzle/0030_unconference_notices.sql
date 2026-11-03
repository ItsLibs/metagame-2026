CREATE TABLE "unconference_note_reactions" (
	"note_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unconference_note_reactions_note_id_user_id_emoji_pk" PRIMARY KEY("note_id","user_id","emoji"),
	CONSTRAINT "unconference_note_reactions_emoji_length" CHECK (char_length("unconference_note_reactions"."emoji") > 0 AND char_length("unconference_note_reactions"."emoji") <= 32)
);
--> statement-breakpoint
ALTER TABLE "unconference_notes" DROP CONSTRAINT "unconference_notes_body_length";--> statement-breakpoint
ALTER TABLE "unconference_notes" DROP CONSTRAINT "unconference_notes_title_length";--> statement-breakpoint
ALTER TABLE "unconference_notes" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "unconference_notes" ADD COLUMN "sticky" jsonb DEFAULT '{"v":1,"items":[]}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "unconference_notes" ADD COLUMN "poster" jsonb DEFAULT '{"v":1,"items":[]}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "unconference_note_reactions" ADD CONSTRAINT "unconference_note_reactions_note_id_unconference_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."unconference_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unconference_note_reactions" ADD CONSTRAINT "unconference_note_reactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "unconference_note_reactions_user_id_idx" ON "unconference_note_reactions" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "unconference_notes" DROP COLUMN "body";--> statement-breakpoint
ALTER TABLE "unconference_notes" ADD CONSTRAINT "unconference_notes_title_length" CHECK ("unconference_notes"."title" is null OR char_length("unconference_notes"."title") <= 120);