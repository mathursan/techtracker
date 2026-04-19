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
      const chipKey = Array.isArray(rawChip) ? rawChip[0] : rawChip;
      return <ScreenerView snapshot={snapshot} chipKey={chipKey} />;
    }
    return <NoDataView tab={tab} />;
  }

  return <PlaceholderView tab={tab} />;
}
