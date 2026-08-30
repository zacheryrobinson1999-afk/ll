CREATE TABLE "diary_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" uuid NOT NULL,
	"work_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"duration_minutes" integer,
	"title" text NOT NULL,
	"crane_model" text,
	"crane_id" text,
	"system_category" text,
	"fault_symptom" text,
	"diagnosis" text,
	"work_performed" text NOT NULL,
	"parts_used" text,
	"outcome" text,
	"follow_up_required" boolean DEFAULT false NOT NULL,
	"follow_up_notes" text,
	"document_id" text,
	"workshop_note_id" uuid,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_entries" ADD CONSTRAINT "diary_entries_workshop_note_id_workshop_notes_id_fk" FOREIGN KEY ("workshop_note_id") REFERENCES "public"."workshop_notes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "diary_entries_technician_work_date_idx" ON "diary_entries" USING btree ("technician_id","work_date");--> statement-breakpoint
CREATE INDEX "diary_entries_technician_updated_at_idx" ON "diary_entries" USING btree ("technician_id","updated_at");--> statement-breakpoint
CREATE INDEX "diary_entries_workshop_note_id_idx" ON "diary_entries" USING btree ("workshop_note_id");