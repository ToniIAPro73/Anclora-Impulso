BEGIN;

ALTER TABLE "recipes"
ADD COLUMN IF NOT EXISTS "userId" TEXT,
ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'system',
ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "isEditable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "mealTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "dietTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "goalTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'recipes_userId_fkey'
  ) THEN
    ALTER TABLE "recipes"
    ADD CONSTRAINT "recipes_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "users"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'recipes_source_check'
  ) THEN
    ALTER TABLE "recipes"
    ADD CONSTRAINT "recipes_source_check"
    CHECK ("source" IN ('system', 'ai', 'user'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "recipes_userId_idx" ON "recipes" ("userId");
CREATE INDEX IF NOT EXISTS "recipes_source_idx" ON "recipes" ("source");
CREATE INDEX IF NOT EXISTS "recipes_isPublic_idx" ON "recipes" ("isPublic");

ALTER TABLE "meals"
ADD COLUMN IF NOT EXISTS "selectedRecipeId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meals_selectedRecipeId_fkey'
  ) THEN
    ALTER TABLE "meals"
    ADD CONSTRAINT "meals_selectedRecipeId_fkey"
    FOREIGN KEY ("selectedRecipeId")
    REFERENCES "recipes"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "meals_selectedRecipeId_idx" ON "meals" ("selectedRecipeId");

CREATE TABLE IF NOT EXISTS "meal_swap_history" (
  "id" TEXT PRIMARY KEY,
  "mealId" TEXT NOT NULL,
  "previousRecipeId" TEXT,
  "newRecipeId" TEXT,
  "swapSource" TEXT NOT NULL DEFAULT 'user',
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meal_swap_history_mealId_fkey'
  ) THEN
    ALTER TABLE "meal_swap_history"
    ADD CONSTRAINT "meal_swap_history_mealId_fkey"
    FOREIGN KEY ("mealId")
    REFERENCES "meals"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meal_swap_history_previousRecipeId_fkey'
  ) THEN
    ALTER TABLE "meal_swap_history"
    ADD CONSTRAINT "meal_swap_history_previousRecipeId_fkey"
    FOREIGN KEY ("previousRecipeId")
    REFERENCES "recipes"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meal_swap_history_newRecipeId_fkey'
  ) THEN
    ALTER TABLE "meal_swap_history"
    ADD CONSTRAINT "meal_swap_history_newRecipeId_fkey"
    FOREIGN KEY ("newRecipeId")
    REFERENCES "recipes"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meal_swap_history_swapSource_check'
  ) THEN
    ALTER TABLE "meal_swap_history"
    ADD CONSTRAINT "meal_swap_history_swapSource_check"
    CHECK ("swapSource" IN ('user', 'ai', 'system'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "meal_swap_history_mealId_idx" ON "meal_swap_history" ("mealId");
CREATE INDEX IF NOT EXISTS "meal_swap_history_createdAt_idx" ON "meal_swap_history" ("createdAt");

COMMIT;
