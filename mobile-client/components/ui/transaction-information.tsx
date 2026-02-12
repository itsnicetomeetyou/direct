import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { moderateScale } from "react-native-size-matters";
import * as WebBrowser from "expo-web-browser";

export default function TransactionInformation(data: { name: string; value: string; variant?: "link" }) {
  const _handlePressButtonAsync = async (link: string) => {
    await WebBrowser.openBrowserAsync(link);
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: moderateScale(6),
      }}
    >
      <Text
        style={{
          fontFamily: "GGSansSemiBold",
          fontSize: moderateScale(14),
          opacity: 0.5,
        }}
      >
        {data.name}
      </Text>
      {data.variant === "link" ? (
        <TouchableOpacity onPress={() => _handlePressButtonAsync(data.value)}>
          <Text
            style={{
              fontFamily: "GGSansSemiBold",
              fontSize: moderateScale(14),
              opacity: 1,
              color: "#3b82f6",
              textDecorationLine: "underline",
            }}
          >
            View
          </Text>
        </TouchableOpacity>
      ) : (
        <Text
          style={{
            fontFamily: "GGSansSemiBold",
            fontSize: moderateScale(14),
            opacity: 1,
          }}
        >
          {data.value}
        </Text>
      )}
    </View>
  );
}
