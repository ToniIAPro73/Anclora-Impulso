-- AlterTable
ALTER TABLE "users" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "avatarDataUrl" TEXT,
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "sex" TEXT,
ADD COLUMN     "targetWeightKg" DOUBLE PRECISION,
ADD COLUMN     "timeframeWeeks" INTEGER,
ADD COLUMN     "trainingDaysPerWeek" INTEGER,
ADD COLUMN     "weightKg" DOUBLE PRECISION;
