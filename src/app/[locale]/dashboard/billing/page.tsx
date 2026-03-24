"use client";
import { useTranslations } from "next-intl";
import { useQuota } from "@/hooks/useQuota";
import { useTenantConfig } from "@/hooks/useTenantConfig";
import {
  Zap,
  BarChart3,
  Clock,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Sparkles,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function BillingPage() {
  const t = useTranslations("Dashboard");
  const {
    quota,
    loading,
    error,
    usagePercent,
    isWarning,
    isCritical,
    daysUntilReset,
    nextResetDate,
    reload,
  } = useQuota();
  const { tenant } = useTenantConfig();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-dim">
          Loading_Billing_Data
        </span>
      </div>
    );
  }

  if (error || !quota) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-text-muted text-sm font-bold">Failed to load billing data</p>
        <button
          onClick={reload}
          className="flex items-center gap-2 px-6 py-3 bg-surface border border-glass-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const statusColor = isCritical
    ? "text-red-400"
    : isWarning
      ? "text-amber-400"
      : "text-emerald-400";
  const statusBg = isCritical
    ? "bg-red-500/10 border-red-500/20"
    : isWarning
      ? "bg-amber-500/10 border-amber-500/20"
      : "bg-emerald-500/10 border-emerald-500/20";
  const statusLabel = isCritical
    ? "Critical"
    : isWarning
      ? "Warning"
      : "Healthy";
  const barColor = isCritical
    ? "from-red-500 to-red-600"
    : isWarning
      ? "from-amber-500 to-orange-600"
      : "from-emerald-500 to-cyan-500";

  const usedFormatted = quota.total_tokens_used.toLocaleString();
  const limitFormatted = quota.token_limit.toLocaleString();
  const remainingTokens = Math.max(0, quota.token_limit - quota.total_tokens_used);
  const remainingFormatted = remainingTokens.toLocaleString();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Background Glows */}
      <div className="fixed top-20 right-1/4 w-[500px] h-[500px] bg-accent-primary/5 blur-[150px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent-primary/10 border border-accent-primary/20 rounded-full">
            <CreditCard className="w-3.5 h-3.5 text-accent-primary" />
            <span className="text-accent-primary font-black text-[10px] uppercase tracking-widest">
              Billing_&_Quota
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter italic leading-none">
            Usage Dashboard<span className="text-accent-primary">.</span>
          </h1>
          <p className="text-text-muted text-lg font-medium max-w-2xl leading-relaxed">
            Monitor token consumption, billing cycles, and plan quotas in real-time.
          </p>
        </div>

        <button
          onClick={reload}
          className="flex items-center gap-3 px-6 py-4 bg-surface border border-glass-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-foreground hover:border-accent-primary/30 transition-all group self-start lg:self-auto"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Refresh Data
        </button>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          {
            label: "Tokens_Used",
            value: usedFormatted,
            icon: <Zap className="w-5 h-5" />,
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/20",
          },
          {
            label: "Tokens_Remaining",
            value: remainingFormatted,
            icon: <BarChart3 className="w-5 h-5" />,
            color: statusColor,
            bg: statusBg,
          },
          {
            label: "Days_Until_Reset",
            value: daysUntilReset,
            icon: <Clock className="w-5 h-5" />,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10 border-cyan-500/20",
          },
          {
            label: "Plan_Status",
            value: statusLabel,
            icon: quota.is_active ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            ),
            color: quota.is_active ? "text-emerald-400" : "text-red-400",
            bg: quota.is_active
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-red-500/10 border-red-500/20",
          },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            key={stat.label}
            className="p-8 bg-surface border border-glass-border rounded-[2.5rem] backdrop-blur-xl space-y-4 group hover:bg-surface-hover transition-all shadow-xl"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform",
                stat.bg,
                stat.color
              )}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tracking-tighter">
                {stat.value}
              </div>
              <div className="text-[10px] text-text-dim font-black uppercase tracking-[0.2em] mt-1">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Main Usage Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface border border-glass-border rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-primary/5 blur-[150px] -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-primary/10 rounded-xl border border-accent-primary/20">
                <TrendingUp className="w-5 h-5 text-accent-primary" />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tight italic uppercase">
                Token Consumption
              </h2>
            </div>
            <p className="text-text-dim text-[11px] font-bold uppercase tracking-widest pl-11">
              {tenant?.name || "Tenant"} // Billing Cycle
            </p>
          </div>

          <div className={cn("flex items-center gap-3 px-5 py-3 rounded-2xl border", statusBg)}>
            {isCritical ? (
              <AlertCircle className={cn("w-4 h-4", statusColor)} />
            ) : (
              <ShieldCheck className={cn("w-4 h-4", statusColor)} />
            )}
            <span className={cn("text-[10px] font-black uppercase tracking-widest", statusColor)}>
              {usagePercent.toFixed(1)}% Utilized
            </span>
          </div>
        </div>

        {/* Usage Bar */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground tracking-tighter">
                {usedFormatted}
              </span>
              <span className="text-text-dim text-sm font-bold">
                / {limitFormatted} tokens
              </span>
            </div>
            <span className={cn("text-2xl font-black tracking-tighter", statusColor)}>
              {usagePercent.toFixed(1)}%
            </span>
          </div>

          <div className="relative h-6 bg-foreground/5 rounded-full overflow-hidden border border-glass-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={cn(
                "absolute inset-y-0 left-0 bg-gradient-to-r rounded-full shadow-lg",
                barColor
              )}
            />
            {/* Threshold markers */}
            <div className="absolute top-0 bottom-0 left-[85%] w-px bg-amber-500/40" title="Warning threshold (85%)" />
            <div className="absolute top-0 bottom-0 left-[95%] w-px bg-red-500/40" title="Critical threshold (95%)" />
          </div>

          <div className="flex justify-between text-[9px] font-black text-text-dim uppercase tracking-widest">
            <span>0</span>
            <span className="text-amber-400/60">85% Warning</span>
            <span className="text-red-400/60">95% Critical</span>
            <span>100%</span>
          </div>
        </div>

        {/* Warning Banner */}
        {(isWarning || isCritical) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={cn(
              "mt-8 p-6 rounded-2xl border flex items-start gap-4",
              isCritical ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"
            )}
          >
            <AlertCircle className={cn("w-5 h-5 flex-shrink-0 mt-0.5", isCritical ? "text-red-400" : "text-amber-400")} />
            <div>
              <p className={cn("text-sm font-black", isCritical ? "text-red-400" : "text-amber-400")}>
                {isCritical
                  ? "Token quota critically low — AI responses may be throttled."
                  : "Approaching token limit. Consider upgrading your plan."}
              </p>
              <p className="text-text-dim text-xs font-medium mt-1">
                {remainingFormatted} tokens remaining. Resets in {daysUntilReset} days.
              </p>
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Bottom Grid: Billing Details + Upgrade CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Cycle Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-surface border border-glass-border rounded-[3rem] p-10 backdrop-blur-xl shadow-xl space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
              <Calendar className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight italic uppercase">
                Billing Cycle
              </h3>
              <p className="text-[10px] text-text-dim font-bold uppercase tracking-[0.2em]">
                30-Day Rolling Period
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "Period Start",
                value: quota.billing_period_start
                  ? new Date(quota.billing_period_start).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A",
              },
              {
                label: "Next Reset",
                value: nextResetDate
                  ? nextResetDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A",
              },
              {
                label: "Days Remaining",
                value: `${daysUntilReset} days`,
              },
              {
                label: "Tenant",
                value: quota.tenant_name || tenant?.name || "—",
              },
              {
                label: "Last Updated",
                value: quota.updated_at
                  ? new Date(quota.updated_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-4 border-b border-glass-border last:border-0"
              >
                <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">
                  {item.label}
                </span>
                <span className="text-sm font-black text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-accent-primary/10 to-purple-500/5 border border-accent-primary/20 rounded-[3rem] p-10 backdrop-blur-xl shadow-xl relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent-primary/10 blur-[100px] -z-10 pointer-events-none group-hover:bg-accent-primary/20 transition-colors duration-1000" />

          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-3xl inline-block shadow-inner border border-white/10">
              <Sparkles className="w-10 h-10 text-accent-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-foreground tracking-tight italic">
                Need More Power<span className="text-accent-primary">?</span>
              </h3>
              <p className="text-text-muted text-sm font-medium leading-relaxed mt-3 max-w-sm">
                Upgrade your plan for higher token limits, priority AI processing, and advanced
                analytics. Scale your automation without limits.
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-10">
            <a
              href="/pricing"
              className="w-full flex items-center justify-center gap-3 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl hover:bg-accent-primary hover:text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl"
            >
              <ArrowUpRight className="w-4 h-4" />
              View Plans
            </a>
            <p className="text-[9px] text-text-dim text-center font-bold italic opacity-50">
              Changes apply instantly with zero downtime
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
