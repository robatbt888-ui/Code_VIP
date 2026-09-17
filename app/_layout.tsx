import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeProvider } from "@/lib/theme-provider";

export default function RootLayout() {
  useEffect(() => { void SplashScreen.hideAsync().catch(() => undefined); }, []);
  return <ThemeProvider><><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></></ThemeProvider>;
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <View style={styles.error}><Text style={styles.brand}>Code VIP</Text><Text style={styles.text}>Application error</Text><Text style={styles.detail}>{error.message}</Text><Pressable onPress={retry} style={styles.button}><Text style={styles.buttonText}>Retry</Text></Pressable></View>;
}
const styles = StyleSheet.create({ error: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#08111F" }, brand: { color: "#60A5FA", fontSize: 27, fontWeight: "800" }, text: { color: "#fff", fontSize: 16, marginTop: 12 }, detail: { color: "#A7B4C8", fontSize: 11, marginTop: 10, textAlign: "center" }, button: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: "#16A34A" }, buttonText: { color: "#fff", fontWeight: "800" } });
