import {
  type LucideIcon,
  TrendingUp,
  Layers,
  Building2,
  MapPin,
  DollarSign,
  Droplets,
  Landmark,
  Globe,
  Shuffle,
  Briefcase,
  Radio,
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Flag,
} from "lucide-react";

import type { Universe } from "@/domain/types";

export type TabRow = 1 | 2;

export interface TabDef {
  /** URL slug under the shell route group. Canonical across the app. */
  slug: string;
  /** Verbatim label from the source app. */
  label: string;
  /** Lucide icon component. Countries fall back to a generic Flag with a text badge. */
  icon: LucideIcon;
  /** 2-letter badge shown beside the Flag icon for country tabs (undefined otherwise). */
  flagBadge?: string;
  /** Universe slug this tab is backed by, for tabs that render a screener. Undefined for tool tabs. */
  universe?: Universe;
  /** Which visual row the tab sits in (1 = universes, 2 = tools). */
  row: TabRow;
  /** GitHub issue that replaces the placeholder with real content. */
  plannedIssue: number;
}

export const TABS: readonly TabDef[] = [
  // Row 1 — asset universes
  { slug: "stocks", label: "Top 50 Stocks", icon: TrendingUp, universe: "stocks", row: 1, plannedIssue: 4 },
  { slug: "sector-etfs", label: "Sector ETFs", icon: Layers, universe: "sector-etfs", row: 1, plannedIssue: 4 },
  { slug: "industry-etfs", label: "Industry ETFs", icon: Building2, universe: "industry-etfs", row: 1, plannedIssue: 4 },
  { slug: "country-etfs", label: "Country ETFs", icon: MapPin, universe: "country-etfs", row: 1, plannedIssue: 4 },
  { slug: "currencies", label: "Currencies", icon: DollarSign, universe: "currencies", row: 1, plannedIssue: 4 },
  { slug: "commodities", label: "Commodities", icon: Droplets, universe: "commodities", row: 1, plannedIssue: 4 },
  { slug: "india", label: "India", icon: Flag, flagBadge: "IN", universe: "india", row: 1, plannedIssue: 4 },
  { slug: "hong-kong", label: "Hong Kong", icon: Flag, flagBadge: "HK", universe: "hong-kong", row: 1, plannedIssue: 4 },
  { slug: "singapore", label: "Singapore", icon: Flag, flagBadge: "SG", universe: "singapore", row: 1, plannedIssue: 4 },
  { slug: "japan", label: "Japan", icon: Flag, flagBadge: "JP", universe: "japan", row: 1, plannedIssue: 4 },
  { slug: "europe", label: "Europe", icon: Flag, flagBadge: "EU", universe: "europe", row: 1, plannedIssue: 4 },
  // Row 2 — tools
  { slug: "fixed-income", label: "Fixed Income", icon: Landmark, universe: "fixed-income", row: 2, plannedIssue: 4 },
  { slug: "broad-market", label: "Broad Market", icon: Globe, universe: "broad-market", row: 2, plannedIssue: 4 },
  { slug: "growth-value", label: "Growth/Value", icon: Shuffle, universe: "growth-value", row: 2, plannedIssue: 4 },
  { slug: "portfolio", label: "Portfolio Builder", icon: Briefcase, row: 2, plannedIssue: 12 },
  { slug: "signals-hub", label: "Signals Hub", icon: Radio, row: 2, plannedIssue: 10 },
  { slug: "signal-change", label: "Signal Change", icon: ArrowLeftRight, row: 2, plannedIssue: 11 },
  { slug: "analytics", label: "Analytics", icon: BarChart3, row: 2, plannedIssue: 15 },
  { slug: "methodology", label: "Methodology", icon: BookOpen, row: 2, plannedIssue: 14 },
] as const;

export const DEFAULT_TAB: TabDef = TABS[0];

/** O(1) lookup. Built once at module load. */
const TABS_BY_SLUG: ReadonlyMap<string, TabDef> = new Map(
  TABS.map((tab) => [tab.slug, tab]),
);

export function tabForSlug(slug: string): TabDef | undefined {
  return TABS_BY_SLUG.get(slug);
}

export function hrefForTab(tab: TabDef): `/${string}` {
  return `/${tab.slug}`;
}

export const TAB_SLUGS: readonly string[] = TABS.map((t) => t.slug);
