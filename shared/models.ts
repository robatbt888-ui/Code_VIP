export type ProviderKind = "demo" | "openai" | "anthropic";

export type ChatRole = "user" | "assistant" | "system";

export type ChatAttachment = {
  id: string;
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
  textContent?: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  modelId?: string;
  attachments?: ChatAttachment[];
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

export type CliSupport = "termux" | "api" | "cloud" | "experimental";

export type CliTool = {
  id: string;
  name: string;
  vendor: string;
  description: string;
  installCommand: string;
  launchCommand: string;
  authCommand: string;
  support: CliSupport;
  accent: string;
  website: string;
};

export type TerminalLine = {
  id: string;
  kind: "input" | "output" | "system" | "error";
  text: string;
  createdAt: string;
};

export type TerminalSession = {
  id: string;
  toolId: string;
  title: string;
  cwd: string;
  lines: TerminalLine[];
  updatedAt: string;
};

export type StoredAppState = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  selectedModelId: string;
  providerSettings: Record<ProviderKind, ProviderSettings>;
  terminalSessions: TerminalSession[];
  selectedToolId: string;
};

export const DEFAULT_STATE: StoredAppState = {
  conversations: [],
  selectedConversationId: null,
  selectedModelId: "code-vip-demo",
  terminalSessions: [],
  selectedToolId: "opencode",
  providerSettings: {
    demo: { provider: "demo", baseUrl: "", model: "code-vip-demo", apiKeyConfigured: false },
    openai: { provider: "openai", baseUrl: "https://api.openai.com/v1", model: "gpt-5-codex", apiKeyConfigured: false },
    anthropic: { provider: "anthropic", baseUrl: "https://api.anthropic.com/v1", model: "claude-sonnet-4-5", apiKeyConfigured: false },
  },
};

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
