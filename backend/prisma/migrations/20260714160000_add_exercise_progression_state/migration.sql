CREATE TABLE "exercise_progression_states" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "currentWeight" DOUBLE PRECISION NOT NULL,
    "targetMinReps" INTEGER NOT NULL,
    "targetMaxReps" INTEGER NOT NULL,
    "lastSessionReps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "lastSessionRIR" DOUBLE PRECISION,
    "consecutiveSuccesses" INTEGER NOT NULL DEFAULT 0,
    "consecutiveStalls" INTEGER NOT NULL DEFAULT 0,
    "lastTrainedAt" TIMESTAMP(3),
    "strategy" TEXT NOT NULL DEFAULT 'LINEAR',
    "deloadActive" BOOLEAN NOT NULL DEFAULT false,
    "lastDeloadAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_progression_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "exercise_progression_states_userId_exerciseId_key" ON "exercise_progression_states"("userId", "exerciseId");
CREATE INDEX "exercise_progression_states_userId_idx" ON "exercise_progression_states"("userId");
CREATE INDEX "exercise_progression_states_exerciseId_idx" ON "exercise_progression_states"("exerciseId");
CREATE INDEX "exercise_progression_states_lastTrainedAt_idx" ON "exercise_progression_states"("lastTrainedAt");

ALTER TABLE "exercise_progression_states" ADD CONSTRAINT "exercise_progression_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_progression_states" ADD CONSTRAINT "exercise_progression_states_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
