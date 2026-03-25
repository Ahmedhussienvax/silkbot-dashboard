"use client";

import { useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase-browser";

interface RoleGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    allowedGlobalRoles?: string[];
    allowedTenantRoles?: string[];
    requireSuperAdmin?: boolean;
}

/**
 * RoleGuard Component (Skill 17: Enterprise RBAC)
 * Protects UI elements based on JWT claims (custom_access_token_hook).
 */
export const RoleGuard = ({ 
    children, 
    fallback = null, 
    allowedGlobalRoles, 
    allowedTenantRoles,
    requireSuperAdmin = false
}: RoleGuardProps) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        fetchUser();
    }, []);

    if (loading) return <div className="animate-pulse bg-surface/50 h-20 rounded-xl" />;

    if (!user) return fallback as ReactNode;

    const globalRole = user.app_metadata?.global_role || 'user';
    const tenantRole = user.app_metadata?.tenant_role || 'agent';

    const isGlobalAdmin = globalRole === 'superadmin' || globalRole === 'systemadmin';

    // 1. Check SuperAdmin Requirement
    if (requireSuperAdmin && globalRole !== 'superadmin') {
        return fallback as ReactNode;
    }

    // 2. Check Global Roles whitelist
    if (allowedGlobalRoles && !allowedGlobalRoles.includes(globalRole) && globalRole !== 'superadmin') {
        return fallback as ReactNode;
    }

    // 3. Check Tenant Roles whitelist (Bypass if Global Admin)
    if (allowedTenantRoles && !allowedTenantRoles.includes(tenantRole) && !isGlobalAdmin) {
        return fallback as ReactNode;
    }

    return <>{children}</>;
};
