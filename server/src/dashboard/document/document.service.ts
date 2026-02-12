import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { UserAuth } from '../../../typings';
import { IOrderDocument } from './dto/create.document.dto';
import { MailService } from '../../../src/mail/mail.service';
import ShortUniqueId from 'short-unique-id';
import { Decimal } from '@prisma/client/runtime/library';
import {
  DeliveryOptions,
  DocumentPayment,
  PaymentOptions,
} from '@prisma/client';
import { LalamoveService } from '../../../src/logistics/lalamove/lalamove.service';
import { CheckQuotation } from './dto/check-quotation.dto';
import { CreateOrder } from '../../../src/logistics/lalamove/dto/lalamove.dto';
import { formatCurrency } from '../../../utils';
import { ScheduleService } from '../../../src/schedule/schedule.service';
import * as moment from 'moment';
import { XenditService } from '../../xendit/xendit.service';

@Injectable()
export class DocumentService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
    private lalamoveService: LalamoveService,
    private scheduleService: ScheduleService,
    private xenditService: XenditService,
  ) {}

  async findManyDocuments(user: UserAuth) {
    const userInformation = await this.prismaService.userInformation.findFirst({
      where: {
        userId: user.sub,
      },
    });
    if (!userInformation) throw new NotFoundException('User Not Found');
    if (userInformation.specialOrder) {
      return await this.prismaService.documents.findMany({
        where: {
          eligibility: 'GRADUATED',
          isAvailable: true,
        },
      });
    }
    return await this.prismaService.documents.findMany({
      where: {
        eligibility: 'STUDENT',
        isAvailable: true,
      },
    });
  }

  async findManyDeliveryOptions() {
    return Object.values(DeliveryOptions);
  }

  /**
   * Creates a document request for the user.
   *
   * @param {UserAuth} user - The authenticated user object containing user ID.
   * @param {IOrderDocument} data - The data transfer object containing order document information.
   * @returns {Promise<DocumentPayment>} The created request document object.
   */
  async createDocument(
    user: UserAuth,
    data: IOrderDocument,
  ): Promise<DocumentPayment> {
    // Generate a unique reference number
    const referenceNumber = new ShortUniqueId({ length: 12 }).rnd();

    // Find the user by ID
    const findUser = await this.prismaService.users.findFirst({
      where: {
        id: user.sub,
      },
      include: {
        UserInformation: true,
      },
    });

    // Check if the user is not found
    if (!findUser) throw new Error('User Not Found');

    // Create a list of order documents
    const orderDocumentList = data.documentSelected.map((document) => ({
      documentId: document,
      userId: user.sub,
    }));

    // // Validate the payment option
    if (!Object.values(PaymentOptions).includes(data.paymentOptions)) {
      throw new BadRequestException('Invalid Payment Option');
    }
    // Check if delivery option is selected and schedule is not null
    if (data.deliveryOptions === 'PICKUP' && !data.selectedSchedule) {
      throw new BadRequestException(
        'Schedule is Required for Selected Delivery Option',
      );
    }

    if (
      data.deliveryOptions === null ||
      !Object.values(DeliveryOptions).includes(data.deliveryOptions)
    ) {
      throw new ForbiddenException('Please select a delivery option');
    }

    if (data.deliveryOptions === 'LALAMOVE') {
      if (!data.address)
        throw new ForbiddenException(
          'Google Map pin is required for Lalamove delivery option',
        );
      if (!data.longitude || !data.latitude)
        throw new ForbiddenException(
          'Longitude and Latitude is required for Lalamove delivery option',
        );
      if (!data.additionalAddress)
        throw new ForbiddenException(
          'Additional Address is required for Lalamove delivery option',
        );
    }

    if (data.deliveryOptions === 'PICKUP') {
      const schedule = await this.scheduleService.checkScheduleForDate(
        moment(data.selectedSchedule).format('YYYY-MM-DD'),
      );
      if (schedule.disabled)
        throw new ForbiddenException('Schedule is already full');
    }

    // Send an email to the user
    const documentIds = data.documentSelected;
    const documents = await this.prismaService.documents.findMany({
      where: {
        id: { in: documentIds },
      },
      select: {
        name: true,
        price: true,
      },
    });

    // Calculate the total price of the documents
    const totalDocumentAmount = documents.reduce(
      (sum, doc) => sum + Number(doc.price),
      0,
    );

    const createPayment = await this.xenditService.createInvoice({
      amount: totalDocumentAmount,
      currency: 'PHP',
      externalId: referenceNumber,
      paymentMethods: [data.paymentOptions],
      successRedirectUrl: 'https://pos.kumatechnologies.com/thank-you',
    });

    const createDocumentPayment =
      await this.prismaService.documentPayment.create({
        data: {
          paymentOptions: data.paymentOptions,
          referenceNumber: referenceNumber || 'ICCT-0001',
          totalAmount: totalDocumentAmount,
          xenditInvoiceId: createPayment.id,
        },
      });

    // Check if payment creation failed
    if (!createDocumentPayment) throw new Error('Payment Creation Failed');

    // Validate the selected schedule
    if (
      data.selectedSchedule !== null &&
      !(data.selectedSchedule instanceof Date) &&
      isNaN(Date.parse(data.selectedSchedule))
    ) {
      throw new BadRequestException('Invalid Schedule');
    }

    // Create a request document
    const createdRequest = await this.prismaService.requestDocuments.create({
      data: {
        selectedSchedule: data.selectedSchedule ?? null,
        deliverOptions: data.deliveryOptions,
        documentPaymentId: createDocumentPayment.id,
        address: data.address,
        additionalAddress: data.additionalAddress,
        longitude: data.longitude?.toString(),
        latitude: data.latitude?.toString(),
        usersId: findUser.id,
        status: 'PENDING',
      },
    });

    // Check if request creation failed
    if (!createdRequest) {
      await this.prismaService.documentPayment.delete({
        where: { id: createDocumentPayment.id },
      });
      throw new Error('Request Creation Failed');
    }

    // Check if the document selected exists
    const checkDocumentsExist = await this.prismaService.documents.findMany({
      where: {
        id: { in: data.documentSelected },
      },
    });

    // Check if the document selected is not found
    if (checkDocumentsExist.length === 0) {
      await this.prismaService.requestDocuments.delete({
        where: { id: createdRequest.id },
      });
      await this.prismaService.documentPayment.delete({
        where: { id: createDocumentPayment.id },
      });

      throw new NotFoundException('Document Not Found');
    }

    // Create a list of document selected
    const createdDocumentSelected =
      await this.prismaService.documentSelected.createMany({
        data: orderDocumentList.map((document) => ({
          ...document,
          userId: findUser.id,
          requestDocumentsId: createdRequest.id,
        })),
      });

    // Check if document selection creation failed
    if (!createdDocumentSelected) {
      await this.prismaService.documentPayment.delete({
        where: { id: createDocumentPayment.id },
      });
      await this.prismaService.requestDocuments.delete({
        where: { id: createdRequest.id },
      });
      throw new Error('Document Selection Creation Failed');
    }

    // Send an email to the user
    await this.mailService.sendEmail({
      to: findUser.email,
      subject: 'DiReCT - Order Information',
      content: this.generateEmailContent(
        findUser.UserInformation.lastName ?? 'User',
        referenceNumber,
        documents,
        totalDocumentAmount,
        data.deliveryOptions,
      ),
    });

    // Return the created document payment
    return createDocumentPayment;
  }

  private generateEmailContent(
    user: string,
    referenceNumber: string,
    documents: {
      name: string;
      price: Decimal;
    }[],
    totalPrice: number,
    deliveryOptions: DeliveryOptions,
  ) {
    return `
        <div style="font-family: 'Poppins', sans-serif; padding: 32px; background-color: #f8fafc; border-radius: 12px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
          <!-- Header Section -->
          <h2 style="font-size: 26px; font-weight: 700; margin-bottom: 24px; color: #1f2937; text-align: center;">Order Confirmation</h2>
          
          <!-- Introduction -->
          <p style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 24px;">Dear ${user},</p>
          <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Your order has been confirmed. Your reference number is 
            <strong style="font-weight: 600; color: #111827;">${referenceNumber}</strong>.
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
                    <td style="border-bottom: 1px solid #e5e7eb; padding: 12px; color: #374151; text-align: right; font-size: 15px;">${formatCurrency(Number(doc.price) || 0)}</td>
                  </tr>
                `,
                )
                .join('')}
            </tbody>
          </table>
          
          <!-- Total Price -->
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 20px; font-weight: 600; color: #1f2937; text-align: right;">Total Price: ${deliveryOptions !== 'PICKUP' ? formatCurrency(Number(totalPrice || 0)) + ' + ' + deliveryOptions + ' Fees' : formatCurrency(Number(totalPrice || 0))}</h3>
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
  }

  async findManyDocumentTransaction(user: UserAuth) {
    const transactions = await this.prismaService.requestDocuments.findMany({
      where: {
        usersId: user.sub,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        DocumentSelected: {
          select: {
            document: true,
          },
        },
      },
    });
    // Map the transactions to the desired format
    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      status: transaction.status,
      documentSelected: transaction.DocumentSelected.map(
        (order) => order.document.name,
      ),
    }));

    // Return the formatted response
    return formattedTransactions;
  }

  async findOneDocumentTransaction(documentRequestId: string, user: UserAuth) {
    const response = await this.prismaService.requestDocuments.findFirst({
      where: {
        id: documentRequestId,
        usersId: user.sub,
      },
    });
    if (!response) throw new NotFoundException('Document Request Not Found');
    if (response.logisticOrderId && response.deliverOptions === 'LALAMOVE') {
      const lalamoveResponse = await this.lalamoveService.retrieveOrder(
        response.logisticOrderId,
      );
      if (lalamoveResponse.status === 'PENDING') {
        await this.prismaService.requestDocuments.update({
          where: {
            id: documentRequestId,
            usersId: user.sub,
          },
          data: {
            status: 'OUTFORDELIVERY',
            documentPayment: {
              update: {
                where: {
                  id: response.documentPaymentId,
                },
                data: {
                  status: 'PAID',
                },
              },
            },
          },
        });
      }
    }
    const findOneDocumentRequest =
      await this.prismaService.requestDocuments.findFirst({
        where: {
          id: documentRequestId,
          usersId: user.sub,
        },
        include: {
          // deliverOptions: true,
          documentPayment: true,
          DocumentSelected: {
            include: {
              document: true,
            },
          },
        },
      });
    return findOneDocumentRequest;
  }

  async payDocumentRequest(
    documentRequestId: string,
    // amount: number,
    user: UserAuth,
  ) {
    const response = await this.prismaService.requestDocuments.findFirst({
      where: {
        id: documentRequestId,
        usersId: user.sub,
      },
      include: {
        DocumentSelected: {
          include: {
            document: true,
          },
        },
      },
    });
    if (!response) throw new NotFoundException('Document Request Not Found');
    const documentFees = response.DocumentSelected.reduce(
      (acc, cur) => acc + Number(cur.document.price),
      0,
    );
    let shippingFees = 0;

    if (response.deliverOptions !== 'PICKUP') {
      const lalamove = await this.lalamoveService.createQuotation({
        stop1: {
          coordinates: {
            lat: '14.6177068',
            lng: '121.1026223',
          },
          address: 'ICCT Bldg, V.V. Soliven Ave II, Cainta, 1900 Rizal',
        },
        stop2: {
          coordinates: {
            lat: response.latitude,
            lng: response.longitude,
          },
          address: response.address,
        },
      });
      shippingFees = Number(lalamove.priceBreakdown.total);
    }

    await this.prismaService.documentPayment.update({
      where: {
        id: response.documentPaymentId,
      },
      data: {
        status: 'PAID',
        documentFees,
        shippingFees,
        totalAmount: documentFees + shippingFees,
      },
    });
    return await this.prismaService.requestDocuments.update({
      where: {
        id: documentRequestId,
        usersId: user.sub,
      },
      data: {
        status: 'PAID',
      },
    });
  }

  async cancelOrder(id: string, user: UserAuth) {
    return await this.prismaService.requestDocuments.update({
      where: {
        id,
        usersId: user.sub,
      },
      data: {
        status: 'CANCELLED',
        documentPayment: {
          update: {
            status: 'CANCELLED',
          },
        },
      },
    });
  }

  async checkQuotation(route: CheckQuotation) {
    if (route.logisticType === 'LALAMOVE') {
      try {
        const lalamoveResponse = await this.lalamoveService.createQuotation({
          stop1: {
            coordinates: {
              lat: '14.6177068',
              lng: '121.1026223',
            },
            address: 'ICCT Bldg, V.V. Soliven Ave II, Cainta, 1900 Rizal',
          },
          stop2: {
            coordinates: {
              lat: route.lat,
              lng: route.lng,
            },
            address: route.address,
          },
        });
        return lalamoveResponse;
      } catch (err) {
        if (err instanceof Error) {
          throw new BadRequestException(err.message);
        }
      }
    }
    throw new BadRequestException('Invalid Logistic Type');
  }

  async placeOrder(
    id: string,
    data: {
      quotationId: CreateOrder['quotationId'];
      senderStopId: CreateOrder['senderStopId'];
      recipientStopId: CreateOrder['recipientStopId'];
      recipientPhoneNumber: CreateOrder['recipientPhoneNumber'];
      recipientName: CreateOrder['recipientName'];
      recipientRemarks: CreateOrder['recipientRemarks'];
    },
  ) {
    const recipientCredentials = {
      ...data,
      senderPhoneNumber: '+639123456789',
      senderName: 'ICCT Colleges - Angela',
    };
    const orderId =
      await this.lalamoveService.createOrder(recipientCredentials);
    const updateRequestDocument =
      await this.prismaService.requestDocuments.update({
        where: {
          id,
        },
        data: {
          logisticOrderId: orderId.id,
          status: 'OUTFORDELIVERY',
        },
      });
    return updateRequestDocument;
  }

  async retrieveOrder(id: string) {
    return await this.lalamoveService.retrieveOrder(id);
  }
}
