import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ScoreSnapshot, Universe } from "@/domain/types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

/**
 * Load a snapshot from the committed `public/data/` tree. Returns null when
 * the file is missing — downstream renders a "no data yet" state instead of
 * erroring. Invoked from server components at render time.
 */
export async function loadSnapshot(
  universe: Universe,
): Promise<ScoreSnapshot | null> {
  const filePath = path.join(DATA_DIR, `${universe}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as ScoreSnapshot;
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") return null;
    throw err;
  }
}
