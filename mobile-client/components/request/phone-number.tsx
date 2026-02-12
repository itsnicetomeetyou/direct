import { View, Text } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { TextInput } from "react-native-gesture-handler";
import { useMemo } from "react";
import { useGetProfileQuery } from "@/redux/profileApiSlice";

export default function PhoneNumber() {
  const { data: dataGetProfile } = useGetProfileQuery({});
  const useMemoDataGetProfile = useMemo(() => {
    if (dataGetProfile?.data.id) {
      return dataGetProfile.data;
    }
    return null;
  }, [dataGetProfile]);
  return (
    <View>
      <Text
        style={{
          fontFamily: "GGSansBold",
          fontSize: moderateScale(14),
          marginBottom: moderateScale(4),
        }}
      >
        Phone Number
      </Text>
      <TextInput
        placeholder="Enter your phone number"
        defaultValue={useMemoDataGetProfile?.UserInformation.phoneNo ?? ""}
        editable={false}
        style={{
          fontFamily: "GGSansSemiBold",
          backgroundColor: "#00000008",
          padding: moderateScale(20),
          borderRadius: moderateScale(8),
        }}
      />
    </View>
  );
}
