import { notFound } from "next/navigation";

import { AnalyticsView } from "@/components/analytics/analytics-view";
import { MethodologyView } from "@/components/methodology/methodology-view";
import { NoDataView } from "@/components/shell/no-data-view";
import { PlaceholderView } from "@/components/shell/placeholder-view";
import { PortfolioBuilderView } from "@/components/portfolio/portfolio-builder-view";
import { ScreenerView } from "@/components/screener/screener-view";
import { SignalChangeView } from "@/components/signal-change/signal-change-view";
import { SignalsHubView } from "@/components/signals-hub/signals-hub-view";
import type { TabDef } from "@/lib/nav";
import type { ScoreSnapshot, Universe } from "@/domain/types";
import { buildPortfolioVM } from "@/domain/portfolio";
import {
  PORTFOLIO_PRESETS,
  parsePresetSlug,
  presetBySlug,
} from "@/domain/portfolio-presets";
import {
  aggregateSignalChanges,
  parseDirection,
  parseLookback,
  parseUniverseScope,
  type UniverseChangeInput,
} from "@/domain/signal-change";
import {
  aggregateSignalsHub,
  parseSignalsHubView,
  type UniverseInput,
} from "@/domain/signals-hub";
import {
  loadAllHistoricalSnapshots,
  loadAllSnapshots,
  loadSnapshot,
} from "@/lib/snapshots";
import { TABS, tabForSlug } from "@/lib/nav";

type Query = Record<string, string | string[] | undefined>;
type ToolRenderer = (ctx: { tab: TabDef; query: Query }) => Promise<React.ReactNode>;

export function generateStaticParams() {
  return TABS.map((tab) => ({ slug: tab.slug }));
}

export const dynamicParams = false;

function pickParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function universeBackedTabs() {
  const tabs = TABS.filter((t) => t.universe);
  const universes = tabs.map((t) => t.universe as Universe);
  return { tabs, universes };
}

/** Common input shape used by Signals Hub + Portfolio + Signal Change. */
async function loadUniverseFeed(): Promise<{
  tabs: ReturnType<typeof universeBackedTabs>["tabs"];
  universes: Universe[];
  snapshots: Array<ScoreSnapshot | null>;
}> {
  const { tabs, universes } = universeBackedTabs();
  const snapshots = await loadAllSnapshots(universes);
  return { tabs, universes, snapshots };
}

const TOOL_RENDERERS: Record<string, ToolRenderer> = {
  "signals-hub": async ({ query }) => {
    const { tabs, snapshots } = await loadUniverseFeed();
    const inputs: UniverseInput[] = tabs.map((t, idx) => ({
      universe: t.universe as Universe,
      displayName: t.label,
      snapshot: snapshots[idx],
    }));
    const vm = aggregateSignalsHub(inputs);
    const view = parseSignalsHubView(pickParam(query.view));
    return <SignalsHubView vm={vm} view={view} />;
  },

  portfolio: async ({ query }) => {
    const activeSlug = parsePresetSlug(pickParam(query.preset));
    const { snapshots } = await loadUniverseFeed();
    // De-duplicated candidate list for UC-09. One row per ticker across all
    // published snapshots.
    const seen = new Set<string>();
    const candidates = snapshots
      .flatMap((s) => (s ? s.instruments : []))
      .filter((inst) => {
        if (seen.has(inst.ticker)) return false;
        seen.add(inst.ticker);
        return true;
      });
    const vm = activeSlug
      ? buildPortfolioVM(presetBySlug(activeSlug), snapshots)
      : null;
    return (
      <PortfolioBuilderView
        presets={PORTFOLIO_PRESETS}
        activeSlug={activeSlug}
        vm={vm}
        snapshots={snapshots}
        candidates={candidates}
      />
    );
  },

  "signal-change": async ({ query }) => {
    const { tabs, universes } = universeBackedTabs();
    const lookback = parseLookback(pickParam(query.lookback));
    const direction = parseDirection(pickParam(query.direction));
    const universeScope = parseUniverseScope(pickParam(query.u), universes);
    const [currents, historicals] = await Promise.all([
      loadAllSnapshots(universes),
      loadAllHistoricalSnapshots(universes, lookback),
    ]);
    const inputs: UniverseChangeInput[] = tabs.map((t, idx) => ({
      universe: t.universe as Universe,
      displayName: t.label,
      current: currents[idx],
      historical: historicals[idx],
    }));
    const vm = aggregateSignalChanges(inputs, { lookback, direction, universeScope });
    return <SignalChangeView vm={vm} />;
  },

  methodology: async () => <MethodologyView />,

  analytics: async () => {
    const snapshot = await loadSnapshot("stocks");
    if (!snapshot || snapshot.instruments.length === 0) {
      return (
        <div className="flex min-h-full flex-col">
          <header className="border-b px-6 py-4">
            <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          </header>
          <div className="m-6 grid place-items-center rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No data published yet. Analytics renders once the scoring pipeline
            publishes a stocks snapshot.
          </div>
        </div>
      );
    }
    return <AnalyticsView snapshot={snapshot} />;
  },
};

export default async function TabPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const tab = tabForSlug(slug);
  if (!tab) notFound();

  if (tab.universe) {
    const snapshot = await loadSnapshot(tab.universe);
    if (snapshot && snapshot.instruments.length > 0) {
      return (
        <ScreenerView
          snapshot={snapshot}
          chipKey={pickParam(query.chip)}
          search={pickParam(query.q)}
        />
      );
    }
    return <NoDataView tab={tab} />;
  }

  const render = TOOL_RENDERERS[slug];
  if (render) return render({ tab, query });

  return <PlaceholderView tab={tab} />;
}
