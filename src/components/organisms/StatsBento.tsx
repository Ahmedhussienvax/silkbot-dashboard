"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, MessageSquare, Send, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

import { supabase } from "@/lib/supabase-client";

import { useTranslations } from "next-intl";
import { premiumEntrance, hoverLift } from "@/lib/motion";

interface Stats {
    conversations: number;
    messages: number;
    contacts: number;
    botEnabled: boolean;
}

interface StatsBentoProps {
    stats: Stats;
    onCardClick?: (id: string) => void;
}

export default function StatsBento({ stats, onCardClick }: StatsBentoProps) {
    const t = useTranslations("Dashboard");
    const [pulse, setPulse] = useState<string | null>(null);

    useEffect(() => {
        const channel = supabase
            .channel('realtime_stats_pulse')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'silkbot',
                    table: 'silkbot_messages',
                },
                () => {
                    setPulse("messages");
                    setTimeout(() => setPulse(null), 3000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
    const statItems = [
        {
            id: "conversations",
            label: t("conversations"),
            value: stats.conversations,
            icon: <MessageSquare className="w-6 h-6" />,
            color: "from-accent-primary to-accent-secondary",
            trend: "+12.5%",
            desc: t("conversations_desc")
        },
        {
            id: "messages",
            label: t("messages"),
            value: stats.messages,
            icon: <Send className="w-6 h-6" />,
            color: "from-blue-500 to-cyan-400",
            trend: "+8.2%",
            desc: t("messages_desc")
        },
        {
            id: "contacts",
            label: t("contacts"),
            value: stats.contacts,
            icon: <Users className="w-6 h-6" />,
            color: "from-purple-500 to-pink-500",
            trend: "+24%",
            desc: t("contacts_desc")
        },
        {
            id: "bot_status",
            label: t("bot_status"),
            value: stats.botEnabled ? t("active") : t("inactive"),
            icon: <Activity className={cn("w-6 h-6", stats.botEnabled ? "text-accent-secondary animate-pulse" : "text-muted-foreground")} />,
            color: stats.botEnabled ? "from-emerald-500 to-teal-400" : "from-zinc-200 to-zinc-300 dark:from-slate-700 dark:to-slate-800",
            trend: stats.botEnabled ? "STABLE" : "OFF",
            desc: t("bot_status_desc")
        }
    ];

    const cardVariants = {
        ...premiumEntrance,
        ...hoverLift
    };

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {statItems.map((stat, idx) => (
                <motion.button
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    whileTap="tap"
                    key={stat.id}
                    onClick={() => onCardClick?.(stat.id)}
                    className={cn(
                        "overflow-hidden group relative text-left w-full outline-none",
                        "glass-card p-6 border border-zinc-200/50 dark:border-white/5 hover:border-accent-primary/30",
                        "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
                    )}
                >
                    {/* Animated Background Mesh */}
                    <div className={cn(
                        "absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br opacity-[0.03] blur-[60px] group-hover:opacity-[0.08] transition-opacity duration-700",
                        stat.color
                    )} />
                    
                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <motion.div 
                            className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                                stat.color
                            )}
                            whileHover={{ scale: 1.1, rotate: 8 }}
                            transition={{ type: "spring", stiffness: 400, damping: 12 }}
                        >
                            <div className="drop-shadow-md">
                                {stat.icon}
                            </div>
                        </motion.div>
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border self-start",
                            stat.trend.includes("+") ? "bg-accent-secondary/10 border-accent-secondary/20" : "bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10"
                        )}>
                            <TrendingUp className={cn("w-3 h-3", stat.trend.includes("+") ? "text-accent-secondary" : "text-muted-foreground")} />
                            <span className={cn("text-[9px] font-black tracking-tighter", stat.trend.includes("+") ? "text-accent-secondary" : "text-muted-foreground")}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1 relative z-10">
                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">
                            {stat.label}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-foreground tracking-tighter drop-shadow-2xl">
                                {stat.value}
                            </span>
                        </div>
                    </div>
                    
                    <p className="text-[9px] text-slate-500 mt-4 font-black leading-relaxed tracking-[0.15em] group-hover:text-slate-300 transition-colors uppercase opacity-60 italic">
                        {stat.desc}
                    </p>

                    {/* Live Pulse Indicator */}
                    {stat.id === pulse && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-in fade-in zoom-in slide-in-from-top-2 duration-500 relative z-20">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">Live</span>
                        </div>
                    )}

                    {/* Light Reflection Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                </motion.button>
            ))}
        </section>
    );
}
