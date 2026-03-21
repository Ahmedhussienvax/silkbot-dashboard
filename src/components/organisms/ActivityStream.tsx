"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, UserPlus, Server, ShieldCheck, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
    id: string;
    type: "message" | "user" | "system" | "security";
    user: string;
    action: string;
    time: string;
    status: "success" | "warning" | "info";
}

interface ActivityStreamProps {
    activities: ActivityItem[];
    translations: any;
}

export default function ActivityStream({ activities, translations: t }: ActivityStreamProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "message": return <MessageSquare className="w-4 h-4" />;
            case "user": return <UserPlus className="w-4 h-4" />;
            case "security": return <ShieldCheck className="w-4 h-4" />;
            default: return <Server className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "success": return "text-accent-secondary bg-accent-secondary/10 border-accent-secondary/20";
            case "warning": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            default: return "text-accent-primary bg-accent-primary/10 border-accent-primary/20";
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bento-item-l glass-card p-8 flex flex-col h-full group/stream overflow-hidden"
        >
            <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h3 className="text-white font-black text-xl tracking-tight leading-none group-hover/stream:text-accent-primary transition-colors">
                        {t("activity_feed")}
                    </h3>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest opacity-60">
                        {t("real_time_events")}
                    </p>
                </div>
                <div className="flex -space-x-3 bg-white/5 p-1 rounded-full border border-white/5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-[#050505] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">
                            {String.fromCharCode(64 + i)}
                        </div>
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-[#050505] bg-accent-primary flex items-center justify-center text-[8px] font-black text-white">
                        +8
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {activities.length > 0 ? (
                        activities.map((activity, index) => (
                            <motion.div 
                                key={activity.id}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group/item flex items-start gap-5 p-4 rounded-3xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all duration-300 relative"
                            >
                                <div className={cn(
                                    "w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xl shrink-0 transition-transform group-hover/item:-rotate-6",
                                    getStatusColor(activity.status)
                                )}>
                                    {getIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <p className="text-sm font-black text-white truncate drop-shadow-sm">
                                            {activity.user}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Clock className="w-3 h-3 opacity-60" />
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">{activity.time}</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed opacity-80 group-hover/item:text-slate-200 transition-colors">
                                        {activity.action}
                                    </p>
                                    
                                    {/* Action Tags */}
                                    <div className="flex gap-2 mt-3 opacity-0 group-hover/item:opacity-100 transition-opacity translate-y-2 group-hover/item:translate-y-0 duration-500">
                                        <button className="px-3 py-1 bg-white/5 border border-white/5 hover:border-accent-primary/50 rounded-full text-[8px] font-black text-slate-400 hover:text-white uppercase transition-all">{t("details")}</button>
                                        <button className="px-3 py-1 bg-white/5 border border-white/5 hover:border-accent-secondary/50 rounded-full text-[8px] font-black text-slate-400 hover:text-white uppercase transition-all">{t("log")}</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center mb-6">
                                <Activity className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-600">{t("no_events_found")}</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <button className="mt-8 w-full py-4 bg-white/5 border border-white/5 hover:border-accent-primary/20 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-[0.2em] transition-all group-hover/stream:shadow-inner">
                {t("view_full_history")}
            </button>
        </motion.div>
    );
}
