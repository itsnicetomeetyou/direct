-- DropForeignKey
ALTER TABLE "DocumentSelected" DROP CONSTRAINT "DocumentSelected_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSelected" DROP CONSTRAINT "DocumentSelected_requestDocumentsId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSelected" DROP CONSTRAINT "DocumentSelected_userId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDocuments" DROP CONSTRAINT "RequestDocuments_documentPaymentId_fkey";

-- DropForeignKey
ALTER TABLE "RequestDocuments" DROP CONSTRAINT "RequestDocuments_usersId_fkey";

-- DropForeignKey
ALTER TABLE "UserInformation" DROP CONSTRAINT "UserInformation_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserInformation" ADD CONSTRAINT "UserInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDocuments" ADD CONSTRAINT "RequestDocuments_documentPaymentId_fkey" FOREIGN KEY ("documentPaymentId") REFERENCES "DocumentPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDocuments" ADD CONSTRAINT "RequestDocuments_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSelected" ADD CONSTRAINT "DocumentSelected_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSelected" ADD CONSTRAINT "DocumentSelected_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSelected" ADD CONSTRAINT "DocumentSelected_requestDocumentsId_fkey" FOREIGN KEY ("requestDocumentsId") REFERENCES "RequestDocuments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
