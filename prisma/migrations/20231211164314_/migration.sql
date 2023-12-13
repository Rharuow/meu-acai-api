/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Made the column `clientId` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "clientId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Member_clientId_key" ON "Member"("clientId");
