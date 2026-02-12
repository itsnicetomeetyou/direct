import { View, Dimensions } from "react-native";
import React, { useCallback } from "react";
import { useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import Pdf from "react-native-pdf";
import { toast } from "sonner-native";

export default function PdfViewer() {
  const { uri, name } = useLocalSearchParams<{ uri: string; name: string }>();
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: name ?? "",
      });
    }, [name, navigation])
  );
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Pdf
        trustAllCerts={false}
        source={{ uri: uri }}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}`);
        }}
        onError={(error) => {
          toast.error("Failed to load PDF file");
        }}
        onPressLink={(uri) => {
          console.log(`Link pressed: ${uri}`);
        }}
        style={{
          flex: 1,
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
        }}
      />
    </View>
  );
}
