# معماری واقعی Code VIP

## نتیجه نهایی

Code VIP باید یک **کلاینت موبایل برای اجرای CLIهای کدنویسی در محیط ابری ایزوله** باشد. اجرای Claude Code، Codex CLI، Gemini CLI، OpenCode، Kilo و Grok Build به‌صورت قابل‌اعتماد داخل APK اندروید، راهکار پشتیبانی‌شده‌ای نیست. این ابزارها به سیستم‌عامل دسکتاپ یا لینوکس، ترمینال، فایل‌سیستم، وابستگی‌های native، احراز هویت ارائه‌دهنده و اجرای پایدار نیاز دارند. اندروید باید رابط کاربری و کنترل جلسه باشد؛ پردازش واقعی باید در backend اجرا شود.

## تجربه کاربر

کاربر پس از ورود به Code VIP، فهرست ابزارهای پشتیبانی‌شده را می‌بیند. هر کارت باید وضعیت ابزار، روش احراز هویت، نسخه نصب‌شده، هزینه احتمالی و قابلیت‌های آن را نشان دهد. با انتخاب یک ابزار، کاربر به صفحه اختصاصی همان ابزار می‌رود، حساب خودش را از طریق مرورگر امن یا device-code متصل می‌کند، یک پروژه یا workspace می‌سازد و وارد ترمینال می‌شود. دستورهای مجاز و آماده در بالای ترمینال نمایش داده می‌شوند؛ اجرای arbitrary shell باید تا زمان تکمیل sandbox و بررسی امنیتی غیرفعال بماند.

قطع اتصال گوشی نباید جلسه را از بین ببرد. فرآیند در backend ادامه می‌یابد و اپ پس از اتصال مجدد، خروجی ترمینال و وضعیت workspace را دریافت می‌کند. فایل‌ها با انتخاب کاربر به workspace فرستاده می‌شوند و قبل از mount شدن اسکن و محدود می‌شوند.

## اجزای فنی

### اپ اندروید

اپ شامل فهرست CLIها، ورود Code VIP با PKCE، مدیریت workspace، انتخاب فایل، ترمینال لمسی، reconnect، تاریخچه اجرا، اعلان پایان کار و مدیریت نشست است. APK نباید API key، refresh token مشترک، credential ارائه‌دهنده یا client secret داشته باشد. فقط session tokenهای کوتاه‌عمر در Android Keystore ذخیره می‌شوند.

### Control Plane

API مرکزی هویت کاربر، مجوز workspace، اتصال credential ارائه‌دهنده، سهمیه‌ها، audit log و ایجاد job را مدیریت می‌کند. پایگاه داده شامل کاربران، پروژه‌ها، workspaceها، وضعیت jobها، اتصال ارائه‌دهنده و quota است. فایل‌ها و transcriptها در object storage رمزنگاری‌شده قرار می‌گیرند.

### Execution Plane

برای هر workspace یک runner نسخه‌گذاری‌شده و غیر root ایجاد می‌شود. image شامل CLI تأییدشده، runtime و وابستگی‌های لازم است؛ credential زنده هرگز داخل image قرار نمی‌گیرد. runner باید filesystem جدا، CPU/RAM/disk limit، زمان پایان، egress allowlist، network policy، seccomp/AppArmor و عدم دسترسی به Docker socket یا host mount داشته باشد. برای اجرای کد غیرقابل‌اعتماد، microVM یا sandbox قوی‌تر از container لازم است.

### Terminal Gateway

مسیر ارتباطی باید چنین باشد:

```text
Android App -> WSS Gateway -> Session Broker -> Runner PTY -> CLI
```

اپ ابتدا از API یک grant تک‌جلسه‌ای و کوتاه‌عمر می‌گیرد. Gateway هر اتصال و هر پیام را مجدداً مجاز می‌کند. token قابل‌استفاده مجدد در URL قرار نمی‌گیرد. پیام‌ها size limit و rate limit دارند و اتصال با پایان نشست یا logout لغو می‌شود.

## وضعیت ابزارها

| ابزار | اجرای مستقیم داخل APK | مسیر مناسب برای Code VIP |
|---|---:|---|
| Claude Code | خیر، Android/Termux هدف پشتیبانی‌شده نیست | cloud session رسمی یا runner لینوکس مجاز با حساب خود کاربر |
| Codex CLI | خیر، Android/Termux پشتیبانی رسمی ندارد | Codex cloud یا runner لینوکس مجاز |
| Gemini CLI | خیر، Android/Termux پشتیبانی رسمی ندارد | runner لینوکس با API key/Vertex/حساب مجاز |
| OpenCode | خیر، binary رسمی Android ندارد | `opencode web` روی runner ایزوله با HTTPS و password |
| Kilo CLI | خیر، هدف رسمی Android ندارد | Cloud Agent رسمی یا runner لینوکس کنترل‌شده |
| Grok Build | خیر، Android هدف رسمی نیست | runner لینوکس با device-code یا API key |

## احراز هویت

هر کاربر باید حساب خودش را متصل کند. Code VIP نباید یک حساب مشترک یا کلید مشترک را میان کاربران توزیع کند. برای OAuth از Authorization Code + PKCE و مرورگر سیستم استفاده می‌شود. برای device-code، کد و URL رسمی ارائه‌دهنده داخل اپ نمایش داده می‌شود. credentialها با KMS/HSM رمزنگاری می‌شوند، scope و زمان انقضا نمایش داده می‌شود و revoke/delete وجود دارد.

## چیزی که نباید وعده داده شود

نمی‌توان وعده داد همه CLIهای اختصاصی داخل APK دانلود شده و بدون login آماده‌اند. APK نمی‌تواند مجوز اشتراک ارائه‌دهنده را منتقل کند، credential را امن پنهان کند یا اجرای دائمی ترمینال را تضمین کند. «آماده» در محصول باید به معنی **نسخه تأییدشده CLI در image سرور و آماده ایجاد workspace** باشد، نه نصب داخل گوشی یا ورود مشترک از قبل.

## مراحل اجرایی

1. دروازه سیاست و قرارداد: تعیین CLIهای دقیق، نسخه‌ها، کشورها، نوع حساب، مجوز میزبانی، data residency و مدل هزینه.
2. نمونه عمودی: ورود Code VIP، یک runner لینوکس، یک CLI تأییدشده، workspace موقت، WSS terminal، upload امن و reconnect.
3. امنیت تولید: KMS، image signing و SBOM، scanner فایل، quotas، audit، egress policy، backup و penetration test.
4. کارخانه integration: افزودن هر CLI با adapter جدا، health check، auth flow، revoke و compatibility test.
5. مقیاس: microVM برای arbitrary code، منطقه‌بندی داده، SSO/SCIM، اعلان، billing و disaster recovery.

## منابع رسمی

[1]: https://code.claude.com/docs/en/mobile "Claude Code Mobile"
[2]: https://developers.openai.com/codex/cloud "OpenAI Codex Cloud"
[3]: https://geminicli.com/docs/get-started/installation/ "Gemini CLI Installation"
[4]: https://opencode.ai/docs/web/ "OpenCode Web"
[5]: https://kilo.ai/docs/code-with-ai/platforms/cli "Kilo CLI"
[6]: https://github.com/xai-org/grok-build "Grok Build Repository"
[7]: https://source.android.com/docs/security/app-sandbox "Android Application Sandbox"
[8]: https://developer.android.com/about/versions/oreo/background "Android Background Execution Limits"
[9]: https://www.rfc-editor.org/rfc/rfc8252.html "OAuth 2.0 for Native Apps"
[10]: https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html "OWASP WebSocket Security"
