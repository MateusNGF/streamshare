-- Step 1: Fill null values with a fallback (createdAt + 5 days)
UPDATE "cobranca" SET "dataVencimento" = "createdAt" + INTERVAL '5 days' WHERE "dataVencimento" IS NULL;

-- Step 2: Now make the column mandatory
ALTER TABLE "cobranca" ALTER COLUMN "dataVencimento" SET NOT NULL;
