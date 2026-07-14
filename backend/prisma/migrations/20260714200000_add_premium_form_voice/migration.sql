ALTER TABLE "users"
  ADD COLUMN "subscriptionTier" TEXT NOT NULL DEFAULT 'free';

CREATE TABLE "form_analysis_requests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "exerciseName" TEXT NOT NULL,
  "mediaType" TEXT NOT NULL,
  "mediaUrl" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "feedback" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "disclaimer" TEXT NOT NULL,
  "clientAnalysis" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "form_analysis_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "voice_cue_sessions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "workoutSessionId" TEXT,
  "exerciseName" TEXT NOT NULL,
  "phase" TEXT NOT NULL,
  "intensity" TEXT NOT NULL,
  "locale" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "audioStatus" TEXT NOT NULL,
  "cues" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "disclaimer" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "voice_cue_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "form_analysis_requests_userId_idx" ON "form_analysis_requests"("userId");
CREATE INDEX "form_analysis_requests_status_idx" ON "form_analysis_requests"("status");
CREATE INDEX "form_analysis_requests_createdAt_idx" ON "form_analysis_requests"("createdAt");
CREATE INDEX "voice_cue_sessions_userId_idx" ON "voice_cue_sessions"("userId");
CREATE INDEX "voice_cue_sessions_workoutSessionId_idx" ON "voice_cue_sessions"("workoutSessionId");
CREATE INDEX "voice_cue_sessions_createdAt_idx" ON "voice_cue_sessions"("createdAt");

ALTER TABLE "form_analysis_requests"
  ADD CONSTRAINT "form_analysis_requests_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "voice_cue_sessions"
  ADD CONSTRAINT "voice_cue_sessions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
