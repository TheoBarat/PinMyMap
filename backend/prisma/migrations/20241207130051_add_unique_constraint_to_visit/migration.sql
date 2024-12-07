/*
  Warnings:

  - A unique constraint covering the columns `[userId,countryId]` on the table `Visit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Visit_userId_countryId_key" ON "Visit"("userId", "countryId");
