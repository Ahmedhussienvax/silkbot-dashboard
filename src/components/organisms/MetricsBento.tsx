"use client";
import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Cpu, Zap, Activity } from "lucide-react";

import { useTranslations } from "next-intl";
import { premiumEntrance, hoverLift, staggerContainer, staggerItem } from "@/lib/motion";

interface MetricsBentoProps {}

export default function MetricsBento({}: MetricsBentoProps) {
    const t = useTranslations("Dashboard");
    const data = [
        { name: t("processing"), value: 65, color: "hsl(var(--accent-primary))" },
        { name: t("idle"), value: 25, color: "hsla(var(--foreground-hsl), 0.05)" },
        { name: t("queued"), value: 10, color: "hsla(var(--accent-secondary-hsl), 0.4)" },
    ];

    const containerVariants = {
        ...premiumEntrance,
        ...hoverLift
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            className="bento-item-l glass-card p-8 flex flex-col justify-between group/metrics overflow-hidden relative"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/5 blur-3xl rounded-full" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-foreground font-black text-xl tracking-tight leading-none mb-2">
                        {t("neural_load")}
                    </h3>
                    <p className="text-text-dim text-[9px] font-black uppercase tracking-widest italic opacity-80">
                        {t("resource_utilization")}
                    </p>
                </div>
                <motion.div 
                    className="p-3 rounded-2xl bg-foreground/5 border border-glass-border group-hover/metrics:border-accent-primary/30 transition-colors shadow-inner"
                    whileHover={{ scale: 1.1, rotate: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <Cpu className="w-5 h-5 text-accent-primary" />
                </motion.div>
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
                                backgroundColor: 'hsl(var(--card))', 
                                backdropFilter: 'blur(16px)', 
                                borderRadius: '20px', 
                                border: '1px solid hsl(var(--glass-border))',
                                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
                                color: 'hsl(var(--foreground))',
                                fontWeight: '900',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-foreground leading-none tracking-tighter drop-shadow-sm">84%</span>
                    <span className="text-[8px] text-text-dim font-black uppercase tracking-widest mt-1 italic">{t("efficiency")}</span>
                </div>
            </div>

            <motion.div 
                className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-glass-border"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <motion.div className="space-y-1" variants={staggerItem}>
                    <div className="flex items-center gap-2 text-accent-secondary">
                        <Zap className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none italic">{t("active_nodes")}</span>
                    </div>
                    <p className="text-lg font-black text-foreground tabular-nums tracking-tighter">12,482</p>
                </motion.div>
                <motion.div className="space-y-1" variants={staggerItem}>
                    <div className="flex items-center gap-2 text-text-muted">
                        <Activity className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none italic">{t("latency")}</span>
                    </div>
                    <p className="text-lg font-black text-foreground tabular-nums tracking-tighter">18ms</p>
                </motion.div>
            </motion.div>

            {/* Premium Progress Bar */}
            <div className="mt-8">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-black text-text-dim uppercase tracking-widest italic">{t("system_health")}</span>
                    <span className="text-[10px] font-black text-accent-secondary uppercase italic">{t("premium")}</span>
                </div>
                <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden border border-glass-border">
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
