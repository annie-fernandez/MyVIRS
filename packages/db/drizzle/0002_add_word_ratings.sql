CREATE TABLE "word_rating" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"word" varchar(256) NOT NULL,
	"rating" smallint NOT NULL,
	"context" text,
	"analysis_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "word_rating_rating_range" CHECK ("word_rating"."rating" between 1 and 5)
);
--> statement-breakpoint
ALTER TABLE "word_rating" ADD CONSTRAINT "word_rating_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "word_rating" ADD CONSTRAINT "word_rating_analysis_id_analysis_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."analysis"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "word_rating_user_word_created_idx" ON "word_rating" USING btree ("user_id","word","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "word_rating_user_created_idx" ON "word_rating" USING btree ("user_id","created_at");