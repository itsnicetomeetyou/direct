import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useCallback, useState } from "react";
import { moderateScale } from "react-native-size-matters";
import Button from "../button";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedSelector";
import { cleanUpLoginInput, setLoginEmailInput, setLoginPasswordInput } from "@/redux/auth/loginSlice";
import { toast } from "sonner-native";
import { authApiSlice, usePostLogInMutation } from "@/redux/auth/authApiSlice";
import { profileApiSlice } from "@/redux/profileApiSlice";
import { statisticsApiSlice } from "@/redux/statisticsApiSlice";
import { documentApiSlice } from "@/redux/documentApiSlice";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const selectLoginInput = useAppSelector((state) => state.loginReducer.input);
  const [postLogin] = usePostLogInMutation();

  const onClickLogin = async () => {
    try {
      setIsLoading(true);
      if (!selectLoginInput.email || !selectLoginInput.password) {
        return toast.error("Email & Password Required", {
          description: "Please enter your email and password to login",
        });
      }
      const { data, status } = await postLogin(selectLoginInput).unwrap();
      if (!data) {
        return toast.error("An Error Occurred", {
          description: "Server returned an empty response. Please try again.",
        });
      }
      if (status === 404 && data?.message === "User Not Found") {
        return toast.error("User Not Found", {
          description: "User not found, please check your email and password",
        });
      }
      if (status === 400) {
        if (Array.isArray(data?.message)) {
          data.message.forEach((msg: string) => {
            toast.error("Validation Error", {
              description: msg,
            });
          });
          return;
        } else {
          return toast.error("Validation Error", {
            description: data?.message || "Invalid input",
          });
        }
      }
      if (status === 201 && data?.accessToken && data?.emailVerified) {
        dispatch(authApiSlice.util.invalidateTags(["LogOut"]));
        dispatch(profileApiSlice.util.invalidateTags(["LogOut"]));
        dispatch(documentApiSlice.util.invalidateTags(["LogOut"]));
        dispatch(statisticsApiSlice.util.invalidateTags(["LogOut"]));
        toast.success("Login Success", {
          description: "You have successfully logged in",
        });
        return router.push("/(dashboard-tab)/home");
      }
      if (status === 201 && data?.accessToken && !data?.emailVerified) {
        toast.error("Email Not Verified", {
          description: "Please verify your email to login",
        });
        return router.push({
          pathname: "/(authentication-tab)/email-confirmation",
          params: {
            email: selectLoginInput.email,
          },
        });
      }
      if (status === 401 && data?.message === "Email Not Verified") {
        toast.error("Email Not Verified", {
          description: "Please verify your email to login",
        });
        return router.push({
          pathname: "/(authentication-tab)/email-confirmation",
          params: {
            email: selectLoginInput.email,
          },
        });
      }
      return toast.error("An Error Occurred", {
        description: data?.message || "An error occurred while trying to login",
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

  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(cleanUpLoginInput());
      };
    }, [dispatch])
  );

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
        Log In
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
          onChangeText={(text) => dispatch(setLoginEmailInput(text))}
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
        />

        <View
          style={{
            backgroundColor: "#0000000D",
            padding: moderateScale(10),
            borderRadius: moderateScale(8),
            flexDirection: "row",
            alignItems: "center",
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <TextInput
            cursorColor={"#000"}
            secureTextEntry={showPassword}
            placeholder="Enter your password"
            onChangeText={(text) => dispatch(setLoginPasswordInput(text))}
            style={{
              fontSize: moderateScale(13),
              fontFamily: "GGSansMedium",
              flex: 1,
            }}
            editable={!isLoading}
            selectTextOnFocus={!isLoading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {showPassword ? (
              <Ionicons name="eye-off-outline" size={24} color="black" />
            ) : (
              <Ionicons name="eye" size={24} color="black" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(12),
              fontFamily: "GGSansSemiBold",
              textAlign: "right",
            }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginTop: moderateScale(60),
        }}
      >
        <Button onPress={onClickLogin} loading={isLoading}>
          Log In
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
          }}
        >
          Don’t have an account? Register{" "}
        </Text>
        <TouchableOpacity onPress={() => router.push("/(authentication-tab)/register")}>
          <Text
            style={{
              fontSize: moderateScale(12),
              fontFamily: "GGSansMedium",
              textDecorationLine: "underline",
            }}
          >
            here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
