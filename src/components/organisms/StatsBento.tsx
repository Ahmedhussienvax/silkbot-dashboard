"use client";
import { motion } from "framer-motion";
import { TrendingUp, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend: string;
    desc: string;
}

interface StatsBentoProps {
    stats: StatItem[];
}

export default function StatsBento({ stats }: StatsBentoProps) {
    return (
        <section className="bento-grid">
            {stats.map((stat, idx) => (
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
                        "bento-item-sm overflow-hidden group relative",
                        "glass-card p-8 border border-white/5 hover:border-accent-primary/30",
                        "premium-hover shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]"
                    )}
                >
                    {/* Animated Background Mesh */}
                    <div className={cn(
                        "absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br opacity-[0.03] blur-[60px] group-hover:opacity-[0.08] transition-opacity duration-700",
                        stat.color
                    )} />
                    
                    <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="w-16 h-16 bg-white/[0.03] rounded-[1.5rem] flex items-center justify-center text-white border border-white/10 shadow-inner group-hover:rotate-[10deg] transition-all duration-500">
                            <div className="text-accent-primary group-hover:scale-110 transition-transform duration-500">
                                {stat.icon}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-secondary/10 rounded-full border border-accent-secondary/20 self-start">
                            <TrendingUp className="w-3 h-3 text-accent-secondary" />
                            <span className="text-[10px] font-black text-accent-secondary tracking-tighter">{stat.trend}</span>
                        </div>
                    </div>

                    <div className="space-y-1 relative z-10">
                        <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.25em]">
                            {stat.label}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">
                                {stat.value}
                            </span>
                        </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 mt-6 font-bold leading-relaxed tracking-wide group-hover:text-slate-300 transition-colors uppercase opacity-60">
                        {stat.desc}
                    </p>

                    {/* Light Reflection Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                </motion.div>
            ))}
        </section>
    );
}
