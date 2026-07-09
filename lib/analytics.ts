import { getPrisma } from "@/lib/prisma";

export type AnalyticsDashboard = {
  generatedAt: string;
  users: {
    total: number;
    newThisWeek: number;
    admins: number;
  };
  analyses: {
    total: number;
    thisWeek: number;
    completed: number;
    failed: number;
    processing: number;
    bySourceThisWeek: Record<string, number>;
  };
  mcp: {
    toolCallsThisWeek: number;
    toolBreakdown: Array<{ tool: string; count: number }>;
    okxPaidThisWeek: number;
  };
  exports: {
    thisWeek: number;
    total: number;
  };
  recentActivity: Array<{
    id: string;
    eventType: string;
    source: string;
    toolName: string | null;
    website: string | null;
    status: string | null;
    userEmail: string | null;
    createdAt: string;
  }>;
  topUsers: Array<{
    userId: string;
    email: string | null;
    analysisCount: number;
  }>;
  dailyVolume: Array<{
    date: string;
    website: number;
    mcpOkx: number;
    mcpDev: number;
    apiAudit: number;
    partnerApi: number;
  }>;
};

function startOfUtcWeek(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  start.setUTCDate(start.getUTCDate() - daysFromMonday);
  return start;
}

function startOfUtcDay(daysAgo = 0): Date {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  start.setUTCDate(start.getUTCDate() - daysAgo);
  return start;
}

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const weekStart = startOfUtcWeek();
  const sevenDaysAgo = startOfUtcDay(6);

  const [
    totalUsers,
    newUsersThisWeek,
    adminCount,
    totalAnalyses,
    analysesThisWeek,
    analysisStatusGroups,
    activityThisWeek,
    exportEvents,
    recentEvents,
    topUsersRaw,
    dailyEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.user.count({ where: { isAdmin: true } }),
    prisma.analysis.count(),
    prisma.analysis.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.analysis.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.activityEvent.findMany({
      where: { createdAt: { gte: weekStart } },
      select: {
        eventType: true,
        source: true,
        toolName: true,
        metadata: true,
      },
    }),
    prisma.activityEvent.groupBy({
      by: ["eventType"],
      where: { eventType: "export_completed" },
      _count: { eventType: true },
    }),
    prisma.activityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        user: { select: { email: true } },
      },
    }),
    prisma.analysis.groupBy({
      by: ["userId"],
      where: { userId: { not: null }, createdAt: { gte: weekStart } },
      _count: { userId: true },
      orderBy: { _count: { userId: "desc" } },
      take: 10,
    }),
    prisma.activityEvent.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        eventType: {
          in: ["analysis_started", "mcp_tool_call", "analysis_completed"],
        },
      },
      select: { source: true, createdAt: true },
    }),
  ]);

  const statusMap = Object.fromEntries(
    analysisStatusGroups.map((row) => [row.status, row._count.status])
  );

  const bySourceThisWeek: Record<string, number> = {};
  let mcpToolCalls = 0;
  let okxPaid = 0;
  const toolCounts = new Map<string, number>();

  for (const event of activityThisWeek) {
    bySourceThisWeek[event.source] = (bySourceThisWeek[event.source] ?? 0) + 1;

    if (event.eventType === "mcp_tool_call") {
      mcpToolCalls += 1;
      const tool = event.toolName ?? "unknown";
      toolCounts.set(tool, (toolCounts.get(tool) ?? 0) + 1);
    }

    if (
      event.source === "mcp_okx" ||
      (event.metadata &&
        typeof event.metadata === "object" &&
        event.metadata !== null &&
        "paid" in event.metadata &&
        (event.metadata as { paid?: boolean }).paid)
    ) {
      okxPaid += 1;
    }
  }

  const topUserIds = topUsersRaw
    .map((row) => row.userId)
    .filter((id): id is string => Boolean(id));

  const topUserEmails =
    topUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: topUserIds } },
          select: { id: true, email: true },
        })
      : [];

  const emailById = new Map(topUserEmails.map((u) => [u.id, u.email]));

  const dailyVolumeMap = new Map<
    string,
    {
      website: number;
      mcpOkx: number;
      mcpDev: number;
      apiAudit: number;
      partnerApi: number;
    }
  >();

  for (let i = 6; i >= 0; i -= 1) {
    const day = startOfUtcDay(i).toISOString().slice(0, 10);
    dailyVolumeMap.set(day, {
      website: 0,
      mcpOkx: 0,
      mcpDev: 0,
      apiAudit: 0,
      partnerApi: 0,
    });
  }

  for (const event of dailyEvents) {
    if (!event.createdAt) continue;
    const day = event.createdAt.toISOString().slice(0, 10);
    const bucket = dailyVolumeMap.get(day);
    if (!bucket) continue;

    if (event.source === "website") bucket.website += 1;
    else if (event.source === "mcp_okx") bucket.mcpOkx += 1;
    else if (event.source === "mcp_dev") bucket.mcpDev += 1;
    else if (event.source === "api_audit") bucket.apiAudit += 1;
    else if (event.source === "partner_api") bucket.partnerApi += 1;
  }

  const exportTotal = exportEvents.reduce(
    (sum, row) => sum + row._count.eventType,
    0
  );
  const exportThisWeek = activityThisWeek.filter(
    (e) => e.eventType === "export_completed"
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    users: {
      total: totalUsers,
      newThisWeek: newUsersThisWeek,
      admins: adminCount,
    },
    analyses: {
      total: totalAnalyses,
      thisWeek: analysesThisWeek,
      completed: statusMap.completed ?? 0,
      failed: statusMap.failed ?? 0,
      processing: statusMap.processing ?? 0,
      bySourceThisWeek,
    },
    mcp: {
      toolCallsThisWeek: mcpToolCalls,
      toolBreakdown: [...toolCounts.entries()]
        .map(([tool, count]) => ({ tool, count }))
        .sort((a, b) => b.count - a.count),
      okxPaidThisWeek: okxPaid,
    },
    exports: {
      thisWeek: exportThisWeek,
      total: exportTotal,
    },
    recentActivity: recentEvents.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      source: event.source,
      toolName: event.toolName,
      website: event.website,
      status: event.status,
      userEmail: event.user?.email ?? null,
      createdAt: event.createdAt?.toISOString() ?? new Date().toISOString(),
    })),
    topUsers: topUsersRaw
      .filter((row) => row.userId)
      .map((row) => ({
        userId: row.userId!,
        email: emailById.get(row.userId!) ?? null,
        analysisCount: row._count.userId,
      })),
    dailyVolume: [...dailyVolumeMap.entries()].map(([date, counts]) => ({
      date,
      ...counts,
    })),
  };
}