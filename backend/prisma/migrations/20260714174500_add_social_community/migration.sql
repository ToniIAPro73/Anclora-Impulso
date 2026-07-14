ALTER TABLE "users"
  ADD COLUMN "socialProfileVisibility" TEXT NOT NULL DEFAULT 'public';

CREATE TABLE "follows" (
  "id" TEXT NOT NULL,
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_feed_items" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "sourceType" TEXT,
  "sourceId" TEXT,
  "visibility" TEXT NOT NULL DEFAULT 'public',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "activity_feed_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "kudos" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "feedItemId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "kudos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "challenges" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "challenge_participants" (
  "id" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "challenge_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "follows_followerId_followingId_key" ON "follows"("followerId", "followingId");
CREATE INDEX "follows_followerId_idx" ON "follows"("followerId");
CREATE INDEX "follows_followingId_idx" ON "follows"("followingId");
CREATE INDEX "activity_feed_items_userId_idx" ON "activity_feed_items"("userId");
CREATE INDEX "activity_feed_items_type_idx" ON "activity_feed_items"("type");
CREATE INDEX "activity_feed_items_visibility_idx" ON "activity_feed_items"("visibility");
CREATE INDEX "activity_feed_items_createdAt_idx" ON "activity_feed_items"("createdAt");
CREATE UNIQUE INDEX "kudos_userId_feedItemId_key" ON "kudos"("userId", "feedItemId");
CREATE INDEX "kudos_userId_idx" ON "kudos"("userId");
CREATE INDEX "kudos_feedItemId_idx" ON "kudos"("feedItemId");
CREATE UNIQUE INDEX "challenges_key_key" ON "challenges"("key");
CREATE INDEX "challenges_startsAt_idx" ON "challenges"("startsAt");
CREATE INDEX "challenges_endsAt_idx" ON "challenges"("endsAt");
CREATE UNIQUE INDEX "challenge_participants_challengeId_userId_key" ON "challenge_participants"("challengeId", "userId");
CREATE INDEX "challenge_participants_challengeId_idx" ON "challenge_participants"("challengeId");
CREATE INDEX "challenge_participants_userId_idx" ON "challenge_participants"("userId");

ALTER TABLE "follows"
  ADD CONSTRAINT "follows_followerId_fkey"
  FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "follows"
  ADD CONSTRAINT "follows_followingId_fkey"
  FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "activity_feed_items"
  ADD CONSTRAINT "activity_feed_items_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "kudos"
  ADD CONSTRAINT "kudos_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "kudos"
  ADD CONSTRAINT "kudos_feedItemId_fkey"
  FOREIGN KEY ("feedItemId") REFERENCES "activity_feed_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "challenge_participants"
  ADD CONSTRAINT "challenge_participants_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "challenge_participants"
  ADD CONSTRAINT "challenge_participants_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
