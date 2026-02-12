'use server';
import { Prisma, RequestDocumentsStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { retrieveOrder } from './utils/lalamove';
import { uploadToCloudinary } from './kiosk';
import { EligibilityStatus } from '@prisma/client';

interface FetchDocumentsParams {
  page: number;
  limit: number;
  search?: string | null;
  status?: string | null;
}

export async function fetchDocuments({ page, limit, search }: FetchDocumentsParams) {
  const skip = (page - 1) * limit;

  const documents = await prisma.documents.findMany({
    where: {
      ...(search && { name: { contains: search } })
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  const totalDocuments = await prisma.documents.count({
    where: {
      ...(search && { name: { contains: search } })
    }
  });

  return {
    documents: documents.map((doc) => ({
      ...doc,
      price: Number(doc.price)
    })),
    totalDocuments
  };
}

export async function createDocument(data: FormData) {
  const formName = data.get('name') as string;
  const formPrice = data.get('price') as string;
  const formAvailabilityStatus = data.get('isAvailable') as string;
  const formEligibilityStatus = data.get('eligibility') as EligibilityStatus;

  const nameExist = await prisma.documents.findFirst({
    where: { name: formName }
  });
  if (nameExist) throw new Error('Document name already exists');
  const cloudinaryResponse = await uploadToCloudinary(data);
  const response = await prisma.documents.create({
    data: {
      name: formName,
      price: formPrice,
      isAvailable: formAvailabilityStatus == 'true' ? true : false,
      eligibility: formEligibilityStatus,
      sampleDocs: cloudinaryResponse.secure_url
    }
  });
  return response;
}

export async function fetchDocumentById(documentId: string) {
  const checkDocumentExist = await prisma.documents.findFirst({
    where: { id: documentId }
  });
  if (!checkDocumentExist) throw new Error('Document not found');
  const document = await prisma.documents.findFirst({
    where: { id: documentId }
  });
  return document;
}

export async function updateDocument(documentId: string, data: FormData) {
  const formName = data.get('name') as string;
  const formPrice = data.get('price') as string;
  const formAvailabilityStatus = data.get('isAvailable') as string;
  const formEligibilityStatus = data.get('eligibility') as EligibilityStatus;

  const checkDocumentExist = await prisma.documents.findFirst({
    where: { id: documentId }
  });
  if (!checkDocumentExist) throw new Error('Document not found');
  const cloudinaryResponse = await uploadToCloudinary(data);
  const response = await prisma.documents.update({
    where: { id: documentId },
    data: {
      name: formName,
      price: formPrice,
      isAvailable: formAvailabilityStatus == 'true' ? true : false,
      eligibility: formEligibilityStatus,
      sampleDocs: cloudinaryResponse.secure_url
    }
  });
  return response;
}

export async function deleteDocument(documentId: string) {
  const checkDocumentExist = await prisma.documents.findFirst({
    where: { id: documentId }
  });
  if (!checkDocumentExist) throw new Error('Document not found');
  const response = await prisma.documents.delete({
    where: { id: documentId }
  });
  return response;
}

export async function fetchDocumentRequest({ page, limit, search, status }: FetchDocumentsParams) {
  const skip = (page - 1) * limit;
  const documentsRequest = await prisma.requestDocuments.findMany({
    where: {
      ...(search && {
        OR: [
          { users: { UserInformation: { firstName: { contains: search } } } },
          { users: { UserInformation: { lastName: { contains: search } } } }
        ]
      }),
      ...(status && {
        status: {
          in: status.split('.').map((s) => RequestDocumentsStatus[s as keyof typeof RequestDocumentsStatus])
        }
      })
    },
    include: {
      documentPayment: true,
      users: {
        include: {
          UserInformation: true
        }
      },
      DocumentSelected: {
        include: {
          document: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  documentsRequest.map(async (column) => {
    if (column.deliverOptions === 'LALAMOVE' && column.status === 'OUTFORDELIVERY') {
      if (column.logisticOrderId) {
        const updateLogisticStatus = await retrieveOrder(column.logisticOrderId);
        if (updateLogisticStatus.status === 'EXPIRED') {
          await prisma.requestDocuments.update({
            where: {
              id: column.id
            },
            data: { status: 'PROCESSING' }
          });
          revalidatePath('dashboard/request');
        }
        if (updateLogisticStatus.status === 'COMPLETED') {
          await prisma.requestDocuments.update({
            where: {
              id: column.id
            },
            data: { status: 'COMPLETED' }
          });
          revalidatePath('dashboard/request');
        }
      }
    }
  });

  const totalDocumentsRequest = await prisma.requestDocuments.count({
    where: {
      ...(search && { id: { contains: search } }),
      ...(status && {
        status: {
          in: status.split('.').map((s) => RequestDocumentsStatus[s as keyof typeof RequestDocumentsStatus])
        }
      })
    }
  });
  return {
    documentsRequest,
    totalDocumentsRequest
  };
}
