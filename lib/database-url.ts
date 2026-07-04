/**
 * Encode credentials in Postgres URLs when passwords contain @, #, /, etc.
 */
export function resolveDatabaseUrl(url?: string): string {
  if (!url) {
    throw new Error("Database URL is not set");
  }

  try {
    new URL(url);
    return url;
  } catch {
    const prefix = "postgresql://";
    if (!url.startsWith(prefix)) {
      throw new Error("Invalid database URL format");
    }

    const rest = url.slice(prefix.length);
    const hostMarker = rest.search(/@(aws-|db\.)/);
    if (hostMarker === -1) {
      throw new Error("Could not parse database URL — check DIRECT_URL / DATABASE_URL");
    }

    const credentials = rest.slice(0, hostMarker);
    const hostAndPath = rest.slice(hostMarker + 1);
    const separator = credentials.indexOf(":");

    if (separator === -1) {
      throw new Error("Database URL is missing a password segment");
    }

    const user = credentials.slice(0, separator);
    const password = credentials.slice(separator + 1);

    return `${prefix}${encodeURIComponent(user)}:${encodeURIComponent(password)}@${hostAndPath}`;
  }
}