import { describe, expect, it } from "vitest";
import { getModel, getModelsForProvider, MODEL_CATALOG } from "../lib/model-catalog";

describe("model catalog", () => {
  it("contains a safe demo model as the default experience", () => {
    expect(MODEL_CATALOG[0].id).toBe("code-vip-demo");
    expect(MODEL_CATALOG[0].provider).toBe("demo");
  });

  it("resolves unknown models to the demo model", () => {
    expect(getModel("not-a-real-model").id).toBe("code-vip-demo");
  });

  it("keeps provider filtering consistent", () => {
    expect(getModelsForProvider("anthropic").every((model) => model.provider === "anthropic")).toBe(true);
    expect(getModelsForProvider("demo")).toHaveLength(1);
  });
});
