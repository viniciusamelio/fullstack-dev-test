import { describe, expect, it } from "vitest";
import { createOpenAiModel } from "../../../../src/infra/llm/create-openai-model.js";

describe("createOpenAiModel", () => {
  it("strips a leading openai/ prefix from the model id", () => {
    const model = createOpenAiModel({ apiKey: "sk-test", model: "openai/gpt-5-nano" });
    expect(model.modelId).toBe("gpt-5-nano");
  });

  it("keeps a bare model id unchanged", () => {
    const model = createOpenAiModel({ apiKey: "sk-test", model: "gpt-5-nano" });
    expect(model.modelId).toBe("gpt-5-nano");
  });
});
