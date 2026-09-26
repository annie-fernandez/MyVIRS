CREATE TYPE "public"."analysis_source_kind" AS ENUM('text', 'pdf', 'document', 'image');--> statement-breakpoint
CREATE TABLE "analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_kind" "analysis_source_kind" NOT NULL,
	"title" text,
	"input_text" text NOT NULL,
	"sentence_count" integer NOT NULL,
	"flesch_reading_score" real NOT NULL,
	"statistics" jsonb NOT NULL,
	"word_matches" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analysis" ADD CONSTRAINT "analysis_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analysis_user_created_idx" ON "analysis" USING btree ("user_id","created_at" DESC NULLS LAST);