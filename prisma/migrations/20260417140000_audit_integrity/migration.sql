-- Audit trail
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "actorName" TEXT,
    "actorRole" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Sale: system timestamps + actor + immutability support
ALTER TABLE "Sale" ADD COLUMN "recordCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Sale" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Sale" ADD COLUMN "createdByUserId" TEXT;
ALTER TABLE "Sale" ADD COLUMN "lastUpdatedByUserId" TEXT;

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_lastUpdatedByUserId_fkey" FOREIGN KEY ("lastUpdatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Procurement: proof photo + actors + updatedAt
ALTER TABLE "Procurement" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Procurement" ADD COLUMN "photoDataUrl" TEXT;
ALTER TABLE "Procurement" ADD COLUMN "createdByUserId" TEXT;
ALTER TABLE "Procurement" ADD COLUMN "lastUpdatedByUserId" TEXT;

ALTER TABLE "Procurement" ADD CONSTRAINT "Procurement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Procurement" ADD CONSTRAINT "Procurement_lastUpdatedByUserId_fkey" FOREIGN KEY ("lastUpdatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
