import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ inputValidator: () => ({ handler: (handler: (args: { data: FormData }) => Promise<unknown>) => handler }) }),
}));

import { submitArtist } from "./artist.functions";

describe("artist bot protection", () => {
  it("silently discards bot submissions before validation, storage and email", async () => {
    const form = new FormData();
    form.set("website", "https://example.com/bot");
    // Missing required fields would throw if the handler did anything past the trap.
    await expect(submitArtist({ data: form })).resolves.toEqual({ ok: true });
  });
});