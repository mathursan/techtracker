import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

import { ThemeToggle } from "./theme-toggle";

beforeEach(() => {
  document.documentElement.classList.remove("light", "dark");
  localStorage.clear();
});

afterEach(() => cleanup());

describe("<ThemeToggle />", () => {
  it("renders a button with an accessible label", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAccessibleName(/theme/i);
  });

  it("clicking in light mode switches to dark + writes localStorage", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("clicking in dark mode switches to light", () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("label reflects the next action", () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAccessibleName(/switch to light/i);
  });

  // External-class-change tracking via MutationObserver is jsdom-flaky.
  // It's exercised end-to-end by e2e/theme-toggle.spec.ts instead.
});
