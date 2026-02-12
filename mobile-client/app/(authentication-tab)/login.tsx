import { Text, ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { moderateScale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import LoginForm from "@/components/ui/auth/login-form";

export default function Login() {
  const { width } = useWindowDimensions();
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
            justifyContent: "space-around",
            flex: 1,
          }}
        >
          <View>
            <Image
              source={require("@/assets/images/adaptive-icon.png")}
              style={{
                width: 90,
                height: 90,
              }}
              contentFit="contain"
            />
            <Text
              style={{
                fontFamily: "GGSansBold",
                fontSize: moderateScale(30),
                color: "#fff",
              }}
            >
              Hey there 👋
            </Text>
          </View>

          <LoginForm />

          <View></View>
          <View></View>
        </SafeAreaView>
      </ScrollView>
    </LinearGradient>
  );
}
