-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "editorialNotes" TEXT,
ADD COLUMN     "editorialOverrideStatus" TEXT,
ADD COLUMN     "editorialReviewedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "editorialNotes" TEXT,
ADD COLUMN     "editorialOverrideStatus" TEXT,
ADD COLUMN     "editorialReviewedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "metadata" JSONB,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_deliveries_dedupeKey_key" ON "notification_deliveries"("dedupeKey");

-- CreateIndex
CREATE INDEX "notification_deliveries_userId_idx" ON "notification_deliveries"("userId");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_idx" ON "notification_deliveries"("status");

-- CreateIndex
CREATE INDEX "notification_deliveries_scheduledFor_idx" ON "notification_deliveries"("scheduledFor");

-- CreateIndex
CREATE INDEX "notification_deliveries_createdAt_idx" ON "notification_deliveries"("createdAt");

-- AddForeignKey
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
