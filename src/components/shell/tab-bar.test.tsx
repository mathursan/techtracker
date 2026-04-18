import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

import { TabBar } from "./tab-bar";
import { TABS } from "@/lib/nav";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/stocks",
  useRouter: () => ({ push: pushMock }),
}));

afterEach(() => {
  cleanup();
  pushMock.mockReset();
});

describe("<TabBar />", () => {
  it("renders all 19 tabs with verbatim labels", () => {
    render(<TabBar />);
    for (const tab of TABS) {
      expect(screen.getByText(tab.label)).toBeInTheDocument();
    }
  });

  it("marks the pathname tab aria-selected", () => {
    render(<TabBar />);
    const stocks = screen.getByRole("tab", { name: /Top 50 Stocks/ });
    expect(stocks).toHaveAttribute("aria-selected", "true");
    expect(stocks).toHaveAttribute("aria-current", "page");

    const japan = screen.getByRole("tab", { name: /Japan/ });
    expect(japan).toHaveAttribute("aria-selected", "false");
  });

  it("exposes role=tablist + role=tab", () => {
    render(<TabBar />);
    expect(screen.getByRole("tablist")).toHaveAttribute(
      "aria-label",
      "TechTracker sections",
    );
    expect(screen.getAllByRole("tab")).toHaveLength(TABS.length);
  });

  it("ArrowRight moves focus to the next tab", () => {
    render(<TabBar />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    expect(document.activeElement).toBe(tabs[0]);
    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[1]);
  });

  it("ArrowLeft from the first tab wraps to the last", () => {
    render(<TabBar />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[tabs.length - 1]);
  });

  it("Home/End jump to first/last", () => {
    render(<TabBar />);
    const tabs = screen.getAllByRole("tab");
    tabs[5].focus();
    fireEvent.keyDown(tabs[5], { key: "End" });
    expect(document.activeElement).toBe(tabs[tabs.length - 1]);
    fireEvent.keyDown(tabs[tabs.length - 1], { key: "Home" });
    expect(document.activeElement).toBe(tabs[0]);
  });

  it("Enter on a focused tab calls router.push with its slug", () => {
    render(<TabBar />);
    const tabs = screen.getAllByRole("tab");
    fireEvent.keyDown(tabs[6], { key: "Enter" });
    expect(pushMock).toHaveBeenCalledWith(`/${TABS[6].slug}`);
  });

  it("country tabs render their 2-letter badge", () => {
    render(<TabBar />);
    for (const badge of ["IN", "HK", "SG", "JP", "EU"]) {
      expect(screen.getByText(badge)).toBeInTheDocument();
    }
  });
});
