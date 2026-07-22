ALTER TYPE "public"."orderStatus" ADD VALUE 'en-route' BEFORE 'shipped';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "image" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "specifications" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "startingPrice" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;