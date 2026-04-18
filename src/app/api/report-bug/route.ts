import { NextResponse } from "next/server";

const GH_API = "https://api.github.com";

interface BugReportBody {
  title: string;
  description: string;
  url?: string;
  userAgent?: string;
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

function isBugReportBody(x: unknown): x is BugReportBody {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return typeof obj.title === "string" && typeof obj.description === "string";
}

export async function POST(request: Request) {
  const token = env("GITHUB_TOKEN");
  const owner = env("GITHUB_REPO_OWNER") ?? "mathursan";
  const repo = env("GITHUB_REPO_NAME") ?? "techtracker";

  if (!token) {
    return NextResponse.json(
      { error: "Server missing GITHUB_TOKEN." },
      { status: 500 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!isBugReportBody(payload)) {
    return NextResponse.json(
      { error: "Expected { title: string, description: string }." },
      { status: 400 },
    );
  }

  const body = [
    payload.description,
    "",
    "---",
    `URL: ${payload.url ?? "n/a"}`,
    `User-Agent: ${payload.userAgent ?? "n/a"}`,
    `Reported via in-app bug report endpoint.`,
  ].join("\n");

  const res = await fetch(`${GH_API}/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `[bug] ${payload.title.slice(0, 120)}`,
      body,
      labels: ["type:feature", "bug-report"],
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `GitHub returned ${res.status}` },
      { status: 502 },
    );
  }
  const issue = (await res.json()) as { number: number; html_url: string };
  return NextResponse.json({ number: issue.number, url: issue.html_url });
}
