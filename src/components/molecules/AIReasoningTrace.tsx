"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Brain, Sparkles, MessageSquare, Zap, Target, History, Clock, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";
import { motion } from "framer-motion";
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

export default function AIReasoningTrace({ steps: initialSteps = [] }: { steps?: TraceStep[] }) {
    const [steps, setSteps] = useState<TraceStep[]>(initialSteps);
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        setSteps(initialSteps);
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
                (payload) => {
                    setIsThinking(true);
                    const newTrace = payload.new as any;
                    const newStep: TraceStep = {
                        id: newTrace.id || Math.random().toString(),
                        type: (newTrace.trace_type || 'reasoning') as any,
                        content: newTrace.content || "Processing...",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        metadata: newTrace.metadata,
                    };
                    setSteps(prev => [newStep, ...prev].slice(0, 10));
                    setTimeout(() => setIsThinking(false), 2000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const t = useTranslations("Bot");

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
        if (step.severity === 'error' || step.severity === 'critical') return "text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
        if (step.severity === 'warning') return "text-amber-400 bg-amber-400/10 border-amber-400/20";
        
        switch (step.type) {
            case 'analysis': return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case 'retrieval': return "text-purple-400 bg-purple-400/10 border-purple-400/20";
            case 'reasoning': return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            case 'thought': return "text-purple-300 bg-purple-500/10 border-purple-500/20 animate-pulse";
            case 'action': return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]";
            case 'observation': return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
            case 'generation': return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 glow-secondary";
            case 'error': return "text-red-400 bg-red-400/10 border-red-400/20";
            default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
        }
    };

    return (
        <div className="bg-zinc-100/50 dark:bg-slate-900/60 backdrop-blur-2xl border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 mt-4 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[100px] -z-10 group-hover:bg-purple-600/10 transition-all duration-1000" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <motion.div 
                        variants={glowPulse}
                        animate={isThinking ? "animate" : "initial"}
                        className="p-3 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-inner relative"
                    >
                        {isThinking ? (
                            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        ) : (
                            <Brain className="w-5 h-5 text-purple-400" />
                        )}
                        {isThinking && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping" />
                        )}
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-white tracking-tight">AI Reasoning Protocol</h3>
                            {isThinking && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[9px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-md"
                                >
                                    Thinking...
                                </motion.span>
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Neural Hub Transparency v3.0</p>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                </div>
            </div>

            <div className="space-y-6 relative">
                {steps.length === 0 ? (
                    <motion.div 
                        variants={premiumEntrance}
                        initial="initial"
                        animate="animate"
                        className="py-12 text-center space-y-4 opacity-40"
                    >
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-200 dark:border-white/10 mx-auto flex items-center justify-center animate-spin-slow text-purple-400/50">
                            <Brain className="w-6 h-6 animate-pulse" />
                        </div>
                        <p className="text-sm font-black text-muted-foreground italic uppercase tracking-widest">Waiting for incoming thoughts...</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="space-y-4"
                    >
                        {steps.map((step, idx) => (
                            <motion.div 
                                key={step.id} 
                                variants={staggerItem}
                                className="relative flex gap-4"
                            >
                                {idx !== steps.length - 1 && (
                                    <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-purple-500/20 to-transparent" />
                                )}
                                
                                <motion.div 
                                    variants={step.type === 'error' ? shake : step.type === 'observation' ? bounce : staggerItem}
                                    animate="animate"
                                    className={cn(
                                        "flex-shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg transition-transform hover:scale-110",
                                        getColor(step)
                                    )}
                                >
                                    {getIcon(step)}
                                </motion.div>
                                
                                <div className="flex-1 pt-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", getColor(step))}>
                                            {step.type}
                                        </span>
                                        {step.metadata?.tool_name && (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                                                via {step.metadata.tool_name}
                                            </span>
                                        )}
                                        <span className="text-[9px] text-muted-foreground font-mono ml-auto">{step.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed font-medium bg-zinc-100/5 dark:bg-black/40 p-5 rounded-3xl border border-zinc-200/10 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-all">
                                        {step.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
