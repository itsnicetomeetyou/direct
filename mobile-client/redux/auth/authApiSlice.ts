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
    validateStatus: (response, result) => {
      return true;
    },
  }),
  tagTypes: ["LogOut"],
  endpoints: (builder) => ({
    postLogIn: builder.mutation({
      query: (data: { email: string; password: string }) => ({
        url: "/api/v1/auth/sign-in",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: IPostLoginResponse, meta) => {
        if (response.accessToken) {
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
      transformResponse: (response: IGetSession, meta) => {
        return { status: meta?.response?.status, data: response };
      },
      providesTags: ["LogOut"],
    }),
    postEmailConfirmation: builder.mutation({
      query: (data: { email: string }) => ({
        url: `/api/v1/auth/verify-email?email=${data.email}`,
        method: "POST",
      }),
      transformResponse: (response: IPostEmailConfirmationResponse, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
    postVerifyOtp: builder.mutation({
      query: (data: { otpToken: string; otp: string }) => ({
        url: `/api/v1/auth/verify-otp`,
        method: "POST",
        body: { ...data, token: data.otpToken },
      }),
      transformResponse: (response: IPostVerifyOtpResponse, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
    postRegister: builder.mutation({
      query: (data: { email: string; password: string }) => ({
        url: `/api/v1/auth/sign-up`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: IPostRegisterResponse, meta) => {
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
