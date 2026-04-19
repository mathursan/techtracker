"use client";

import { useMemo } from "react";

import { signalForScore } from "@/domain/bands";
import { DEFAULT_WEIGHTS, compositeScore } from "@/domain/composite";
import type { Instrument, Weights } from "@/domain/types";
import { useActiveWeights } from "@/stores/weight-preset";

function weightsEqual(a: Weights, b: Weights): boolean {
  for (const id of Object.keys(a) as (keyof Weights)[]) {
    if (a[id] !== b[id]) return false;
  }
  return true;
}

/**
 * Recompute each instrument's `compositeScore` + `signal` using the active
 * weight preset. When the active preset is Default (which mirrors the
 * server-computed weights), this short-circuits and returns the input
 * unchanged so there's zero overhead in the common case.
 *
 * Phase 1 scope: only the screener table subscribes. Cross-tab
 * aggregators (Signals Hub / Signal Change / Portfolio) keep using the
 * server-computed `inst.compositeScore` until phase 2.
 */
export function useEffectiveInstruments(
  instruments: readonly Instrument[],
): Instrument[] {
  const active = useActiveWeights();
  return useMemo(() => {
    if (weightsEqual(active, DEFAULT_WEIGHTS)) {
      return instruments as Instrument[];
    }
    return instruments.map((inst) => {
      const score = compositeScore(inst.indicators, active);
      return {
        ...inst,
        compositeScore: score,
        signal: signalForScore(score),
      };
    });
  }, [instruments, active]);
}
