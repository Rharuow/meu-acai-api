-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;
