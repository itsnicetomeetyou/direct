import { useEffect, useState } from "react";
import store from "@/redux/store";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Network from "expo-network";
import NoConnectionModal from "@/components/no-connection-modal";
import * as Updates from "expo-updates";
import { Alert } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [noConnection, setConnection] = useState<boolean>(false);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    GGSansBold: require("../assets/fonts/GGSans/ggsans-Bold.ttf"),
    GGSansBoldItalic: require("../assets/fonts/GGSans/ggsans-BoldItalic.ttf"),
    GGSansExtraBold: require("../assets/fonts/GGSans/ggsans-ExtraBold.ttf"),
    GGSansExtraBoldItalic: require("../assets/fonts/GGSans/ggsans-ExtraBoldItalic.ttf"),
    GGSansMedium: require("../assets/fonts/GGSans/ggsans-Medium.ttf"),
    GGSansMediumItalic: require("../assets/fonts/GGSans/ggsans-MediumItalic.ttf"),
    GGSansNormal: require("../assets/fonts/GGSans/ggsans-Normal.ttf"),
    GGSansNormalItalic: require("../assets/fonts/GGSans/ggsans-NormalItalic.ttf"),
    GGSansSemiBold: require("../assets/fonts/GGSans/ggsans-Semibold.ttf"),
    GGSansSemiBoldItalic: require("../assets/fonts/GGSans/ggsans-SemiboldItalic.ttf"),
  });

  const downloadNewVersion = async () => {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (err) {
      alert(`Error fetching latest Expo update: ${err}`);
    }
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }

    (async () => {
      await NavigationBar.setBackgroundColorAsync("white");
      const network = await Network.getNetworkStateAsync();
      if (network.isConnected === false) {
        setConnection(true);
      }

      const updates = await Updates.checkForUpdateAsync();
      if (updates.isAvailable) {
        Alert.alert("New Version Released!", "Install now the latest app for better use.", [
          {
            text: "Ask me later",
            onPress: () => console.log("Ask me later pressed"),
          },
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          { text: "INSTALL", onPress: downloadNewVersion },
        ]);
      }
    })();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NoConnectionModal visible={noConnection} />
        <Provider store={store}>
          <Stack>
            <Stack.Screen name="(authentication-tab)" options={{ headerShown: false, animation: "ios" }} />
            <Stack.Screen name="(dashboard-tab)" options={{ headerShown: false, animation: "ios" }} />
            <Stack.Screen name="(dashboard-screen)" options={{ headerShown: false, animation: "ios" }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <Toaster />
        </Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
