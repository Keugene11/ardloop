import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ardsleypost.app",
  appName: "Ardsleypost",
  webDir: "out",
  server: {
    // Point to your live Vercel URL — update this if you add a custom domain
    url: "https://ardloop.vercel.app",
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Ardsleypost",
  },
  android: {
    backgroundColor: "#fafafa",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1000,
      backgroundColor: "#fafafa",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#fafafa",
    },
  },
};

export default config;
