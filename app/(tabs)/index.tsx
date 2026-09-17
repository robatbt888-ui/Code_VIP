import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MODEL_CATALOG } from "@/lib/model-catalog";
import { useAppState } from "@/lib/app-state";
import { useColors } from "@/hooks/use-colors";
import { createId, type ChatAttachment, type ChatMessage } from "@/shared/models";

const rtl = { writingDirection: "rtl" as const, textAlign: "right" as const };

function MessageBubble({ message }: { message: ChatMessage }) {
  const colors = useColors();
  const isUser = message.role === "user";
  return (
    <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
      {!isUser && <View style={[styles.avatar, { backgroundColor: colors.primary }]}><IconSymbol name="sparkles" size={14} color="#fff" /></View>}
      <View style={[styles.bubble, { backgroundColor: isUser ? colors.primary : colors.surface, borderColor: isUser ? colors.primary : colors.border }]}>
        <Text style={[styles.messageText, rtl, { color: isUser ? "#fff" : colors.foreground }]}>{message.content}</Text>
        {message.attachments?.map((attachment) => <View key={attachment.id} style={[styles.messageAttachment, { backgroundColor: isUser ? "rgba(255,255,255,.14)" : colors.background }]}><IconSymbol name="attach" size={13} color={isUser ? "#fff" : colors.primary} /><Text style={[styles.messageAttachmentText, { color: isUser ? "#fff" : colors.foreground }]} numberOfLines={1}>{attachment.name}</Text></View>)}
        <Text style={[styles.messageTime, { color: isUser ? "rgba(255,255,255,.7)" : colors.muted }]}>{new Date(message.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const { activeConversation, selectedModel, setSelectedModel, createConversation, sendMessage } = useAppState();
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [showModels, setShowModels] = useState(false);

  const messages = useMemo(() => activeConversation?.messages ?? [], [activeConversation]);
  const chooseModel = (modelId: string) => {
    setSelectedModel(modelId);
    if (activeConversation && activeConversation.messages.length > 0) createConversation(modelId);
    setShowModels(false);
  };

  const pickFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: true, copyToCacheDirectory: true });
    if (result.canceled) return;
    const picked: ChatAttachment[] = [];
    for (const asset of result.assets) {
      const extension = asset.name.split(".").pop()?.toLowerCase() ?? "";
      const isText = Boolean(asset.mimeType?.startsWith("text/")) || ["js", "jsx", "ts", "tsx", "py", "java", "kt", "swift", "json", "xml", "html", "css", "md", "sql", "yml", "yaml", "env", "sh", "txt", "csv"].includes(extension);
      let textContent: string | undefined;
      if (isText && (asset.size ?? 0) <= 512_000) {
        try { textContent = await FileSystem.readAsStringAsync(asset.uri); } catch { textContent = undefined; }
      }
      picked.push({ id: createId("attachment"), name: asset.name, uri: asset.uri, mimeType: asset.mimeType, size: asset.size, textContent });
    }
    setAttachments((previous) => [...previous, ...picked].slice(0, 5));
  };

  const submit = async () => {
    if ((!draft.trim() && attachments.length === 0) || sending) return;
    const message = draft;
    const selectedAttachments = attachments;
    setDraft("");
    setAttachments([]);
    setSending(true);
    await sendMessage(message, selectedAttachments);
    setSending(false);
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={8}>
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <View style={[styles.brandMark, { backgroundColor: colors.primary }]}><IconSymbol name="sparkles" size={19} color="#fff" /></View>
            <View>
              <Text style={[styles.eyebrow, { color: colors.muted }, rtl]}>دستیار کدنویسی</Text>
              <Text style={[styles.title, { color: colors.foreground }, rtl]}>Code VIP</Text>
            </View>
          </View>
          <Pressable onPress={() => createConversation()} style={({ pressed }) => [styles.iconButton, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}>
            <IconSymbol name="plus" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={[styles.modelPicker, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable onPress={() => setShowModels((value) => !value)} style={styles.modelPickerButton}>
            <View style={[styles.modelDot, { backgroundColor: selectedModel.accent }]} />
            <View style={styles.modelPickerText}>
              <Text style={[styles.modelLabel, { color: colors.muted }, rtl]}>مدل فعال</Text>
              <Text style={[styles.modelName, { color: colors.foreground }, rtl]}>{selectedModel.name}</Text>
            </View>
            <IconSymbol name={showModels ? "chevron.left" : "chevron.right"} size={19} color={colors.muted} />
          </Pressable>
          {showModels && (
            <View style={[styles.modelDropdown, { borderTopColor: colors.border }]}>
              <FlatList
                data={MODEL_CATALOG}
                keyExtractor={(item) => item.id}
                horizontal={false}
                renderItem={({ item }) => (
                  <Pressable onPress={() => chooseModel(item.id)} style={({ pressed }) => [styles.modelOption, { backgroundColor: item.id === selectedModel.id ? colors.background : "transparent" }, pressed && styles.pressed]}>
                    <View style={[styles.modelDot, { backgroundColor: item.accent }]} />
                    <View style={styles.modelOptionBody}>
                      <Text style={[styles.modelOptionName, { color: colors.foreground }, rtl]}>{item.name}</Text>
                      <Text style={[styles.modelOptionDescription, { color: colors.muted }, rtl]}>{item.family} · {item.description}</Text>
                    </View>
                    {item.id === selectedModel.id && <IconSymbol name="check" size={18} color={colors.primary} />}
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>

        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}22` }]}><IconSymbol name="sparkles" size={32} color={colors.primary} /></View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }, rtl]}>آماده‌اید کد بهتری بنویسید؟</Text>
            <Text style={[styles.emptySubtitle, { color: colors.muted }, rtl]}>مدل را انتخاب کنید و سؤال، خطا یا فایل کدتان را اینجا بنویسید.</Text>
            <View style={styles.quickActions}>
              {["این کد را توضیح بده", "خطایابی کن", "یک API بساز"].map((label) => (
                <Pressable key={label} onPress={() => setDraft(label)} style={({ pressed }) => [styles.quickAction, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}>
                  <Text style={[styles.quickActionText, { color: colors.foreground }, rtl]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <FlatList data={messages} keyExtractor={(item) => item.id} renderItem={({ item }) => <MessageBubble message={item} />} contentContainerStyle={styles.messageList} showsVerticalScrollIndicator={false} />
        )}

        {attachments.length > 0 && <View style={styles.attachmentTray}>{attachments.map((attachment) => <View key={attachment.id} style={[styles.attachmentChip, { borderColor: colors.border, backgroundColor: colors.surface }]}><IconSymbol name="attach" size={13} color={colors.primary} /><Text style={[styles.attachmentChipText, { color: colors.foreground }]} numberOfLines={1}>{attachment.name}</Text><Pressable onPress={() => setAttachments((previous) => previous.filter((item) => item.id !== attachment.id))}><IconSymbol name="close" size={14} color={colors.muted} /></Pressable></View>)}</View>}
        <View style={[styles.composer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Pressable onPress={pickFiles} style={({ pressed }) => [styles.attachButton, pressed && styles.pressed]}><IconSymbol name="attach" size={20} color={colors.primary} /></Pressable>
          <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={submit} placeholder="پیام یا کد خود را بنویسید..." placeholderTextColor={colors.muted} multiline maxLength={8000} style={[styles.input, { color: colors.foreground }, rtl]} textAlignVertical="top" />
          <Pressable onPress={submit} disabled={(!draft.trim() && attachments.length === 0) || sending} style={({ pressed }) => [styles.sendButton, { backgroundColor: (draft.trim() || attachments.length > 0) && !sending ? colors.primary : colors.border }, pressed && styles.pressed]}>
            {sending ? <ActivityIndicator size="small" color="#fff" /> : <IconSymbol name="arrow.up" size={21} color="#fff" />}
          </Pressable>
        </View>
        <Text style={[styles.disclaimer, { color: colors.muted }, rtl]}>گفتگوها روی همین دستگاه ذخیره می‌شوند · برای اتصال واقعی، تنظیمات ارائه‌دهنده را کامل کنید.</Text>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14 },
  headerTitle: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  brandMark: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  eyebrow: { fontSize: 11, fontWeight: "600", marginBottom: 1 },
  title: { fontSize: 21, fontWeight: "800", letterSpacing: 0.2 },
  iconButton: { width: 40, height: 40, borderWidth: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.98 }] },
  modelPicker: { marginHorizontal: 18, borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  modelPickerButton: { minHeight: 62, paddingHorizontal: 14, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  modelPickerText: { flex: 1 },
  modelDot: { width: 11, height: 11, borderRadius: 6 },
  modelLabel: { fontSize: 11, marginBottom: 2 },
  modelName: { fontSize: 15, fontWeight: "700" },
  modelDropdown: { borderTopWidth: 1, maxHeight: 260 },
  modelOption: { minHeight: 62, paddingHorizontal: 14, flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  modelOptionBody: { flex: 1 },
  modelOptionName: { fontSize: 14, fontWeight: "700" },
  modelOptionDescription: { fontSize: 11, marginTop: 3 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingBottom: 20 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emptyTitle: { fontSize: 21, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  emptySubtitle: { fontSize: 14, lineHeight: 23, textAlign: "center", maxWidth: 330 },
  quickActions: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 22 },
  quickAction: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  quickActionText: { fontSize: 12, fontWeight: "600" },
  messageList: { paddingHorizontal: 16, paddingVertical: 18, gap: 14, flexGrow: 1 },
  messageRow: { flexDirection: "row-reverse", alignItems: "flex-end", gap: 7 },
  messageRowUser: { justifyContent: "flex-start" },
  messageRowAssistant: { justifyContent: "flex-end" },
  avatar: { width: 26, height: 26, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "86%", borderRadius: 17, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1 },
  messageText: { fontSize: 14, lineHeight: 22 },
  messageAttachment: { flexDirection: "row-reverse", alignItems: "center", gap: 5, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5, marginTop: 7, maxWidth: 220 },
  messageAttachmentText: { fontSize: 10, flexShrink: 1 },
  messageTime: { fontSize: 9, marginTop: 6, textAlign: "left" },
  attachmentTray: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, marginHorizontal: 14, marginBottom: 6 },
  attachmentChip: { flexDirection: "row-reverse", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 5, maxWidth: 180 },
  attachmentChipText: { fontSize: 10, flexShrink: 1 },
  composer: { marginHorizontal: 14, borderRadius: 18, borderWidth: 1, minHeight: 58, maxHeight: 140, flexDirection: "row-reverse", alignItems: "flex-end", padding: 8, gap: 5 },
  attachButton: { width: 38, height: 42, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, minHeight: 40, maxHeight: 112, fontSize: 14, lineHeight: 21, paddingHorizontal: 9, paddingTop: 8, paddingBottom: 7 },
  sendButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  disclaimer: { fontSize: 10, textAlign: "center", paddingHorizontal: 12, paddingTop: 7, paddingBottom: 5 },
});
