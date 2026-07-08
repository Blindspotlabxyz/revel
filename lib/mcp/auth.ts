export function getMcpApiKey(): string | undefined {
  return process.env.MCP_API_KEY?.trim() || undefined;
}

export function isMcpHttpEnabled(): boolean {
  return Boolean(getMcpApiKey()) || process.env.NODE_ENV === "development";
}

export function validateMcpRequest(request: Request): boolean {
  const key = getMcpApiKey();
  if (!key) {
    return process.env.NODE_ENV === "development";
  }

  const authorization = request.headers.get("authorization");
  if (authorization === `Bearer ${key}`) {
    return true;
  }

  return request.headers.get("x-revel-mcp-key") === key;
}

export function mcpUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({
      error: "Unauthorized",
      hint: "Set Authorization: Bearer <MCP_API_KEY> or X-Revel-MCP-Key header",
    }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}