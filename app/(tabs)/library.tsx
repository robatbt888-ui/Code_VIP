import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppState } from "@/lib/app-state";
import { getModel } from "@/lib/model-catalog";
import { useColors } from "@/hooks/use-colors";

const rtl = { writingDirection: "rtl" as const, textAlign: "right" as const };

export default function LibraryScreen() {
  const colors = useColors();
  const { state, selectConversation, deleteConversation, createConversation } = useAppState();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => state.conversations.filter((item) => `${item.title} ${getModel(item.modelId).name}`.toLowerCase().includes(search.toLowerCase())), [search, state.conversations]);

  const remove = (id: string) => Alert.alert("حذف گفتگو", "این گفتگو از حافظه دستگاه حذف شود؟", [{ text: "لغو", style: "cancel" }, { text: "حذف", style: "destructive", onPress: () => deleteConversation(id) }]);

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: colors.muted }, rtl]}>آرشیو شخصی</Text>
          <Text style={[styles.title, { color: colors.foreground }, rtl]}>گفتگوهای من</Text>
        </View>
        <Pressable onPress={() => { createConversation(); router.navigate("/"); }} style={({ pressed }) => [styles.newButton, { backgroundColor: colors.primary }, pressed && { opacity: 0.75 }]}>
          <IconSymbol name="plus" size={19} color="#fff" />
          <Text style={styles.newButtonText}>جدید</Text>
        </Pressable>
      </View>
      <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <IconSymbol name="message.fill" size={18} color={colors.muted} />
        <TextInput value={search} onChangeText={setSearch} placeholder="جست‌وجو در گفتگوها" placeholderTextColor={colors.muted} style={[styles.searchInput, { color: colors.foreground }, rtl]} />
      </View>
      <Text style={[styles.count, { color: colors.muted }, rtl]}>{filtered.length} گفت‌وگو</Text>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}18` }]}><IconSymbol name="folder.fill" size={30} color={colors.primary} /></View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }, rtl]}>هنوز گفتگویی ندارید</Text>
          <Text style={[styles.emptyText, { color: colors.muted }, rtl]}>اولین گفتگوی کدنویسی خود را بسازید؛ همه پیام‌ها روی دستگاه ذخیره می‌شوند.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const model = getModel(item.modelId);
            const last = item.messages[item.messages.length - 1];
            return (
              <Pressable onPress={() => { selectConversation(item.id); router.navigate("/"); }} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
                <View style={[styles.modelBadge, { backgroundColor: `${model.accent}20` }]}><View style={[styles.dot, { backgroundColor: model.accent }]} /><Text style={[styles.modelBadgeText, { color: model.accent }]}>{model.name}</Text></View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }, rtl]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.preview, { color: colors.muted }, rtl]} numberOfLines={1}>{last?.content ?? "گفتگوی خالی"}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Text style={[styles.date, { color: colors.muted }]}>{new Date(item.updatedAt).toLocaleDateString("fa-IR", { month: "short", day: "numeric" })}</Text>
                  <Pressable onPress={() => remove(item.id)} hitSlop={10}><IconSymbol name="trash" size={18} color={colors.muted} /></Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row-reverse", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 12, paddingBottom: 17 },
  kicker: { fontSize: 11, fontWeight: "600", marginBottom: 3 },
  title: { fontSize: 25, fontWeight: "800" },
  newButton: { flexDirection: "row-reverse", alignItems: "center", gap: 5, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10 },
  newButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  searchBox: { flexDirection: "row-reverse", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 14, marginHorizontal: 18, paddingHorizontal: 13, minHeight: 46 },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 8 },
  count: { fontSize: 11, marginHorizontal: 20, marginTop: 18, marginBottom: 7 },
  list: { padding: 18, paddingTop: 5, gap: 10 },
  card: { minHeight: 96, borderRadius: 16, borderWidth: 1, padding: 13, gap: 8 },
  cardBody: { minWidth: 0 },
  modelBadge: { alignSelf: "flex-end", flexDirection: "row-reverse", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 },
  modelBadgeText: { fontSize: 10, fontWeight: "700" },
  dot: { width: 7, height: 7, borderRadius: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  preview: { fontSize: 11, marginTop: 5 },
  cardActions: { position: "absolute", left: 13, bottom: 13, flexDirection: "row", alignItems: "center", gap: 12 },
  date: { fontSize: 10 },
  pressed: { opacity: 0.75 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36, paddingBottom: 80 },
  emptyIcon: { width: 66, height: 66, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  emptyTitle: { fontSize: 19, fontWeight: "800", marginBottom: 7 },
  emptyText: { fontSize: 13, lineHeight: 21, textAlign: "center" },
});
