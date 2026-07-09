import type { AnalyticsDashboard } from "@/lib/analytics";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="mt-2 font-heading text-3xl font-semibold tabular-nums">
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function formatSource(source: string): string {
  const labels: Record<string, string> = {
    website: "Mission Control",
    mcp_okx: "OKX MCP",
    mcp_dev: "MCP (dev key)",
    api_audit: "Paid API",
  };
  return labels[source] ?? source;
}

function formatEventType(eventType: string): string {
  return eventType.replaceAll("_", " ");
}

export function AnalyticsDashboardView({ data }: { data: AnalyticsDashboard }) {
  const sourceRows = Object.entries(data.analyses.bySourceThisWeek).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted">
          Updated {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={data.users.total} hint={`${data.users.newThisWeek} new this week`} />
        <StatCard
          label="Analyses this week"
          value={data.analyses.thisWeek}
          hint={`${data.analyses.completed} completed total`}
        />
        <StatCard
          label="MCP tool calls"
          value={data.mcp.toolCallsThisWeek}
          hint={`${data.mcp.okxPaidThisWeek} OKX marketplace events`}
        />
        <StatCard
          label="Exports this week"
          value={data.exports.thisWeek}
          hint={`${data.exports.total} tracked total`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-0">
            <CardTitle>Traffic by source (this week)</CardTitle>
            {sourceRows.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No activity logged yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {sourceRows.map(([source, count]) => (
                  <li
                    key={source}
                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                  >
                    <span>{formatSource(source)}</span>
                    <span className="font-medium tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <CardTitle>MCP tools (this week)</CardTitle>
            {data.mcp.toolBreakdown.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No MCP calls yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.mcp.toolBreakdown.map((row) => (
                  <li
                    key={row.tool}
                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                  >
                    <span className="font-mono text-xs">{row.tool}</span>
                    <span className="font-medium tabular-nums">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-0">
            <CardTitle>7-day volume</CardTitle>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Web</th>
                    <th className="py-2 pr-3">OKX</th>
                    <th className="py-2 pr-3">Dev</th>
                    <th className="py-2">API</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyVolume.map((row) => (
                    <tr key={row.date} className="border-b border-border/60">
                      <td className="py-2 pr-3 tabular-nums">{row.date}</td>
                      <td className="py-2 pr-3 tabular-nums">{row.website}</td>
                      <td className="py-2 pr-3 tabular-nums">{row.mcpOkx}</td>
                      <td className="py-2 pr-3 tabular-nums">{row.mcpDev}</td>
                      <td className="py-2 tabular-nums">{row.apiAudit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-0">
            <CardTitle>Top users (this week)</CardTitle>
            {data.topUsers.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No signed-in usage yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.topUsers.map((row) => (
                  <li
                    key={row.userId}
                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                  >
                    <span className="truncate pr-3">
                      {row.email ?? row.userId.slice(0, 8)}
                    </span>
                    <span className="font-medium tabular-nums">
                      {row.analysisCount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="pt-0">
          <CardTitle>Recent activity</CardTitle>
          {data.recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No events recorded yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3">Event</th>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivity.map((event) => (
                    <tr key={event.id} className="border-b border-border/60">
                      <td className="py-2 pr-3 whitespace-nowrap text-xs text-muted">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3 capitalize">
                        {formatEventType(event.eventType)}
                      </td>
                      <td className="py-2 pr-3">{formatSource(event.source)}</td>
                      <td className="py-2 pr-3 truncate max-w-[10rem]">
                        {event.userEmail ?? "—"}
                      </td>
                      <td className="py-2 truncate max-w-[16rem] text-muted">
                        {event.toolName ??
                          event.website ??
                          event.status ??
                          "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}