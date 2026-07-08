import { beforeAll, describe, expect, it } from "vitest";

// env.js validates required vars at import time; skip that for this unit test
// and provide only what the anthropic branch reads.
beforeAll(() => {
  process.env.SKIP_ENV_VALIDATION = "1";
  process.env.ANTHROPIC_API_KEY = "sk-ant-test";
});

describe("modelPicker anthropic provider", () => {
  it("builds a ChatAnthropic client for provider 'anthropic'", async () => {
    const { modelPicker } = await import("./model-picker");
    const model = modelPicker("anthropic", "claude-opus-4-8");
    // ChatAnthropic (wraps the official Anthropic SDK), not ChatOpenAI.
    expect(model.constructor.name).toBe("ChatAnthropic");
  });

  it("defaults the anthropic model to claude-opus-4-8", async () => {
    const { modelPicker } = await import("./model-picker");
    const model = modelPicker("anthropic") as unknown as { model?: string };
    expect(model.model).toBe("claude-opus-4-8");
  });
});
