"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Brain, Sparkles, MessageSquare, Zap, Target, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";

interface TraceStep {
    id: string;
    type: 'analysis' | 'retrieval' | 'reasoning' | 'generation';
    content: string;
    timestamp: string;
}

export default function AIReasoningTrace({ steps: initialSteps = [] }: { steps?: TraceStep[] }) {
    const [steps, setSteps] = useState<TraceStep[]>(initialSteps);

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
                    schema: 'silkbot',
                    table: 'ai_traces',
                },
                (payload) => {
                    const newTrace = payload.new as any;
                    const newStep: TraceStep = {
                        id: newTrace.trace_id || Math.random().toString(),
                        type: (newTrace.step_type || 'reasoning') as any,
                        content: newTrace.content || "Processing...",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };
                    setSteps(prev => [newStep, ...prev].slice(0, 10));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
    const t = useTranslations("Bot");

    const getIcon = (type: string) => {
        switch (type) {
            case 'analysis': return <Target className="w-4 h-4" />;
            case 'retrieval': return <Sparkles className="w-4 h-4" />;
            case 'reasoning': return <Brain className="w-4 h-4" />;
            case 'generation': return <Zap className="w-4 h-4" />;
            default: return <MessageSquare className="w-4 h-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'analysis': return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case 'retrieval': return "text-purple-400 bg-purple-400/10 border-purple-400/20";
            case 'reasoning': return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            case 'generation': return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
        }
    };

    return (
        <div className="bg-zinc-100/50 dark:bg-slate-900/60 backdrop-blur-2xl border border-zinc-200 dark:border-white/5 rounded-[2.5rem] p-8 mt-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[100px] -z-10 group-hover:bg-purple-600/10 transition-all duration-1000" />
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-inner">
                        <History className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">{t("reasoning_trace_title") || "AI Reasoning Trace"}</h3>
                        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{t("reasoning_trace_subtitle") || "Live thought transparency"}</p>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                </div>
            </div>

            <div className="space-y-6 relative">
                {steps.length === 0 ? (
                    <div className="py-12 text-center space-y-4 opacity-40">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-200 dark:border-white/10 mx-auto flex items-center justify-center animate-spin-slow">
                            <Brain className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground italic">{t("waiting_thoughts") || "Waiting for incoming thoughts..."}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {steps.map((step, idx) => (
                            <div 
                                key={step.id} 
                                className="relative flex gap-4 animate-in slide-in-from-right-4 duration-500"
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                {idx !== steps.length - 1 && (
                                    <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
                                )}
                                
                                <div className={cn(
                                    "flex-shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg",
                                    getColor(step.type)
                                )}>
                                    {getIcon(step.type)}
                                </div>
                                
                                <div className="flex-1 pt-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", getColor(step.type).split(' ')[0])}>
                                            {step.type}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground font-mono">{step.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed font-medium bg-zinc-100/50 dark:bg-black/20 p-4 rounded-2xl border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-colors">
                                        {step.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
