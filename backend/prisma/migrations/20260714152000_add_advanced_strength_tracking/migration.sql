-- Advanced strength tracking for Fase 2.
ALTER TABLE "session_sets"
ADD COLUMN "rir" INTEGER,
ADD COLUMN "rpe" DOUBLE PRECISION,
ADD COLUMN "restSeconds" INTEGER;

CREATE TABLE "personal_records" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "exerciseId" TEXT NOT NULL,
  "maxWeight" DOUBLE PRECISION NOT NULL,
  "bestEstimatedOneRepMax" DOUBLE PRECISION NOT NULL,
  "reps" INTEGER NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "achievedAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "personal_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "muscle_volumes" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "muscleGroup" TEXT NOT NULL,
  "totalVolume" DOUBLE PRECISION NOT NULL,
  "setCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "muscle_volumes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "personal_records_userId_exerciseId_key" ON "personal_records"("userId", "exerciseId");
CREATE INDEX "personal_records_userId_idx" ON "personal_records"("userId");
CREATE INDEX "personal_records_exerciseId_idx" ON "personal_records"("exerciseId");
CREATE INDEX "personal_records_achievedAt_idx" ON "personal_records"("achievedAt");

CREATE UNIQUE INDEX "muscle_volumes_sessionId_muscleGroup_key" ON "muscle_volumes"("sessionId", "muscleGroup");
CREATE INDEX "muscle_volumes_userId_idx" ON "muscle_volumes"("userId");
CREATE INDEX "muscle_volumes_muscleGroup_idx" ON "muscle_volumes"("muscleGroup");
CREATE INDEX "muscle_volumes_createdAt_idx" ON "muscle_volumes"("createdAt");

ALTER TABLE "personal_records"
ADD CONSTRAINT "personal_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "personal_records"
ADD CONSTRAINT "personal_records_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "muscle_volumes"
ADD CONSTRAINT "muscle_volumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "muscle_volumes"
ADD CONSTRAINT "muscle_volumes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
