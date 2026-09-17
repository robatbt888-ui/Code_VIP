export type AiModel = { id: string; name: string; vendor: string; color: string; command: string; install: string; auth: string; guide: string; status: "ready" | "needs-login" | "experimental" };
export type TerminalLine = { id: string; kind: "input" | "output" | "system"; text: string; at: string };
export type ChatSession = { id: string; modelId: string; modelName: string; createdAt: string; updatedAt: string; lines: TerminalLine[] };
export function id(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
