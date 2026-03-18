'use server';
import { Prisma, RequestDocumentsStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { retrieveOrder } from './utils/lalamove';
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

export async function createDocument(data: {
  name: string;
  price: string;
  isAvailable: string;
  eligibility: string;
  sampleDocs?: string | null;
  dayBeforeRelease?: number;
}) {
  const nameExist = await prisma.documents.findFirst({
    where: { name: data.name }
  });
  if (nameExist) throw new Error('Document name already exists');
  const response = await prisma.documents.create({
    data: {
      name: data.name,
      price: data.price,
      isAvailable: data.isAvailable == 'true' ? true : false,
      eligibility: data.eligibility as EligibilityStatus,
      sampleDocs: data.sampleDocs ?? null,
      dayBeforeRelease: data.dayBeforeRelease ?? 3
    }
  });
  return { ...response, price: Number(response.price) };
}

export async function fetchDocumentById(documentId: string) {
  const document = await prisma.documents.findFirst({
    where: { id: documentId }
  });
  if (!document) throw new Error('Document not found');
  return {
    ...document,
    price: Number(document.price),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString()
  };
}

export async function updateDocument(documentId: string, data: {
  name: string;
  price: string;
  isAvailable: string;
  eligibility: string;
  sampleDocs?: string | null;
  dayBeforeRelease?: number;
}) {
  const checkDocumentExist = await prisma.documents.findFirst({
    where: { id: documentId }
  });
  if (!checkDocumentExist) throw new Error('Document not found');
  const response = await prisma.documents.update({
    where: { id: documentId },
    data: {
      name: data.name,
      price: data.price,
      isAvailable: data.isAvailable == 'true' ? true : false,
      eligibility: data.eligibility as EligibilityStatus,
      sampleDocs: data.sampleDocs !== undefined ? data.sampleDocs : checkDocumentExist.sampleDocs,
      dayBeforeRelease: data.dayBeforeRelease ?? checkDocumentExist.dayBeforeRelease
    }
  });
  return { ...response, price: Number(response.price) };
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
  const whereClause: Prisma.RequestDocumentsWhereInput = {
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
  };

  const USER_INFO_SELECT_BASE = {
    id: true,
    firstName: true,
    middleName: true,
    lastName: true,
    studentNo: true,
    specialOrder: true,
    lrn: true,
    address: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    phoneNo: true,
    birthDate: true
  } as const;

  const USER_INFO_SELECT_WITH_ACADEMIC = {
    ...USER_INFO_SELECT_BASE,
    collegeDepartment: true,
    course: true
  } as const;

  async function fetchRequests(includeAcademic: boolean) {
    return prisma.requestDocuments.findMany({
      where: whereClause,
      include: {
        documentPayment: true,
        users: {
          include: {
            UserInformation: {
              select: includeAcademic ? USER_INFO_SELECT_WITH_ACADEMIC : USER_INFO_SELECT_BASE
            }
          }
        },
        DocumentSelected: {
          include: { document: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
  }

  let documentsRequest = await fetchRequests(true).catch(async (err) => {
    const message = err instanceof Error ? err.message : String(err);
    // Backward-compatible fallback for production DBs that haven't been migrated yet.
    if (/Unknown column/i.test(message) && /(collegeDepartment|course)/i.test(message)) {
      return fetchRequests(false);
    }
    throw err;
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
