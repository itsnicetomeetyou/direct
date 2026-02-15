import { View, Dimensions } from "react-native";
import React, { useCallback } from "react";
import { useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { WebView } from "react-native-webview";

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

  // Use Google Docs Viewer to render PDF in a WebView (works in Expo Go)
  const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri ?? "")}`;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <WebView
        source={{ uri: googleDocsUrl }}
        style={{
          flex: 1,
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
        }}
      />
    </View>
  );
}
