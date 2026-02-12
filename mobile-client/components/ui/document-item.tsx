import { View, Text, useWindowDimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BadgeStatus from "./badge-status";
import { moderateScale } from "react-native-size-matters";
import { truncateString } from "@/utils";
import { DocumentSelected, DocumentTransactionStatus } from "@/typings";
import { router } from "expo-router";

export default function DocumentItem(data: { id: string; documentSelected: DocumentSelected[]; status: DocumentTransactionStatus }) {
  const { width } = useWindowDimensions();
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(dashboard-screen)/transaction",
          params: {
            id: data.id,
          },
        })
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: moderateScale(12),
        width: (90 / 100) * width,
        borderRadius: moderateScale(10),
        elevation: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Ionicons name="document" size={34} color="black" />
        <View
          style={{
            marginLeft: moderateScale(6),
          }}
        >
          <Text
            style={{
              fontFamily: "GGSansSemiBold",
              fontSize: moderateScale(14),
            }}
          >
            {truncateString(data.documentSelected.join(", "), 22)}
          </Text>
          <Text
            style={{
              fontFamily: "GGSansSemiBold",
              fontSize: moderateScale(14),
              opacity: 0.4,
            }}
          >
            {truncateString(data.id, 20)}
          </Text>
        </View>
      </View>
      <BadgeStatus variant={data.status} />
    </TouchableOpacity>
  );
}
