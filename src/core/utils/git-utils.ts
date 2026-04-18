import { execSync } from "node:child_process";

const DEFAULT_PORT = 3000;
const PORT_BASE = 10000;
const PORT_SPAN = 55535;

function safeExec(cmd: string): string | null {
  try {
    return execSync(cmd, { timeout: 2_000, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

export function currentBranch(): string {
  return (
    process.env.GIT_BRANCH ?? safeExec("git rev-parse --abbrev-ref HEAD") ?? "main"
  );
}

export function parseIssueFromBranch(branch: string): number | null {
  const m = branch.match(/(?:^|\/)(?:feat|fix|chore|issue|uc|infra)[-/]?(\d+)/i);
  return m ? Number(m[1]) : null;
}

export function allocatePort(branch = currentBranch()): number {
  const envPort = Number(process.env.PORT);
  if (Number.isFinite(envPort) && envPort > 0) return envPort;

  const issue = parseIssueFromBranch(branch);
  if (issue == null) return DEFAULT_PORT;
  return PORT_BASE + (issue % PORT_SPAN);
}

export function dbNameForBranch(
  project = "techtracker",
  branch = currentBranch(),
): string {
  const issue = parseIssueFromBranch(branch);
  if (issue == null) return project;
  return `${project}_issue_${issue}`;
}
