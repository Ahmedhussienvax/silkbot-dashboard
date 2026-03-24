/**
 * Gateway Health Proxy Route
 * Proxies to GET /health on the Gateway server.
 * No auth required at gateway level, but goes through our proxy
 * to protect the API key and handle CORS.
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
    const gatewayApiKey = process.env.GATEWAY_API_KEY;

    if (!gatewayUrl) {
      return NextResponse.json(
        { error: "Gateway configuration missing" },
        { status: 500 }
      );
    }

    const response = await fetch(`${gatewayUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(gatewayApiKey && { "x-api-key": gatewayApiKey }),
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({
      error: "Invalid gateway response",
    }));

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Gateway Health Proxy Error]:", error);
    return NextResponse.json(
      {
        gateway: "unreachable",
        error: error?.message || "Cannot reach gateway",
      },
      { status: 503 }
    );
  }
}
