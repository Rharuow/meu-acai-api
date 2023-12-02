/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Member_clientId_key" ON "Member"("clientId");
