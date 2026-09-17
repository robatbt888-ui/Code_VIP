export type ProviderKind = "demo" | "openai" | "anthropic";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  modelId?: string;
};

export type Conversation = {
  id: string;
  title: string;
  modelId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type ProviderSettings = {
  provider: ProviderKind;
  baseUrl: string;
  model: string;
  apiKeyConfigured: boolean;
};

export type StoredAppState = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  selectedModelId: string;
  providerSettings: Record<ProviderKind, ProviderSettings>;
};

export const DEFAULT_STATE: StoredAppState = {
  conversations: [],
  selectedConversationId: null,
  selectedModelId: "code-vip-demo",
  providerSettings: {
    demo: {
      provider: "demo",
      baseUrl: "",
      model: "code-vip-demo",
      apiKeyConfigured: false,
    },
    openai: {
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-5-codex",
      apiKeyConfigured: false,
    },
    anthropic: {
      provider: "anthropic",
      baseUrl: "https://api.anthropic.com/v1",
      model: "claude-sonnet-4-5",
      apiKeyConfigured: false,
    },
  },
};

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
