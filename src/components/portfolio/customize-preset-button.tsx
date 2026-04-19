"use client";

import { Pencil } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import type { PortfolioPreset } from "@/domain/portfolio-presets";
import { usePortfolioStore } from "@/stores/portfolio";

export function CustomizePresetButton({ preset }: { preset: PortfolioPreset }) {
  const router = useRouter();
  const pathname = usePathname();
  const replace = usePortfolioStore((s) => s.replace);

  return (
    <button
      type="button"
      onClick={() => {
        replace(preset.holdings.map((h) => h.ticker));
        router.push(pathname);
      }}
      className="inline-flex items-center gap-1 rounded-md border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      <Pencil className="h-3 w-3" aria-hidden="true" /> Customize this preset
    </button>
  );
}
