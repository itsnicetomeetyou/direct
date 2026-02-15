import React, { useCallback } from "react";
import { Stack, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";

export default function DashboardScreenLayout() {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark", true);

      return () => {
        setStatusBarStyle("auto", true);
      };
    }, [])
  );
  return (
    <Stack>
      <Stack.Screen
        name="request-document"
        options={{
          title: "REQUEST DOCUMENT",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: "GGSansBold",
            color: "#007AEB",
          },
        }}
      />

      <Stack.Screen
        name="transaction"
        options={{
          headerTitleStyle: {
            fontFamily: "GGSansBold",
            color: "#007AEB",
          },
          headerTransparent: true,
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="pdf-viewer"
        options={{
          headerTitleStyle: {
            fontFamily: "GGSansBold",
            color: "#007AEB",
          },
        }}
      />

      <Stack.Screen
        name="payment-links"
        options={{
          title: "Payment",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: "GGSansBold",
            color: "#007AEB",
          },
        }}
      />
    </Stack>
  );
}
