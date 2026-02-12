import { Stack } from "expo-router";
import React from "react";

export default function AuthenticationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="login"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen name="email-confirmation" />
      <Stack.Screen name="information-registration" />
    </Stack>
  );
}
