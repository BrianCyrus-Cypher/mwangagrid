ALTER TABLE "products" ADD COLUMN "specifications" text;
ALTER TABLE "services" ADD COLUMN "startingPrice" decimal(10,2);
ALTER TABLE "services" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;
