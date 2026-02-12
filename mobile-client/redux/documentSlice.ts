import { DeliveryOptions, IDocumentInitialState, PaymentMethod } from "@/typings";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

let initialState: IDocumentInitialState = {
  orderDocument: {
    orderItem: [],
    shippingOptions: undefined,
    address: {
      googleMapAddress: "",
      longitude: 0,
      latitude: 0,
      additionalAddress: "",
    },
    schedule: null,
    paymentMethod: undefined,
  },
  createOrder: {
    quotationId: "",
    recipientStopId: "",
    recipientPhoneNumber: "",
    recipientName: "",
    recipientRemarks: "",
    senderStopId: "",
  },
};

export const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setOrderDocumentItem: (state, action: PayloadAction<string[]>) => {
      state.orderDocument.orderItem = [...action.payload];
    },
    setOrderDocumentShippingOptions: (state, action: PayloadAction<DeliveryOptions | undefined>) => {
      state.orderDocument.shippingOptions = action.payload;
    },
    setOrderDocumentGoogleMapAddress: (state, action: PayloadAction<string>) => {
      state.orderDocument.address.googleMapAddress = action.payload;
    },
    setOrderDocumentGoogleMapPosition: (
      state,
      action: PayloadAction<{
        longitude: number;
        latitude: number;
      }>
    ) => {
      state.orderDocument.address.latitude = action.payload.latitude;
      state.orderDocument.address.longitude = action.payload.longitude;
    },
    setOrderDocumentAdditionalAddress: (state, action: PayloadAction<string>) => {
      state.orderDocument.address.additionalAddress = action.payload;
    },
    setOrderDocumentSchedule: (state, action: PayloadAction<Date>) => {
      state.orderDocument.schedule = action.payload;
    },
    setOrderDocumentPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.orderDocument.paymentMethod = action.payload;
    },
    setCreateOrderQuotationId: (state, action: PayloadAction<string>) => {
      state.createOrder.quotationId = action.payload;
    },
    setCreateOrderRecipientStopId: (state, action: PayloadAction<string>) => {
      state.createOrder.recipientStopId = action.payload;
    },
    setCreateOrderSenderStopId: (state, action: PayloadAction<string>) => {
      state.createOrder.senderStopId = action.payload;
    },
    setCreateOrderRecipientName: (state, action: PayloadAction<string>) => {
      state.createOrder.recipientName = action.payload;
    },
    setCreateOrderRecipientPhoneNumber: (state, action: PayloadAction<string>) => {
      state.createOrder.recipientPhoneNumber = action.payload;
    },
    setCreateOrderRecipientRemarks: (state, action: PayloadAction<string>) => {
      state.createOrder.recipientRemarks = action.payload;
    },
    cleanUpOrderDocument: (state) => {
      state.orderDocument = {
        orderItem: [],
        shippingOptions: undefined,
        address: {
          googleMapAddress: "",
          longitude: 0,
          latitude: 0,
          additionalAddress: "",
        },
        schedule: null,
        paymentMethod: undefined,
      };
    },
    cleanUpCreateOrder: (state) => {
      state.createOrder = {
        quotationId: "",
        recipientStopId: "",
        recipientPhoneNumber: "",
        recipientName: "",
        recipientRemarks: "",
        senderStopId: "",
      };
    },
  },
  extraReducers(builder) {},
});

export const {
  setOrderDocumentAdditionalAddress,
  setOrderDocumentGoogleMapAddress,
  setOrderDocumentGoogleMapPosition,
  setOrderDocumentItem,
  setOrderDocumentPaymentMethod,
  setOrderDocumentSchedule,
  setOrderDocumentShippingOptions,
  cleanUpOrderDocument,
  setCreateOrderQuotationId,
  setCreateOrderRecipientName,
  setCreateOrderRecipientPhoneNumber,
  setCreateOrderRecipientRemarks,
  setCreateOrderRecipientStopId,
  setCreateOrderSenderStopId,
  cleanUpCreateOrder,
} = documentSlice.actions;

export default documentSlice.reducer;
