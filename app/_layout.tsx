import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppStateProvider } from "@/lib/app-state";
import { ThemeProvider } from "@/lib/theme-provider";

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <ThemeProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="oauth/callback" />
        </Stack>
      </AppStateProvider>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={styles.errorScreen}>
      <Text style={styles.errorTitle}>Code VIP</Text>
      <Text style={styles.errorText}>برنامه با خطای غیرمنتظره روبه‌رو شد.</Text>
      <Text style={styles.errorDetails}>{error.message}</Text>
      <Pressable onPress={retry} style={styles.retryButton}><Text style={styles.retryText}>تلاش دوباره</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  errorScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#0B0D10" },
  errorTitle: { color: "#F5B82E", fontSize: 26, fontWeight: "800" },
  errorText: { color: "#FFFFFF", fontSize: 16, marginTop: 12, textAlign: "center" },
  errorDetails: { color: "#A7AFBA", fontSize: 11, marginTop: 10, textAlign: "center" },
  retryButton: { marginTop: 24, backgroundColor: "#F5B82E", borderRadius: 12, paddingHorizontal: 22, paddingVertical: 12 },
  retryText: { color: "#0B0D10", fontWeight: "800" },
});
