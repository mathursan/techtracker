import { notFound } from "next/navigation";

import { PlaceholderView } from "@/components/shell/placeholder-view";
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
  return <PlaceholderView tab={tab} />;
}
