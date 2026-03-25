"use client";
import { useTranslations } from "next-intl";
import { useQuota, useTenantConfig, useRoles } from "@/hooks";
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
  Activity,
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
  const { userRoles, loading: rolesLoading } = useRoles();
  
  const isOwner = userRoles?.tenant === "owner";
  const isGlobalAdmin = userRoles?.global === "superadmin" || userRoles?.global === "systemadmin";

  if (loading || rolesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-dim-foreground">
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
        <p className="text-muted-foreground text-sm font-bold">Failed to load billing data</p>
        <button
          onClick={reload}
          className="flex items-center gap-2 px-6 py-3 bg-surface border border-glass-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
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
          <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed">
            Monitor token consumption, billing cycles, and plan quotas in real-time.
          </p>
        </div>

        <button
          onClick={reload}
          className="flex items-center gap-3 px-6 py-4 bg-surface border border-glass-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-accent-primary/30 transition-all group self-start lg:self-auto"
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
              <div className="text-[10px] text-dim-foreground font-black uppercase tracking-[0.2em] mt-1">
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
            <p className="text-dim-foreground text-[11px] font-bold uppercase tracking-widest pl-11">
              {tenant?.name || "Tenant"}
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
              <span className="text-dim-foreground text-sm font-bold">
                / {limitFormatted} tokens
              </span>
            </div>
            <span className={cn("text-2xl font-black tracking-tighter", statusColor)}>
              {usagePercent.toFixed(1)}%
            </span>
          </div>

          <div className="relative h-6 bg-surface rounded-full overflow-hidden border border-glass-border">
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

          <div className="flex justify-between text-[9px] font-black text-dim-foreground uppercase tracking-widest">
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
              <p className="text-dim-foreground text-xs font-medium mt-1">
                {remainingFormatted} tokens remaining. Resets in {daysUntilReset} days.
              </p>
            </div>
          </motion.div>
        )}
      </motion.section>
      {/* Bottom Grid: Billing Details + History + Capability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
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
              <p className="text-[10px] text-dim-foreground font-bold uppercase tracking-[0.2em]">
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
                <span className="text-[10px] font-black text-dim-foreground uppercase tracking-widest">
                  {item.label}
                </span>
                <span className="text-sm font-black text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Billing History */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-surface border border-glass-border rounded-[3rem] p-10 backdrop-blur-3xl shadow-3xl space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] -z-10 pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <RefreshCw className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight italic uppercase">Subscription Governance</h3>
              <p className="text-[10px] text-dim-foreground font-bold uppercase tracking-[0.2em]">Compliance & Audit History</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 text-[9px] font-black text-dim-foreground uppercase tracking-widest px-4 border-b border-glass-border pb-4">
              <span>Date</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>
            {[
              { date: "Mar 01, 2026", status: "Processed", amount: "$99.00", color: "text-emerald-400" },
              { date: "Feb 01, 2026", status: "Processed", amount: "$99.00", color: "text-emerald-400" },
              { date: "Jan 01, 2026", status: "Processed", amount: "$99.00", color: "text-emerald-400" },
            ].map((invoice, idx) => (
              <div key={idx} className="grid grid-cols-3 text-sm font-black text-foreground px-4 py-3 hover:bg-surface-hover rounded-xl transition-all cursor-pointer group">
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">{invoice.date}</span>
                <span className={cn("text-[10px] uppercase tracking-tighter self-center", invoice.color)}>{invoice.status}</span>
                <span className="text-right opacity-70 group-hover:opacity-100 transition-opacity">{invoice.amount}</span>
              </div>
            ))}
            <div className="text-center pt-4">
              <button className="text-[10px] font-black text-accent-primary uppercase tracking-[0.3em] hover:underline transition-all">Download Full Audit_Report</button>
            </div>
          </div>
        </motion.div>

        {/* Feature Matrix / Capability */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
          className="bg-surface border border-glass-border rounded-[3rem] p-10 backdrop-blur-3xl shadow-3xl space-y-8 relative overflow-hidden lg:col-span-2"
        >
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] -z-10 pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <Activity className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight italic uppercase">Enterprise Capability</h3>
              <p className="text-[10px] text-dim-foreground font-bold uppercase tracking-[0.2em]">Service Expansion Metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex items-center justify-between p-6 bg-surface-hover rounded-[2rem] border border-glass-border shadow-inner">
                <div>
                  <h4 className="text-[11px] font-black uppercase text-foreground">Worker Efficiency</h4>
                  <p className="text-2xl font-black text-amber-400 italic mt-1">99.98% <span className="text-[10px] font-medium text-dim-foreground tracking-tight">System_Uptime</span></p>
                </div>
                <div className="w-12 h-12 rounded-full border border-amber-500/20 flex items-center justify-center bg-amber-500/10">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
             </div>

             <div className="flex items-center justify-between p-6 bg-surface-hover rounded-[2rem] border border-glass-border shadow-inner">
                <div>
                  <h4 className="text-[11px] font-black uppercase text-foreground">Projected Cost Savings</h4>
                  <p className="text-2xl font-black text-emerald-400 italic mt-1">$4,290.00 <span className="text-[10px] font-medium text-dim-foreground tracking-tight">Manual_Labor_Hedged</span></p>
                </div>
                <div className="w-12 h-12 rounded-full border border-emerald-500/20 flex items-center justify-center bg-emerald-500/10">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {(!isGlobalAdmin && isOwner) && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-indigo-500/20 via-surface to-background border border-glass-border rounded-[4rem] p-12 lg:p-20 text-center space-y-10 relative overflow-hidden group shadow-3xl"
        >
          <div className="absolute inset-0 bg-accent-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-1000" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-primary/20 blur-[150px] rounded-full group-hover:bg-accent-primary/30 transition-all duration-1000" />
          
          <div className="p-8 bg-surface border border-glass-border rounded-full inline-block shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="w-16 h-16 text-foreground opacity-80" />
          </div>

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <h2 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter italic uppercase">Scale Beyond Horizon<span className="text-accent-primary">.</span></h2>
            <p className="text-lg lg:text-xl text-dim-foreground font-medium max-w-2xl mx-auto leading-relaxed italic opacity-80">
              Your business velocity is increasing. Secure your next cycle with a high-capacity Enterprise account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
             <a href="/pricing" className="w-full sm:w-80 h-24 bg-white text-black font-black text-[12px] uppercase tracking-[0.5em] rounded-[2rem] hover:bg-accent-primary hover:text-white transition-all transform hover:scale-[1.05] active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center justify-center gap-4 group">
                UPGRADE_NOW
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </a>
             <div className="text-left px-4">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block">Starting at</span>
                <p className="text-2xl font-black text-foreground">$149/mo</p>
             </div>
          </div>
          
          <p className="text-[9px] font-black text-dim-foreground uppercase tracking-[0.3em] opacity-40">Changes propagate globally across all worker nodes instantly</p>
        </motion.div>
      )}
    </div>
  );
}
