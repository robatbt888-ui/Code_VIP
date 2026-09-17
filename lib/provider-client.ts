import type { ChatMessage, ProviderKind, ProviderSettings } from "@/shared/models";
import { getProviderApiKey } from "@/lib/local-storage";

export type ProviderRequest = {
  settings: ProviderSettings;
  messages: ChatMessage[];
};

function demoReply(input: string, modelName: string) {
  const trimmed = input.trim();
  if (trimmed.includes("سلام")) {
    return `سلام! من ${modelName} هستم. سؤال یا کدی که می‌خواهید بررسی شود را بفرستید.`;
  }
  return `این پاسخ آزمایشی Code VIP است. برای دریافت پاسخ واقعی از ${modelName}، در تنظیمات ارائه‌دهنده، کلید API خودتان را در حافظه امن دستگاه ثبت کنید.\n\nدرخواست شما:\n${trimmed}\n\nنکته: مدل‌های اختصاصی مانند Claude Code یا Codex داخل APK دانلود نمی‌شوند؛ این اپ آن‌ها را از طریق API رسمی یا درگاه سازگار فراخوانی می‌کند.`;
}

function toOpenAiMessages(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role !== "system")
    .map((message) => ({ role: message.role, content: message.content }));
}

export async function requestAssistantReply({ settings, messages }: ProviderRequest) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!lastUserMessage) throw new Error("پیام کاربر پیدا نشد.");

  const apiKey = await getProviderApiKey(settings.provider);
  if (settings.provider === "demo" || !apiKey) {
    return demoReply(lastUserMessage.content, settings.model);
  }

  if (!settings.baseUrl.trim() || !settings.model.trim()) {
    throw new Error("آدرس API و نام مدل را در تنظیمات کامل کنید.");
  }

  if (settings.provider === "anthropic") {
    const response = await fetch(`${settings.baseUrl.replace(/\/$/, "")}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: settings.model,
        max_tokens: 4096,
        messages: toOpenAiMessages(messages),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message ?? "خطا در اتصال به Anthropic");
    const text = Array.isArray(data?.content)
      ? data.content.filter((item: { type?: string }) => item.type === "text").map((item: { text?: string }) => item.text ?? "").join("\n")
      : "پاسخ خالی از سرویس دریافت شد.";
    return text || "پاسخ خالی از سرویس دریافت شد.";
  }

  const response = await fetch(`${settings.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: toOpenAiMessages(messages),
      temperature: 0.2,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? "خطا در اتصال به ارائه‌دهنده");
  return data?.choices?.[0]?.message?.content ?? "پاسخ خالی از سرویس دریافت شد.";
}
