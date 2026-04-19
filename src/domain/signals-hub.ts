import type {
  Instrument,
  ScoreSnapshot,
  Signal,
  Universe,
} from "./types";

export type SignalsHubView = "top-buys" | "top-sells" | "momentum" | "heatmap";

export const SIGNALS_HUB_VIEWS: readonly SignalsHubView[] = [
  "top-buys",
  "top-sells",
  "momentum",
  "heatmap",
] as const;

export const DEFAULT_SIGNALS_HUB_VIEW: SignalsHubView = "top-buys";

export const SIGNAL_BANDS: readonly Signal[] = [
  "Strong Sell",
  "Sell",
  "Neutral",
  "Buy",
  "Strong Buy",
] as const;

/** How many spotlight cards each of top-buys / top-sells / momentum shows. */
export const SPOTLIGHT_LIMIT = 12;

export interface UniverseCard {
  universe: Universe;
  displayName: string;
  hasData: boolean;
  totalCount: number;
  avgScore: number;
  /** Count of instruments flagged Strong Buy OR Buy — matches the Top Buys
   * list filter one panel below. */
  buyCount: number;
  /** Count of instruments flagged Strong Sell OR Sell — matches Top Sells. */
  sellCount: number;
}

export interface SpotlightVM {
  instrument: Instrument;
  universe: Universe;
  universeDisplayName: string;
}

export interface HeatmapRow {
  universe: Universe;
  displayName: string;
  hasData: boolean;
  counts: Record<Signal, number>;
  total: number;
}

export interface SignalsHubVM {
  universeCards: UniverseCard[];
  topBuys: SpotlightVM[];
  topSells: SpotlightVM[];
  momentum: SpotlightVM[];
  heatmap: HeatmapRow[];
  totalInstruments: number;
  snapshotCount: number;
}

export interface UniverseInput {
  universe: Universe;
  displayName: string;
  snapshot: ScoreSnapshot | null;
}

const BUY_SIGNALS: ReadonlySet<Signal> = new Set(["Strong Buy", "Buy"]);
const SELL_SIGNALS: ReadonlySet<Signal> = new Set(["Strong Sell", "Sell"]);

function emptyCounts(): Record<Signal, number> {
  return {
    "Strong Sell": 0,
    Sell: 0,
    Neutral: 0,
    Buy: 0,
    "Strong Buy": 0,
  };
}

export function parseSignalsHubView(raw: unknown): SignalsHubView {
  if (typeof raw !== "string") return DEFAULT_SIGNALS_HUB_VIEW;
  return (SIGNALS_HUB_VIEWS as readonly string[]).includes(raw)
    ? (raw as SignalsHubView)
    : DEFAULT_SIGNALS_HUB_VIEW;
}

/**
 * Aggregate every universe snapshot into the shape the Signals Hub page
 * renders. Pure; no I/O. Callers filter/merge before calling.
 *
 * `displayName` is passed in (from the nav tab config) so the domain layer
 * doesn't depend on `src/lib/nav.ts` — keeps the dependency direction clean.
 */
export function aggregateSignalsHub(inputs: readonly UniverseInput[]): SignalsHubVM {
  const universeCards: UniverseCard[] = inputs.map((input) => {
    const snap = input.snapshot;
    if (!snap || snap.instruments.length === 0) {
      return {
        universe: input.universe,
        displayName: input.displayName,
        hasData: false,
        totalCount: 0,
        avgScore: 0,
        buyCount: 0,
        sellCount: 0,
      };
    }
    let buyCount = 0;
    let sellCount = 0;
    for (const inst of snap.instruments) {
      if (BUY_SIGNALS.has(inst.signal)) buyCount += 1;
      else if (SELL_SIGNALS.has(inst.signal)) sellCount += 1;
    }
    return {
      universe: input.universe,
      displayName: input.displayName,
      hasData: true,
      totalCount: snap.summary.totalCount,
      avgScore: snap.summary.avgScore,
      buyCount,
      sellCount,
    };
  });

  const allInstruments: SpotlightVM[] = inputs.flatMap((input) => {
    if (!input.snapshot) return [];
    return input.snapshot.instruments.map((inst) => ({
      instrument: inst,
      universe: input.universe,
      universeDisplayName: input.displayName,
    }));
  });

  const buys = allInstruments
    .filter((vm) => BUY_SIGNALS.has(vm.instrument.signal))
    .sort((a, b) => {
      const byScore = b.instrument.compositeScore - a.instrument.compositeScore;
      if (byScore !== 0) return byScore;
      return b.instrument.perfOneMonth - a.instrument.perfOneMonth;
    });

  const sells = allInstruments
    .filter((vm) => SELL_SIGNALS.has(vm.instrument.signal))
    .sort((a, b) => {
      const byScore = a.instrument.compositeScore - b.instrument.compositeScore;
      if (byScore !== 0) return byScore;
      return a.instrument.perfOneMonth - b.instrument.perfOneMonth;
    });

  const momentum = allInstruments
    .filter((vm) => Number.isFinite(vm.instrument.perfOneMonth))
    .sort((a, b) => {
      const mag = Math.abs(b.instrument.perfOneMonth) - Math.abs(a.instrument.perfOneMonth);
      if (mag !== 0) return mag;
      return b.instrument.compositeScore - a.instrument.compositeScore;
    });

  const heatmap: HeatmapRow[] = inputs.map((input) => {
    const snap = input.snapshot;
    if (!snap || snap.instruments.length === 0) {
      return {
        universe: input.universe,
        displayName: input.displayName,
        hasData: false,
        counts: emptyCounts(),
        total: 0,
      };
    }
    const counts = emptyCounts();
    for (const inst of snap.instruments) counts[inst.signal] += 1;
    return {
      universe: input.universe,
      displayName: input.displayName,
      hasData: true,
      counts,
      total: snap.instruments.length,
    };
  });

  return {
    universeCards,
    topBuys: buys.slice(0, SPOTLIGHT_LIMIT),
    topSells: sells.slice(0, SPOTLIGHT_LIMIT),
    momentum: momentum.slice(0, SPOTLIGHT_LIMIT),
    heatmap,
    totalInstruments: allInstruments.length,
    snapshotCount: inputs.filter((i) => i.snapshot !== null).length,
  };
}
