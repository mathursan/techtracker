"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import type { Instrument } from "@/domain/types";

// Lazy-load the modal and its Recharts dependency. Before this, every
// route that offered a row-click (screener, signals hub, signal change,
// portfolio builder) pulled Recharts into its initial JS payload —
// ~95 KB gzip — even though the modal renders only after a click.
const TickerDetailModal = dynamic(
  () => import("./ticker-detail-modal").then((m) => m.TickerDetailModal),
  { ssr: false },
);

/**
 * Shared opener for the Ticker Detail modal (UC-05).
 *
 * Returns an imperative `openDetail(inst)` and the dialog node to render
 * once at the bottom of your component tree. Keeps the modal open/close
 * and active-instrument state in one place so every opener (screener,
 * Signals Hub, Signal Change, Portfolio Builder) doesn't re-roll the
 * same `useState` pair.
 */
export function useTickerDetailModal(): {
  openDetail: (instrument: Instrument) => void;
  modal: React.ReactNode;
} {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Instrument | null>(null);

  const openDetail = useCallback((inst: Instrument) => {
    setActive(inst);
    setOpen(true);
  }, []);

  const modal = (
    <TickerDetailModal
      instrument={active}
      open={open}
      onOpenChange={setOpen}
    />
  );

  return { openDetail, modal };
}
