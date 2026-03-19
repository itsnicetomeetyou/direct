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

const USER_INFO_ACADEMIC_CHUNK = 800;

/**
 * collegeDepartment & course from UserInformation (saved on mobile registration).
 * Chunked for large CSV exports. Returns empty strings if columns are missing on DB.
 */
async function getUserInformationAcademicByUserIds(
  userIds: string[]
): Promise<Map<string, { collegeDepartment: string; course: string }>> {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  const map = new Map<string, { collegeDepartment: string; course: string }>();
  if (unique.length === 0) return map;

  for (let i = 0; i < unique.length; i += USER_INFO_ACADEMIC_CHUNK) {
    const slice = unique.slice(i, i + USER_INFO_ACADEMIC_CHUNK);
    try {
      const rows = await prisma.userInformation.findMany({
        where: { userId: { in: slice } },
        select: { userId: true, collegeDepartment: true, course: true }
      });
      for (const r of rows) {
        map.set(r.userId, {
          collegeDepartment: (r.collegeDepartment ?? '').trim(),
          course: (r.course ?? '').trim()
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/Unknown column/i.test(msg)) break;
      console.error('[getUserInformationAcademicByUserIds]', e);
      break;
    }
  }
  return map;
}

export async function fetchDocuments({ page, limit, search }: FetchDocumentsParams) {
  const skip = (page - 1) * limit;

  const documents = await prisma.documents.findMany({
    where: {
      ...(search && { name: { contains: search } })
    },
    orderBy: { name: 'asc' },
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

  const academicByUser = await getUserInformationAcademicByUserIds(
    documentsRequest.map((d) => d.usersId)
  );
  documentsRequest = documentsRequest.map((doc) => {
    if (!doc.users?.UserInformation) return doc;
    const fromDb = academicByUser.get(doc.usersId);
    const ui = doc.users.UserInformation as {
      collegeDepartment?: string | null;
      course?: string | null;
    };
    return {
      ...doc,
      users: {
        ...doc.users,
        UserInformation: {
          ...doc.users.UserInformation,
          collegeDepartment:
            fromDb !== undefined ? fromDb.collegeDepartment : (ui.collegeDepartment ?? '').toString().trim(),
          course: fromDb !== undefined ? fromDb.course : (ui.course ?? '').toString().trim()
        }
      }
    };
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
    where: whereClause
  });
  return {
    documentsRequest,
    totalDocumentsRequest
  };
}

const MAX_CSV_EXPORT_ROWS = 50_000;

/** Order list CSV row — collegeDepartment & course from UserInformation (mobile register-info). */
export type CsvOrderRow = {
  referenceNumber: string;
  createdAt: string;
  selectedSchedule: string;
  status: string;
  deliverOptions: string;
  studentNo: string;
  studentName: string;
  collegeDepartment: string;
  course: string;
  documents: string;
  totalAmount: string;
};

/** All orders matching filters (up to MAX_CSV_EXPORT_ROWS) for CSV download — not paginated. */
export async function exportDocumentRequestsForCsv(params: {
  search?: string | null;
  status?: string | null;
}): Promise<CsvOrderRow[]> {
  const search = params.search?.trim() || null;
  const status = params.status?.trim() || null;

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

  const USER_INFO_SELECT_EXPORT = {
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

  const orders = await prisma.requestDocuments.findMany({
    where: whereClause,
    include: {
      documentPayment: true,
      users: {
        include: {
          UserInformation: { select: USER_INFO_SELECT_EXPORT }
        }
      },
      DocumentSelected: {
        include: { document: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: MAX_CSV_EXPORT_ROWS
  });

  const academicByUser = await getUserInformationAcademicByUserIds(orders.map((o) => o.usersId));

  return orders.map((order) => {
    const ui = order.users?.UserInformation;
    const studentName = ui
      ? `${ui.lastName}, ${ui.firstName}${ui.middleName ? ` ${ui.middleName}` : ''}`
      : '';
    const docs = (order.DocumentSelected ?? [])
      .map((ds) => ds?.document?.name ?? '')
      .filter(Boolean)
      .join('; ');
    const total =
      order.documentPayment?.totalAmount !== null && order.documentPayment?.totalAmount !== undefined
        ? Number(order.documentPayment.totalAmount).toFixed(2)
        : '';
    const acad = academicByUser.get(order.usersId);

    return {
      referenceNumber: order.documentPayment?.referenceNumber ?? '',
      createdAt: order.createdAt.toISOString(),
      selectedSchedule: order.selectedSchedule ? order.selectedSchedule.toISOString() : '',
      status: order.status ?? '',
      deliverOptions: order.deliverOptions ?? '',
      studentNo: ui?.studentNo ?? '',
      studentName,
      collegeDepartment: acad?.collegeDepartment ?? '',
      course: acad?.course ?? '',
      documents: docs,
      totalAmount: total
    };
  });
}
