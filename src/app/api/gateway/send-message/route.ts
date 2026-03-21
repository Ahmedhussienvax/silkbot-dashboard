import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { instance, to, message } = await req.json();
    if (!instance || !to || !message) {
      return NextResponse.json(
        { error: "Missing required fields: instance, to, message" },
        { status: 400 }
      );
    }

    // Security Hardening: Verify User Session and Instance Ownership (Skill 10)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership of this instance in the tenants table
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .or(`instance_id.eq.${instance},name.eq.${instance}`)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this instance" },
        { status: 403 }
      );
    }

    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
    const gatewayApiKey = process.env.GATEWAY_API_KEY;

    if (!gatewayUrl || !gatewayApiKey) {
      return NextResponse.json(
        { error: "Gateway server configuration missing" },
        { status: 500 }
      );
    }

    const response = await fetch(`${gatewayUrl}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": gatewayApiKey,
      },
      body: JSON.stringify({ instance, to, message }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({ error: "Invalid gateway response" }));
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
