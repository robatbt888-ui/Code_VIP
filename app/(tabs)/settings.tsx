import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppState } from "@/lib/app-state";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { startOAuthLogin } from "@/constants/oauth";
import type { ProviderKind } from "@/shared/models";

const rtl = { writingDirection: "rtl" as const, textAlign: "right" as const };
const providerMeta: Record<ProviderKind, { label: string; description: string; color: string }> = {
  demo: { label: "Demo آفلاین", description: "برای آزمایش رابط بدون کلید API", color: "#7C5CFC" },
  openai: { label: "OpenAI و سازگارها", description: "Codex، GPT و درگاه‌های سازگار با OpenAI", color: "#18A37A" },
  anthropic: { label: "Anthropic", description: "Claude Sonnet و Claude Opus", color: "#D97757" },
};

export default function SettingsScreen() {
  const colors = useColors();
  const { state, updateProviderSettings } = useAppState();
  const { user, isAuthenticated } = useAuth();
  const [provider, setProvider] = useState<ProviderKind>("openai");
  const [baseUrl, setBaseUrl] = useState(state.providerSettings.openai.baseUrl);
  const [model, setModel] = useState(state.providerSettings.openai.model);
  const [apiKey, setApiKey] = useState("");
  const active = state.providerSettings[provider];

  useEffect(() => {
    setBaseUrl(state.providerSettings[provider].baseUrl);
    setModel(state.providerSettings[provider].model);
    setApiKey("");
  }, [provider, state.providerSettings]);

  const save = async () => {
    await updateProviderSettings(provider, { baseUrl, model }, apiKey || undefined);
    Alert.alert("ذخیره شد", "تنظیمات این ارائه‌دهنده به‌روزرسانی شد.");
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.muted }, rtl]}>کنترل اتصال</Text>
            <Text style={[styles.title, { color: colors.foreground }, rtl]}>تنظیمات</Text>
            <Text style={[styles.subtitle, { color: colors.muted }, rtl]}>برای استفاده واقعی، سرویس موردنظر و کلید شخصی خودتان را وارد کنید.</Text>
          </View>

          <View style={[styles.accountCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.accountIcon, { backgroundColor: `${colors.primary}18` }]}><IconSymbol name={isAuthenticated ? "check" : "cloud"} size={19} color={colors.primary} /></View>
            <View style={styles.accountBody}><Text style={[styles.accountTitle, { color: colors.foreground }, rtl]}>{isAuthenticated ? `سلام، ${user?.name ?? "کاربر Code VIP"}` : "ورود اختیاری به Code VIP"}</Text><Text style={[styles.accountText, { color: colors.muted }, rtl]}>{isAuthenticated ? "حساب شما متصل است؛ گفتگوهای جدید می‌توانند همگام شوند." : "برای ذخیره ابری و ادامه گفتگو روی دستگاه‌های دیگر وارد شوید؛ چت محلی بدون ورود هم کار می‌کند."}</Text></View>
            {!isAuthenticated && <Pressable onPress={() => void startOAuthLogin()} style={({ pressed }) => [styles.loginButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={styles.loginText}>ورود</Text></Pressable>}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }, rtl]}>ارائه‌دهنده</Text>
          <View style={[styles.providerTabs, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            {(["openai", "anthropic", "demo"] as ProviderKind[]).map((item) => {
              const meta = providerMeta[item];
              const selected = provider === item;
              return <Pressable key={item} onPress={() => setProvider(item)} style={({ pressed }) => [styles.providerTab, selected && { backgroundColor: `${meta.color}18` }, pressed && styles.pressed]}><View style={[styles.providerDot, { backgroundColor: meta.color }]} /><Text style={[styles.providerText, { color: selected ? meta.color : colors.muted }]}>{meta.label}</Text></Pressable>;
            })}
          </View>

          <View style={[styles.selectedCard, { borderColor: `${providerMeta[provider].color}55`, backgroundColor: colors.surface }]}>
            <View style={[styles.selectedIcon, { backgroundColor: `${providerMeta[provider].color}20` }]}><IconSymbol name={provider === "demo" ? "sparkles" : "cloud"} size={20} color={providerMeta[provider].color} /></View>
            <View style={styles.selectedBody}><Text style={[styles.selectedTitle, { color: colors.foreground }, rtl]}>{providerMeta[provider].label}</Text><Text style={[styles.selectedDescription, { color: colors.muted }, rtl]}>{providerMeta[provider].description}</Text></View>
            {active.apiKeyConfigured && <View style={styles.connected}><IconSymbol name="check" size={13} color="#16A34A" /><Text style={styles.connectedText}>فعال</Text></View>}
          </View>

          {provider !== "demo" && <>
            <Text style={[styles.fieldLabel, { color: colors.foreground }, rtl]}>آدرس API</Text>
            <TextInput value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" keyboardType="url" placeholder="https://api.example.com/v1" placeholderTextColor={colors.muted} style={[styles.field, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }, rtl]} />
            <Text style={[styles.help, { color: colors.muted }, rtl]}>برای Codex/GPT معمولاً به /v1 ختم می‌شود. برای Claude آدرس رسمی یا gateway سازگار را وارد کنید.</Text>
            <Text style={[styles.fieldLabel, { color: colors.foreground }, rtl]}>نام مدل</Text>
            <TextInput value={model} onChangeText={setModel} autoCapitalize="none" placeholder="نام مدل ارائه‌دهنده" placeholderTextColor={colors.muted} style={[styles.field, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }, rtl]} />
            <Text style={[styles.fieldLabel, { color: colors.foreground }, rtl]}>کلید API</Text>
            <TextInput value={apiKey} onChangeText={setApiKey} secureTextEntry autoCapitalize="none" placeholder={active.apiKeyConfigured ? "برای نگه‌داشتن کلید خالی بگذارید" : "کلید را وارد کنید"} placeholderTextColor={colors.muted} style={[styles.field, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.surface }, rtl]} />
          </>}
          <Pressable onPress={save} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><IconSymbol name="lock" size={17} color="#fff" /><Text style={styles.saveText}>ذخیره امن تنظیمات</Text></Pressable>

          <View style={[styles.infoCard, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}><IconSymbol name="info" size={18} color={colors.primary} /><Text style={[styles.infoText, { color: colors.foreground }, rtl]}>کلیدها روی اندروید داخل Android Keystore و روی iOS داخل Keychain ذخیره می‌شوند. مدل‌های بسته مثل Claude Code یا Codex در APK دانلود نمی‌شوند؛ اپ از API رسمی آن‌ها استفاده می‌کند.</Text></View>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 22 }, rtl]}>وضعیت ذخیره‌سازی</Text>
          <View style={[styles.statusRow, { borderColor: colors.border, backgroundColor: colors.surface }]}><IconSymbol name="lock" size={18} color={colors.primary} /><Text style={[styles.statusText, { color: colors.foreground }, rtl]}>ذخیره محلی فعال است · {state.conversations.length} گفتگو روی دستگاه</Text></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  header: { alignItems: "flex-end", marginBottom: 24 },
  kicker: { fontSize: 11, fontWeight: "600", marginBottom: 3 },
  title: { fontSize: 27, fontWeight: "800" },
  subtitle: { fontSize: 13, lineHeight: 21, marginTop: 7, textAlign: "right" },
  accountCard: { flexDirection: "row-reverse", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 22 },
  accountIcon: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  accountBody: { flex: 1 },
  accountTitle: { fontSize: 13, fontWeight: "800" },
  accountText: { fontSize: 10, lineHeight: 16, marginTop: 3 },
  loginButton: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10 },
  loginText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 9 },
  providerTabs: { borderWidth: 1, borderRadius: 15, padding: 4, flexDirection: "row-reverse", gap: 4 },
  providerTab: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: 11, gap: 4 },
  providerDot: { width: 7, height: 7, borderRadius: 4 },
  providerText: { fontSize: 10, fontWeight: "700", textAlign: "center" },
  selectedCard: { flexDirection: "row-reverse", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 13, marginBottom: 21 },
  selectedIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  selectedBody: { flex: 1 },
  selectedTitle: { fontSize: 14, fontWeight: "800" },
  selectedDescription: { fontSize: 11, marginTop: 3 },
  connected: { flexDirection: "row", alignItems: "center", gap: 2 },
  connectedText: { color: "#16A34A", fontSize: 10, fontWeight: "700" },
  fieldLabel: { fontSize: 12, fontWeight: "700", marginBottom: 7, marginTop: 12 },
  field: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 12, paddingVertical: 11, minHeight: 46, fontSize: 13 },
  help: { fontSize: 10, lineHeight: 16, textAlign: "right", marginTop: 5 },
  saveButton: { minHeight: 49, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row-reverse", gap: 7, marginTop: 22 },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  infoCard: { flexDirection: "row-reverse", alignItems: "flex-start", gap: 9, borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 15 },
  infoText: { flex: 1, fontSize: 11, lineHeight: 18 },
  statusRow: { flexDirection: "row-reverse", alignItems: "center", gap: 9, borderWidth: 1, borderRadius: 13, padding: 13 },
  statusText: { flex: 1, fontSize: 12 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
