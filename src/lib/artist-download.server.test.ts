import { beforeEach, describe, expect, it, vi } from "vitest";
import { Blob as NodeBlob } from "node:buffer";

const mocks = vi.hoisted(() => ({ session: vi.fn(), single: vi.fn(), download: vi.fn(), from: vi.fn() }));
vi.mock("./steward-session.server", () => ({ requireStewardSession: mocks.session }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {
  from: mocks.from,
  storage: { from: () => ({ download: mocks.download }) },
} }));
import { downloadArtistFile } from "./artist-download.server";

const id = "00000000-0000-4000-8000-000000000001";
const request = (path = `${id}/1.pdf`) => new Request(`https://example.com/api/public/artist-download?${new URLSearchParams({ id, path })}`);
describe("private artist downloads", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.session.mockResolvedValue(undefined);
    mocks.from.mockReturnValue({ select: () => ({ eq: () => ({ single: mocks.single }) }) });
    mocks.single.mockResolvedValue({ data: { files: [{ path: `${id}/1.pdf`, name: "sample.pdf", type: "application/pdf" }] } });
    mocks.download.mockResolvedValue({ data: new NodeBlob(["%PDF-1.7\nexample"], { type: "application/pdf" }) });
  });
  it("denies locked visitors before accessing private submissions or storage", async () => {
    mocks.session.mockRejectedValue(new Error("LOCKED"));
    expect((await downloadArtistFile(request())).status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.download).not.toHaveBeenCalled();
  });
  it("denies files not attached to the requested submission", async () => {
    expect((await downloadArtistFile(request("another-submission/1.pdf"))).status).toBe(404);
    expect(mocks.download).not.toHaveBeenCalled();
  });
  it("delivers original file bytes as a private attachment", async () => {
    const response = await downloadArtistFile(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain('attachment; filename="sample.pdf"');
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.text()).toBe("%PDF-1.7\nexample");
  });
});