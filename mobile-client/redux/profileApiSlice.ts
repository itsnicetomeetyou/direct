import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import { IGetProfileResponse } from "../typings/index";

export const profileApiSlice = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    validateStatus: (response, result) => {
      return true;
    },
  }),
  tagTypes: ["LogOut"],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => {
        return {
          url: `/api/v1/dashboard/profile`,
          headers: {
            Authorization: `Bearer ${SecureStore.getItem("token")}`,
          },
        };
      },
      transformResponse: (response: IGetProfileResponse, meta) => {
        return { status: meta?.response?.status, data: response };
      },
      providesTags: ["LogOut"],
    }),
  }),
});

export const { useGetProfileQuery } = profileApiSlice;
