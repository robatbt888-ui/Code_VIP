import type { ProviderKind } from "../shared/models";

export type ModelDefinition = {
  id: string;
  name: string;
  provider: ProviderKind;
  family: string;
  description: string;
  badge: string;
  accent: string;
  supportsTools?: boolean;
};

export const MODEL_CATALOG: ModelDefinition[] = [
  {
    id: "code-vip-demo",
    name: "Code VIP Demo",
    provider: "demo",
    family: "آفلاین",
    description: "برای تست رابط، بدون کلید API و بدون ارسال داده",
    badge: "رایگان",
    accent: "#7C5CFC",
  },
  {
    id: "gpt-5-codex",
    name: "Codex / GPT Coding",
    provider: "openai",
    family: "OpenAI",
    description: "مدل‌های کدنویسی و بررسی تغییرات پروژه با API سازگار",
    badge: "کدنویسی",
    accent: "#18A37A",
    supportsTools: true,
  },
  {
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet",
    provider: "anthropic",
    family: "Anthropic",
    description: "تحلیل کد، معماری و پاسخ‌های دقیق با زمینه طولانی",
    badge: "پیشرفته",
    accent: "#D97757",
    supportsTools: true,
  },
  {
    id: "claude-opus",
    name: "Claude Opus",
    provider: "anthropic",
    family: "Anthropic",
    description: "گزینه عمیق‌تر برای مسائل پیچیده و بازبینی‌های سنگین",
    badge: "پیشرفته",
    accent: "#B45309",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "openai",
    family: "OpenAI-compatible",
    description: "از طریق درگاه‌های سازگار با OpenAI قابل اتصال است",
    badge: "چندمنظوره",
    accent: "#4285F4",
  },
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    provider: "openai",
    family: "OpenAI-compatible",
    description: "انتخاب اقتصادی برای تولید و توضیح کد",
    badge: "اقتصادی",
    accent: "#2563EB",
  },
  {
    id: "qwen-coder",
    name: "Qwen Coder",
    provider: "openai",
    family: "OpenAI-compatible",
    description: "قابل استفاده از طریق endpointهای سازگار با OpenAI",
    badge: "چندزبانه",
    accent: "#7C3AED",
  },
];

export function getModel(modelId: string) {
  return MODEL_CATALOG.find((model) => model.id === modelId) ?? MODEL_CATALOG[0];
}

export function getModelsForProvider(provider: ProviderKind) {
  return MODEL_CATALOG.filter((model) => model.provider === provider);
}
