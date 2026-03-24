import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import GlobalAudiencesClient from "./GlobalAudiencesClient";

export default async function AudiencesPage() {
    const supabase = await createClient();
    
    // MFA / Assurance Level 2 Verification per guidelines
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/auth/mfa");
    }

    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!mfaData || mfaData.currentLevel !== 'aal2') {
        redirect("/auth/mfa");
    }

    return <GlobalAudiencesClient />;
}
