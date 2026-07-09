import { Card, CardContent } from "@/components/ui/card";
import { genesisReportStatCards } from "@/lib/genesis-report-stats";

type GenesisStatCardsProps = {
  className?: string;
};

export function GenesisStatCards({ className }: GenesisStatCardsProps) {
  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {genesisReportStatCards.map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="pt-0">
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="mt-2 font-heading text-4xl font-semibold text-primary tabular-nums">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}