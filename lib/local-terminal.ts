import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, Platform } from "react-native";
import { createId, type TerminalLine, type TerminalSession } from "@/shared/models";
import { getCliTool } from "@/lib/cli-catalog";

const KEY = "code-vip-terminal-sessions-v1";

export async function loadTerminalSessions(): Promise<TerminalSession[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TerminalSession[]) : [];
  } catch {
    return [];
  }
}

export async function saveTerminalSessions(sessions: TerminalSession[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(sessions.slice(0, 8)));
}

export function createTerminalSession(toolId: string): TerminalSession {
  const tool = getCliTool(toolId);
  const now = new Date().toISOString();
  const lines: TerminalLine[] = [
    { id: createId("terminal"), kind: "system", text: `Code VIP Local Terminal · ${tool.name}`, createdAt: now },
    { id: createId("terminal"), kind: "system", text: "این ترمینال محلی است. برای اجرای واقعی CLI، Termux باید جداگانه نصب و مجوزدهی شده باشد.", createdAt: now },
  ];
  return { id: createId("session"), toolId, title: `${tool.name} · پروژه جدید`, cwd: "~/code-vip", lines, updatedAt: now };
}

export function addTerminalLine(session: TerminalSession, kind: TerminalLine["kind"], text: string): TerminalSession {
  const now = new Date().toISOString();
  return { ...session, lines: [...session.lines, { id: createId("terminal"), kind, text, createdAt: now }].slice(-160), updatedAt: now };
}

export async function openTermux() {
  if (Platform.OS === "android") {
    try {
      await Linking.openURL("termux://");
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function copyText(text: string) {
  const Clipboard = await import("expo-clipboard");
  await Clipboard.setStringAsync(text);
}
