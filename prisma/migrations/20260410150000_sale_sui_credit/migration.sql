-- AlterTable
ALTER TABLE "User" ADD COLUMN "creditLimitUgx" DOUBLE PRECISION NOT NULL DEFAULT 1000000;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN "settlementMethod" TEXT;
ALTER TABLE "Sale" ADD COLUMN "suiTxDigest" TEXT;
ALTER TABLE "Sale" ADD COLUMN "buyerUserId" TEXT;
ALTER TABLE "Sale" ADD COLUMN "procurementId" INTEGER;

CREATE UNIQUE INDEX "Sale_suiTxDigest_key" ON "Sale"("suiTxDigest");

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "Procurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
