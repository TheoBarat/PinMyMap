-- AlterTable
ALTER TABLE "Visit" ADD COLUMN "color" TEXT;

-- CreateTable
CREATE TABLE "StatusColor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "color" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StatusColor_status_key" ON "StatusColor"("status");
