import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  allocatePort,
  dbNameForBranch,
  parseIssueFromBranch,
} from "./git-utils";

describe("parseIssueFromBranch", () => {
  it.each([
    ["feat/17-project-scaffolding", 17],
    ["feat/uc-01-screener", 1],
    ["fix/42-broken-chart", 42],
    ["chore/release", null],
    ["main", null],
    ["issue-123-thing", 123],
  ])("parses %s -> %s", (branch, expected) => {
    expect(parseIssueFromBranch(branch)).toBe(expected);
  });
});

describe("allocatePort", () => {
  const savedPort = process.env.PORT;

  beforeEach(() => {
    delete process.env.PORT;
  });

  afterEach(() => {
    if (savedPort === undefined) delete process.env.PORT;
    else process.env.PORT = savedPort;
  });

  it("defaults to 3000 when branch has no issue number", () => {
    expect(allocatePort("main")).toBe(3000);
  });

  it("derives a stable per-issue port", () => {
    expect(allocatePort("feat/17-project-scaffolding")).toBe(10017);
    expect(allocatePort("feat/uc-01-screener")).toBe(10001);
  });

  it("respects $PORT when set", () => {
    process.env.PORT = "8080";
    expect(allocatePort("feat/17-x")).toBe(8080);
  });
});

describe("dbNameForBranch", () => {
  it("returns base name on main", () => {
    expect(dbNameForBranch("techtracker", "main")).toBe("techtracker");
  });

  it("appends issue suffix on feature branches", () => {
    expect(dbNameForBranch("techtracker", "feat/17-x")).toBe(
      "techtracker_issue_17",
    );
  });
});
