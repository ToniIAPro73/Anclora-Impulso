CREATE TABLE "coach_conversations" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "coach_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coach_messages" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "provider" TEXT,
  "model" TEXT,
  "estimatedTokens" INTEGER NOT NULL DEFAULT 0,
  "safetyFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "coach_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coach_usage_windows" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "windowStartsAt" TIMESTAMP(3) NOT NULL,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  "tokenEstimate" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "coach_usage_windows_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "coach_conversations_userId_idx" ON "coach_conversations"("userId");
CREATE INDEX "coach_conversations_updatedAt_idx" ON "coach_conversations"("updatedAt");
CREATE INDEX "coach_messages_conversationId_idx" ON "coach_messages"("conversationId");
CREATE INDEX "coach_messages_createdAt_idx" ON "coach_messages"("createdAt");
CREATE INDEX "coach_usage_windows_userId_idx" ON "coach_usage_windows"("userId");
CREATE INDEX "coach_usage_windows_windowStartsAt_idx" ON "coach_usage_windows"("windowStartsAt");
CREATE UNIQUE INDEX "coach_usage_windows_userId_windowStartsAt_key" ON "coach_usage_windows"("userId", "windowStartsAt");

ALTER TABLE "coach_conversations"
  ADD CONSTRAINT "coach_conversations_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coach_messages"
  ADD CONSTRAINT "coach_messages_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "coach_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "coach_usage_windows"
  ADD CONSTRAINT "coach_usage_windows_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
