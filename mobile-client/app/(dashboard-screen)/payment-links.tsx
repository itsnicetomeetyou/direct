import { View } from "react-native";
import React, { useCallback } from "react";
import { WebView, WebViewNavigation } from "react-native-webview";
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { documentApiSlice, usePutPayDocumentTransactionMutation } from "@/redux/documentApiSlice";
import { useAppDispatch } from "@/hooks/useTypedSelector";

export default function PaymentLinks() {
  const { invoiceId, documentRequestId } = useLocalSearchParams<{ invoiceId: string; documentRequestId: string }>();
  const navigation = useNavigation();
  const [putPayDocumentTransaction] = usePutPayDocumentTransactionMutation();
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerTitle: invoiceId,
      });
    }, [navigation, invoiceId])
  );

  const handleNavigationStateChange = useCallback(
    async (e: WebViewNavigation) => {
      if (e.url === "https://pos.kumatechnologies.com/thank-you") {
        await putPayDocumentTransaction({ id: documentRequestId }).unwrap();
        dispatch(documentApiSlice.util.resetApiState());
        return router.back();
      }
    },
    [dispatch, documentRequestId, putPayDocumentTransaction]
  );
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {invoiceId && (
        <WebView
          source={{ uri: "https://checkout.xendit.co/web/" + invoiceId }}
          originWhiteList={["*"]}
          onNavigationStateChange={handleNavigationStateChange}
          useWebView2
          contentMode="mobile"
          style={{ flex: 1 }}
          forceDarkOn={false}
        />
      )}
    </View>
  );
}
