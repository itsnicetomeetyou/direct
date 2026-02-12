import { View, Text } from "react-native";
import React from "react";
import { moderateScale } from "react-native-size-matters";
import { DocumentTransactionStatus } from "@/typings";

export default function BadgeStatus({ variant }: { variant?: DocumentTransactionStatus }) {
  const { backgroundColor, color, text } = colorVariant(variant);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: backgroundColor,
        borderRadius: moderateScale(10),
        paddingVertical: moderateScale(2),
        paddingHorizontal: moderateScale(20),
        justifyContent: "center",
        height: moderateScale(25),
      }}
    >
      <Text
        style={{
          fontFamily: "GGSansExtraBold",
          fontSize: moderateScale(10),
          color: color,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function colorVariant(variant?: DocumentTransactionStatus): {
  backgroundColor: string;
  color: string;
  text: string;
} {
  if (variant === "PENDING") {
    return {
      backgroundColor: "#FFBF6133",
      color: "#FFBF61",
      text: variant,
    };
  }

  if (variant === "PAID") {
    return {
      backgroundColor: "#72BF7833",
      color: "#72BF78",
      text: variant,
    };
  }

  if (variant === "PROCESSING") {
    return {
      backgroundColor: "#FFBF6133",
      color: "#FFBF61",
      text: variant,
    };
  }

  if (variant === "READYTOPICKUP") {
    return {
      backgroundColor: "#36C2CE33",
      color: "#36C2CE",
      text: variant,
    };
  }

  if (variant === "OUTFORDELIVERY") {
    return {
      backgroundColor: "#36C2CE33",
      color: "#36C2CE",
      text: variant,
    };
  }

  if (variant === "COMPLETED") {
    return {
      backgroundColor: "#72BF7833",
      color: "#72BF78",
      text: variant,
    };
  }

  if (variant === "CANCELLED") {
    return {
      backgroundColor: "#36C2CE33",
      color: "#36C2CE",
      text: variant,
    };
  }

  // Default return statement
  return {
    backgroundColor: "#00000033",
    color: "#000000",
    text: "Unknown",
  };
}
