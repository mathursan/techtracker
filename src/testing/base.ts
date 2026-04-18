import { describe, it } from "vitest";

/**
 * Vitest tagging + filtering helpers.
 *
 * Usage:
 *   import { describeTagged, tagged } from "@/testing/base";
 *
 *   describeTagged("FX screener", ["screener", "slow"], () => {
 *     tagged(["integration"]).it("renders currencies", () => { ... });
 *   });
 *
 * Filter by tag via env:
 *   VITEST_TAGS=screener pnpm test
 *   VITEST_TAGS=!slow pnpm test        # exclude
 *   VITEST_TAGS=screener,!slow pnpm test
 */

export type Tag = string;

function parseEnvTags(): { include: Set<Tag>; exclude: Set<Tag> } {
  const raw = (
    process.env.VITEST_TAGS ??
    process.env.TAGS ??
    ""
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const include = new Set<Tag>();
  const exclude = new Set<Tag>();
  for (const token of raw) {
    if (token.startsWith("!")) exclude.add(token.slice(1));
    else include.add(token);
  }
  return { include, exclude };
}

function shouldRun(tags: readonly Tag[]): boolean {
  const { include, exclude } = parseEnvTags();
  if (tags.some((t) => exclude.has(t))) return false;
  if (include.size === 0) return true;
  return tags.some((t) => include.has(t));
}

/**
 * Drop-in replacement for `describe()` with a tags array. Skips when any
 * tag is in the current exclusion set, or when an inclusion set is active
 * and no tag matches.
 */
export function describeTagged(
  name: string,
  tags: readonly Tag[],
  fn: () => void,
): void {
  const runner = shouldRun(tags) ? describe : describe.skip;
  runner(`[${tags.join(",")}] ${name}`, fn);
}

/**
 * Tag a single `it()`. Return value is a facade that only exposes `it`
 * (use `describeTagged` for groups). Nested tag inheritance is intentionally
 * NOT implemented; each level tags explicitly.
 */
export function tagged(tags: readonly Tag[]) {
  const runner = shouldRun(tags) ? it : it.skip;
  return {
    it: (name: string, fn: () => void | Promise<void>) =>
      runner(`[${tags.join(",")}] ${name}`, fn),
  };
}
