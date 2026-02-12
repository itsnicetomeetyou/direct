import React, { useCallback, useRef, useState } from "react";
import { Text, ScrollView, useWindowDimensions, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import { moderateScale } from "react-native-size-matters";
import Button from "@/components/ui/button";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { usePostEmailConfirmationMutation, usePostVerifyOtpMutation } from "@/redux/auth/authApiSlice";
import * as SecureStore from "expo-secure-store";
import { toast } from "sonner-native";

export default function EmailConfirmation() {
  const { width } = useWindowDimensions();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [postEmailConfirmation] = usePostEmailConfirmationMutation();
  const otpRef = useRef<OtpInputRef>(null);
  const [otp, setOtp] = useState<string>("");
  const [postVerifyOtp] = usePostVerifyOtpMutation();

  const onClickVerify = async () => {
    try {
      const { data, status } = await postVerifyOtp({
        otp: otp,
        otpToken: SecureStore.getItem("otpToken") ?? "",
      }).unwrap();
      if (status === 200 && data.message === "Email Verified") {
        toast.success("Email Verified", {
          description: "You have successfully verified your email.",
        });
        return router.push("/(authentication-tab)/information-registration");
      }
      if (status === 401 && data.message === "Invalid OTP") {
        return toast.error("Invalid OTP", {
          description: "The OTP you entered is incorrect. Please try again.",
        });
      }
      return toast.warning("Something went wrong", {
        description: "Please try again.",
      });
    } catch (err) {
      if (err instanceof Error) {
        return toast.error("Error", {
          description: err.message,
        });
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        if (email) {
          const { data, status } = await postEmailConfirmation({ email }).unwrap();
          if (status === 200 && data.data) {
            SecureStore.setItem("otpToken", data.data);
            return toast.success("OTP Sent", {
              description: "Please check your email and enter the OTP.",
            });
          }
        }
      })();
    }, [email, postEmailConfirmation])
  );
  return (
    <LinearGradient
      colors={["#E900C4", "#007AEB"]}
      style={{
        flex: 1,
      }}
      start={{
        x: 1.8,
        y: 0,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flex: 1,
        }}
      >
        <SafeAreaView
          style={{
            width: (90 / 100) * width,
            alignSelf: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: moderateScale(20),
              borderRadius: moderateScale(20),
            }}
          >
            <Text
              style={{
                fontFamily: "GGSansBold",
                fontSize: moderateScale(20),
                textAlign: "center",
              }}
            >
              Email Verification
            </Text>

            <OtpInput
              ref={otpRef}
              numberOfDigits={4}
              focusColor="#007AEB"
              type="numeric"
              autoFocus={false}
              focusStickBlinkingDuration={500}
              // onFilled={onClickVerify}
              onTextChange={(text) => setOtp(text)}
              textInputProps={{
                accessibilityLabel: "One-Time Password",
              }}
              theme={{
                containerStyle: {
                  marginVertical: moderateScale(20),
                  // opacity: loading ? 0.5 : 1,
                },
                pinCodeContainerStyle: {
                  width: "24%",
                  borderRadius: moderateScale(20),
                },
                pinCodeTextStyle: { color: "#fff" },
                filledPinCodeContainerStyle: { backgroundColor: "#007AEB" },
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginVertical: moderateScale(20),
              }}
            >
              <Text
                style={{
                  fontFamily: "GGSansSemiBold",
                  fontSize: moderateScale(14),
                  opacity: 0.4,
                }}
              >
                Din't you received the OTP?{" "}
              </Text>
              <TouchableOpacity>
                <Text
                  style={{
                    fontFamily: "GGSansSemiBold",
                    fontSize: moderateScale(14),
                    color: "#007AEB",
                  }}
                >
                  RESEND OTP
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginTop: moderateScale(60),
              }}
            >
              <Button onPress={onClickVerify} disabled={otp.length !== 4}>
                Verify
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
}
