/**
 * Gateway DLQ (Dead Letter Queue) Health Proxy Route
 * Proxies to GET /api/health/dlq on the Gateway server.
 * Requires authentication — uses the shared gatewayProxy helper.
 */
import { NextRequest } from "next/server";
import { gatewayProxy } from "@/app/api/gateway/proxy";

export async function GET(req: NextRequest) {
  return gatewayProxy(req, {
    gatewayPath: "/api/health/dlq",
    method: "GET",
  });
}
