import type { CliSupport, CliTool } from "@/shared/models";

export const CLI_CATALOG: CliTool[] = [
  { id: "claude-code", name: "Claude Code", vendor: "Anthropic", description: "عامل کدنویسی ترمینالی؛ اجرای محلی Android رسمی نیست.", installCommand: "curl -fsSL https://claude.ai/install.sh | bash", launchCommand: "claude", authCommand: "claude", support: "termux", accent: "#D97757", website: "https://code.claude.com/docs/en/overview" },
  { id: "codex-cli", name: "Codex CLI", vendor: "OpenAI", description: "عامل کدنویسی OpenAI؛ برای Android/Termux مسیر رسمی ندارد.", installCommand: "npm install -g @openai/codex", launchCommand: "codex", authCommand: "codex", support: "experimental", accent: "#18A37A", website: "https://developers.openai.com/codex/cli" },
  { id: "gemini-cli", name: "Gemini CLI", vendor: "Google", description: "CLI کدنویسی Google؛ احراز هویت و سازگاری Android را باید بررسی کرد.", installCommand: "npm install -g @google/gemini-cli", launchCommand: "gemini", authCommand: "gemini", support: "experimental", accent: "#4285F4", website: "https://geminicli.com/docs/get-started/installation/" },
  { id: "opencode", name: "OpenCode", vendor: "OpenCode", description: "ابزار متن‌باز چندمدلی؛ گزینه مناسب‌تر برای تست با Termux.", installCommand: "npm install -g opencode-ai", launchCommand: "opencode", authCommand: "opencode auth login", support: "termux", accent: "#8B5CF6", website: "https://opencode.ai/docs/" },
  { id: "kilo", name: "Kilo CLI", vendor: "Kilo", description: "عامل کدنویسی چندمدلی؛ Android هدف رسمی آن نیست.", installCommand: "npm install -g @kilocode/cli", launchCommand: "kilo", authCommand: "kilo", support: "experimental", accent: "#F97316", website: "https://kilo.ai/docs/code-with-ai/platforms/cli" },
  { id: "grok", name: "Grok Build", vendor: "xAI", description: "CLI کدنویسی xAI؛ اجرا روی میزبان Linux رسمی‌تر از Android است.", installCommand: "curl -fsSL https://x.ai/cli/install.sh | bash", launchCommand: "grok", authCommand: "grok login --device-auth", support: "experimental", accent: "#111827", website: "https://github.com/xai-org/grok-build" },
];

export const SUPPORT_LABELS: Record<CliSupport, string> = {
  termux: "قابل آزمایش با Termux",
  api: "اتصال API",
  cloud: "اجرای ابری",
  experimental: "آزمایشی در Android",
};

export function getCliTool(id: string) {
  return CLI_CATALOG.find((tool) => tool.id === id) ?? CLI_CATALOG[0];
}
