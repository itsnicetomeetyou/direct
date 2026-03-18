/*
  Warnings:

  - You are about to drop the column `amount` on the `DocumentPayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentPayment" DROP COLUMN "amount",
ADD COLUMN     "documentFees" DECIMAL(10,2),
ADD COLUMN     "shippingFees" DECIMAL(10,2),
ADD COLUMN     "totalAmount" DECIMAL(10,2);
