-- CreateTable
CREATE TABLE "FarmDailyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "activities" TEXT NOT NULL,
    "expenseNote" TEXT,
    "expenseAmount" DOUBLE PRECISION,
    "issues" TEXT,
    "photoDataUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmDailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FarmDailyLog_userId_logDate_idx" ON "FarmDailyLog"("userId", "logDate");

-- AddForeignKey
ALTER TABLE "FarmDailyLog" ADD CONSTRAINT "FarmDailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
