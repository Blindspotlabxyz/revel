import { Check, Minus, X } from "lucide-react";
import {
  compareColumns,
  compareRows,
  type CompareValue,
} from "@/lib/compare-data";
import { cn } from "@/lib/utils";

function CellValue({ value, highlight }: { value: CompareValue; highlight?: boolean }) {
  if (value === true) {
    return (
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full",
          highlight ? "bg-primary/15 text-primary" : "bg-background text-foreground"
        )}
        aria-label="Yes"
      >
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }

  if (value === false) {
    return (
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted"
        aria-label="No"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-sm leading-snug",
        highlight ? "font-medium text-foreground" : "text-muted"
      )}
    >
      {value}
    </span>
  );
}

export function CompareTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 z-10 bg-surface px-4 py-4 text-sm font-medium text-muted md:px-6">
              Capability
            </th>
            {compareColumns.map((col) => (
              <th
                key={col.id}
                className={cn(
                  "px-4 py-4 md:px-5",
                  col.highlight && "bg-primary/5"
                )}
              >
                <div className="font-heading text-base font-semibold text-foreground">
                  {col.name}
                </div>
                <div className="mt-0.5 text-xs font-normal text-muted">
                  {col.tagline}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compareRows.map((row) => (
            <tr key={row.feature} className="border-b border-border last:border-0">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-surface px-4 py-4 text-sm font-medium text-foreground md:px-6"
              >
                {row.feature}
              </th>
              {compareColumns.map((col) => (
                <td
                  key={col.id}
                  className={cn(
                    "px-4 py-4 align-middle md:px-5",
                    col.highlight && "bg-primary/5"
                  )}
                >
                  <CellValue
                    value={row.values[col.id] ?? false}
                    highlight={col.highlight}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-3 text-xs text-muted md:px-6">
        <Minus className="mr-1 inline h-3 w-3" aria-hidden />
        * Early access: free weekly audits in Mission Control. Agent audits via
        OKX.AI are usage-priced. Full SaaS plans are not published yet.
      </p>
    </div>
  );
}
