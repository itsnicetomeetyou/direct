/*
  Warnings:

  - A unique constraint covering the columns `[documentPaymentId]` on the table `RequestDocuments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RequestDocuments_documentPaymentId_key" ON "RequestDocuments"("documentPaymentId");
