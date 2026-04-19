import "server-only";

import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ScoreSnapshot, Universe } from "@/domain/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

/**
 * Load a snapshot from the committed `public/data/` tree. Returns null on:
 *   - file missing (ENOENT)
 *   - invalid JSON (parse error)
 *   - payload missing required fields
 *
 * Wrapped in React.cache so repeated calls within a single request (e.g.
 * StatusLine fan-out + page.tsx reading its one universe) de-duplicate the
 * file read.
 */
export const loadSnapshot = cache(async function loadSnapshot(
  universe: Universe,
): Promise<ScoreSnapshot | null> {
  const filePath = path.join(DATA_DIR, `${universe}.json`);
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return null;
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isSnapshot(parsed)) return null;
  return parsed;
});

/** Return the newest `asOf` across every screener-universe snapshot, or
 * null when zero universes have data. Cached per request. */
export const latestAsOf = cache(async function latestAsOf(
  universes: readonly Universe[],
): Promise<Date | null> {
  const snapshots = await Promise.all(universes.map((u) => loadSnapshot(u)));
  const dates = snapshots
    .map((s) => (s ? new Date(s.asOf) : null))
    .filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()));
  if (dates.length === 0) return null;
  return dates.reduce((a, b) => (b.getTime() > a.getTime() ? b : a));
});

function isSnapshot(x: unknown): x is ScoreSnapshot {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.asOf === "string" &&
    typeof o.universe === "string" &&
    Array.isArray(o.instruments) &&
    typeof o.summary === "object" &&
    o.summary !== null
  );
}
