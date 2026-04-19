"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  MAX_USER_PRESETS,
  builtInPresetById,
  isBuiltInPresetId,
  type UserWeightPreset,
  type UserPresetId,
  type WeightPresetId,
} from "@/domain/weight-presets";
import type { Weights } from "@/domain/types";

interface WeightPresetState {
  activeId: WeightPresetId;
  customPresets: UserWeightPreset[];
  /** Un-saved slider state. Overrides `activeWeights()` when non-null. */
  draft: Weights | null;
  hydrated: boolean;
  setActive: (id: WeightPresetId) => void;
  setDraft: (weights: Weights) => void;
  clearDraft: () => void;
  /** Save the current draft (or, if no draft, the active weights) under
   * a new user slot and activate it. Returns the new preset id, or `null`
   * if the slot cap is reached or the name is empty/duplicate. */
  saveCurrent: (name: string) => UserPresetId | null;
  deletePreset: (id: UserPresetId) => void;
}

const STORAGE_KEY = "tt-weight-preset";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "preset";
}

function uniqueUserId(
  name: string,
  existing: readonly UserWeightPreset[],
): UserPresetId {
  const base = slugify(name);
  let candidate = `user-${base}` as UserPresetId;
  let n = 2;
  const taken = new Set(existing.map((p) => p.id));
  while (taken.has(candidate)) {
    candidate = `user-${base}-${n}` as UserPresetId;
    n += 1;
  }
  return candidate;
}

export const useWeightPresetStore = create<WeightPresetState>()(
  persist(
    (set, get) => ({
      activeId: "default",
      customPresets: [],
      draft: null,
      hydrated: false,

      setActive: (id) => {
        if (isBuiltInPresetId(id)) {
          set({ activeId: id, draft: null });
          return;
        }
        const match = get().customPresets.find((p) => p.id === id);
        if (!match) return;
        set({ activeId: id, draft: null });
      },

      setDraft: (weights) => set({ draft: weights }),
      clearDraft: () => set({ draft: null }),

      saveCurrent: (rawName) => {
        const name = rawName.trim();
        if (!name) return null;
        const { customPresets, draft, activeId } = get();
        if (customPresets.length >= MAX_USER_PRESETS) return null;
        if (customPresets.some((p) => p.name === name)) return null;

        const weights: Weights =
          draft ??
          (isBuiltInPresetId(activeId)
            ? builtInPresetById(activeId).weights
            : customPresets.find((p) => p.id === activeId)?.weights ??
              builtInPresetById("default").weights);

        const id = uniqueUserId(name, customPresets);
        const next: UserWeightPreset = { id, name, weights };
        set({
          customPresets: [...customPresets, next],
          activeId: id,
          draft: null,
        });
        return id;
      },

      deletePreset: (id) => {
        const { customPresets, activeId } = get();
        const without = customPresets.filter((p) => p.id !== id);
        set({
          customPresets: without,
          activeId: activeId === id ? "default" : activeId,
          draft: activeId === id ? null : get().draft,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeId: state.activeId,
        customPresets: state.customPresets,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

/**
 * Read the currently active weights — built-in preset if the active id
 * matches one, user preset otherwise, with draft overrides when present.
 * Falls back to the Default preset if nothing matches (e.g. after a user
 * deletes the active preset between renders).
 */
export function resolveActiveWeights(
  activeId: WeightPresetId,
  customPresets: readonly UserWeightPreset[],
  draft: Weights | null,
): Weights {
  if (draft) return draft;
  if (isBuiltInPresetId(activeId)) return builtInPresetById(activeId).weights;
  const user = customPresets.find((p) => p.id === activeId);
  if (user) return user.weights;
  return builtInPresetById("default").weights;
}

/** Convenience hook: subscribe to the active effective weights only. */
export function useActiveWeights(): Weights {
  return useWeightPresetStore((s) =>
    resolveActiveWeights(s.activeId, s.customPresets, s.draft),
  );
}

