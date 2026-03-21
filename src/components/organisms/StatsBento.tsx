"use client";
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, MessageSquare, Send, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
    conversations: number;
    messages: number;
    contacts: number;
    botEnabled: boolean;
}

interface StatsBentoProps {
    stats: Stats;
    translations: any;
}

export default function StatsBento({ stats, translations: t }: StatsBentoProps) {
    const statItems = [
        {
            label: t("conversations"),
            value: stats.conversations,
            icon: <MessageSquare className="w-6 h-6" />,
            color: "from-accent-primary to-accent-secondary",
            trend: "+12.5%",
            desc: t("conversations_desc")
        },
        {
            label: t("messages"),
            value: stats.messages,
            icon: <Send className="w-6 h-6" />,
            color: "from-blue-500 to-cyan-400",
            trend: "+8.2%",
            desc: t("messages_desc")
        },
        {
            label: t("contacts"),
            value: stats.contacts,
            icon: <Users className="w-6 h-6" />,
            color: "from-purple-500 to-pink-500",
            trend: "+24%",
            desc: t("contacts_desc")
        },
        {
            label: t("bot_status"),
            value: stats.botEnabled ? t("active") : t("inactive"),
            icon: <Activity className={cn("w-6 h-6", stats.botEnabled ? "text-accent-secondary animate-pulse" : "text-slate-500")} />,
            color: stats.botEnabled ? "from-emerald-500 to-teal-400" : "from-slate-700 to-slate-800",
            trend: stats.botEnabled ? "STABLE" : "OFF",
            desc: t("bot_status_desc")
        }
    ];

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {statItems.map((stat, idx) => (
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                        delay: idx * 0.1, 
                        duration: 0.6, 
                        ease: [0.23, 1, 0.32, 1] 
                    }}
                    key={stat.label}
                    className={cn(
                        "overflow-hidden group relative",
                        "glass-card p-6 border border-white/5 hover:border-accent-primary/30",
                        "premium-hover shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
                    )}
                >
                    {/* Animated Background Mesh */}
                    <div className={cn(
                        "absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br opacity-[0.03] blur-[60px] group-hover:opacity-[0.08] transition-opacity duration-700",
                        stat.color
                    )} />
                    
                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="w-12 h-12 bg-white/[0.03] rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner group-hover:rotate-[10deg] transition-all duration-500">
                            <div className="text-accent-primary group-hover:scale-110 transition-transform duration-500">
                                {stat.icon}
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border self-start",
                            stat.trend.includes("+") ? "bg-accent-secondary/10 border-accent-secondary/20" : "bg-white/5 border-white/10"
                        )}>
                            <TrendingUp className={cn("w-3 h-3", stat.trend.includes("+") ? "text-accent-secondary" : "text-slate-500")} />
                            <span className={cn("text-[9px] font-black tracking-tighter", stat.trend.includes("+") ? "text-accent-secondary" : "text-slate-500")}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1 relative z-10">
                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">
                            {stat.label}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white tracking-tighter drop-shadow-2xl">
                                {stat.value}
                            </span>
                        </div>
                    </div>
                    
                    <p className="text-[9px] text-slate-500 mt-4 font-bold leading-relaxed tracking-wide group-hover:text-slate-300 transition-colors uppercase opacity-60">
                        {stat.desc}
                    </p>

                    {/* Light Reflection Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                </motion.div>
            ))}
        </section>
    );
}
