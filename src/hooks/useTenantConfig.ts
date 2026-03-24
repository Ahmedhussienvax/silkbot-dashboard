/**
 * useTenantConfig Hook
 * Extracted from settings/page.tsx to enable shared tenant data access
 * across multiple pages (Settings, Bot, WhatsApp, Dashboard).
 *
 * Uses RLS — only returns the authenticated user's tenant record.
 */
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";

export interface Tenant {
  id: string;
  name: string;
  wa_session: string;
  industry: string;
  timezone: string;
  settings: Record<string, any>;
  api_key?: string;
  instance_id?: string;
}

interface UseTenantConfigReturn {
  tenant: Tenant | null;
  setTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
  loading: boolean;
  error: string | null;
  saveTenant: () => Promise<boolean>;
  saving: boolean;
  reload: () => Promise<void>;
}

export function useTenantConfig(): UseTenantConfigReturn {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadTenant = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("tenants")
        .select("*")
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      if (data) setTenant(data as Tenant);
    } catch (err: any) {
      const msg = err?.message || "Failed to load tenant configuration";
      setError(msg);
      console.error("[useTenantConfig] Load error:", msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  /**
   * Persists current tenant state to Supabase.
   * Returns true on success, false on failure.
   */
  const saveTenant = useCallback(async (): Promise<boolean> => {
    if (!tenant) return false;
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from("tenants")
        .update({
          name: tenant.name,
          industry: tenant.industry,
          timezone: tenant.timezone,
          settings: tenant.settings,
          wa_session: tenant.wa_session,
        })
        .eq("id", tenant.id);

      if (updateError) throw updateError;
      return true;
    } catch (err: any) {
      const msg = err?.message || "Failed to save tenant configuration";
      toast.error(msg);
      console.error("[useTenantConfig] Save error:", msg);
      return false;
    } finally {
      setSaving(false);
    }
  }, [tenant, supabase]);

  return {
    tenant,
    setTenant,
    loading,
    error,
    saveTenant,
    saving,
    reload: loadTenant,
  };
}
