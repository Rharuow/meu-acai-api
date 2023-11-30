/*
  Warnings:

  - A unique constraint covering the columns `[house,square]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Address_house_square_key" ON "Address"("house", "square");
