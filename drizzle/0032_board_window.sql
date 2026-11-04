DROP INDEX "unconference_notes_location_id_idx";--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "board_starts_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "board_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "unconference_notes" ADD COLUMN "board_day" date DEFAULT '2026-11-06' NOT NULL;--> statement-breakpoint
CREATE INDEX "unconference_notes_location_id_idx" ON "unconference_notes" USING btree ("location_id","board_day");--> statement-breakpoint
ALTER TABLE "locations" DROP COLUMN "layout";--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_board_window" CHECK ("locations"."board_ends_at" is null OR ("locations"."board_starts_at" is not null AND "locations"."board_ends_at" > "locations"."board_starts_at"));--> statement-breakpoint
DROP TYPE "public"."location_layout";