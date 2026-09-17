import type { AiModel } from "@/shared/models";

export const AI_MODELS: AiModel[] = [
  { id: "claude-code", name: "Claude Code", vendor: "Anthropic", color: "#D97757", command: "claude", install: "curl -fsSL https://claude.ai/install.sh | bash", auth: "claude", guide: "Install the official Claude Code CLI, run claude, then complete the browser sign-in flow. Return to the terminal after authentication.", status: "needs-login" },
  { id: "codex", name: "Codex CLI", vendor: "OpenAI", color: "#16A37A", command: "codex", install: "npm install -g @openai/codex", auth: "codex", guide: "Install the official Codex CLI, run codex, choose Sign in with ChatGPT, and finish login in the browser.", status: "needs-login" },
  { id: "gemini", name: "Gemini CLI", vendor: "Google", color: "#4285F4", command: "gemini", install: "npm install -g @google/gemini-cli", auth: "gemini", guide: "Install Gemini CLI, run gemini, and complete the supported Google authentication flow. Check account eligibility before use.", status: "experimental" },
  { id: "opencode", name: "OpenCode", vendor: "OpenCode", color: "#8B5CF6", command: "opencode", install: "npm install -g opencode-ai", auth: "opencode auth login", guide: "Install OpenCode, run opencode auth login, connect a provider, then start opencode inside your project directory.", status: "experimental" },
  { id: "kilo", name: "Kilo CLI", vendor: "Kilo", color: "#F97316", command: "kilo", install: "npm install -g @kilocode/cli", auth: "kilo", guide: "Install Kilo CLI, start kilo, and use /connect to authenticate your selected provider.", status: "experimental" },
  { id: "grok", name: "Grok Build", vendor: "xAI", color: "#111827", command: "grok", install: "curl -fsSL https://x.ai/cli/install.sh | bash", auth: "grok login --device-auth", guide: "Install Grok Build, run the device authentication command, complete the URL and code flow, then run grok.", status: "experimental" },
];
export const modelById = (id: string) => AI_MODELS.find((item) => item.id === id) ?? AI_MODELS[0];
