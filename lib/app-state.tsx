import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getModel } from "@/lib/model-catalog";
import { getProviderApiKey, loadAppState, saveAppState, setProviderApiKey } from "@/lib/local-storage";
import { requestAssistantReply } from "@/lib/provider-client";
import { createId, DEFAULT_STATE, type ChatMessage, type Conversation, type ProviderKind, type ProviderSettings, type StoredAppState } from "@/shared/models";

const AppStateContext = createContext<{
  state: StoredAppState;
  hydrated: boolean;
  activeConversation: Conversation | null;
  selectedModel: ReturnType<typeof getModel>;
  setSelectedModel: (modelId: string) => void;
  createConversation: (modelId?: string) => string;
  selectConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  updateProviderSettings: (provider: ProviderKind, patch: Partial<ProviderSettings>, apiKey?: string) => Promise<void>;
} | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredAppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadAppState()
      .then((saved) => saved && setState({ ...DEFAULT_STATE, ...saved }))
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) void saveAppState(state);
  }, [hydrated, state]);

  const setSelectedModel = useCallback((modelId: string) => {
    setState((previous) => ({ ...previous, selectedModelId: modelId }));
  }, []);

  const createConversation = useCallback((modelId = state.selectedModelId) => {
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: createId("conversation"),
      title: "گفتگوی جدید",
      modelId,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    setState((previous) => ({
      ...previous,
      selectedModelId: modelId,
      selectedConversationId: conversation.id,
      conversations: [conversation, ...previous.conversations],
    }));
    return conversation.id;
  }, [state.selectedModelId]);

  const selectConversation = useCallback((conversationId: string) => {
    const conversation = state.conversations.find((item) => item.id === conversationId);
    if (!conversation) return;
    setState((previous) => ({ ...previous, selectedConversationId: conversationId, selectedModelId: conversation.modelId }));
  }, [state.conversations]);

  const deleteConversation = useCallback((conversationId: string) => {
    setState((previous) => {
      const conversations = previous.conversations.filter((item) => item.id !== conversationId);
      return {
        ...previous,
        conversations,
        selectedConversationId: previous.selectedConversationId === conversationId ? conversations[0]?.id ?? null : previous.selectedConversationId,
      };
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text) return;
    const selectedModel = getModel(state.selectedModelId);
    const current = state.conversations.find((item) => item.id === state.selectedConversationId);
    const conversationId = current?.id ?? createId("conversation");
    const now = new Date().toISOString();
    const userMessage: ChatMessage = { id: createId("message"), role: "user", content: text, createdAt: now, modelId: selectedModel.id };
    const conversation: Conversation = current ?? {
      id: conversationId,
      title: text.slice(0, 32),
      modelId: selectedModel.id,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    const nextMessages = [...conversation.messages, userMessage];
    const nextConversation = { ...conversation, title: conversation.messages.length ? conversation.title : text.slice(0, 32), modelId: selectedModel.id, updatedAt: now, messages: nextMessages };
    const providerSettings = state.providerSettings[selectedModel.provider];

    setState((previous) => ({
      ...previous,
      selectedConversationId: conversationId,
      conversations: current ? previous.conversations.map((item) => item.id === conversationId ? nextConversation : item) : [nextConversation, ...previous.conversations],
    }));

    try {
      const reply = await requestAssistantReply({ settings: providerSettings, messages: nextMessages });
      const assistantMessage: ChatMessage = { id: createId("message"), role: "assistant", content: reply, createdAt: new Date().toISOString(), modelId: selectedModel.id };
      setState((previous) => ({
        ...previous,
        conversations: previous.conversations.map((item) => item.id === conversationId ? { ...item, updatedAt: assistantMessage.createdAt, messages: [...item.messages, assistantMessage] } : item),
      }));
    } catch (error) {
      const assistantMessage: ChatMessage = { id: createId("message"), role: "assistant", content: `اتصال انجام نشد. ${error instanceof Error ? error.message : "خطای ناشناخته"}`, createdAt: new Date().toISOString(), modelId: selectedModel.id };
      setState((previous) => ({
        ...previous,
        conversations: previous.conversations.map((item) => item.id === conversationId ? { ...item, updatedAt: assistantMessage.createdAt, messages: [...item.messages, assistantMessage] } : item),
      }));
    }
  }, [createConversation, state]);

  const updateProviderSettings = useCallback(async (provider: ProviderKind, patch: Partial<ProviderSettings>, apiKey?: string) => {
    if (apiKey !== undefined) await setProviderApiKey(provider, apiKey.trim());
    const configured = apiKey !== undefined ? Boolean(apiKey.trim()) : state.providerSettings[provider].apiKeyConfigured;
    setState((previous) => ({
      ...previous,
      providerSettings: {
        ...previous.providerSettings,
        [provider]: { ...previous.providerSettings[provider], ...patch, apiKeyConfigured: configured },
      },
    }));
  }, [state.providerSettings]);

  const activeConversation = useMemo(() => state.conversations.find((item) => item.id === state.selectedConversationId) ?? null, [state]);
  const selectedModel = useMemo(() => getModel(state.selectedModelId), [state.selectedModelId]);
  const value = useMemo(() => ({ state, hydrated, activeConversation, selectedModel, setSelectedModel, createConversation, selectConversation, deleteConversation, sendMessage, updateProviderSettings }), [state, hydrated, activeConversation, selectedModel, setSelectedModel, createConversation, selectConversation, deleteConversation, sendMessage, updateProviderSettings]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState باید داخل AppStateProvider استفاده شود.");
  return context;
}

export async function hasStoredKey(provider: ProviderKind) {
  return Boolean(await getProviderApiKey(provider));
}
