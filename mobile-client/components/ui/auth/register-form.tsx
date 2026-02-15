import { View, Text, TextInput } from "react-native";
import React, { useState } from "react";
import Button from "../button";
import { moderateScale } from "react-native-size-matters";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { usePostRegisterMutation } from "@/redux/auth/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import {
  setRegisterInputConfirmPassword,
  setRegisterInputEmail,
  setRegisterInputPassword,
} from "@/redux/auth/registerSlice";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const selectRegisterForm = useAppSelector((state) => state.registerReducer.input);
  const [postRegister] = usePostRegisterMutation();
  const onClickRegister = async () => {
    try {
      setIsLoading(true);
      if (selectRegisterForm.password !== selectRegisterForm.confirmPassword) {
        return toast.error("Password does not match.", {
          description: "Please make sure that your password match.",
        });
      }
      const { data, status } = await postRegister({
        email: selectRegisterForm.email,
        password: selectRegisterForm.password,
      }).unwrap();
      if (!data) {
        return toast.error("An Error Occurred", {
          description: "Server returned an empty response. Please try again.",
        });
      }
      if (status === 400 && Array.isArray(data?.message)) {
        return toast.error("An error occurred. Please try again later.", {
          description: data.message.join(", "),
        });
      }
      if (status === 409 && data?.message === "User Already Exists") {
        return toast.error("User Already Exists", {
          description: "Please change email address.",
        });
      }
      if (status === 201 && data?.id) {
        toast.success("Successfully registered.", {
          description: "You can now login.",
        });
        return router.push("/(authentication-tab)/login");
      }
      return toast.error("An error occurred. Please try again later.", {
        description: data?.message || "Please try again later.",
      });
    } catch (err: any) {
      const message =
        err instanceof Error
          ? err.message
          : err?.data?.message || err?.error || "Something went wrong. Please try again.";
      return toast.error("An error occurred.", {
        description: typeof message === "string" ? message : "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
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
        Register
      </Text>

      <View
        style={{
          gap: moderateScale(10),
          marginVertical: moderateScale(30),
        }}
      >
        <TextInput
          cursorColor={"#000"}
          placeholder="Enter your email address"
          style={{
            backgroundColor: "#0000000D",
            padding: moderateScale(10),
            borderRadius: moderateScale(8),
            fontSize: moderateScale(13),
            fontFamily: "GGSansMedium",
            opacity: isLoading ? 0.5 : 1,
          }}
          editable={!isLoading}
          selectTextOnFocus={!isLoading}
          onChangeText={(text) => dispatch(setRegisterInputEmail(text))}
        />

        <TextInput
          cursorColor={"#000"}
          placeholder="Enter your password"
          secureTextEntry
          style={{
            backgroundColor: "#0000000D",
            padding: moderateScale(10),
            borderRadius: moderateScale(8),
            fontSize: moderateScale(13),
            fontFamily: "GGSansMedium",
            opacity: isLoading ? 0.5 : 1,
          }}
          editable={!isLoading}
          selectTextOnFocus={!isLoading}
          onChangeText={(text) => dispatch(setRegisterInputPassword(text))}
        />

        <TextInput
          cursorColor={"#000"}
          placeholder="Confirm your password"
          secureTextEntry
          style={{
            backgroundColor: "#0000000D",
            padding: moderateScale(10),
            borderRadius: moderateScale(8),
            fontSize: moderateScale(13),
            fontFamily: "GGSansMedium",
            opacity: isLoading ? 0.5 : 1,
          }}
          editable={!isLoading}
          selectTextOnFocus={!isLoading}
          onChangeText={(text) => dispatch(setRegisterInputConfirmPassword(text))}
        />
      </View>

      <View
        style={{
          marginTop: moderateScale(60),
        }}
      >
        <Button onPress={onClickRegister} loading={isLoading}>
          Register
        </Button>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "center",
          marginTop: moderateScale(20),
        }}
      >
        <Text
          style={{
            fontSize: moderateScale(12),
            fontFamily: "GGSansSemiBold",
            textAlign: "center",
            width: "65%",
          }}
        >
          By signing up, You agree to our Terms of User and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
