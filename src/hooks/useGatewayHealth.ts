/**
 * useGatewayHealth Hook
 * Polls the gateway health endpoint every 30 seconds.
 * Provides deterministic service status for the System Health Dashboard.
 *
 * Implements graceful degradation: if the gateway is unreachable,
 * all services are marked as "unknown" rather than crashing.
 */
import { useState, useEffect, useCallback, useRef } from "react";

export type ServiceStatus = "healthy" | "degraded" | "down" | "unknown";

export interface HealthData {
  gateway: ServiceStatus;
  redis: ServiceStatus;
  supabase: ServiceStatus;
  worker: ServiceStatus;
  lastChecked: Date | null;
  raw: Record<string, any> | null;
}

export interface DLQData {
  queues: { name: string; depth: number; failed: number }[];
  totalFailed: number;
}

interface UseGatewayHealthReturn {
  health: HealthData;
  dlq: DLQData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DEFAULT_HEALTH: HealthData = {
  gateway: "unknown",
  redis: "unknown",
  supabase: "unknown",
  worker: "unknown",
  lastChecked: null,
  raw: null,
};

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export function useGatewayHealth(): UseGatewayHealthReturn {
  const [health, setHealth] = useState<HealthData>(DEFAULT_HEALTH);
  const [dlq, setDlq] = useState<DLQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Maps raw gateway health response to a normalized HealthData.
   * Handles various response formats defensively.
   */
  const parseHealthResponse = useCallback(
    (data: Record<string, any>): HealthData => {
      const mapStatus = (val: any): ServiceStatus => {
        if (!val) return "unknown";
        if (typeof val === "string") {
          if (val === "ok" || val === "healthy" || val === "connected")
            return "healthy";
          if (val === "degraded" || val === "slow") return "degraded";
          if (val === "down" || val === "error" || val === "disconnected")
            return "down";
        }
        if (typeof val === "boolean") return val ? "healthy" : "down";
        return "unknown";
      };

      return {
        gateway: data.error ? "down" : "healthy",
        redis: mapStatus(data.redis || data.cache),
        supabase: mapStatus(data.supabase || data.database || data.db),
        worker: mapStatus(data.worker || data.processor),
        lastChecked: new Date(),
        raw: data,
      };
    },
    []
  );

  const fetchHealth = useCallback(async () => {
    try {
      // Fetch health + DLQ in parallel
      const [healthRes, dlqRes] = await Promise.allSettled([
        fetch("/api/gateway/health", { cache: "no-store" }),
        fetch("/api/gateway/health/dlq", { cache: "no-store" }),
      ]);

      // Process health
      if (healthRes.status === "fulfilled" && healthRes.value.ok) {
        const data = await healthRes.value.json();
        setHealth(parseHealthResponse(data));
        setError(null);
      } else {
        setHealth({
          ...DEFAULT_HEALTH,
          gateway: "down",
          lastChecked: new Date(),
        });
        setError("Gateway unreachable");
      }

      // Process DLQ
      if (dlqRes.status === "fulfilled" && dlqRes.value.ok) {
        const dlqData = await dlqRes.value.json();
        const queues = Array.isArray(dlqData.queues)
          ? dlqData.queues
          : Array.isArray(dlqData)
            ? dlqData
            : [];
        const totalFailed = queues.reduce(
          (sum: number, q: any) => sum + (q.depth || q.failed || 0),
          0
        );
        setDlq({ queues, totalFailed });
      }
    } catch (err: any) {
      setHealth({
        ...DEFAULT_HEALTH,
        gateway: "down",
        lastChecked: new Date(),
      });
      setError(err?.message || "Health check failed");
    } finally {
      setLoading(false);
    }
  }, [parseHealthResponse]);

  useEffect(() => {
    fetchHealth();

    // Set up polling interval
    intervalRef.current = setInterval(fetchHealth, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchHealth]);

  return {
    health,
    dlq,
    loading,
    error,
    refresh: fetchHealth,
  };
}
