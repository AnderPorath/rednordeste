-- AlterTable
ALTER TABLE "Company" ADD COLUMN "passwordHash" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
