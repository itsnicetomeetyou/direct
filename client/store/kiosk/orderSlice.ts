import { MenuItem, OrderSliceInitialState } from '@/types';
import { DeliveryOptions, PaymentOptions } from '@prisma/client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

let initialState: OrderSliceInitialState = {
  order: [],
  openModalConfirmationOrder: false,
  orderData: {
    orderItem: [],
    shippingOptions: null,
    address: {
      googleMapAddress: null,
      longitude: null,
      latitude: null,
      additionalAddress: null
    },
    schedule: null,
    paymentMethod: null
  }
};

const orderSlice = createSlice({
  name: 'kiosk/order',
  initialState,
  reducers: {
    addToOrder: (state, action: PayloadAction<MenuItem>) => {
      const itemExists = state.order.some((item) => item.id === action.payload.id);
      if (!itemExists) {
        state.order.push(action.payload);
        state.orderData.orderItem.push(action.payload);
      }
    },
    setOpenModalConfirmationOrder: (state, action: PayloadAction<boolean>) => {
      state.openModalConfirmationOrder = action.payload;
    },
    removeFromOrder: (state, action: PayloadAction<string>) => {
      const itemIndex = state.order.findIndex((item) => item.id === action.payload);
      if (itemIndex !== -1) {
        state.order.splice(itemIndex, 1);
        state.orderData.orderItem.splice(itemIndex, 1);
      }
    },
    cleanUpOrder: (state) => {
      state.order = [];
    },
    setOrderDataShippingOptions: (state, action: PayloadAction<DeliveryOptions | null>) => {
      state.orderData.shippingOptions = action.payload;
    },
    setOrderDataAddress: (state, action: PayloadAction<OrderSliceInitialState['orderData']['address']>) => {
      state.orderData.address = action.payload;
    },
    setOrderDataSchedule: (state, action: PayloadAction<Date>) => {
      state.orderData.schedule = action.payload;
    },
    setOrderDataPaymentMethod: (state, action: PayloadAction<PaymentOptions | null>) => {
      state.orderData.paymentMethod = action.payload;
    },
    cleanUpOrderData: (state) => {
      state.order = [];
      state.orderData = {
        orderItem: [],
        shippingOptions: null,
        address: {
          googleMapAddress: null,
          longitude: null,
          latitude: null,
          additionalAddress: null
        },
        schedule: new Date(),
        paymentMethod: null
      };
    }
  },
  extraReducers(builder) {}
});

export const {
  addToOrder,
  removeFromOrder,
  cleanUpOrder,
  setOrderDataAddress,
  setOrderDataPaymentMethod,
  setOrderDataSchedule,
  cleanUpOrderData,
  setOpenModalConfirmationOrder,
  setOrderDataShippingOptions
} = orderSlice.actions;
export default orderSlice.reducer;
