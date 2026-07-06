import { handlers } from "@/auth";

const { GET, POST } = handlers;

/**
 * Auth.js only supports GET/POST. Tools and prefetchers may send HEAD to auth
 * routes; return 200 so it does not surface as UnknownAction in logs.
 */
export async function HEAD() {
  return new Response(null, { status: 200 });
}

export { GET, POST };