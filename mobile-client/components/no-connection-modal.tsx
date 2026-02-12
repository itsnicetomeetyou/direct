import { View, Text, Modal, BackHandler } from "react-native";
import React from "react";
import { moderateScale } from "react-native-size-matters";
import Button from "./ui/button";

export default function NoConnectionModal(data: { visible: boolean }) {
  return (
    <Modal transparent statusBarTranslucent visible={data.visible}>
      <View
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 10,
            margin: 20,
            padding: 35,
          }}
        >
          <Text
            style={{
              fontFamily: "GGSansBold",
              fontSize: moderateScale(24),
              marginBottom: 20,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            No Internet!
          </Text>
          <Text
            style={{
              fontFamily: "GGSansMedium",
              fontSize: moderateScale(16),
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            Poor network connection detected. Please check your connectivity.
          </Text>
          <Button onPress={() => BackHandler.exitApp()}>Close</Button>
        </View>
      </View>
    </Modal>
  );
}
