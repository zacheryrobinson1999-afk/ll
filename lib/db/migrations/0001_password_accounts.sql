DROP INDEX "technicians_access_code_fingerprint_unique";--> statement-breakpoint
ALTER TABLE "technicians" ALTER COLUMN "access_code_fingerprint" DROP NOT NULL;