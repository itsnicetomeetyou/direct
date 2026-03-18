-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentOptions" AS ENUM ('GCASH', 'PAYMAYA', 'PAYPAL', 'CREDITCARD', 'WALKIN');

-- CreateEnum
CREATE TYPE "DeliveryOptions" AS ENUM ('PICKUP', 'LALAMOVE');

-- CreateEnum
CREATE TYPE "RequestDocumentsStatus" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'READYTOPICKUP', 'OUTFORDELIVERY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EligibilityStatus" AS ENUM ('STUDENT', 'GRADUATED', 'BOTH');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInformation" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "studentNo" TEXT,
    "specialOrder" TEXT,
    "lrn" TEXT,
    "address" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "dayBeforeRelease" INTEGER NOT NULL DEFAULT 3,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "eligibility" "EligibilityStatus" NOT NULL DEFAULT 'BOTH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPayment" (
    "id" TEXT NOT NULL,
    "paymentOptions" "PaymentOptions" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "referenceNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestDocuments" (
    "id" TEXT NOT NULL,
    "selectedSchedule" TIMESTAMP(3),
    "deliverOptions" "DeliveryOptions" NOT NULL,
    "documentPaymentId" TEXT NOT NULL,
    "status" "RequestDocumentsStatus" NOT NULL DEFAULT 'PENDING',
    "address" TEXT,
    "additionalAddress" TEXT,
    "longitude" TEXT,
    "latitude" TEXT,
    "usersId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSelected" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestDocumentsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentSelected_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserInformation_userId_key" ON "UserInformation"("userId");

-- AddForeignKey
ALTER TABLE "UserInformation" ADD CONSTRAINT "UserInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDocuments" ADD CONSTRAINT "RequestDocuments_documentPaymentId_fkey" FOREIGN KEY ("documentPaymentId") REFERENCES "DocumentPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestDocuments" ADD CONSTRAINT "RequestDocuments_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSelected" ADD CONSTRAINT "DocumentSelected_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSelected" ADD CONSTRAINT "DocumentSelected_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSelected" ADD CONSTRAINT "DocumentSelected_requestDocumentsId_fkey" FOREIGN KEY ("requestDocumentsId") REFERENCES "RequestDocuments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
