import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import { IPostDashboardProfileResponse, UserInformation } from "../typings/index";

export const dashboardApiSlice = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    validateStatus: (response, result) => {
      return true;
    },
  }),
  endpoints: (builder) => ({
    postDashboardProfile: builder.mutation({
      query: (data: UserInformation) => {
        return {
          url: "/api/v1/dashboard/profile",
          method: "POST",
          body: data,
          headers: {
            Authorization: `Bearer ${SecureStore.getItem("token")}`,
          },
        };
      },
      transformResponse: (response: IPostDashboardProfileResponse, meta) => {
        return { status: meta?.response?.status, data: response };
      },
    }),
  }),
});

export const { usePostDashboardProfileMutation } = dashboardApiSlice;
