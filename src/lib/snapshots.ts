import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ScoreSnapshot, Universe } from "@/domain/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

/**
 * Load a snapshot from the committed `public/data/` tree. Returns null on:
 *   - file missing (ENOENT)
 *   - invalid JSON (parse error)
 *   - payload missing required fields
 * The page then renders NoDataView instead of crashing. Upstream snapshots
 * come from the scoring pipeline, which enforces the shape — this is a
 * defence-in-depth check for local dev + CI seed files.
 */
export async function loadSnapshot(
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
    // Corrupted or partial write — render NoDataView rather than 500.
    return null;
  }

  if (!isSnapshot(parsed)) return null;
  return parsed;
}

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
