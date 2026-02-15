import {
  IGetSession,
  IPostEmailConfirmationResponse,
  IPostLoginResponse,
  IPostRegisterResponse,
  IPostVerifyOtpResponse,
} from "@/typings";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";

export const authApiSlice = createApi({
  reducerPath: "authApi",
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
    postLogIn: builder.mutation({
      query: (data: { email: string; password: string }) => ({
        url: "/api/v1/auth/sign-in",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: IPostLoginResponse | null, meta) => {
        if (response?.accessToken) {
          SecureStore.setItemAsync("token", response.accessToken);
        }
        return { status: meta?.response?.status, data: response };
      },
    }),
    getSession: builder.query({
      query: () => ({
        url: "/api/v1/auth/session",
        headers: {
          Authorization: `Bearer ${SecureStore.getItem("token")}`,
        },
      }),
      transformResponse: (response: IGetSession | null, meta) => {
        return { status: meta?.response?.status, data: response };
      },
      providesTags: ["LogOut"],
    }),
    postEmailConfirmation: builder.mutation({
      query: (data: { email: string }) => ({
        url: `/api/v1/auth/verify-email?email=${data.email}`,
        method: "POST",
      }),
      transformResponse: (response: IPostEmailConfirmationResponse | null, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
    postVerifyOtp: builder.mutation({
      query: (data: { otpToken: string; otp: string }) => ({
        url: `/api/v1/auth/verify-otp`,
        method: "POST",
        body: { ...data, token: data.otpToken },
      }),
      transformResponse: (response: IPostVerifyOtpResponse | null, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
    postRegister: builder.mutation({
      query: (data: { email: string; password: string }) => ({
        url: `/api/v1/auth/sign-up`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: IPostRegisterResponse | null, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
  }),
});

export const {
  usePostLogInMutation,
  useGetSessionQuery,
  usePostEmailConfirmationMutation,
  usePostVerifyOtpMutation,
  usePostRegisterMutation,
} = authApiSlice;
