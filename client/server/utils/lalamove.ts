'use server';

// Lalamove integration - bypassed when API keys are not configured
const LALAMOVE_ENABLED =
  !!process.env.LALAMOVE_API_KEY &&
  !!process.env.LALAMOVE_API_SECRET &&
  process.env.LALAMOVE_API_KEY !== '' &&
  process.env.LALAMOVE_ENV !== 'disabled';

let lalamoveClient: any = null;

if (LALAMOVE_ENABLED) {
  try {
    const LalamoveClient = require('@lalamove/lalamove-js');
    const { senderConfig } = require('@/constants/logistic.sender');
    lalamoveClient = new LalamoveClient.ClientModule(
      new LalamoveClient.Config(
        process.env.LALAMOVE_API_KEY as string,
        process.env.LALAMOVE_API_SECRET as string,
        process.env.LALAMOVE_ENV
      )
    );
  } catch (e) {
    console.warn('[Lalamove] Failed to initialize client:', e);
  }
}

export async function createQuotation(recipient: {
  coordinates: {
    lat: string;
    lng: string;
  };
  address: string;
}) {
  if (!LALAMOVE_ENABLED || !lalamoveClient) {
    console.warn('[Lalamove] Service disabled - returning mock quotation');
    return {
      quotationId: 'mock-quotation-id',
      stops: [
        { stopId: 'mock-sender-stop', coordinates: { lat: '0', lng: '0' } },
        { stopId: 'mock-recipient-stop', coordinates: recipient.coordinates }
      ],
      priceBreakdown: { total: '0', currency: 'PHP' }
    };
  }

  const { senderConfig } = require('@/constants/logistic.sender');
  const LalamoveClient = require('@lalamove/lalamove-js');

  const sender = {
    coordinates: {
      lat: senderConfig.coordinates.lat,
      lng: senderConfig.coordinates.lng
    },
    address: senderConfig.address
  };

  const quotationPayload = LalamoveClient.QuotationPayloadBuilder.quotationPayload()
    .withLanguage('en_PH')
    .withServiceType('MOTORCYCLE')
    .withStops([sender, recipient])
    .build();

  const create = await lalamoveClient.Quotation.create('PH', quotationPayload);
  if (!create) throw new Error('Failed to create quotation');
  return create;
}

export async function createOrder(data: {
  quotationId: string;
  senderStopId: string;
  recipientStopId: string;
  recipientName: string;
  recipientPhoneNo: string;
  recipientRemarks: string;
}) {
  if (!LALAMOVE_ENABLED || !lalamoveClient) {
    console.warn('[Lalamove] Service disabled - returning mock order');
    return {
      orderId: 'mock-order-id',
      status: 'ASSIGNING_DRIVER',
      shareLink: ''
    };
  }

  const { senderConfig } = require('@/constants/logistic.sender');
  const LalamoveClient = require('@lalamove/lalamove-js');

  const orderPayload = LalamoveClient.OrderPayloadBuilder.orderPayload()
    .withIsPODEnabled(true)
    .withQuotationID(data.quotationId)
    .withSender({
      stopId: data.senderStopId,
      name: senderConfig.information.name,
      phone: senderConfig.information.phone
    })
    .withRecipients([
      {
        stopId: data.recipientStopId,
        name: data.recipientName,
        phone: data.recipientPhoneNo,
        remarks: data.recipientRemarks
      }
    ])
    .withMetadata({
      internalId: 'xyx211d'
    })
    .build();
  if (!orderPayload) throw new Error('Failed to create order payload');
  const order = await lalamoveClient.Order.create('PH', orderPayload);
  if (!order) throw new Error('Failed to create order');
  return order;
}

export async function retrieveOrder(id: string) {
  if (!LALAMOVE_ENABLED || !lalamoveClient) {
    console.warn('[Lalamove] Service disabled - returning mock order status');
    return {
      orderId: id,
      status: 'COMPLETED',
      shareLink: ''
    };
  }

  const response = await lalamoveClient.Order.retrieve('PH', id);
  if (!response) throw new Error('Failed to retrieve order');
  return response;
}
