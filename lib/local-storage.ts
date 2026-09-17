import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { ProviderKind, StoredAppState } from "@/shared/models";

const STATE_KEY = "code-vip-state-v1";
const SECRET_PREFIX = "code-vip-api-key-";

export async function loadAppState(): Promise<StoredAppState | null> {
  const raw = await AsyncStorage.getItem(STATE_KEY);
  return raw ? (JSON.parse(raw) as StoredAppState) : null;
}

export async function saveAppState(state: StoredAppState) {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export async function getProviderApiKey(provider: ProviderKind) {
  const key = `${SECRET_PREFIX}${provider}`;
  if (Platform.OS === "web") return AsyncStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function setProviderApiKey(provider: ProviderKind, value: string) {
  const key = `${SECRET_PREFIX}${provider}`;
  if (Platform.OS === "web") {
    if (value) await AsyncStorage.setItem(key, value);
    else await AsyncStorage.removeItem(key);
    return;
  }
  if (value) await SecureStore.setItemAsync(key, value);
  else await SecureStore.deleteItemAsync(key);
}
