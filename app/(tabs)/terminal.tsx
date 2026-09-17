import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { CLI_CATALOG, getCliTool, SUPPORT_LABELS } from "@/lib/cli-catalog";
import { addTerminalLine, copyText, createTerminalSession, loadTerminalSessions, openTermux, saveTerminalSessions } from "@/lib/local-terminal";
import type { TerminalSession } from "@/shared/models";

const rtl = { writingDirection: "rtl" as const, textAlign: "right" as const };

export default function TerminalScreen() {
  const colors = useColors();
  const [toolId, setToolId] = useState("opencode");
  const [session, setSession] = useState<TerminalSession>(() => createTerminalSession("opencode"));
  const [command, setCommand] = useState("");
  const tool = useMemo(() => getCliTool(toolId), [toolId]);

  useEffect(() => {
    loadTerminalSessions().then((saved) => {
      const last = saved[0];
      if (last) { setToolId(last.toolId); setSession(last); }
    });
  }, []);

  useEffect(() => { void saveTerminalSessions([session]); }, [session]);

  const selectTool = (id: string) => {
    setToolId(id);
    setSession(createTerminalSession(id));
  };

  const runLocal = () => {
    const value = command.trim();
    if (!value) return;
    setSession((current) => addTerminalLine(addTerminalLine(current, "input", `$ ${value}`), "system", "دستور در صف اجرای محلی قرار گرفت. برای اجرای واقعی، آن را در Termux اجرا کنید."));
    setCommand("");
  };

  const launch = async () => {
    const opened = await openTermux();
    if (!opened) Alert.alert("Termux پیدا نشد", "Termux را از F-Droid نصب کنید، سپس دوباره امتحان کنید.");
    else setSession((current) => addTerminalLine(current, "system", "Termux باز شد. دستور آماده را کپی و در آن اجرا کنید."));
  };

  const copy = async (value: string) => {
    await copyText(value);
    setSession((current) => addTerminalLine(current, "system", "دستور در کلیپ‌بورد کپی شد."));
  };

  return (
    <ScreenContainer className="p-4" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headingRow}>
            <View style={[styles.brand, { backgroundColor: colors.primary }]}><IconSymbol name="terminal" size={20} color="#fff" /></View>
            <View><Text style={[styles.eyebrow, { color: colors.muted }, rtl]}>اجرای محلی روی گوشی</Text><Text style={[styles.title, { color: colors.foreground }, rtl]}>ترمینال Code VIP</Text></View>
          </View>
          <Pressable onPress={launch} style={({ pressed }) => [styles.openButton, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><IconSymbol name="open" size={17} color={colors.primary} /><Text style={[styles.openText, { color: colors.primary }, rtl]}>بازکردن Termux</Text></Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }, rtl]}>ابزار کدنویسی را انتخاب کنید</Text>
        <FlatList data={CLI_CATALOG} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => item.id} contentContainerStyle={styles.toolsRow} renderItem={({ item }) => (
          <Pressable onPress={() => selectTool(item.id)} style={({ pressed }) => [styles.toolCard, { borderColor: item.id === toolId ? item.accent : colors.border, backgroundColor: item.id === toolId ? `${item.accent}16` : colors.surface }, pressed && styles.pressed]}>
            <View style={[styles.toolDot, { backgroundColor: item.accent }]} /><Text style={[styles.toolName, { color: colors.foreground }, rtl]}>{item.name}</Text><Text style={[styles.toolVendor, { color: colors.muted }, rtl]}>{item.vendor}</Text>
          </Pressable>
        )} />

        <View style={[styles.infoCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.infoTop}><View style={[styles.statusDot, { backgroundColor: tool.support === "termux" ? colors.success : colors.warning }]} /><Text style={[styles.status, { color: colors.foreground }, rtl]}>{SUPPORT_LABELS[tool.support]}</Text><Text style={[styles.toolLarge, { color: tool.accent }, rtl]}>{tool.name}</Text></View>
          <Text style={[styles.description, { color: colors.muted }, rtl]}>{tool.description}</Text>
          <Text style={[styles.warning, { color: colors.warning }, rtl]}>نسخه محلی فقط از اینترنت کاربر و محیط Android استفاده می‌کند؛ این برنامه ادعا نمی‌کند CLI داخل APK نصب شده است.</Text>
        </View>

        <View style={[styles.terminal, { backgroundColor: "#101114", borderColor: "#292d35" }]}>
          <View style={styles.terminalBar}><View style={styles.traffic}><View style={[styles.trafficDot, { backgroundColor: "#EF4444" }]} /><View style={[styles.trafficDot, { backgroundColor: "#F59E0B" }]} /><View style={[styles.trafficDot, { backgroundColor: "#22C55E" }]} /></View><Text style={styles.terminalTitle}>code-vip · {tool.id}</Text></View>
          <FlatList data={session.lines} keyExtractor={(item) => item.id} scrollEnabled={false} contentContainerStyle={styles.lines} renderItem={({ item }) => <Text style={[styles.line, item.kind === "error" && styles.errorLine, item.kind === "system" && styles.systemLine]}>{item.text}</Text>} />
          <TextInput value={command} onChangeText={setCommand} onSubmitEditing={runLocal} placeholder="دستور یا فرمان آماده..." placeholderTextColor="#6B7280" multiline style={styles.commandInput} autoCapitalize="none" />
          <Pressable onPress={runLocal} style={({ pressed }) => [styles.runButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}><IconSymbol name="play" size={17} color="#fff" /><Text style={styles.runText}>ثبت دستور محلی</Text></Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }, rtl]}>دستورهای آماده {tool.name}</Text>
        {[tool.installCommand, tool.authCommand, tool.launchCommand].map((value) => <Pressable key={value} onPress={() => copy(value)} style={({ pressed }) => [styles.commandCard, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><Text style={styles.commandText}>{value}</Text><IconSymbol name="copy" size={17} color={colors.primary} /></Pressable>)}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28, gap: 12 },
  header: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 2 },
  headingRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10, flexShrink: 1 },
  brand: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  eyebrow: { fontSize: 11, marginBottom: 2 }, title: { fontSize: 21, fontWeight: "800" },
  openButton: { flexDirection: "row-reverse", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: 11, paddingVertical: 8, paddingHorizontal: 8 }, openText: { fontSize: 10, fontWeight: "700" },
  sectionTitle: { fontSize: 14, fontWeight: "800", marginTop: 4 }, toolsRow: { gap: 8, paddingVertical: 2 },
  toolCard: { width: 126, minHeight: 76, borderRadius: 14, borderWidth: 1, padding: 10, justifyContent: "center" }, toolDot: { width: 9, height: 9, borderRadius: 5, marginBottom: 7 }, toolName: { fontSize: 12, fontWeight: "800" }, toolVendor: { fontSize: 10, marginTop: 3 },
  infoCard: { borderWidth: 1, borderRadius: 15, padding: 13, gap: 7 }, infoTop: { flexDirection: "row-reverse", alignItems: "center", gap: 7 }, statusDot: { width: 8, height: 8, borderRadius: 4 }, status: { fontSize: 10, flex: 1 }, toolLarge: { fontSize: 15, fontWeight: "800" }, description: { fontSize: 12, lineHeight: 19 }, warning: { fontSize: 10, lineHeight: 16 },
  terminal: { borderRadius: 15, borderWidth: 1, overflow: "hidden" }, terminalBar: { height: 36, backgroundColor: "#191c22", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 }, traffic: { flexDirection: "row", gap: 5 }, trafficDot: { width: 8, height: 8, borderRadius: 4 }, terminalTitle: { color: "#A1A1AA", fontSize: 10 }, lines: { padding: 12, gap: 7, minHeight: 126 }, line: { color: "#E5E7EB", fontSize: 11, lineHeight: 17, fontFamily: "monospace", textAlign: "left" }, systemLine: { color: "#93C5FD" }, errorLine: { color: "#FCA5A5" }, commandInput: { margin: 10, minHeight: 55, borderRadius: 9, backgroundColor: "#191c22", color: "#F9FAFB", padding: 10, fontSize: 12, fontFamily: "monospace", textAlign: "left" }, runButton: { marginHorizontal: 10, marginBottom: 10, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }, runText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  commandCard: { minHeight: 44, borderRadius: 11, borderWidth: 1, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, commandText: { flex: 1, color: "#A7F3D0", backgroundColor: "#101114", padding: 8, borderRadius: 7, fontSize: 10, fontFamily: "monospace", textAlign: "left" }, pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
