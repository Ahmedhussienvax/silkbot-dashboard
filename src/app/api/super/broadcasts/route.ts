import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
    // 1. Authenticate user session
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!mfaData || mfaData.currentLevel !== 'aal2') {
        return NextResponse.json({ success: false, error: "Missing MFA verification" }, { status: 403 });
    }

    // 2. Extract Gateway secrets from server environment
    const gUrl = process.env.GATEWAY_URL || "http://localhost:3000";
    const apiKey = process.env.GATEWAY_API_KEY;

    if (!apiKey) {
        console.error("GATEWAY_API_KEY is missing from environment variables.");
        return NextResponse.json({ success: false, error: "Internal Server Configuration Error" }, { status: 500 });
    }

    // 3. Forward request body to backend Gateway API
    const backendUrl = new URL(`${gUrl}/api/super/broadcasts`);

    try {
        const body = await req.json();

        const response = await fetch(backendUrl.toString(), {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: "Backend validation failed", details: await response.text() },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error connecting to backend gateway APIs:", error);
        return NextResponse.json({ success: false, error: "Gateway connection timeout" }, { status: 504 });
    }
}
