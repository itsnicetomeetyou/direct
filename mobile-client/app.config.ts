import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "DiReCT",
  slug: "DiReCT",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.jkrmarmol.DiReCT",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY ?? "",
      },
    },
  },
  web: {
    bundler: "metro",
    output: "single" as const,
    favicon: "./assets/images/favicon.png",
  },
  platforms: ["ios", "android"],
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    "expo-web-browser",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "ab13c527-207b-4f12-9557-2036f08ef923",
    },
  },
  updates: {
    enabled: false,
  },
});
