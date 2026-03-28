"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap, AlertCircle, BarChart3, ShieldCheck, Clock } from "lucide-react";
import { useQuota } from "@/hooks/useQuota";
import { cn } from "@/lib/utils";

export default function UsageMonitor() {
    const t = useTranslations("Dashboard");
    const { quota, loading, usagePercent, isWarning, isCritical, daysUntilReset } = useQuota();

    if (loading) return (
        <div className="h-48 bg-surface/50 border border-border rounded-[2rem] animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <Zap className="w-6 h-6 text-muted-foreground/20 animate-pulse" />
                <div className="h-2 w-24 bg-border rounded-full" />
            </div>
        </div>
    );

    if (!quota) return (
        <div className="glass-card p-8 border-dashed border-border flex items-center justify-center opacity-50 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase tracking-widest italic">No Quota Data Detected</p>
        </div>
    );

    return (
        <div className={cn(
            "glass-card p-6 md:p-8 border-border relative overflow-hidden group transition-all duration-500",
            isCritical ? "ring-2 ring-red-500/20 bg-red-500/5" : "bg-surface"
        )}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 blur-[80px] -z-10 group-hover:bg-accent-primary/10 transition-all duration-1000" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                        isCritical 
                            ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]" 
                            : "bg-accent-primary/10 text-accent-primary border-accent-primary/20"
                    )}>
                        <Zap className={cn("w-6 h-6", isCritical && "animate-pulse")} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Neural_Token_Index</h4>
                        <div className="text-foreground font-black italic uppercase tracking-tighter text-lg leading-tight">Usage Monitor</div>
                    </div>
                </div>
                {quota.is_active ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System_Active</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Locked</span>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                            <span className={cn(
                                "text-4xl font-black tracking-tighter transition-colors",
                                isCritical ? "text-red-400" : "text-foreground"
                            )}>
                                {quota.total_tokens_used.toLocaleString()}
                            </span>
                            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest italic translate-y-[-4px]">
                                / {quota.token_limit.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] italic">Current Cycle Consumption</p>
                    </div>
                    <div className={cn(
                        "text-xl font-black italic transition-all duration-500 px-3 py-1 rounded-lg border",
                        isCritical 
                            ? 'text-red-500 bg-red-500/10 border-red-500/20 animate-bounce' 
                            : isWarning 
                                ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' 
                                : 'text-accent-primary bg-accent-primary/5 border-glass-border'
                    )}>
                        {usagePercent.toFixed(1)}%
                    </div>
                </div>

                <div className="h-3 w-full bg-surface-dark rounded-full overflow-hidden border border-border shadow-inner p-[2px]">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercent}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={cn(
                            "h-full rounded-full transition-all duration-700",
                            isCritical 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                                : isWarning 
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                                    : 'bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                        )}
                    />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">
                        <Clock className="w-4 h-4 text-accent-primary opacity-50" />
                        Cycle Reset: {daysUntilReset} Day{daysUntilReset !== 1 ? 's' : ''} Remaining
                    </div>
                    {isCritical && (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white rounded-lg shadow-lg shadow-red-500/20"
                        >
                            <BarChart3 className="w-3 h-3" />
                            <span className="text-[9px] font-black uppercase tracking-wider">Expand Limit</span>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
