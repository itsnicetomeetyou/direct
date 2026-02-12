'use server';
import { IOrderDocument } from '@/types';
import { prisma } from './prisma';
import * as referralCodes from 'referral-codes';
import { sendCustomEmail } from './utils/mail.utils';
import { DeliveryOptions, DocumentPayment, PaymentOptions } from '@prisma/client';
import { formatCurrency } from '@/lib/utils';
import moment from 'moment';
import cloudinary from 'cloudinary';

// Xendit integration - bypassed when API key is not configured
const XENDIT_ENABLED =
  !!process.env.XENDIT_SECRET_KEY &&
  process.env.XENDIT_SECRET_KEY !== '';

let Xendit: any = null;
if (XENDIT_ENABLED) {
  try {
    Xendit = require('xendit-node').Xendit;
  } catch (e) {
    console.warn('[Xendit] Failed to load module:', e);
  }
}

async function generateReferenceNumber() {
  // Generate a unique reference number (e.g., using a UUID or a custom logic)
  const referenceNumber = referralCodes.generate({
    prefix: 'DiReCT-',
    postfix: `${Math.floor(Math.random() * 10000)}`
  });
  return referenceNumber[0];
}

export async function fetchStudentNumber(studentNo: string) {
  const studentNumber = await prisma.userInformation.findFirst({
    where: {
      studentNo: {
        equals: studentNo
      }
    }
  });
  if (!studentNumber) throw new Error('Student Number Not Found');
  return studentNumber;
}

export async function fetchAllDocuments(studentNo: string) {
  const users = await fetchStudentNumber(studentNo);
  return await prisma.documents.findMany({
    where: {
      isAvailable: true,
      eligibility: users.specialOrder ? 'GRADUATED' : 'STUDENT'
    }
  });
}

