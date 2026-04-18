#!/usr/bin/env -S pnpm exec tsx
/**
 * Regenerates the band-grid fixture consumed by scoring/tests/test_contract.py.
 *
 *   pnpm exec tsx src/domain/__fixtures__/generate.ts          # write
 *   pnpm exec tsx src/domain/__fixtures__/generate.ts --check  # fail if stale
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { signalForScore } from "../bands";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "band-grid.json");

const grid = Array.from({ length: 101 }, (_, i) =>
  Math.round(i * 0.1 * 10) / 10,
);

const rows = grid.map((score) => ({ score, signal: signalForScore(score) }));
const serialized = `${JSON.stringify(rows, null, 2)}\n`;

const checkMode = process.argv.includes("--check");
if (checkMode) {
  try {
    const existing = readFileSync(out, "utf-8");
    if (existing !== serialized) {
      console.error(
        "Fixture is stale — re-run without --check to regenerate.",
      );
      process.exit(1);
    }
  } catch {
    console.error("Fixture missing — re-run without --check to generate.");
    process.exit(1);
  }
  console.log("Fixture is current.");
  process.exit(0);
}

writeFileSync(out, serialized);
console.log(`Wrote ${rows.length} rows to ${out}`);
