/**
 * useRealtimeTraces Hook
 * Subscribes to Supabase Realtime postgres_changes on ai_traces table.
 * Provides live AI reasoning traces filtered by tenant_name.
 *
 * Supports severity filtering and conversation thread grouping.
 * Cleans up the Realtime channel on unmount to prevent memory leaks.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";

export interface AITrace {
  id: string;
  trace_type: string;
  content: string;
  agent_name: string;
  tenant_name: string;
  instance_name?: string;
  conversation_id?: string;
  severity: "info" | "warning" | "error";
  metadata: Record<string, any>;
  created_at: string;
  /** Display-friendly timestamp */
  timestamp: string;
}

export type SeverityFilter = "all" | "info" | "warning" | "error";

interface UseRealtimeTracesOptions {
  tenantName: string | null;
  /** Maximum number of traces to keep in memory (prevent unbounded growth) */
  maxTraces?: number;
  /** Initial page size for history load */
  initialLimit?: number;
  /** Whether to enable realtime subscription */
  enableRealtime?: boolean;
}

interface UseRealtimeTracesReturn {
  traces: AITrace[];
  loading: boolean;
  error: string | null;
  severityFilter: SeverityFilter;
  setSeverityFilter: (filter: SeverityFilter) => void;
  /** Traces grouped by conversation_id (for thread view) */
  conversationThreads: Map<string, AITrace[]>;
  /** Filtered traces based on current severity filter */
  filteredTraces: AITrace[];
  /** Load more traces (pagination) */
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

function mapTrace(raw: any): AITrace {
  return {
    id: raw.id,
    trace_type: raw.trace_type || "thought",
    content: raw.content || "",
    agent_name: raw.agent_name || "System",
    tenant_name: raw.tenant_name || "",
    instance_name: raw.instance_name,
    conversation_id: raw.conversation_id,
    severity: raw.severity || "info",
    metadata: raw.metadata || {},
    created_at: raw.created_at,
    timestamp: raw.created_at
      ? new Date(raw.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Recently",
  };
}

export function useRealtimeTraces({
  tenantName,
  maxTraces = 100,
  initialLimit = 20,
  enableRealtime = true,
}: UseRealtimeTracesOptions): UseRealtimeTracesReturn {
  const [traces, setTraces] = useState<AITrace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const supabase = createClient();

  // Load initial traces
  const loadTraces = useCallback(async () => {
    if (!tenantName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("ai_traces")
        .select("*")
        .eq("tenant_name", tenantName)
        .order("created_at", { ascending: false })
        .limit(initialLimit);

      if (fetchError) throw fetchError;

      const mapped = (data || []).map(mapTrace);
      setTraces(mapped);
      setOffset(mapped.length);
      setHasMore((data?.length || 0) >= initialLimit);
    } catch (err: any) {
      setError(err?.message || "Failed to load traces");
      console.error("[useRealtimeTraces] Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantName, supabase, initialLimit]);

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (!tenantName || !hasMore) return;
    try {
      const { data, error: fetchError } = await supabase
        .from("ai_traces")
        .select("*")
        .eq("tenant_name", tenantName)
        .order("created_at", { ascending: false })
        .range(offset, offset + initialLimit - 1);

      if (fetchError) throw fetchError;

      const mapped = (data || []).map(mapTrace);
      setTraces((prev) => [...prev, ...mapped]);
      setOffset((prev) => prev + mapped.length);
      setHasMore(mapped.length >= initialLimit);
    } catch (err: any) {
      console.error("[useRealtimeTraces] LoadMore error:", err);
    }
  }, [tenantName, supabase, offset, hasMore, initialLimit]);

  // Initial load
  useEffect(() => {
    loadTraces();
  }, [loadTraces]);

  // Realtime subscription
  useEffect(() => {
    if (!tenantName || !enableRealtime) return;

    const channel = supabase
      .channel(`ai_traces_rt_${tenantName}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_traces",
          filter: `tenant_name=eq.${tenantName}`,
        },
        (payload: { new: Record<string, any> }) => {
          const newTrace = mapTrace(payload.new);
          setTraces((prev) => [newTrace, ...prev].slice(0, maxTraces));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantName, supabase, maxTraces, enableRealtime]);

  // Filtered traces
  const filteredTraces = useMemo(() => {
    if (severityFilter === "all") return traces;
    return traces.filter((t) => t.severity === severityFilter);
  }, [traces, severityFilter]);

  // Group by conversation_id
  const conversationThreads = useMemo(() => {
    const threads = new Map<string, AITrace[]>();
    for (const trace of traces) {
      const key = trace.conversation_id || "unattached";
      const existing = threads.get(key) || [];
      existing.push(trace);
      threads.set(key, existing);
    }
    return threads;
  }, [traces]);

  return {
    traces,
    loading,
    error,
    severityFilter,
    setSeverityFilter,
    conversationThreads,
    filteredTraces,
    loadMore,
    hasMore,
  };
}
