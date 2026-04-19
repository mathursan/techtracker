import { notFound } from "next/navigation";

import { NoDataView } from "@/components/shell/no-data-view";
import { PlaceholderView } from "@/components/shell/placeholder-view";
import { ScreenerView } from "@/components/screener/screener-view";
import { SignalChangeView } from "@/components/signal-change/signal-change-view";
import { SignalsHubView } from "@/components/signals-hub/signals-hub-view";
import type { Universe } from "@/domain/types";
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

export function generateStaticParams() {
  return TABS.map((tab) => ({ slug: tab.slug }));
}

export const dynamicParams = false;

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
      const rawChip = query.chip;
      const rawQuery = query.q;
      const chipKey = Array.isArray(rawChip) ? rawChip[0] : rawChip;
      const search = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;
      return (
        <ScreenerView
          snapshot={snapshot}
          chipKey={chipKey}
          search={search}
        />
      );
    }
    return <NoDataView tab={tab} />;
  }

  if (slug === "signals-hub") {
    const universeTabs = TABS.filter((t) => t.universe);
    const universes = universeTabs.map((t) => t.universe as Universe);
    const snapshots = await loadAllSnapshots(universes);
    const inputs: UniverseInput[] = universeTabs.map((t, idx) => ({
      universe: t.universe as Universe,
      displayName: t.label,
      snapshot: snapshots[idx],
    }));
    const vm = aggregateSignalsHub(inputs);
    const rawView = query.view;
    const viewParam = Array.isArray(rawView) ? rawView[0] : rawView;
    const view = parseSignalsHubView(viewParam);
    return <SignalsHubView vm={vm} view={view} />;
  }

  if (slug === "signal-change") {
    const universeTabs = TABS.filter((t) => t.universe);
    const universes = universeTabs.map((t) => t.universe as Universe);
    const rawLookback = query.lookback;
    const lookback = parseLookback(
      Array.isArray(rawLookback) ? rawLookback[0] : rawLookback,
    );
    const rawDirection = query.direction;
    const direction = parseDirection(
      Array.isArray(rawDirection) ? rawDirection[0] : rawDirection,
    );
    const rawScope = query.u;
    const universeScope = parseUniverseScope(
      Array.isArray(rawScope) ? rawScope[0] : rawScope,
      universes,
    );
    const [currents, historicals] = await Promise.all([
      loadAllSnapshots(universes),
      loadAllHistoricalSnapshots(universes, lookback),
    ]);
    const inputs: UniverseChangeInput[] = universeTabs.map((t, idx) => ({
      universe: t.universe as Universe,
      displayName: t.label,
      current: currents[idx],
      historical: historicals[idx],
    }));
    const vm = aggregateSignalChanges(inputs, { lookback, direction, universeScope });
    return <SignalChangeView vm={vm} />;
  }

  return <PlaceholderView tab={tab} />;
}
