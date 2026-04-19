import type { IndicatorScore, Weights } from "@/domain/types";
import { INDICATOR_IDS } from "@/domain/types";
import { DEFAULT_WEIGHTS } from "@/domain/composite";
import { scoreTextClass, toneForScore } from "@/domain/colors";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  ma_trend: "MA Trend",
  macd: "MACD",
  adx_dmi: "ADX/DMI",
  rsi: "RSI",
  sar: "SAR",
  bollinger: "Bollinger",
  stochastic: "Stochastic",
  obv: "OBV",
  ichimoku: "Ichimoku",
};

const BAR_BG: Record<"green" | "amber" | "red", string> = {
  green: "bg-emerald-500 dark:bg-emerald-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  red: "bg-rose-500 dark:bg-rose-400",
};

export function IndicatorScoresPanel({
  scores,
  weights = DEFAULT_WEIGHTS,
}: {
  scores: IndicatorScore[];
  weights?: Weights;
}) {
  const byId = new Map(scores.map((s) => [s.id, s.value] as const));

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold">Indicator Scores</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Scale: <span className="font-medium">0</span> Strong Sell ·{" "}
          <span className="font-medium">5</span> Neutral ·{" "}
          <span className="font-medium">10</span> Strong Buy
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {INDICATOR_IDS.map((id) => {
          const value = byId.get(id);
          const weight = weights[id] ?? 0;
          return (
            <div
              key={id}
              className="grid grid-cols-[7rem_1fr_3rem_2.5rem] items-center gap-2"
            >
              <span className="text-xs text-muted-foreground">
                {LABELS[id] ?? id}
              </span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full transition-[width]",
                    value != null && BAR_BG[toneForScore(value)],
                  )}
                  style={{ width: `${((value ?? 0) / 10) * 100}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-right font-mono text-xs font-semibold",
                  value != null ? scoreTextClass(value) : "text-muted-foreground",
                )}
              >
                {value != null ? value.toFixed(1) : "—"}
              </span>
              <span className="text-right font-mono text-xs text-muted-foreground">
                {weight.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
