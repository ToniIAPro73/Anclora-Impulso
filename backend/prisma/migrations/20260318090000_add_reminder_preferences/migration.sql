ALTER TABLE "users"
ADD COLUMN "remindersEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "reminderTime" TEXT,
ADD COLUMN "reminderWorkout" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "reminderNutrition" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "reminderWeeklyReview" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "reminderReactivation" BOOLEAN NOT NULL DEFAULT true;
