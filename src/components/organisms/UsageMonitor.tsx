"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap, AlertCircle, BarChart3, ShieldCheck, Clock } from "lucide-react";
import { useQuota } from "@/hooks/useQuota";

export default function UsageMonitor() {
    const t = useTranslations("Dashboard");
    const { quota, loading, usagePercent, isWarning, isCritical, daysUntilReset } = useQuota();

    if (loading) return (
        <div className="h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
    );

    if (!quota) return null;

    return (
        <div className="glass-card p-8 border-white/5 bg-white/[0.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 blur-[80px] -z-10" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Neural_Throughput</h4>
                        <div className="text-white font-black italic uppercase tracking-tighter">Usage Monitor</div>
                    </div>
                </div>
                {quota.is_active ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Locked</span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white tracking-tighter">
                            {quota.total_tokens_used.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                            / {quota.token_limit.toLocaleString()} Tokens
                        </span>
                    </div>
                    <div className={`text-[11px] font-black italic transition-colors ${isCritical ? 'text-red-500 animate-pulse' : isWarning ? 'text-amber-500' : 'text-accent-primary'}`}>
                        {usagePercent.toFixed(1)}%
                    </div>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePercent}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                            isCritical 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                                : isWarning 
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                                    : 'bg-gradient-to-r from-accent-primary to-accent-tertiary shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        }`}
                    />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
                        <Clock className="w-3.5 h-3.5" />
                        Next Reset in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
                    </div>
                    {isCritical && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md">
                            <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                            <span className="text-[8px] font-black text-red-400 uppercase tracking-wider">Quota Critical</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