export async function fetchOrderDocument(data: IOrderDocument): Promise<DocumentPayment> {
  try {
    // Generate a unique reference number
    const referenceNumber = await generateReferenceNumber();
    // Find the user using student no.
    const findUser = await prisma.userInformation.findFirst({
      where: {
        studentNo: {
          equals: data.studentNo
        }
      },
      include: {
        users: true
      }
    });

    // Check if user is not found
    if (!findUser) throw new Error('User not found');

    // Create a list of order documents
    const orderDocumentList = data.documentSelected.map((document) => ({
      documentId: document,
      userId: findUser.userId
    }));

    // Validate the payment option
    if (data.paymentOptions === null || !Object.values(PaymentOptions).includes(data.paymentOptions)) {
      throw new Error('Invalid Payment Option');
    }

    // Check if delivery option is selected and schedule is not null
    if (data.deliverOptions === 'PICKUP' && !data.selectedSchedule) {
      throw new Error('Schedule is Required for Selected Delivery Option');
    }

    if (data.deliverOptions === null || !Object.values(DeliveryOptions).includes(data.deliverOptions)) {
      throw new Error('Please select a delivery option');
    }

    if (data.deliverOptions === 'LALAMOVE') {
      if (!data.address) throw new Error('Google Map pin is required for Lalamove delivery option');
      if (!data.longitude || !data.latitude)
        throw new Error('Longitude and Latitude is required for Lalamove delivery option');
      if (!data.additionalAddress) throw new Error('Additional Address is required for Lalamove delivery option');
    }

    if (data.deliverOptions === 'PICKUP') {
      const schedule = await checkScheduleForDate(moment(data.selectedSchedule).format('YYYY-MM-DD'));
      if (schedule.disabled) throw new Error('Schedule is already full');
    }

    // Calculate the total price of the selected documents
    const documentIds = data.documentSelected;
    const documents = await prisma.documents.findMany({
      where: {
        id: { in: documentIds }
      },
      select: {
        name: true,
        price: true
      }
    });

    const totalDocumentAmount = documents.reduce((sum, doc) => sum + Number(doc.price), 0);

    // Xendit payment integration (bypassed when disabled)
    let xenditInvoiceId: string | null = null;
    if (XENDIT_ENABLED && Xendit) {
      try {
        const xenditClient = new Xendit({
          secretKey: process.env.XENDIT_SECRET_KEY as string
        });
        const createPayment = await xenditClient.Invoice.createInvoice({
          data: {
            amount: totalDocumentAmount,
            currency: 'PHP',
            externalId: referenceNumber,
            paymentMethods: [data.paymentOptions],
            successRedirectUrl: 'https://pos.kumatechnologies.com/thank-you'
          }
        });
        xenditInvoiceId = createPayment.id ?? null;
      } catch (e) {
        console.warn('[Xendit] Payment creation failed, proceeding without invoice:', e);
      }
    } else {
      console.warn('[Xendit] Service disabled - skipping payment invoice creation');
    }

    // Check if address is required for selected delivery option
    const createDocumentPayment = await prisma.documentPayment.create({
      data: {
        paymentOptions: data.paymentOptions,
        referenceNumber: referenceNumber || 'ICCT-0001',
        totalAmount: totalDocumentAmount,
        xenditInvoiceId: xenditInvoiceId
      }
    });

    // Check if document payment is not created
    if (!createDocumentPayment) throw new Error('Payment Creation Failed');

    // Validate the selected schedule & delete document payment if schedule is invalid
    if (
      data.selectedSchedule !== null &&
      !(data.selectedSchedule instanceof Date) &&
      isNaN(Date.parse(data.selectedSchedule))
    ) {
      await prisma.documentPayment.delete({
        where: {
          id: createDocumentPayment.id
        }
      });
      throw new Error('Invalid Schedule');
    }

    // Create a request document
    const createdRequest = await prisma.requestDocuments.create({
      data: {
        selectedSchedule: data.selectedSchedule ?? null,
        deliverOptions: data.deliverOptions,
        documentPaymentId: createDocumentPayment.id,
        address: data.address,
        additionalAddress: data.additionalAddress,
        longitude: data.longitude?.toString() ?? null,
        latitude: data.latitude?.toString() ?? null,
        usersId: findUser.userId,
        status: 'PENDING'
      }
    });

    // Check if request creation failed
    if (!createdRequest) {
      await prisma.documentPayment.delete({
        where: { id: createDocumentPayment.id }
      });
      throw new Error('Request Creation Failed');
    }

    // Check if the document selected exists
    const checkDocumentsExist = await prisma.documents.findMany({
      where: {
        id: { in: data.documentSelected }
      }
    });

    // Check if the document selected is not found
    if (checkDocumentsExist.length === 0) {
      await prisma.requestDocuments.delete({
        where: { id: createdRequest.id }
      });
      await prisma.documentPayment.delete({
        where: { id: createDocumentPayment.id }
      });

      throw new Error('Document Not Found');
    }

    // Create a list of document selected
    const createdDocumentSelected = await prisma.documentSelected.createMany({
      data: orderDocumentList.map((document) => ({
        ...document,
        userId: findUser.userId,
        requestDocumentsId: createdRequest.id
      }))
    });

    // Check if document selection creation failed
    if (!createdDocumentSelected) {
      await prisma.documentPayment.delete({
        where: { id: createDocumentPayment.id }
      });
      await prisma.requestDocuments.delete({
        where: { id: createdRequest.id }
      });
      throw new Error('Document Selection Creation Failed');
    }

    const emailContent = `
    <div style="font-family: 'Poppins', sans-serif; padding: 32px; background-color: #f8fafc; border-radius: 12px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
      <!-- Header Section -->
      <h2 style="font-size: 26px; font-weight: 700; margin-bottom: 24px; color: #1f2937; text-align: center;">Order Confirmation</h2>
      
      <!-- Introduction -->
      <p style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 24px;">Dear ${findUser.firstName},</p>
      <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Your order has been confirmed. Your reference number is 
        <strong style="font-weight: 600; color: #111827;">${createDocumentPayment.referenceNumber}</strong>.
      </p>
      
      <!-- Order Details -->
      <h3 style="margin-top: 32px; font-size: 20px; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03); margin-bottom: 24px;">
        <thead>
          <tr>
            <th style="border-bottom: 2px solid #e5e7eb; padding: 12px; text-align: left; background-color: #f3f4f6; color: #1f2937; font-size: 16px;">Document Name</th>
            <th style="border-bottom: 2px solid #e5e7eb; padding: 12px; text-align: right; background-color: #f3f4f6; color: #1f2937; font-size: 16px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${documents
            .map(
              (doc) => `
              <tr style="background-color: #ffffff;">
                <td style="border-bottom: 1px solid #e5e7eb; padding: 12px; color: #374151; font-size: 15px;">${
                  doc.name
                }</td>
                <td style="border-bottom: 1px solid #e5e7eb; padding: 12px; color: #374151; text-align: right; font-size: 15px;">${formatCurrency(
                  Number(doc.price || 0)
                )}</td>
                
              </tr>
            `
            )
            .join('')}
        </tbody>
      </table>
      
      <!-- Total Price -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; text-align: right;">Total Price: 
        ${
          data.deliverOptions !== 'PICKUP'
            ? formatCurrency(Number(totalDocumentAmount || 0)) + ' + ' + data.deliverOptions + ' Fees'
            : formatCurrency(Number(totalDocumentAmount || 0))
        }
        </h3>
      </div>
      
      <!-- Payment Instructions -->
      <h3 style="margin-top: 32px; font-size: 20px; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Payment Instructions</h3>
      <p style="margin-top: 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">Please follow the instructions below to complete your payment:</p>
      
      <!-- Payment Steps -->
      <ol style="list-style-type: decimal; margin-top: 12px; padding-left: 20px; color: #4b5563; font-size: 16px; line-height: 1.8; margin-bottom: 32px;">
        <li style="margin-bottom: 12px;">Log in to your online banking account or visit your nearest bank branch.</li>
        <li style="margin-bottom: 12px;">Use the following payment options to complete your transaction:</li>
        <ul style="list-style-type: disc; margin-top: 8px; padding-left: 40px; color: #4b5563; font-size: 16px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">GCash: Use the reference number as the transaction reference.</li>
        </ul>
        <li style="margin-top: 12px;">Once the payment is completed, keep the transaction receipt for your records.</li>
      </ol>
    </div>
`;

    await sendCustomEmail(findUser.users.email, 'DiReCT - Order Information', emailContent);
    return createDocumentPayment;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function orderCheckStatus(referenceNo: string) {
  try {
    const response = await prisma.requestDocuments.findFirst({
      where: {
        documentPayment: {
          referenceNumber: {
            equals: referenceNo
          }
        }
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
      }
    });
    if (response === null) throw new Error('Invalid Reference Number');
    return response;
  } catch (err) {
    if (err instanceof Error) {
      return err.message;
    }
  }
}

export async function checkScheduleForDate(date: string): Promise<{
  count: string;
  date: string;
  disabled: boolean;
}> {
  // Limit the number of schedules per date
  const limitPerDate = 300;
  // Validate the input date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('Invalid date format. Please use YYYY-MM-DD.');
  }
  // Parse the input date to a Date object
  const parsedDate = new Date(date);

  // Find request documents for the specified date
  const result = await prisma.requestDocuments.groupBy({
    by: ['selectedSchedule'],
    where: {
      selectedSchedule: {
        equals: parsedDate
      },
      OR: [{ status: 'PENDING' }, { status: 'PAID' }, { status: 'PROCESSING' }, { status: 'READYTOPICKUP' }]
    },
    _count: {
      selectedSchedule: true
    }
  });

  if (result.length === 0) {
    return {
      count: '0',
      date: date,
      disabled: false
    };
  }

  // Transform the result to the desired format
  const item = result[0];
  const transformedResult = {
    count: item._count.selectedSchedule.toString(),
    date: item.selectedSchedule ? item.selectedSchedule.toISOString().split('T')[0].replace(/-/g, '/') : '',
    disabled: item._count.selectedSchedule > limitPerDate
  };

  return transformedResult;
}

export async function uploadToCloudinary(data: FormData): Promise<cloudinary.UploadApiResponse> {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  const file: File | null = data.get('sampleDocs') as unknown as File;

  if (!file) throw new Error('No file uploaded');

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { resource_type: 'auto', folder: '/direct' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Upload failed, result is undefined'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}
