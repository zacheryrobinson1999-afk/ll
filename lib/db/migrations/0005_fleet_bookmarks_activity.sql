CREATE TABLE "activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" uuid NOT NULL,
	"type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"crane_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dedup_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manual_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" uuid NOT NULL,
	"document_id" text NOT NULL,
	"section_ref" text DEFAULT '' NOT NULL,
	"page_ref" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_bookmarks" ADD CONSTRAINT "manual_bookmarks_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "activity_events_owner_dedup_unique" ON "activity_events" USING btree ("technician_id","dedup_key");--> statement-breakpoint
CREATE INDEX "activity_events_owner_created_idx" ON "activity_events" USING btree ("technician_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_events_owner_crane_created_idx" ON "activity_events" USING btree ("technician_id","crane_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "manual_bookmarks_owner_document_ref_unique" ON "manual_bookmarks" USING btree ("technician_id","document_id","section_ref","page_ref");--> statement-breakpoint
CREATE INDEX "manual_bookmarks_owner_created_idx" ON "manual_bookmarks" USING btree ("technician_id","created_at");