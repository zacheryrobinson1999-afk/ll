CREATE TABLE "workshop_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"crane_model" text,
	"system_category" text,
	"document_id" text,
	"document_title" text,
	"page_reference" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workshop_notes" ADD CONSTRAINT "workshop_notes_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workshop_notes_technician_updated_at_idx" ON "workshop_notes" USING btree ("technician_id","updated_at");--> statement-breakpoint
CREATE INDEX "workshop_notes_document_id_idx" ON "workshop_notes" USING btree ("document_id");