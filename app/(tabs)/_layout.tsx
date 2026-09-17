import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        tabBarButton: HapticTab,
        tabBarStyle: { height: 60 + bottomPadding, paddingTop: 8, paddingBottom: bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 },
        tabBarLabelStyle: { fontFamily: "System", fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "چت", tabBarIcon: ({ color }) => <IconSymbol name="message.fill" size={24} color={color} /> }} />
      <Tabs.Screen name="terminal" options={{ title: "ترمینال", tabBarIcon: ({ color }) => <IconSymbol name="terminal" size={24} color={color} /> }} />
      <Tabs.Screen name="library" options={{ title: "گفتگوها", tabBarIcon: ({ color }) => <IconSymbol name="folder.fill" size={24} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "تنظیمات", tabBarIcon: ({ color }) => <IconSymbol name="gearshape.fill" size={24} color={color} /> }} />
    </Tabs>
  );
}
