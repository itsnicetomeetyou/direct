/*
  Warnings:

  - Added the required column `phoneNo` to the `UserInformation` table without a default value. This is not possible if the table is not empty.
  - Made the column `firstName` on table `UserInformation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `middleName` on table `UserInformation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `UserInformation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `studentNo` on table `UserInformation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lrn` on table `UserInformation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `UserInformation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserInformation" ADD COLUMN     "phoneNo" TEXT NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "middleName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "studentNo" SET NOT NULL,
ALTER COLUMN "lrn" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;
