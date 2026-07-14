CREATE TABLE "wearable_connections" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "syncDirection" TEXT NOT NULL,
  "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "lastSyncAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "wearable_connections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recovery_samples" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL,
  "hrvMs" DOUBLE PRECISION,
  "restingHeartRateBpm" INTEGER,
  "sleepMinutes" INTEGER,
  "activityMinutes" INTEGER,
  "readinessScore" INTEGER NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "recovery_samples_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wearable_connections_userId_provider_key" ON "wearable_connections"("userId", "provider");
CREATE INDEX "wearable_connections_userId_idx" ON "wearable_connections"("userId");
CREATE INDEX "wearable_connections_provider_idx" ON "wearable_connections"("provider");
CREATE INDEX "recovery_samples_userId_idx" ON "recovery_samples"("userId");
CREATE INDEX "recovery_samples_provider_idx" ON "recovery_samples"("provider");
CREATE INDEX "recovery_samples_recordedAt_idx" ON "recovery_samples"("recordedAt");

ALTER TABLE "wearable_connections"
  ADD CONSTRAINT "wearable_connections_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recovery_samples"
  ADD CONSTRAINT "recovery_samples_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
