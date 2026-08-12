CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."daycode_usage_outcome" AS ENUM('success', 'denied', 'validation_failed');--> statement-breakpoint
CREATE TYPE "public"."login_attempt_outcome" AS ENUM('success', 'failed', 'disabled', 'locked');--> statement-breakpoint
CREATE TYPE "public"."technician_role" AS ENUM('technician', 'admin');--> statement-breakpoint
CREATE TABLE "daycode_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" uuid,
	"technician_name" text NOT NULL,
	"crane_serial_number" text,
	"requested_date" text,
	"outcome" "daycode_usage_outcome" NOT NULL,
	"denial_reason" text,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" uuid,
	"normalized_name" text NOT NULL,
	"ip_hash" text NOT NULL,
	"outcome" "login_attempt_outcome" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"technician_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "technicians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"role" "technician_role" DEFAULT 'technician' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"access_code_hash" text NOT NULL,
	"access_code_salt" text NOT NULL,
	"access_code_fingerprint" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daycode_usage" ADD CONSTRAINT "daycode_usage_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_technician_id_technicians_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."technicians"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daycode_usage_created_at_idx" ON "daycode_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "daycode_usage_technician_created_at_idx" ON "daycode_usage" USING btree ("technician_id","created_at");--> statement-breakpoint
CREATE INDEX "daycode_usage_serial_created_at_idx" ON "daycode_usage" USING btree ("crane_serial_number","created_at");--> statement-breakpoint
CREATE INDEX "login_attempts_name_created_at_idx" ON "login_attempts" USING btree ("normalized_name","created_at");--> statement-breakpoint
CREATE INDEX "login_attempts_technician_created_at_idx" ON "login_attempts" USING btree ("technician_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_technician_id_idx" ON "sessions" USING btree ("technician_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "technicians_normalized_name_unique" ON "technicians" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "technicians_access_code_fingerprint_unique" ON "technicians" USING btree ("access_code_fingerprint");
