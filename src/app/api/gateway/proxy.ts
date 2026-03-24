// Shared proxy helper for all gateway API routes
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

interface ProxyOptions {
  gatewayPath: string;
  method?: "GET" | "POST" | "DELETE";
  extractInstance?: (body: any, params?: any) => string;
  transformBody?: (body: any) => any;
  dynamicPath?: boolean; // If true, gatewayPath is a base path needing name suffix
}

export async function gatewayProxy(req: NextRequest, options: ProxyOptions) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = options.method !== "GET" ? await req.json().catch(() => ({})) : {};
    const instanceName = options.extractInstance ? options.extractInstance(body) : "";

    // If instance is provided, verify tenant ownership via RLS-protected query
    if (instanceName) {
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("id")
        .or(`instance_id.eq.${instanceName},name.eq.${instanceName}`)
        .single();

      if (tenantError || !tenant) {
        return NextResponse.json(
          { error: "Forbidden: You do not own this instance" },
          { status: 403 }
        );
      }
    }

    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
    const gatewayApiKey = process.env.GATEWAY_API_KEY; // Server-only secret

    if (!gatewayUrl || !gatewayApiKey) {
      console.error("[Gateway Proxy Error] config missing:", { gatewayUrl, gatewayApiKey: !!gatewayApiKey });
      return NextResponse.json(
        { error: "Gateway configuration missing" },
        { status: 500 }
      );
    }

    // Dynamic path handling for status/qr/logout/create routes
    let targetPath = options.gatewayPath;
    if (options.dynamicPath && instanceName) {
      targetPath = `${options.gatewayPath}${instanceName}`;
    }

    const fetchUrl = `${gatewayUrl}${targetPath}`;
    console.log(`[Gateway Proxy] Forwarding to: ${options.method || 'POST'} ${fetchUrl}`);

    const response = await fetch(fetchUrl, {
      method: options.method || "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": gatewayApiKey,
        "apikey": gatewayApiKey, // For some instance endpoints that expect apikey
      },
      ...(options.method !== "GET" && {
        body: JSON.stringify(options.transformBody ? options.transformBody(body) : body),
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({ error: "Invalid gateway response" }));
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("[Gateway Proxy Fatal Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
