import { SIGNAL_SEVERITY } from "./bands";
import type { Instrument, ScoreSnapshot, Signal, Universe } from "./types";

export type Lookback = "1w" | "1m";
export type Direction = "all" | "up" | "down";

export const LOOKBACKS: readonly Lookback[] = ["1w", "1m"] as const;
export const DEFAULT_LOOKBACK: Lookback = "1m";

export const DIRECTIONS: readonly Direction[] = ["all", "up", "down"] as const;
export const DEFAULT_DIRECTION: Direction = "all";

export const LOOKBACK_LABELS: Record<Lookback, string> = {
  "1w": "1 Week",
  "1m": "1 Month",
};

export interface SignalChangeRow {
  instrument: Instrument;
  universe: Universe;
  universeDisplayName: string;
  previous: Signal;
  current: Signal;
  /** severity(current) - severity(previous). Always non-zero by construction. */
  severityJump: number;
}

export interface UniverseChangeSummary {
  universe: Universe;
  displayName: string;
  hasData: boolean;
  upgrades: number;
  downgrades: number;
}

export interface AllMarketsSummary {
  upgrades: number;
  downgrades: number;
  /** Universes that contributed at least one change (either direction). */
  universesWithData: number;
}

export interface SignalChangeVM {
  lookback: Lookback;
  direction: Direction;
  universeScope: Universe | null;
  allMarkets: AllMarketsSummary;
  perUniverse: UniverseChangeSummary[];
  rows: SignalChangeRow[];
  /** True when no universe in the input had a historical snapshot at all. */
  noHistory: boolean;
}

export interface UniverseChangeInput {
  universe: Universe;
  displayName: string;
  current: ScoreSnapshot | null;
  historical: ScoreSnapshot | null;
}

export function parseLookback(raw: unknown): Lookback {
  if (typeof raw !== "string") return DEFAULT_LOOKBACK;
  return (LOOKBACKS as readonly string[]).includes(raw) ? (raw as Lookback) : DEFAULT_LOOKBACK;
}

export function parseDirection(raw: unknown): Direction {
  if (typeof raw !== "string") return DEFAULT_DIRECTION;
  return (DIRECTIONS as readonly string[]).includes(raw) ? (raw as Direction) : DEFAULT_DIRECTION;
}

export function parseUniverseScope(
  raw: unknown,
  valid: readonly Universe[],
): Universe | null {
  if (typeof raw !== "string") return null;
  return (valid as readonly string[]).includes(raw) ? (raw as Universe) : null;
}

function diffOne(
  current: Instrument,
  prevByTicker: Map<string, Instrument>,
): { previous: Signal; severityJump: number } | null {
  const prev = prevByTicker.get(current.ticker);
  if (!prev) return null;
  const jump = SIGNAL_SEVERITY[current.signal] - SIGNAL_SEVERITY[prev.signal];
  if (jump === 0) return null;
  return { previous: prev.signal, severityJump: jump };
}

/**
 * Build the Signal Change view model.
 *
 * Pure; no I/O. Caller is responsible for loading both the current and the
 * historical snapshot for each universe and passing them in `inputs`.
 *
 * Flat rows (signal unchanged) are dropped — "no change" is not a row.
 * Missing historical snapshot for a universe → that universe contributes
 * zero rows and is marked `hasData: false`.
 *
 * Sorting: absolute severity jump desc (biggest moves first), then by
 * composite score desc within upgrades and asc within downgrades — so the
 * strongest conviction changes lead.
 */
export function aggregateSignalChanges(
  inputs: readonly UniverseChangeInput[],
  options: {
    lookback: Lookback;
    direction: Direction;
    universeScope: Universe | null;
  },
): SignalChangeVM {
  const perUniverse: UniverseChangeSummary[] = [];
  const allRows: SignalChangeRow[] = [];

  for (const input of inputs) {
    if (!input.current || !input.historical) {
      perUniverse.push({
        universe: input.universe,
        displayName: input.displayName,
        hasData: false,
        upgrades: 0,
        downgrades: 0,
      });
      continue;
    }

    const prevByTicker = new Map(
      input.historical.instruments.map((i) => [i.ticker, i] as const),
    );

    let upgrades = 0;
    let downgrades = 0;
    const universeRows: SignalChangeRow[] = [];

    for (const inst of input.current.instruments) {
      const diff = diffOne(inst, prevByTicker);
      if (!diff) continue;
      if (diff.severityJump > 0) upgrades += 1;
      else downgrades += 1;
      universeRows.push({
        instrument: inst,
        universe: input.universe,
        universeDisplayName: input.displayName,
        previous: diff.previous,
        current: inst.signal,
        severityJump: diff.severityJump,
      });
    }

    perUniverse.push({
      universe: input.universe,
      displayName: input.displayName,
      hasData: true,
      upgrades,
      downgrades,
    });
    allRows.push(...universeRows);
  }

  const scopedRows = options.universeScope
    ? allRows.filter((r) => r.universe === options.universeScope)
    : allRows;

  const directionFiltered = scopedRows.filter((r) => {
    if (options.direction === "all") return true;
    if (options.direction === "up") return r.severityJump > 0;
    return r.severityJump < 0;
  });

  directionFiltered.sort((a, b) => {
    const mag = Math.abs(b.severityJump) - Math.abs(a.severityJump);
    if (mag !== 0) return mag;
    const aUp = a.severityJump > 0;
    const bUp = b.severityJump > 0;
    if (aUp !== bUp) return aUp ? -1 : 1;
    if (aUp) return b.instrument.compositeScore - a.instrument.compositeScore;
    return a.instrument.compositeScore - b.instrument.compositeScore;
  });

  const allMarkets: AllMarketsSummary = {
    upgrades: allRows.filter((r) => r.severityJump > 0).length,
    downgrades: allRows.filter((r) => r.severityJump < 0).length,
    universesWithData: perUniverse.filter((u) => u.hasData).length,
  };

  return {
    lookback: options.lookback,
    direction: options.direction,
    universeScope: options.universeScope,
    allMarkets,
    perUniverse,
    rows: directionFiltered,
    noHistory: allMarkets.universesWithData === 0,
  };
}
