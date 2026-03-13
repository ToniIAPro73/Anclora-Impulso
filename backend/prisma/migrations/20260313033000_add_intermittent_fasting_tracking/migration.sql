-- AlterTable
ALTER TABLE "meal_plans"
ADD COLUMN "dietType" TEXT,
ADD COLUMN "carryoverCaloriesApplied" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "meals"
ADD COLUMN "servingMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN "adjustmentReason" TEXT;

-- AlterTable
ALTER TABLE "nutrition_logs"
ADD COLUMN "consumedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_nutrition_balances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carryoverCalories" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_nutrition_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_nutrition_balances_userId_key" ON "user_nutrition_balances"("userId");

-- AddForeignKey
ALTER TABLE "user_nutrition_balances"
ADD CONSTRAINT "user_nutrition_balances_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
