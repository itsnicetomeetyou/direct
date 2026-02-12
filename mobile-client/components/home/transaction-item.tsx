import { View, Text, Pressable } from "react-native";
import React from "react";
import { moderateScale } from "react-native-size-matters";
import { DocumentPayment } from "@/typings";
import moment from "moment";
import { formatCurrency } from "@/utils";
import { router } from "expo-router";

export default function TransactionItem(data: DocumentPayment) {
  return (
    <Pressable
      android_ripple={{
        color: "#007AEB",
      }}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(12),
      }}
      onPress={() => {
        if (data.RequestDocuments?.id) {
          return router.push({
            pathname: "/(dashboard-screen)/transaction",
            params: {
              id: data.RequestDocuments?.id,
            },
          });
        }
      }}
    >
      <View
        style={{
          alignItems: "flex-start",
        }}
      >
        <Text
          style={{
            fontFamily: "GGSansMedium",
            fontSize: moderateScale(12),
            opacity: 0.5,
          }}
        >
          Status is {data?.status}
        </Text>
        <Text
          style={{
            fontFamily: "GGSansSemiBold",
            fontSize: moderateScale(13),
          }}
        >
          {data?.paymentOptions}
        </Text>
      </View>
      <View
        style={{
          alignItems: "flex-end",
        }}
      >
        <Text
          style={{
            fontFamily: "GGSansMedium",
            fontSize: moderateScale(12),
            opacity: 0.5,
          }}
        >
          {moment(data?.createdAt).format("DD MMM YYYY")}
        </Text>
        <Text
          style={{
            fontFamily: "GGSansSemiBold",
            fontSize: moderateScale(13),
          }}
        >
          {formatCurrency(Number(data?.totalAmount) || 0)}
        </Text>
      </View>
    </Pressable>
  );
}
