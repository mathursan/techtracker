"use client";

import { useState } from "react";

import { BUILT_IN_PRESETS, MAX_USER_PRESETS } from "@/domain/weight-presets";
import type { WeightPresetId } from "@/domain/weight-presets";
import { useWeightPresetStore } from "@/stores/weight-preset";
import { cn } from "@/lib/utils";

export function PresetChipRow() {
  const hydrated = useWeightPresetStore((s) => s.hydrated);
  const activeId = useWeightPresetStore((s) => s.activeId);
  const customPresets = useWeightPresetStore((s) => s.customPresets);
  const draft = useWeightPresetStore((s) => s.draft);
  const setActive = useWeightPresetStore((s) => s.setActive);
  const saveCurrent = useWeightPresetStore((s) => s.saveCurrent);
  const deletePreset = useWeightPresetStore((s) => s.deletePreset);

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const slotsUsed = customPresets.length;
  const slotsFull = slotsUsed >= MAX_USER_PRESETS;
  const hasDraft = draft !== null;

  const handleSave = () => {
    setError(null);
    const id = saveCurrent(name);
    if (!id) {
      if (!name.trim()) setError("Name can't be empty.");
      else if (slotsFull) setError(`All ${MAX_USER_PRESETS} slots are full.`);
      else setError("Name already used.");
      return;
    }
    setName("");
    setSaving(false);
  };

  return (
    <section aria-label="Weight presets" className="flex flex-col gap-3 border-b px-6 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Preset
        </span>
        {BUILT_IN_PRESETS.map((p) => {
          const isActive = p.id === activeId && !hasDraft;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(p.id)}
              title={p.tagline}
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {p.name}
            </button>
          );
        })}
        {hydrated &&
          customPresets.map((p) => {
            const isActive = p.id === activeId && !hasDraft;
            return (
              <span key={p.id} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(p.id)}
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {p.name}
                </button>
                <button
                  type="button"
                  onClick={() => deletePreset(p.id)}
                  aria-label={`Delete ${p.name}`}
                  className="inline-flex h-5 w-5 items-center justify-center rounded border border-border text-[10px] text-muted-foreground transition-colors hover:border-rose-600 hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            );
          })}

        <div className="ml-auto flex items-center gap-2">
          {!saving ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSaving(true);
              }}
              disabled={!hydrated || slotsFull}
              className={cn(
                "inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                slotsFull
                  ? "cursor-not-allowed border-border text-muted-foreground opacity-60"
                  : "border-primary bg-primary/10 text-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              Save Current ({slotsUsed}/{MAX_USER_PRESETS})
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") {
                    setSaving(false);
                    setName("");
                    setError(null);
                  }
                }}
                placeholder="Preset name"
                aria-label="New preset name"
                autoFocus
                className="w-40 rounded-md border px-2 py-1 text-xs shadow-sm focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSave}
                className="rounded-md border border-primary bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaving(false);
                  setName("");
                  setError(null);
                }}
                className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <div className="text-xs text-rose-600 dark:text-rose-400">{error}</div>}
      {hasDraft && (
        <div className="text-xs text-amber-600 dark:text-amber-400">
          Unsaved changes — click a preset to discard, or Save Current to keep.
        </div>
      )}
    </section>
  );
}

export type { WeightPresetId };
