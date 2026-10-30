import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WaveDialog } from "@/components/wave/WaveDialog";
import { LanguageProvider } from "@/lib/i18n";

vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => vi.fn() }));
vi.mock("@/lib/wave.functions", () => ({ submitHost: vi.fn(), submitNote: vi.fn() }));

afterEach(cleanup);

function openHostForm() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <LanguageProvider>
        <WaveDialog state={{ mode: "host", block: null }} setState={vi.fn()} />
      </LanguageProvider>
    </QueryClientProvider>,
  );
  return screen.getAllByRole("checkbox");
}

describe("Host signup options", () => {
  it("starts both optional answers unchecked", () => {
    const options = openHostForm();
    expect(options).toHaveLength(2);
    for (const option of options) expect(option).not.toBeChecked();
  });

  it("allows both answers together and independent changes", () => {
    const [funds, rain] = openHostForm();
    if (!funds || !rain) throw new Error("Missing host options");
    fireEvent.click(funds);
    fireEvent.click(rain);
    expect(funds).toBeChecked();
    expect(rain).toBeChecked();
    fireEvent.click(funds);
    expect(funds).not.toBeChecked();
    expect(rain).toBeChecked();
  });
});