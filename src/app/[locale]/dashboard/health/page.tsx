"use client";
import { useGatewayHealth, ServiceStatus } from "@/hooks/useGatewayHealth";
import { useTranslations } from "next-intl";
import {
  Activity,
  RefreshCw,
  Server,
  Database,
  HardDrive,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  ServiceStatus,
  { color: string; bg: string; border: string; icon: typeof CheckCircle2; label: string }
> = {
  healthy: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
    label: "Operational",
  },
  degraded: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: AlertTriangle,
    label: "Degraded",
  },
  down: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: XCircle,
    label: "Down",
  },
  unknown: {
    color: "text-muted-foreground",
    bg: "bg-slate-500/10",
    border: "border-border",
    icon: HelpCircle,
    label: "Unknown",
  },
};

const SERVICE_META = [
  { key: "gateway" as const, label: "API Gateway", icon: Server, desc: "Handles all API routing and load balancing" },
  { key: "redis" as const, label: "Redis Cache", icon: HardDrive, desc: "Session store, bot config cache (5min TTL)" },
  { key: "supabase" as const, label: "Supabase DB", icon: Database, desc: "PostgreSQL + RLS tenant isolation" },
  { key: "worker" as const, label: "AI Worker", icon: Cpu, desc: "AI Hub message processing engine" },
];

export default function HealthPage() {
  const t = useTranslations("Health");
  const { health, dlq, loading, error, refresh } = useGatewayHealth();

  const allHealthy = health.gateway === "healthy" &&
    health.redis === "healthy" &&
    health.supabase === "healthy" &&
    health.worker === "healthy";

  const overallStatus: ServiceStatus = allHealthy
    ? "healthy"
    : [health.gateway, health.redis, health.supabase, health.worker].includes("down")
      ? "down"
      : [health.gateway, health.redis, health.supabase, health.worker].includes("degraded")
        ? "degraded"
        : "unknown";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Probing System Nodes...
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl border relative",
              STATUS_CONFIG[overallStatus].bg,
              STATUS_CONFIG[overallStatus].border
            )}>
              <Activity className={cn("w-5 h-5", STATUS_CONFIG[overallStatus].color)} />
              {overallStatus === "healthy" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              )}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.3em]",
              STATUS_CONFIG[overallStatus].color
            )}>
              {STATUS_CONFIG[overallStatus].label}
            </span>
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter italic">
            {t("title")}<span className="text-purple-500">.</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed italic">
            {t("description")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {health.lastChecked && (
            <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground">
                {health.lastChecked.toLocaleTimeString()}
              </span>
            </div>
          )}
          <button
            onClick={refresh}
            className="p-3 bg-surface text-muted-foreground rounded-2xl hover:bg-foreground/10 hover:text-foreground transition-all border border-border active:rotate-180 duration-500"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {SERVICE_META.map((service) => {
          const status = health[service.key];
          const cfg = STATUS_CONFIG[status];
          const StatusIcon = cfg.icon;

          return (
            <div
              key={service.key}
              className={cn(
                "relative group bg-gradient-to-br from-slate-900/60 to-black/60 backdrop-blur-2xl border rounded-[2rem] p-8 shadow-xl overflow-hidden transition-all duration-500 hover:scale-[1.02]",
                cfg.border
              )}
            >
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-600/5 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:bg-purple-600/10 transition-colors duration-1000" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "p-3 rounded-2xl border",
                    cfg.bg,
                    cfg.border
                  )}>
                    <service.icon className={cn("w-6 h-6", cfg.color)} />
                  </div>
                  <StatusIcon className={cn("w-5 h-5", cfg.color, status === "healthy" && "animate-pulse")} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">{service.label}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em] mt-1">{service.desc}</p>
                </div>

                <div className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border",
                  cfg.bg,
                  cfg.border
                )}>
                  <div className={cn("w-2 h-2 rounded-full", status === "healthy" ? "bg-emerald-500 animate-pulse" : status === "down" ? "bg-red-500" : "bg-amber-500")} />
                  <span className={cn("text-[11px] font-black uppercase tracking-widest", cfg.color)}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DLQ Section */}
      {dlq && dlq.totalFailed > 0 && (
        <section className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-[2rem] p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">Dead Letter Queue</h3>
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
                {dlq.totalFailed} Failed Messages
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dlq.queues.map((q, i) => (
              <div key={i} className="bg-surface border border-red-500/10 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-foreground truncate">{q.name}</p>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-red-400 font-mono">
                    Depth: {q.depth}
                  </span>
                  <span className="text-[10px] text-red-400 font-mono">
                    Failed: {q.failed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex items-center gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-300">Connection Issue</p>
            <p className="text-xs text-amber-400/70">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
