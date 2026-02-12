import { IStatistics } from "@/typings";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";

export const statisticsApiSlice = createApi({
  reducerPath: "statisticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    validateStatus: (response, result) => {
      return true;
    },
  }),
  tagTypes: ["LogOut"],
  endpoints: (builder) => ({
    getStatistics: builder.query({
      query: () => ({
        url: "/api/v1/dashboard/statistics",
        headers: {
          Authorization: `Bearer ${SecureStore.getItem("token")}`,
        },
      }),
      transformResponse: (response: IStatistics, meta) => {
        return { status: meta?.response?.status, data: response };
      },
      providesTags: ["LogOut"],
    }),
  }),
});

export const { useGetStatisticsQuery } = statisticsApiSlice;
