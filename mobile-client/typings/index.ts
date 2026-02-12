export interface ILoginSliceInitialState {
  input: {
    email: string;
    password: string;
  };
}

export type Role = "ADMIN" | "STUDENT";

export interface IExceptionResponse {
  message?: string | string[];
  error: string;
  statusCode: number;
}

export interface IPostLoginResponse extends Partial<IExceptionResponse> {
  accessToken: string;
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
}

export interface IGetSession {
  id: string;
  emailVerified: boolean;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  UserInformation: UserInformation | null;
}

export interface UserInformation {
  id?: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  studentNo: string | null;
  specialOrder: string | null;
  lrn: string | null;
  address: string | null;
  phoneNo: string | null;
  userId?: string;
}

export interface IPostEmailConfirmationResponse extends Partial<IExceptionResponse> {
  data: string;
}

export interface IPostVerifyOtpResponse extends Partial<IExceptionResponse> {}

export interface IInformationRegistrationSliceInitialState {
  personalInformation: {
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    address: string | null;
    phoneNo: string | null;
  };
  academicInformation: {
    studentNo: string | null;
    specialOrderNo: string | null;
    lrn: string | null;
  };
}

export interface IPostDashboardProfileResponse extends Partial<IExceptionResponse>, Partial<UserInformation> {}

export interface IPostRegisterResponse extends Partial<IExceptionResponse> {
  id: string;
  emailVerified: boolean;
  email: string;
  password: string;
  role: "STUDENT" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegisterSliceInitialState {
  input: {
    email: string;
    password: string;
    confirmPassword: string;
  };
}

export type IGetDocumentListResponse = {
  id: string;
  name: string;
  price: string;
  dayBeforeRelease: number;
  isAvailable: boolean;
  eligibility: "STUDENT" | "ADMIN" | "BOTH";
  sampleDocs?: string;
  createdAt: Date;
  updatedAt: Date;
}[] &
  Partial<IExceptionResponse>;

export type IGetDocumentDeliveryOptionsResponse = string[] & Partial<IExceptionResponse>;

export type IGetDocumentDPaymentOptionsResponse = {
  id: string;
  name: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}[] &
  Partial<IExceptionResponse>;

export interface IDocumentInitialState {
  orderDocument: {
    orderItem: string[];
    shippingOptions?: DeliveryOptions;
    address: {
      googleMapAddress: string;
      longitude: number;
      latitude: number;
      additionalAddress: string;
    };
    schedule: Date | null;
    paymentMethod?: PaymentMethod;
  };
  createOrder: {
    quotationId: string;
    senderStopId: string;
    recipientStopId: string;
    recipientPhoneNumber: string;
    recipientName: string;
    recipientRemarks: string;
  };
}

export type PaymentMethod = "GCASH" | "PAYMAYA" | "CREDIT_CARD";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface IOrderDocument {
  documentSelected: string[];
  selectedSchedule: Date | null;
  deliveryOptions: DeliveryOptions | undefined;
  paymentOptions?: PaymentMethod;
  address?: string;
  additionalAddress?: string;
  longitude?: string | number;
  latitude?: string | number;
}

export interface IOrderDocumentResponse extends Partial<IExceptionResponse> {
  id: string;
  paymentOptions: PaymentMethod;
  status: string;
  referenceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentTransactionStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "READYTOPICKUP"
  | "OUTFORDELIVERY"
  | "CANCELLED"
  | "COMPLETED";

export type DocumentTransaction = {
  id: string;
  status: DocumentTransactionStatus;
  documentSelected: DocumentSelected[];
}[] &
  Partial<IExceptionResponse>;

export interface OneDocumentTransaction extends Partial<IExceptionResponse> {
  id: string;
  selectedSchedule: string | null;
  deliveryOptions: DeliveryOptions;
  documentPaymentId: string;
  status: string;
  address: string;
  additionalAddress: string;
  longitude: string;
  latitude: string;
  logisticOrderId: string;
  usersId: string;
  createdAt: Date;
  updatedAt: Date;
  deliverOptions: DeliveryOptions;
  documentPayment?: DocumentPayment;
  DocumentSelected?: DocumentSelected[];
}

// export interface DeliverOptions {
//   id: string;
//   name: string;
//   isAvailable: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

export interface DocumentPayment {
  id: string;
  paymentOptions: string;
  status: string;
  referenceNumber: string;
  documentFees: string;
  shippingFees: string;
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
  xenditInvoiceId?: string;
  RequestDocuments?: RequestDocuments;
}

export type RequestDocuments = {
  id: string;
  selectedSchedule: string | null;
  deliverOptions: DeliveryOptions;
  documentPaymentId: string;
  status: string;
  address: string;
  additionalAddress: string;
  longitude: string;
  latitude: string;
  logisticOrderId: string | null;
  usersId: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface DocumentSelected {
  id: string;
  documentId: string;
  userId: string;
  requestDocumentsId: string;
  createdAt: string;
  updatedAt: string;
  document: Document;
}

export interface Document {
  id: string;
  name: string;
  price: string;
  dayBeforeRelease: number;
  isAvailable: boolean;
  eligibility: string;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryOptions = "PICKUP" | "LALAMOVE";

export interface IDocumentCheckQuotation {
  logisticType: DeliveryOptions | undefined;
  lat: string;
  lng: string;
  address: string;
}

export interface ICreateOrderType {
  quotationId: string;
  senderStopId: string;
  recipientStopId: string;
  recipientPhoneNumber: string;
  recipientName: string;
  recipientRemarks: string;
}

export interface IStatistics extends Partial<IExceptionResponse> {
  status: {
    pending: number;
    paid: number;
    processing: number;
    readyToPickup: number;
    outForDelivery: number;
    cancelled: number;
    completed: number;
  };
  transaction: DocumentPayment[];
}

export interface IGetProfileResponse {
  id: string;
  emailVerified: boolean;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  UserInformation: UserInformation;
}
