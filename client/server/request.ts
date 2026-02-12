'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { RequestDocumentsStatus } from '@prisma/client';
import { createOrder, createQuotation } from './utils/lalamove';
import { IQuotation } from '@lalamove/lalamove-js';
import { IOrder } from '@lalamove/lalamove-js/dist/response/order';
import parsePhoneNumber from 'libphonenumber-js';

export async function changeStatus(data: {
  requestDocumentId: string;
  status: RequestDocumentsStatus;
  recipient?: {
    coordinates: {
      lat: string;
      lng: string;
    };
    address: string;
  };
}) {
  // Find the request document
  const findRequestDocuments = await prisma.requestDocuments.findFirst({
    where: {
      id: data.requestDocumentId
    },
    include: {
      users: {
        include: {
          UserInformation: true
        }
      }
    }
  });
  if (!findRequestDocuments) throw new Error('Request Document not found');
  if (data.status === 'OUTFORDELIVERY' && data.recipient) {
    const getQuotation: IQuotation = await createQuotation(data.recipient);
    if (!getQuotation) throw new Error('Failed to create quotation');
    const createOrderLalamove: IOrder = await createOrder({
      quotationId: getQuotation.id,
      senderStopId: getQuotation.stops[0].id ?? '',
      recipientStopId: getQuotation.stops[1].id ?? '',
      recipientName: `${findRequestDocuments?.users?.UserInformation?.firstName} ${findRequestDocuments?.users?.UserInformation?.lastName}`,
      recipientPhoneNo: parsePhoneNumber(findRequestDocuments.users.UserInformation?.phoneNo ?? '', 'PH')?.number ?? '',
      recipientRemarks: 'Contact the recipient before delivery'
    });
    if (!createOrderLalamove) throw new Error('Failed to create order');
    await prisma.requestDocuments.update({
      where: {
        id: data.requestDocumentId
      },
      data: {
        logisticOrderId: createOrderLalamove.id
      }
    });
  }
  if (data.status === 'PAID' || data.status === 'CANCELLED' || data.status === 'PENDING') {
    // Update the status of the document payment
    await prisma.documentPayment.update({
      where: {
        id: findRequestDocuments.documentPaymentId
      },
      data: {
        status: data.status
      }
    });
  }
  // Update the status of the request document
  const updateRequestDocumentStatus = await prisma.requestDocuments.update({
    where: {
      id: data.requestDocumentId
    },
    data: {
      status: data.status
    }
  });
  if (!updateRequestDocumentStatus) throw new Error('Failed to update status');

  revalidatePath('/dashboard/request');
  return updateRequestDocumentStatus;
}
