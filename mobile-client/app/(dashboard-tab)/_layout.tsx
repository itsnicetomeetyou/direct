import { useCallback } from "react";
import DocumentActive from "@/components/svg/document-active";
import DocumentInActive from "@/components/svg/document-inactive";
import HomeActive from "@/components/svg/home-active";
import HomeInactive from "@/components/svg/home-inactive";
import ProfileActive from "@/components/svg/profile-active";
import ProfileInActive from "@/components/svg/profile-inactive";
import { router, Tabs, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { moderateScale } from "react-native-size-matters";
import { AntDesign } from "@expo/vector-icons";
import { View, Text } from "react-native";

export default function DashboardTab() {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark", true);

      return () => {
        setStatusBarStyle("auto", true);
      };
    }, [])
  );
  return (
    <Tabs
      screenOptions={({ route }: { route: any }) => ({
        headerShown: route.name === "profile",
        headerTitle: "",
        headerTransparent: route.name === "profile",
        tabBarStyle: {
          height: moderateScale(50),
          backgroundColor: "#fff",
          elevation: 0,
          shadowOpacity: 0,
          padding: moderateScale(10),
          display: route.name === "profile" ? "none" : "flex",
        },
        headerLeft: () => {
          if (route.name === "profile") {
            return (
              <View
                style={{
                  marginLeft: moderateScale(10),
                }}
              >
                <AntDesign name="arrow-left" size={24} color="#fff" onPress={() => router.back()} />
              </View>
            );
          }
        },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused }: { focused: boolean }) => {
          if (route.name === "home")
            return focused ? (
              <HomeActive height={30} width={30} fill={"#007AEB"} />
            ) : (
              <HomeInactive height={30} width={30} opacity={0.2} />
            );
          if (route.name === "documents")
            return focused ? (
              <DocumentActive height={30} width={30} fill={"#007AEB"} />
            ) : (
              <DocumentInActive height={30} width={30} opacity={0.2} />
            );
          if (route.name === "profile")
            return focused ? (
              <ProfileActive height={30} width={30} fill={"#007AEB"} />
            ) : (
              <ProfileInActive height={30} width={30} opacity={0.2} />
            );
        },
        tabBarLabel: ({ focused }: { focused: boolean }) => {
          if (route.name === "home") {
            return (
              <Text
                style={{
                  fontSize: moderateScale(10),
                  color: focused ? "#007AEB" : "#00000033",
                }}
              >
                Home
              </Text>
            );
          }
          if (route.name === "documents") {
            return (
              <Text
                style={{
                  fontSize: moderateScale(10),
                  color: focused ? "#007AEB" : "#00000033",
                }}
              >
                Documents
              </Text>
            );
          }
          if (route.name === "profile") {
            return (
              <Text
                style={{
                  fontSize: moderateScale(10),
                  color: focused ? "#007AEB" : "#00000033",
                }}
              >
                Profile
              </Text>
            );
          }
        },
      })}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: true,
          headerTitle: "DiReCT",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: "GGSansBold",
            color: "#007AEB",
          },
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          headerShown: true,
          headerTitle: "DOCUMENTS",
          headerTitleStyle: {
            fontFamily: "GGSansBold",
            color: "#007AEB",
          },
          headerStyle: {
            backgroundColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
