"use client";
import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Cpu, Zap, Activity } from "lucide-react";

import { useTranslations } from "next-intl";

interface MetricsBentoProps {}

export default function MetricsBento({}: MetricsBentoProps) {
    const t = useTranslations("Dashboard");
    const data = [
        { name: t("processing"), value: 65, color: "var(--accent)" },
        { name: t("idle"), value: 25, color: "hsla(var(--muted-foreground-hsl), 0.1)" },
        { name: t("queued"), value: 10, color: "hsla(var(--accent-secondary-hsl), 0.3)" },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bento-item-l glass-card p-8 flex flex-col justify-between group/metrics overflow-hidden relative"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/5 blur-3xl rounded-full" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-foreground font-black text-xl tracking-tight leading-none mb-2">
                        {t("neural_load")}
                    </h3>
                    <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest opacity-60">
                        {t("resource_utilization")}
                    </p>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 group-hover/metrics:border-accent-primary/30 transition-colors">
                    <Cpu className="w-5 h-5 text-accent-primary group-hover/metrics:scale-110 transition-transform" />
                </div>
            </div>

            <div className="h-48 w-full relative group/pie">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'var(--card)', 
                                backdropFilter: 'blur(10px)', 
                                borderRadius: '16px', 
                                border: '1px solid var(--border)',
                                color: 'var(--foreground)',
                                fontWeight: '900',
                                fontSize: '10px'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-foreground leading-none">84%</span>
                    <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{t("efficiency")}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-zinc-200 dark:border-white/5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-accent-secondary">
                        <Zap className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t("active_nodes")}</span>
                    </div>
                    <p className="text-lg font-black text-foreground">12,482</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t("latency")}</span>
                    </div>
                    <p className="text-lg font-black text-foreground">18ms</p>
                </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="mt-8">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{t("system_health")}</span>
                    <span className="text-[10px] font-black text-accent-secondary uppercase">{t("premium")}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden border border-zinc-300 dark:border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "94%" }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary bg-[length:200%_auto] animate-shimmer rounded-full"
                    />
                </div>
            </div>
        </motion.div>
    );
}
