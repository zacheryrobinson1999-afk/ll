-- Keep historical job rows; only daily summaries participate in the unique index.
ALTER TABLE "diary_entries" ADD COLUMN "daily_summary" text;
--> statement-breakpoint
CREATE UNIQUE INDEX "diary_entries_daily_summary_owner_date_idx"
ON "diary_entries" ("technician_id", "work_date")
WHERE "daily_summary" IS NOT NULL;
