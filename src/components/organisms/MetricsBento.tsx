"use client";
import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Cpu, Zap, Activity } from "lucide-react";

import { useTranslations } from "next-intl";
import { premiumEntrance, hoverLift, staggerContainer, staggerItem } from "@/lib/motion";

interface MetricsBentoProps {
    metrics?: {
        pipeline_value: number;
        total_leads: number;
        unassigned_chats: number;
        ticket_distribution: Record<string, number>;
        generated_at: string;
    };
}

export default function MetricsBento({ metrics }: MetricsBentoProps) {
    const t = useTranslations("Dashboard");
    
    // Fallback to static distribution if no data available
    const distribution = metrics?.ticket_distribution || { open: 1, closed: 0 };
    const unassignedCount = metrics?.unassigned_chats || 0;
    
    // Map distribution to Recharts format
    const data = Object.entries(distribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value,
        color: name === 'open' 
            ? "hsl(var(--accent-primary))" 
            : (name === 'closed' ? "hsla(var(--foreground-hsl), 0.4)" : "hsla(var(--accent-secondary-hsl), 0.6)")
    }));

    if (data.length === 0) {
        data.push({ name: t("idle"), value: 1, color: "hsla(var(--foreground-hsl), 0.05)" });
    }

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
            <div className={`absolute top-0 right-0 w-32 h-32 ${unassignedCount > 0 ? 'bg-red-500/5' : 'bg-accent-secondary/5'} blur-3xl rounded-full`} />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-foreground font-black text-xl tracking-tight leading-none">
                            Ticket <span className="text-accent-primary uppercase italic">Matrix</span>
                        </h3>
                        {unassignedCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full italic animate-pulse"
                            >
                                {unassignedCount} Urgent
                            </motion.span>
                        )}
                    </div>
                    <p className="text-dim-foreground text-[9px] font-black uppercase tracking-widest italic opacity-80">
                        {t("resource_utilization")}
                    </p>
                </div>
                <motion.div 
                    className="p-3 rounded-2xl bg-surface border border-glass-border group-hover/metrics:border-accent-primary/30 transition-colors shadow-inner"
                    whileHover={{ scale: 1.1, rotate: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <Activity className="w-5 h-5 text-accent-primary" />
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
                    <span className="text-2xl font-black text-foreground leading-none tracking-tighter drop-shadow-sm">
                        {Object.values(distribution).reduce((a, b) => a + b, 0)}
                    </span>
                    <span className="text-[8px] text-dim-foreground font-black uppercase tracking-widest mt-1 italic">Total</span>
                </div>
            </div>

            <motion.div 
                className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-glass-border"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <motion.div className="space-y-1" variants={staggerItem}>
                    <div className="flex items-center gap-2 text-accent-primary">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none italic">Open</span>
                    </div>
                    <p className="text-lg font-black text-foreground tabular-nums tracking-tighter">{distribution.open || 0}</p>
                </motion.div>
                <motion.div className="space-y-1" variants={staggerItem}>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none italic">Closed</span>
                    </div>
                    <p className="text-lg font-black text-foreground tabular-nums tracking-tighter">{distribution.closed || 0}</p>
                </motion.div>
            </motion.div>

            {/* Premium Progress Bar */}
            <div className="mt-8">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-black text-dim-foreground uppercase tracking-widest italic">{t("system_health")}</span>
                    <span className="text-[10px] font-black text-accent-secondary uppercase italic">
                        {unassignedCount > 0 ? "Debt Pending" : "Operational"}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-glass-border">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 via-accent-primary to-emerald-500 bg-[length:200%_auto] animate-shimmer rounded-full"
                    />
                </div>
            </div>
        </motion.div>
    );
}
