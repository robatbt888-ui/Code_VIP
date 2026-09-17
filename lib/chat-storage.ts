import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatSession } from "@/shared/models";
const KEY = "code-vip-chats-v2";
export async function readChats(): Promise<ChatSession[]> { try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }
export async function writeChats(items: ChatSession[]) { await AsyncStorage.setItem(KEY, JSON.stringify(items.slice(0, 50))); }
