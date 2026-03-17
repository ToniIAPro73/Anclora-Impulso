-- AlterTable
ALTER TABLE "users" ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "limitations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "preferredTrainingEnvironment" TEXT,
ADD COLUMN     "trainingGoal" TEXT;
