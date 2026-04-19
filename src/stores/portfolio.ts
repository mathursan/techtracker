"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CustomHolding {
  ticker: string;
}

interface PortfolioState {
  holdings: CustomHolding[];
  /** True after zustand/persist has rehydrated from localStorage. Use this
   * to gate rendering to avoid SSR/CSR mismatches — same pattern as the
   * hand-rolled theme bootstrap. */
  hydrated: boolean;
  add: (ticker: string) => void;
  remove: (ticker: string) => void;
  replace: (tickers: readonly string[]) => void;
  clear: () => void;
}

const STORAGE_KEY = "tt-portfolio";

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      holdings: [],
      hydrated: false,
      add: (ticker) => {
        if (get().holdings.some((h) => h.ticker === ticker)) return;
        set((state) => ({ holdings: [...state.holdings, { ticker }] }));
      },
      remove: (ticker) =>
        set((state) => ({
          holdings: state.holdings.filter((h) => h.ticker !== ticker),
        })),
      replace: (tickers) => {
        // De-duplicate while preserving order.
        const seen = new Set<string>();
        const next: CustomHolding[] = [];
        for (const t of tickers) {
          if (seen.has(t)) continue;
          seen.add(t);
          next.push({ ticker: t });
        }
        set({ holdings: next });
      },
      clear: () => set({ holdings: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ holdings: state.holdings }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
