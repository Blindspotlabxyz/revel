import { AsyncLocalStorage } from "node:async_hooks";

export type ActivitySource =
  | "website"
  | "mcp_okx"
  | "mcp_dev"
  | "api_audit"
  | "partner_api";

export type ActivityContext = {
  source: ActivitySource;
  userId?: string | null;
  paid?: boolean;
};

const storage = new AsyncLocalStorage<ActivityContext>();

export function runWithActivityContext<T>(
  context: ActivityContext,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return storage.run(context, fn);
}

export function getActivityContext(): ActivityContext | undefined {
  return storage.getStore();
}