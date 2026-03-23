"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { useTranslations } from "next-intl";

interface ChartData {
    name: string;
    received: number;
    sent: number;
}

const GlassTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card p-5 border border-glass-border shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-dim mb-3 italic drop-shadow-sm">{label}</p>
                <div className="space-y-3">
                    {payload.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.stroke }} />
                                <span className="text-[11px] font-black text-text-muted uppercase tracking-widest leading-none">{item.name}</span>
                            </div>
                            <span className="text-sm font-black text-foreground tabular-nums drop-shadow-sm">{item.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary/20 via-transparent to-accent-secondary/20 blur-xl -z-10 opacity-50" />
            </div>
        );
    }
    return null;
};

export default function MainChartBento({ data }: { data: ChartData[] }) {
    const t = useTranslations("Dashboard");
    const [activeTab, setActiveTab] = React.useState("day");
    return (
        <motion.section 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bento-item-xl glass-card p-10 relative overflow-hidden group/chart-host"
        >
            {/* Top Indicator Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/40 to-transparent" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 relative z-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h3 className="text-foreground font-black text-3xl tracking-tight leading-none">
                            {t("message_activity")}
                        </h3>
                        <div className="relative">
                            <span className="px-2.5 py-1 bg-accent-secondary/10 text-accent-secondary text-[8px] font-black rounded-[4px] uppercase tracking-widest border border-accent-secondary/20">
                                {t("live")}
                            </span>
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-secondary rounded-full animate-ping opacity-75" />
                        </div>
                    </div>
                    <p className="text-text-dim text-xs font-bold uppercase tracking-[0.1em] opacity-80 italic">{t("network_throughput_overview")}</p>
                </div>

                <div className="flex bg-foreground/[0.03] backdrop-blur-3xl p-1.5 rounded-3xl border border-glass-border shadow-2xl">
                    {[t("tab_day"), t("tab_week"), t("tab_month")].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={cn(
                                "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                                activeTab === tab.toLowerCase() 
                                    ? "bg-foreground/[0.08] text-foreground shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-glass-border" 
                                    : "text-text-dim hover:text-foreground hover:bg-foreground/[0.04]"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[400px] w-full relative z-10 group/chart-plot">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--accent-primary-hsl))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--accent-primary-hsl))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--accent-secondary-hsl))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--accent-secondary-hsl))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--glass-border-hsl, 240 5% 50%))" strokeOpacity={0.1} />
                        <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--foreground-hsl))" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false} 
                            dy={15} 
                            fontFamily="inherit"
                            fontWeight="900"
                            opacity={0.4}
                        />
                        <YAxis 
                            stroke="hsl(var(--foreground-hsl))" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false}
                            fontFamily="inherit"
                            fontWeight="900"
                            opacity={0.4}
                        />
                        <Tooltip 
                            content={<GlassTooltip />}
                            cursor={{ stroke: 'var(--accent)', strokeWidth: 2, strokeDasharray: '5 5' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="received" 
                            stroke="var(--accent)" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorReceived)" 
                            strokeDasharray="10 5"
                            className="drop-shadow-[0_0_8px_var(--glow-primary)]"
                            animationDuration={2500}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="sent" 
                            stroke="var(--accent-secondary)" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorSent)" 
                            strokeDasharray="5 10"
                            className="drop-shadow-[0_0_8px_var(--glow-secondary)]"
                            animationDuration={2500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-12 flex flex-wrap gap-12 pt-10 border-t border-glass-border relative z-10">
                <div className="flex items-center gap-5 group/stat-mini">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/20 shadow-lg group-hover/stat-mini:rotate-6 transition-transform">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest leading-none mb-2 opacity-60 italic">{t("peak_volume")}</p>
                        <p className="text-xl font-black text-foreground tracking-tighter drop-shadow-md">{t("peak_volume_value")}</p>
                    </div>
                </div>
                <div className="flex items-center gap-5 group/stat-mini">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-accent-secondary/10 flex items-center justify-center text-accent-secondary border border-accent-secondary/20 shadow-lg group-hover/stat-mini:-rotate-6 transition-transform">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest leading-none mb-2 opacity-60 italic">{t("success_rate")}</p>
                        <p className="text-xl font-black text-foreground tracking-tighter drop-shadow-md">{t("success_rate_value")}</p>
                    </div>
                </div>
            </div>

            {/* Premium Animated Corner Shadow */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent-primary/5 blur-[100px] rounded-full pointer-events-none group-hover/chart-host:bg-accent-primary/10 transition-colors duration-1000" />
        </motion.section>
    );
}
