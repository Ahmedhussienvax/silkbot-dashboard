import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import SuperBroadcastsClient from "./SuperBroadcastsClient";

export default async function SuperBroadcastsPage() {
    const supabase = await createClient();
    
    // MFA / Assurance Level 2 Verification
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        redirect("/auth/mfa");
    }

    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (!mfaData || mfaData.currentLevel !== 'aal2') {
        redirect("/auth/mfa");
    }

    return <SuperBroadcastsClient />;
}
