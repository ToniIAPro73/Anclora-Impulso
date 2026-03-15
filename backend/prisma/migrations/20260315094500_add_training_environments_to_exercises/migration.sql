ALTER TABLE "exercises"
ADD COLUMN "trainingEnvironments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
