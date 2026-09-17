import { describe, expect, it } from "vitest";
import { CLI_CATALOG, getCliTool, SUPPORT_LABELS } from "../lib/cli-catalog";

describe("CLI catalog", () => {
  it("contains the requested coding tools", () => {
    expect(CLI_CATALOG.map((tool) => tool.id)).toEqual([
      "claude-code",
      "codex-cli",
      "gemini-cli",
      "opencode",
      "kilo",
      "grok",
    ]);
  });

  it("provides install, auth and launch commands", () => {
    for (const tool of CLI_CATALOG) {
      expect(tool.installCommand.length).toBeGreaterThan(5);
      expect(tool.authCommand.length).toBeGreaterThan(1);
      expect(tool.launchCommand.length).toBeGreaterThan(1);
      expect(SUPPORT_LABELS[tool.support]).toBeTruthy();
    }
  });

  it("falls back safely for an unknown tool", () => {
    expect(getCliTool("missing-tool").id).toBe("claude-code");
  });
});
