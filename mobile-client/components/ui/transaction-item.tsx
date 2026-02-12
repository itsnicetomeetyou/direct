import { View, Text } from "react-native";
import React from "react";
import { moderateScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { DocumentSelected } from "@/typings";
import { formatCurrency } from "@/utils";

export default function TransactionItem(data: DocumentSelected) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: moderateScale(6),
        borderRadius: moderateScale(6),
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Ionicons name="document" size={34} color="black" />
        <Text
          style={{
            fontFamily: "GGSansSemiBold",
            fontSize: moderateScale(14),
            marginLeft: moderateScale(6),
          }}
        >
          {data.document.name}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "GGSansSemiBold",
          fontSize: moderateScale(14),
          opacity: 0.5,
        }}
      >
        {formatCurrency(Number(data.document.price))}
      </Text>
    </View>
  );
}
