import { Card, CardContent } from "@/components/ui/card";
import { genesisReportStatCards } from "@/lib/genesis-report-stats";
import { cn } from "@/lib/utils";

type GenesisStatCardsProps = {
  className?: string;
};

export function GenesisStatCards({ className }: GenesisStatCardsProps) {
  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {genesisReportStatCards.map((stat) => (
          <Card key={stat.label} className="text-center hover:-translate-y-0.5">
            <CardContent className="pt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                {stat.label}
              </p>
              <p
                className={cn(
                  "mt-3 font-heading text-4xl font-bold tabular-nums tracking-tight text-primary"
                )}
              >
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
