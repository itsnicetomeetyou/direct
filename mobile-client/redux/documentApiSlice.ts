import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import {
  DeliveryOptions,
  DocumentTransaction,
  IDocumentCheckQuotation,
  IExceptionResponse,
  IGetDocumentDeliveryOptionsResponse,
  IGetDocumentListResponse,
  IOrderDocument,
  IOrderDocumentResponse,
  OneDocumentTransaction,
} from "../typings/index";
import type { IQuotation } from "@lalamove/lalamove-js";

export const documentApiSlice = createApi({
  reducerPath: "documentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    prepareHeaders: (headers) => {
      headers.set("bypass-tunnel-reminder", "true");
      return headers;
    },
    responseHandler: async (response) => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { message: text || "An unexpected error occurred" };
      }
    },
    validateStatus: () => true,
  }),
  tagTypes: ["LogOut"],
  endpoints: (builder) => ({
    getDocumentList: builder.query({
      query: () => ({
        url: "/api/v1/dashboard/document/list",
        headers: {
          Authorization: `Bearer ${SecureStore.getItem("token")}`,
        },
      }),
      transformResponse: (response: IGetDocumentListResponse, meta) => {
        return { status: meta?.response?.status, data: response };
      },
      providesTags: ["LogOut"],
    }),
    getDocumentDeliveryOptions: builder.query({
      query: () => ({
        url: "/api/v1/dashboard/document/delivery",
        headers: {
          Authorization: `Bearer ${SecureStore.getItem("token")}`,
        },
      }),
      transformResponse: (response: IGetDocumentDeliveryOptionsResponse, meta) => {
        return { status: meta?.response?.status, data: response };
      },
      providesTags: ["LogOut"],
    }),
    postDocumentOrder: builder.mutation({
      query: (data: IOrderDocument) => {
        return {
          url: "/api/v1/dashboard/document",
          method: "POST",
          headers: {
            Authorization: `Bearer ${SecureStore.getItem("token")}`,
          },
          body: data,
        };
      },
      transformResponse: (response: IOrderDocumentResponse, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
    getManyDocumentTransaction: builder.query({
      query: () => ({
        url: "/api/v1/dashboard/document/transaction",
        headers: {
          Authorization: `Bearer ${SecureStore.getItem("token")}`,
        },
      }),
      transformResponse: (response: DocumentTransaction, meta) => {
        return { status: meta?.response?.status, data: response };
      },
      providesTags: ["LogOut"],
    }),
    getOneDocumentTransaction: builder.query({
      query: (id: string) => {
        return {
          url: `/api/v1/dashboard/document/transaction/${id}`,
          headers: {
            Authorization: `Bearer ${SecureStore.getItem("token")}`,
          },
        };
      },
      transformResponse: (response: OneDocumentTransaction, meta) => {
        return { status: meta?.response?.status, data: response };
      },
      providesTags: ["LogOut"],
    }),
    putPayDocumentTransaction: builder.mutation({
      query: ({ id }: { id: string }) => ({
        url: `/api/v1/dashboard/document/transaction/${id}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${SecureStore.getItem("token")}`,
        },
      }),
      transformResponse: (response: OneDocumentTransaction, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
    postDocumentCheckQuotation: builder.mutation({
      query: (data: IDocumentCheckQuotation) => {
        return {
          url: "/api/v1/dashboard/document/quotation",
          method: "POST",
          headers: {
            Authorization: `Bearer ${SecureStore.getItem("token")}`,
          },
          body: data,
        };
      },
      transformResponse: (response: IQuotation & Partial<IExceptionResponse>, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
    getOneLogisticTracking: builder.query({
      query: ({ orderId, logisticType }: { orderId: string; logisticType: DeliveryOptions }) => ({
        url: `/api/v1/dashboard/tracking/${orderId}?logistic=${logisticType}`,
        headers: {
          Authorization: `Bearer ${SecureStore.getItem("token")}`,
        },
      }),
      transformResponse: (response, meta) => {
        return { status: meta?.response?.status, data: response };
      },
      providesTags: ["LogOut"],
    }),
    postCancelOrder: builder.mutation({
      query: (id: string) => {
        return {
          url: `/api/v1/dashboard/document/${id}/cancel`,
          method: "POST",
          headers: {
            Authorization: `Bearer ${SecureStore.getItem("token")}`,
          },
        };
      },
      transformResponse: (response: IOrderDocumentResponse, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
  }),
});

export const {
  useGetDocumentListQuery,
  useGetDocumentDeliveryOptionsQuery,
  usePostDocumentOrderMutation,
  useGetManyDocumentTransactionQuery,
  useGetOneDocumentTransactionQuery,
  usePutPayDocumentTransactionMutation,
  usePostDocumentCheckQuotationMutation,
  useGetOneLogisticTrackingQuery,
  usePostCancelOrderMutation,
} = documentApiSlice;
