CREATE TABLE "food_items" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "brand" TEXT,
  "barcode" TEXT,
  "servingSizeG" DOUBLE PRECISION NOT NULL,
  "calories" DOUBLE PRECISION NOT NULL,
  "protein" DOUBLE PRECISION NOT NULL,
  "carbs" DOUBLE PRECISION NOT NULL,
  "fat" DOUBLE PRECISION NOT NULL,
  "fiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "source" TEXT NOT NULL DEFAULT 'user',
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meal_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "foodItemId" TEXT,
  "mealType" TEXT NOT NULL,
  "consumedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "quantityG" DOUBLE PRECISION,
  "name" TEXT NOT NULL,
  "calories" DOUBLE PRECISION NOT NULL,
  "protein" DOUBLE PRECISION NOT NULL,
  "carbs" DOUBLE PRECISION NOT NULL,
  "fat" DOUBLE PRECISION NOT NULL,
  "fiber" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "meal_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "nutrition_targets" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "calories" DOUBLE PRECISION NOT NULL,
  "protein" DOUBLE PRECISION NOT NULL,
  "carbs" DOUBLE PRECISION NOT NULL,
  "fat" DOUBLE PRECISION NOT NULL,
  "fiber" DOUBLE PRECISION NOT NULL,
  "goal" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "nutrition_targets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "health_data_imports" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "importType" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "payload" JSONB,
  "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "health_data_imports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "food_items_userId_idx" ON "food_items"("userId");
CREATE INDEX "food_items_name_idx" ON "food_items"("name");
CREATE INDEX "food_items_barcode_idx" ON "food_items"("barcode");
CREATE INDEX "meal_logs_userId_idx" ON "meal_logs"("userId");
CREATE INDEX "meal_logs_foodItemId_idx" ON "meal_logs"("foodItemId");
CREATE INDEX "meal_logs_consumedAt_idx" ON "meal_logs"("consumedAt");
CREATE UNIQUE INDEX "nutrition_targets_userId_key" ON "nutrition_targets"("userId");
CREATE INDEX "health_data_imports_userId_idx" ON "health_data_imports"("userId");
CREATE INDEX "health_data_imports_provider_idx" ON "health_data_imports"("provider");
CREATE INDEX "health_data_imports_importedAt_idx" ON "health_data_imports"("importedAt");

ALTER TABLE "food_items"
  ADD CONSTRAINT "food_items_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "meal_logs"
  ADD CONSTRAINT "meal_logs_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meal_logs"
  ADD CONSTRAINT "meal_logs_foodItemId_fkey"
  FOREIGN KEY ("foodItemId") REFERENCES "food_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "nutrition_targets"
  ADD CONSTRAINT "nutrition_targets_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "health_data_imports"
  ADD CONSTRAINT "health_data_imports_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
