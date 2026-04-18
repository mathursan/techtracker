import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Persistent "not investment advice" notice. Legal boundary component —
 * must be present in the app shell on every page that renders a signal,
 * score, price, or composite. Expanded in the app-shell issue (#1).
 */
export function Disclaimer({
  className,
  ...rest
}: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "border-t bg-muted px-4 py-3 text-center text-xs text-muted-foreground",
        className,
      )}
      {...rest}
    >
      TechTracker provides technical analysis for informational purposes only.
      It is <strong className="font-medium">not investment advice</strong>, a
      recommendation to buy or sell any security, and does not take into account
      your objectives, financial situation, or needs.{" "}
      <strong className="font-medium">
        Past performance does not guarantee future results.
      </strong>{" "}
      Data may be delayed or inaccurate. Do your own research.
    </p>
  );
}
