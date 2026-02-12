import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { setStatusBarStyle } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { authApiSlice, useGetSessionQuery } from "@/redux/auth/authApiSlice";
import { Avatar } from "@kolking/react-native-avatar";
import { profileApiSlice, useGetProfileQuery } from "@/redux/profileApiSlice";
import { useAppDispatch } from "@/hooks/useTypedSelector";
import { statisticsApiSlice } from "@/redux/statisticsApiSlice";
import { documentApiSlice } from "@/redux/documentApiSlice";

export default function Profile() {
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { refetch: refetchGetSession } = useGetSessionQuery({});
  const { data: dataGetProfile } = useGetProfileQuery({});

  const useMemoDataGetProfile = useMemo(() => {
    if (dataGetProfile?.data.id) {
      return dataGetProfile.data;
    }
    return null;
  }, [dataGetProfile?.data]);

  const onClickLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await refetchGetSession();
    dispatch(authApiSlice.util.resetApiState());
    dispatch(profileApiSlice.util.resetApiState());
    dispatch(statisticsApiSlice.util.resetApiState());
    dispatch(documentApiSlice.util.resetApiState());
    return router.push("/(authentication-tab)/");
  };

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light", true);

      return () => {
        setStatusBarStyle("dark", true);
      };
    }, [])
  );
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F5F6FA",
      }}
    >
      <View>
        <View
          style={{
            backgroundColor: "#020066",
            height: moderateScale(260),
          }}
        ></View>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: moderateScale(1000),
            justifyContent: "center",
            alignItems: "center",
            width: moderateScale(110),
            height: moderateScale(110),
            position: "absolute",
            bottom: moderateScale(-50),
            left: moderateScale(20),
          }}
        >
          <Avatar
            size={100}
            colorize
            email={useMemoDataGetProfile?.email ?? ""}
            name={useMemoDataGetProfile?.UserInformation?.firstName ?? ""}
          />
        </View>
      </View>

      <View
        style={{
          width: (90 / 100) * width,
          alignSelf: "center",
          marginTop: moderateScale(60),
        }}
      >
        <Text
          style={{
            fontFamily: "GGSansBold",
            fontSize: moderateScale(20),
          }}
        >
          {useMemoDataGetProfile?.UserInformation?.firstName} {useMemoDataGetProfile?.UserInformation?.lastName}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onClickLogout}
        style={{
          backgroundColor: "#0000000D",
          height: moderateScale(50),
          justifyContent: "center",
          alignItems: "center",
          width: (90 / 100) * width,
          alignSelf: "center",
          position: "absolute",
          bottom: moderateScale(10),
          borderRadius: moderateScale(10),
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontFamily: "GGSansBold",
            opacity: 0.6,
            fontSize: moderateScale(13),
          }}
        >
          Log Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
