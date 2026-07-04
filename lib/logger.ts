type LogEvent =
  | "analysis_started"
  | "analysis_completed"
  | "analysis_failed"
  | "export_completed";

export function logEvent(
  event: LogEvent,
  data: Record<string, unknown> = {}
): void {
  const entry = {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  };

  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(entry));
  } else {
    console.log(`[Revel] ${event}`, data);
  }
}