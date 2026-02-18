'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { RequestDocumentsStatus } from '@prisma/client';
import { createOrder, createQuotation } from './utils/lalamove';
import { IQuotation } from '@lalamove/lalamove-js';
import { IOrder } from '@lalamove/lalamove-js/dist/response/order';
import parsePhoneNumber from 'libphonenumber-js';
import { sendCustomEmail } from './utils/mail.utils';

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
  const findRequestDocuments = await prisma.requestDocuments.findFirst({
    where: {
      id: data.requestDocumentId
    },
    include: {
      users: {
        include: {
          UserInformation: true
        }
      },
      DocumentSelected: {
        include: {
          document: true
        }
      },
      documentPayment: true
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
    await prisma.documentPayment.update({
      where: {
        id: findRequestDocuments.documentPaymentId
      },
      data: {
        status: data.status
      }
    });
  }
  const updateRequestDocumentStatus = await prisma.requestDocuments.update({
    where: {
      id: data.requestDocumentId
    },
    data: {
      status: data.status
    }
  });
  if (!updateRequestDocumentStatus) throw new Error('Failed to update status');

  // Send status change email if a template is configured and active
  try {
    const emailTemplate = await prisma.emailTemplate.findUnique({
      where: { status: data.status }
    });

    if (emailTemplate && emailTemplate.isActive) {
      const userEmail = findRequestDocuments.users?.email;
      const firstName = findRequestDocuments.users?.UserInformation?.firstName ?? '';
      const lastName = findRequestDocuments.users?.UserInformation?.lastName ?? '';
      const refNumber = findRequestDocuments.documentPayment?.referenceNumber ?? '';
      const docNames = findRequestDocuments.DocumentSelected
        ?.map((ds) => ds.document?.name)
        .filter(Boolean)
        .join(', ') ?? '';

      const STATUS_LABELS: Record<string, string> = {
        PENDING: 'Pending',
        PAID: 'Paid',
        PROCESSING: 'Processing',
        READYTOPICKUP: 'Ready to Pick Up',
        OUTFORDELIVERY: 'Out for Delivery',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled'
      };

      const replacePlaceholders = (text: string) =>
        text
          .replace(/\{\{firstName\}\}/g, firstName)
          .replace(/\{\{lastName\}\}/g, lastName)
          .replace(/\{\{referenceNumber\}\}/g, refNumber)
          .replace(/\{\{status\}\}/g, STATUS_LABELS[data.status] ?? data.status)
          .replace(/\{\{documents\}\}/g, docNames);

      const subject = replacePlaceholders(emailTemplate.subject);
      const body = replacePlaceholders(emailTemplate.body);

      if (userEmail) {
        await sendCustomEmail(userEmail, subject, body);
      }
    }
  } catch (emailError) {
    console.error('Failed to send status change email:', emailError);
  }

  revalidatePath('/dashboard/request');
  return updateRequestDocumentStatus;
}
