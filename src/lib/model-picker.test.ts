import { beforeAll, describe, expect, it, vi } from "vitest";

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

  it("BYOK: a per-request key works with no env key", async () => {
    // env snapshots ANTHROPIC_API_KEY at import time, so re-import fresh
    // without it to prove the request-supplied key is what's used.
    vi.resetModules();
    delete process.env.ANTHROPIC_API_KEY;
    const { modelPicker, assertModelIsConfigured } = await import(
      "./model-picker"
    );
    // No key anywhere -> config assertion fails...
    expect(() =>
      assertModelIsConfigured("anthropic", "claude-opus-4-8"),
    ).toThrow();
    // ...but a request-supplied key satisfies it and builds the client.
    expect(() =>
      assertModelIsConfigured("anthropic", "claude-opus-4-8", "sk-ant-byok"),
    ).not.toThrow();
    const model = modelPicker("anthropic", "claude-opus-4-8", "sk-ant-byok");
    expect(model.constructor.name).toBe("ChatAnthropic");
  });
});

describe("modelPicker google provider", () => {
  it("builds a ChatGoogleGenerativeAI client and defaults the model", async () => {
    vi.resetModules();
    const { modelPicker } = await import("./model-picker");
    const model = modelPicker("google", undefined, "AIza-test") as unknown as {
      constructor: { name: string };
      model?: string;
    };
    expect(model.constructor.name).toBe("ChatGoogleGenerativeAI");
    expect(model.model).toContain("gemini-2.5-flash");
  });

  it("BYOK: a per-request key satisfies config with no env key", async () => {
    vi.resetModules();
    delete process.env.GEMINI_API_KEY;
    const { assertModelIsConfigured } = await import("./model-picker");
    expect(() => assertModelIsConfigured("google", "gemini-2.5-flash")).toThrow();
    expect(() =>
      assertModelIsConfigured("google", "gemini-2.5-flash", "AIza-byok"),
    ).not.toThrow();
  });
});
