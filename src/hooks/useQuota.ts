/**
 * useQuota Hook
 * Loads tenant_quotas from the public schema (NOT silkbot schema).
 * This fixes the schema mismatch bug in the original UsageMonitor.tsx.
 *
 * Also calculates billing period countdown and usage percentage.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";

export interface Quota {
  id: string;
  tenant_name: string;
  total_tokens_used: number;
  token_limit: number;
  billing_period_start: string;
  is_active: boolean;
  updated_at: string;
}

interface UseQuotaReturn {
  quota: Quota | null;
  loading: boolean;
  error: string | null;
  /** Usage percentage (0-100), capped at 100 */
  usagePercent: number;
  /** Whether usage is above 85% threshold */
  isWarning: boolean;
  /** Whether usage is above 95% threshold */
  isCritical: boolean;
  /** Days remaining until billing period resets (assuming 30-day cycle) */
  daysUntilReset: number;
  /** Next reset date */
  nextResetDate: Date | null;
  reload: () => Promise<void>;
}

export function useQuota(): UseQuotaReturn {
  const [quota, setQuota] = useState<Quota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const loadQuota = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // CRITICAL FIX: Query public schema directly, NOT .schema("silkbot")
      const { data, error: fetchError } = await supabase
        .from("tenant_quotas")
        .select("*")
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      if (data) setQuota(data as Quota);
    } catch (err: any) {
      const msg = err?.message || "Failed to load quota data";
      setError(msg);
      console.error("[useQuota] Load error:", msg);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadQuota();

    // Realtime subscription for usage updates
    const channel = supabase
      .channel("public_tenant_quotas_monitor")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tenant_quotas",
        },
        (payload: { new: any }) => {
          console.log("[useQuota] Realtime Update:", payload.new);
          setQuota(payload.new as Quota);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadQuota, supabase]);

  const usagePercent = useMemo(() => {
    if (!quota || !quota.token_limit) return 0;
    return Math.min((quota.total_tokens_used / quota.token_limit) * 100, 100);
  }, [quota]);

  const isWarning = usagePercent > 85;
  const isCritical = usagePercent > 95;

  const { daysUntilReset, nextResetDate } = useMemo(() => {
    if (!quota?.billing_period_start) {
      return { daysUntilReset: 0, nextResetDate: null };
    }
    const start = new Date(quota.billing_period_start);
    const nextReset = new Date(start);
    nextReset.setDate(nextReset.getDate() + 30);

    // If next reset is in the past, calculate from now
    while (nextReset < new Date()) {
      nextReset.setDate(nextReset.getDate() + 30);
    }

    const now = new Date();
    const diffMs = nextReset.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return { daysUntilReset: days, nextResetDate: nextReset };
  }, [quota]);

  return {
    quota,
    loading,
    error,
    usagePercent,
    isWarning,
    isCritical,
    daysUntilReset,
    nextResetDate,
    reload: loadQuota,
  };
}
