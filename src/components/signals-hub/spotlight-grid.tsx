"use client";

import { useState } from "react";

import type { SpotlightVM } from "@/domain/signals-hub";

import { TickerDetailModal } from "@/components/detail/ticker-detail-modal";
import { SpotlightCard } from "./spotlight-card";

export function SpotlightGrid({
  items,
  emptyCopy,
}: {
  items: SpotlightVM[];
  emptyCopy: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<SpotlightVM | null>(null);

  const onOpen = (vm: SpotlightVM) => {
    setActive(vm);
    setOpen(true);
  };

  if (items.length === 0) {
    return (
      <div className="grid h-40 place-items-center rounded border border-dashed text-sm text-muted-foreground">
        {emptyCopy}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((vm) => (
          <SpotlightCard key={`${vm.universe}:${vm.instrument.ticker}`} vm={vm} onOpen={onOpen} />
        ))}
      </div>
      <TickerDetailModal
        instrument={active?.instrument ?? null}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
