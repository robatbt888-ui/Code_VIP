import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
export default function TabsLayout() { const colors = useColors(); const inset = useSafeAreaInsets(); const bottom = Platform.OS === "web" ? 10 : Math.max(inset.bottom, 8); return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: { height: 60 + bottom, paddingBottom: bottom, paddingTop: 8, backgroundColor: colors.surface, borderTopColor: colors.border }, tabBarLabelStyle: { fontSize: 11 } }}><Tabs.Screen name="index" options={{ title: "مدل‌های AI", tabBarIcon: ({ color }) => <IconSymbol name="sparkles" size={24} color={color} /> }} /><Tabs.Screen name="chats" options={{ title: "چت‌ها", tabBarIcon: ({ color }) => <IconSymbol name="message.fill" size={24} color={color} /> }} /></Tabs>; }
