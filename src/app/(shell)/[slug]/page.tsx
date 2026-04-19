import { notFound } from "next/navigation";

import { NoDataView } from "@/components/shell/no-data-view";
import { PlaceholderView } from "@/components/shell/placeholder-view";
import { ScreenerView } from "@/components/screener/screener-view";
import { loadSnapshot } from "@/lib/snapshots";
import { TABS, tabForSlug } from "@/lib/nav";

export function generateStaticParams() {
  return TABS.map((tab) => ({ slug: tab.slug }));
}

export const dynamicParams = false;

export default async function TabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tab = tabForSlug(slug);
  if (!tab) notFound();

  // Screener universes render the table; tool tabs keep the roadmap placeholder.
  if (tab.universe) {
    const snapshot = await loadSnapshot(tab.universe);
    if (snapshot && snapshot.instruments.length > 0) {
      return <ScreenerView snapshot={snapshot} />;
    }
    return <NoDataView tab={tab} />;
  }

  return <PlaceholderView tab={tab} />;
}
