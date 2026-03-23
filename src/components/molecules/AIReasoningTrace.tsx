"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Brain, Sparkles, MessageSquare, Zap, Target, History, Clock, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-browser";
import { motion, AnimatePresence } from "framer-motion";
import { premiumEntrance, staggerContainer, staggerItem, glowPulse, shake, bounce } from "@/lib/motion";

interface TraceStep {
    id: string;
    type: 'analysis' | 'retrieval' | 'reasoning' | 'generation' | 'action' | 'observation' | 'error' | 'thought';
    severity?: 'info' | 'warning' | 'error' | 'critical';
    content: string;
    timestamp: string;
    metadata?: {
        tool_name?: string;
        [key: string]: any;
    };
}

interface TraceGroup {
    trace_id: string;
    steps: TraceStep[];
    last_updated: string;
}

export default function AIReasoningTrace({ steps: initialSteps = [] }: { steps?: TraceStep[] }) {
    const [groups, setGroups] = useState<TraceGroup[]>([]);
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        if (initialSteps.length > 0) {
            const grouped = initialSteps.reduce((acc, step) => {
                const traceId = (step as any).trace_id || 'manual_sync';
                const existing = acc.find(g => g.trace_id === traceId);
                if (existing) {
                    existing.steps.push(step);
                } else {
                    acc.push({ trace_id: traceId, steps: [step], last_updated: step.timestamp });
                }
                return acc;
            }, [] as TraceGroup[]);
            setGroups(grouped.slice(0, 5));
        }
    }, [initialSteps]);

    useEffect(() => {
        const channel = supabase
            .channel('realtime_traces')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ai_traces',
                },
                (payload: { new: any }) => {
                    setIsThinking(true);
                    const newTrace = payload.new;
                    const newStep: TraceStep = {
                        id: newTrace.id || Math.random().toString(),
                        type: (newTrace.trace_type || 'reasoning') as any,
                        severity: newTrace.severity as any,
                        content: newTrace.content || "Processing...",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        metadata: newTrace.metadata,
                    };
                    
                    const traceId = newTrace.trace_id || 'system_bg';
                    
                    setGroups(prev => {
                        const existingIdx = prev.findIndex(g => g.trace_id === traceId);
                        if (existingIdx > -1) {
                            const updated = [...prev];
                            updated[existingIdx] = {
                                ...updated[existingIdx],
                                steps: [newStep, ...updated[existingIdx].steps].slice(0, 5),
                                last_updated: newStep.timestamp
                            };
                            return updated;
                        } else {
                            return [{ trace_id: traceId, steps: [newStep], last_updated: newStep.timestamp }, ...prev].slice(0, 5);
                        }
                    });
                    setTimeout(() => setIsThinking(false), 2000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getIcon = (step: TraceStep) => {
        if (step.type === 'action' && step.metadata?.tool_name) {
            const tool = step.metadata.tool_name.toLowerCase();
            if (tool.includes('crm') || tool.includes('lead')) return <Target className="w-4 h-4 text-cyan-400" />;
            if (tool.includes('calendar')) return <Clock className="w-4 h-4 text-amber-400" />;
            if (tool.includes('search') || tool.includes('knowledge')) return <Sparkles className="w-4 h-4 text-purple-400" />;
        }

        switch (step.type) {
            case 'analysis': return <Target className="w-4 h-4" />;
            case 'retrieval': return <Sparkles className="w-4 h-4" />;
            case 'reasoning': return <Brain className="w-4 h-4" />;
            case 'thought': return <Brain className="w-4 h-4" />;
            case 'action': return <Zap className="w-4 h-4 animate-pulse" />;
            case 'observation': return <MessageSquare className="w-4 h-4" />;
            case 'generation': return <Sparkles className="w-4 h-4 text-emerald-400" />;
            case 'error': return <ShieldCheck className="w-4 h-4 text-red-500" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    const getColor = (step: TraceStep) => {
        if (step.severity === 'error' || step.severity === 'critical') return "text-red-400 bg-red-400/10 border-red-400/20";
        if (step.severity === 'warning') return "text-amber-400 bg-amber-400/10 border-amber-400/20";
        
        switch (step.type) {
            case 'analysis': return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case 'retrieval': return "text-purple-400 bg-purple-400/10 border-purple-400/20";
            case 'reasoning': return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            case 'thought': return "text-purple-300 bg-purple-500/10 border-purple-500/20 animate-pulse";
            case 'action': return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]";
            case 'observation': return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
            case 'generation': return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case 'error': return "text-red-400 bg-red-400/10 border-red-400/20";
            default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
        }
    };

    return (
        <div className="glass-card p-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 blur-[100px] -z-10 group-hover:bg-accent-primary/10 transition-all duration-1000" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <motion.div 
                        variants={glowPulse}
                        animate={isThinking ? "animate" : "initial"}
                        className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner relative"
                    >
                        {isThinking ? (
                            <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
                        ) : (
                            <Brain className="w-5 h-5 text-accent-primary" />
                        )}
                    </motion.div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight italic">Neural Trace Console</h3>
                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Observability Layer v5.7.0</p>
                    </div>
                </div>
            </div>

            <div className="space-y-10 relative">
                {groups.length === 0 ? (
                    <motion.div 
                        variants={premiumEntrance}
                        initial="initial"
                        animate="animate"
                        className="py-12 text-center opacity-40"
                    >
                        <p className="text-sm font-black text-slate-500 italic uppercase tracking-widest">Waiting for incoming thoughts...</p>
                    </motion.div>
                ) : (
                    <div className="space-y-12">
                        {groups.map((group) => (
                            <div key={group.trace_id} className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-white/5" />
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic">
                                        Thought_Chain: {group.trace_id.slice(0, 8)}
                                    </span>
                                    <div className="h-px flex-1 bg-white/5" />
                                </div>

                                <motion.div 
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                    className="space-y-4"
                                >
                                    {group.steps.map((step, idx) => (
                                        <motion.div 
                                            key={step.id} 
                                            variants={staggerItem}
                                            className="relative flex gap-4"
                                        >
                                            <div className={cn(
                                                "flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-transform",
                                                getColor(step)
                                            )}>
                                                {getIcon(step)}
                                            </div>
                                            
                                            <div className="flex-1 pt-0.5">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", getColor(step))}>
                                                        {step.type}
                                                    </span>
                                                    <span className="text-[9px] text-slate-500 font-mono ml-auto">{step.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed font-medium bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                                    {step.content}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
