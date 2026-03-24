"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { 
    Search, 
    History, 
    BrainCircuit, 
    ExternalLink, 
    Loader2, 
    Activity, 
    Terminal, 
    ShieldCheck, 
    X, 
    ChevronRight, 
    Cpu, 
    Zap, 
    MessageCircle,
    Copy,
    Check
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuditLog {
    id: string;
    instance_name: string;
    contact_jid: string;
    user_msg: string;
    ai_response: string;
    kg_match: string;
    created_at: string;
    tenant_id: string;
    metadata?: any;
}

interface TraceStep {
    id: string;
    trace_type: string;
    content: string;
    created_at: string;
}

export default function AuditPage() {
    const t = useTranslations("Dashboard");
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [relatedTraces, setRelatedTraces] = useState<TraceStep[]>([]);
    const [loadingTraces, setLoadingTraces] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const supabase = createClient();

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from("silkbot_audit_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);
            
            if (error) {
                console.error("Error fetching audit logs:", error);
            } else {
                setLogs((data as AuditLog[]) || []);
            }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    // Fetch related AI traces when a log is selected
    useEffect(() => {
        if (!selectedLog) return;

        const fetchTraces = async () => {
            setLoadingTraces(true);
            try {
                // Heuristic: Get traces for the same tenant around the same time (+/- 5 seconds)
                const logTime = new Date(selectedLog.created_at).getTime();
                const startTime = new Date(logTime - 10000).toISOString();
                const endTime = new Date(logTime + 10000).toISOString();

                const { data, error } = await supabase
                    .from("ai_traces")
                    .select("*")
                    .eq("tenant_name", selectedLog.instance_name)
                    .gte("created_at", startTime)
                    .lte("created_at", endTime)
                    .order("created_at", { ascending: true });

                if (!error) {
                    setRelatedTraces(data || []);
                }
            } catch (err) {
                console.error("Trace fetch error:", err);
            } finally {
                setLoadingTraces(false);
            }
        };

        fetchTraces();
    }, [selectedLog]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredLogs = logs.filter(log => 
        log.user_msg?.toLowerCase().includes(search.toLowerCase()) || 
        log.ai_response?.toLowerCase().includes(search.toLowerCase()) ||
        log.contact_jid?.includes(search) ||
        log.instance_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 bg-background transition-colors duration-700">
                <div className="relative">
                    <div className="w-32 h-32 border-4 border-accent-primary/10 border-t-accent-primary rounded-full animate-spin shadow-[0_0_50px_rgba(var(--accent-primary-rgb),0.2)]" />
                    <BrainCircuit className="w-12 h-12 text-accent-primary absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-foreground font-black text-xl tracking-tighter uppercase italic">Accessing Neural Archive</h2>
                    <p className="text-text-dim text-[10px] font-mono uppercase tracking-[0.3em] animate-pulse">Decrypting encrypted synapses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-12 max-w-[1900px] mx-auto space-y-12 animate-in fade-in duration-1000 relative">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] -z-10 pointer-events-none" />

            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
                        <Activity className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-purple-400 font-black text-[10px] uppercase tracking-widest">Realtime_Synapse_Stream</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter italic leading-none">
                        Neural Audit<span className="text-accent-primary">.</span>
                    </h1>
                    <p className="text-text-muted text-xl font-medium max-w-3xl leading-relaxed">
                        Deep-level instrumentation of autonomous decision patterns, KG mapping accuracy, and synthetic cognition outputs.
                    </p>
                </div>
                
                <div className="relative w-full xl:w-[600px] group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition-opacity" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5 group-focus-within:text-purple-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Scan neural logs (Msg, JID, Instance)..." 
                        className="w-full pl-16 pr-8 py-6 bg-surface border border-glass-border rounded-3xl text-foreground text-sm focus:outline-none focus:ring-0 focus:border-accent-primary/50 transition-all placeholder:text-text-dim backdrop-blur-3xl font-bold font-mono shadow-2xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            {/* Main Stats Hub */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Synapses_Captured", value: logs.length, icon: <Activity />, color: "text-purple-400" },
                    { label: "KG_Validated", value: logs.filter(l => l.kg_match?.trim()).length, icon: <ShieldCheck />, color: "text-emerald-400" },
                    { label: "Active_Endpoints", value: new Set(logs.map(l => l.contact_jid)).size, icon: <Terminal />, color: "text-indigo-400" },
                    { label: "Processing_Load", value: "Optimal", icon: <Cpu />, color: "text-amber-400" }
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="p-8 bg-surface border border-glass-border rounded-[2.5rem] backdrop-blur-3xl space-y-4 group hover:bg-surface-hover transition-all shadow-xl"
                    >
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-foreground/5 border border-glass-border group-hover:scale-110 transition-transform", stat.color)}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</div>
                            <div className="text-[10px] text-text-dim font-black uppercase tracking-[0.2em] mt-1">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Audit Table */}
            <div className="bg-surface border border-glass-border rounded-[3.5rem] overflow-hidden backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.4)] relative border-t-glass-border/50">
                <div className="overflow-x-auto relative">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-foreground/[0.03] border-b border-glass-border">
                                <th className="px-10 py-10 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">Temporal_Marker</th>
                                <th className="px-10 py-10 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">Subject_Cluster</th>
                                <th className="px-10 py-10 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">Inbound_Signal</th>
                                <th className="px-10 py-10 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">Synthetic_Synthesis</th>
                                <th className="px-10 py-10 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">Logic_Health</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {filteredLogs.map((log, idx) => (
                                <tr 
                                    key={log.id} 
                                    onClick={() => setSelectedLog(log)}
                                    className="hover:bg-accent-primary/[0.03] transition-all group/row cursor-pointer"
                                >
                                    <td className="px-10 py-10 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-foreground font-mono text-sm font-black group-hover/row:text-accent-primary transition-colors">
                                                {format(new Date(log.created_at), "HH:mm:ss")}
                                            </span>
                                            <span className="text-text-dim font-black text-[9px] uppercase tracking-tighter mt-1">
                                                {format(new Date(log.created_at), "MMM dd, yyyy")}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 whitespace-nowrap">
                                        <div className="space-y-1.5">
                                            <div className="font-mono text-sm text-text-muted group-hover/row:text-foreground transition-colors">{log.contact_jid}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] text-text-dim font-black uppercase tracking-[0.2em] group-hover/row:text-text-muted transition-colors">
                                                    {log.instance_name || "MASTER_CORE"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 min-w-[300px] max-w-[400px]">
                                        <div className="text-text-muted text-sm leading-relaxed p-5 bg-foreground/[0.02] border border-glass-border rounded-[1.5rem] group-hover/row:border-foreground/10 transition-colors line-clamp-2">
                                            {log.user_msg || <span className="opacity-40 italic font-medium text-xs">[Signal_Null]</span>}
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 min-w-[300px] max-w-[400px]">
                                        <div className="text-indigo-300 font-medium text-sm leading-relaxed p-5 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-[1.5rem] group-hover/row:bg-indigo-500/[0.05] transition-all line-clamp-2">
                                            {log.ai_response || <span className="text-slate-600 opacity-40 italic text-xs">[Passthrough]</span>}
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        {log.kg_match ? (
                                            <div className="flex flex-col gap-2">
                                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Validated
                                                </span>
                                                <p className="text-[9px] text-slate-600 font-mono italic truncate max-w-[150px] opacity-60">Source: Vectors_PRD_01</p>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 text-slate-600 border border-white/5 w-fit">
                                                <History className="w-3 h-3" />
                                                Heuristic
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Neural Detail Drawer */}
            <AnimatePresence>
                {selectedLog && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLog(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-zoom-out"
                        />
                        <motion.aside 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full xl:w-[600px] bg-background border-l border-glass-border z-[60] shadow-[-50px_0_100px_rgba(0,0,0,0.8)] overflow-y-auto"
                        >
                            <div className="p-12 space-y-12 pb-32">
                                {/* Drawer Header */}
                                <header className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-accent-primary/10 rounded-lg border border-accent-primary/20">
                                                <Zap className="w-4 h-4 text-accent-primary" />
                                            </div>
                                            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic">Trace_Inspector</h2>
                                        </div>
                                        <p className="text-[10px] text-text-dim font-black uppercase tracking-widest pl-9">Synapse ID: {selectedLog.id.split('-')[0]}...</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedLog(null)}
                                        className="p-3 bg-foreground/5 rounded-2xl hover:bg-foreground/10 transition-colors border border-glass-border group"
                                    >
                                        <X className="w-6 h-6 text-text-muted group-hover:text-foreground transition-colors" />
                                    </button>
                                </header>

                                {/* Detail Sections */}
                                <div className="space-y-10">
                                    {/* Inbound Signal Box */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbound_Signal</h4>
                                            <button 
                                                onClick={() => copyToClipboard(selectedLog.user_msg)}
                                                className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                                            >
                                                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                Copy Raw
                                            </button>
                                        </div>
                                        <div className="p-6 bg-slate-900/60 border border-white/10 rounded-3xl text-slate-300 text-sm leading-relaxed font-medium shadow-inner">
                                            {selectedLog.user_msg}
                                        </div>
                                    </div>

                                    {/* Synthetic Cognition Output */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Synthetic_Synthesis</h4>
                                        <div className="p-6 bg-indigo-500/[0.05] border border-indigo-500/20 rounded-3xl text-indigo-100 text-sm leading-relaxed font-bold shadow-inner">
                                            {selectedLog.ai_response}
                                        </div>
                                    </div>

                                    {/* Neural Timeline (Traces) */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thought_Chain (AI_Traces)</h4>
                                        
                                        {loadingTraces ? (
                                            <div className="flex items-center gap-3 text-slate-600 animate-pulse py-4 font-mono text-xs">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Fetching temporal shards...
                                            </div>
                                        ) : relatedTraces.length > 0 ? (
                                            <div className="space-y-4">
                                                {relatedTraces.map((trace, i) => (
                                                    <div key={trace.id} className="relative flex gap-4 pl-4">
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-slate-400 font-black">
                                                            {i + 1}
                                                        </div>
                                                        {i !== relatedTraces.length - 1 && (
                                                            <div className="absolute left-[29px] top-8 bottom-0 w-px bg-white/5" />
                                                        )}
                                                        <div className="pb-4 pt-1 flex-1">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className="text-[10px] font-black uppercase text-purple-400">@{trace.trace_type}</span>
                                                                <span className="text-[8px] text-slate-700 font-mono">{format(new Date(trace.created_at), "HH:mm:ss:SS")}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 leading-relaxed font-bold italic">
                                                                "{trace.content}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center">
                                                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Zero_Related_Traces_Found</p>
                                                <p className="text-[9px] text-slate-700 mt-2">Temporal alignment window: ±10s</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Subject Cluster Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Subject_JID</p>
                                            <p className="text-xs text-slate-300 font-mono font-black truncate">{selectedLog.contact_jid}</p>
                                        </div>
                                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
                                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Active_Cluster</p>
                                            <p className="text-xs text-white font-black truncate">{selectedLog.instance_name || "MASTER_CORE"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 border-t border-white/5 flex flex-col gap-6">
                                    <button 
                                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-white shadow-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                                        onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2))}
                                    >
                                        <ExternalLink className="w-4 h-4" /> Export_Binary_Synapse
                                    </button>
                                    <p className="text-[9px] text-slate-700 text-center font-bold italic">SilkBot_Observability_Module v4.5 // System_Ready</p>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}