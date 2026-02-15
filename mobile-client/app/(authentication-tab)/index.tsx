import { useWindowDimensions, View, Text, BackHandler, ToastAndroid } from "react-native";
import { Image } from "expo-image";
import { moderateScale } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import Button from "@/components/ui/button";
import { useGetSessionQuery } from "@/redux/auth/authApiSlice";
import { useCallback, useState } from "react";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { data: dataGetSession } = useGetSessionQuery({});
  const [backPressCount, setBackPressCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (dataGetSession?.data?.id && dataGetSession?.data?.emailVerified && dataGetSession?.data?.UserInformation) {
        return router.push("/(dashboard-tab)/home");
      }
      if (dataGetSession?.data?.id && !dataGetSession?.data?.emailVerified) {
        return router.push({
          pathname: "/(authentication-tab)/email-confirmation",
          params: { email: dataGetSession?.data?.email },
        });
      }
      if (dataGetSession?.data?.id && dataGetSession?.data?.emailVerified && !dataGetSession?.data?.UserInformation) {
        return router.push("/(authentication-tab)/information-registration");
      }

      const backAction = () => {
        if (backPressCount === 0) {
          setBackPressCount(1);
          ToastAndroid.show("Press back again to exit", ToastAndroid.SHORT);
          setTimeout(() => {
            setBackPressCount(0);
          }, 2000); // Reset backPressCount after 2 seconds
          return true;
        }
        BackHandler.exitApp();
        return false;
      };

      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

      return () => backHandler.remove();
    }, [
      dataGetSession?.data?.UserInformation,
      dataGetSession?.data?.email,
      dataGetSession?.data?.emailVerified,
      dataGetSession?.data?.id,
      backPressCount,
    ])
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
      <View
        style={{
          width: (90 / 100) * width,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <View
          style={{
            alignItems: "center",
            height: "50%",
          }}
        >
          <Image
            source={require("../../assets/images/adaptive-icon.png")}
            style={{
              width: moderateScale(120),
              height: moderateScale(120),
            }}
            contentFit="contain"
          />
          <View
            style={{
              marginVertical: moderateScale(10),
            }}
          >
            <View style={{ paddingTop: moderateScale(16) }}>
              <Text
                style={{
                  textAlign: "center",
                  fontFamily: "GGSansExtraBold",
                  fontSize: moderateScale(40),
                  lineHeight: moderateScale(44),
                  color: "#fff",
                }}
              >
                WELCOME TO DiReCT
              </Text>
            </View>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "GGSansMedium",
                fontSize: moderateScale(14),
                lineHeight: moderateScale(18),
                color: "#fff",
              }}
            >
              Digital Record and Credential Transaction
            </Text>
          </View>
        </View>

        <View
          style={{
            width: (90 / 100) * width,
            gap: 10,
            bottom: 20,
            position: "absolute",
          }}
        >
          <Button onPress={() => router.push("/(authentication-tab)/register")}>Register</Button>
          <Button onPress={() => router.push("/(authentication-tab)/login")}>Log In</Button>

          <Text
            style={{
              textAlign: "center",
              fontFamily: "GGSansMedium",
              fontSize: moderateScale(8),
              lineHeight: moderateScale(20),
              color: "#fff",
            }}
          >
            Designed & Developed by Kurt Russelle Marmol
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
