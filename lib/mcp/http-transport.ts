import { createRevelMcpServer } from "@/lib/mcp/create-server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

/**
 * Stateless Streamable HTTP handler for Next.js / Vercel.
 * Creates a fresh transport + server per request (serverless-safe).
 */
export async function handleMcpHttpRequest(
  request: Request
): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  const server = createRevelMcpServer();
  await server.connect(transport);

  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
}