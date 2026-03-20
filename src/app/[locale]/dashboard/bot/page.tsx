"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import { 
    Bot, 
    Settings, 
    MessageCircle, 
    Zap, 
    Cpu, 
    ShieldCheck, 
    ChevronRight,
    Search,
    Clock,
    Flame,
    Activity,
    BrainCircuit,
    Terminal,
    Sliders,
    Sparkles,
    Loader2
} from "lucide-react";
import AIReasoningTrace from "@/components/molecules/AIReasoningTrace";
import { cn } from "@/lib/utils";

interface BotConfig {
    id?: string;
    bot_name: string;
    is_enabled: boolean;
    ai_provider: string;
    ai_model: string;
    system_prompt: string;
    fallback_message: string;
    handoff_keywords: string[];
    max_tokens: number;
    temperature: number;
}

export default function BotConfigPage() {
    const t = useTranslations("Bot");
    const [traceSteps, setTraceSteps] = useState<any[]>([]);
    const [config, setConfig] = useState<BotConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            try {
                // 1. Load Bot Config
                const { data: botData, error: botError } = await supabase.from("bot_configs").select("*, tenants(name)").single();
                if (botData) {
                    setConfig(botData as any);
                    
                    // 2. Load Initial Traces for this tenant
                    const tenantName = (botData as any).tenants?.name || "unknown";
                    const { data: traceData } = await supabase
                        .from("ai_traces")
                        .select("*")
                        .eq("tenant_name", tenantName)
                        .order("created_at", { ascending: false })
                        .limit(5);
                    
                    if (traceData) {
                        setTraceSteps(traceData.map(t => ({
                            id: t.id,
                            type: t.trace_type,
                            content: t.content,
                            timestamp: new Date(t.created_at).toLocaleTimeString()
                        })).reverse());
                    }

                    // 3. Realtime Subscription
                    const channel = supabase
                        .channel(`ai_traces_${tenantName}`)
                        .on('postgres_changes', { 
                            event: 'INSERT', 
                            schema: 'public', 
                            table: 'ai_traces',
                            filter: `tenant_name=eq.${tenantName}`
                        }, (payload) => {
                            const newTrace = payload.new;
                            setTraceSteps(prev => [...prev, {
                                id: newTrace.id,
                                type: newTrace.trace_type,
                                content: newTrace.content,
                                timestamp: new Date(newTrace.created_at).toLocaleTimeString()
                            }].slice(-5)); // Keep last 5
                        })
                        .subscribe();

                    return () => {
                        supabase.removeChannel(channel);
                    };
                }
            } catch (err: any) {
                console.error("Error loading neural state:", err.message);
                toast.error(t("error_loading") || "Failed to load neural configuration.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [supabase, t]);

    const saveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!config) return;
        setSaving(true);

        try {
            const { error: saveError } = await supabase
                .from("bot_configs")
                .update({ ...config, updated_at: new Date().toISOString() })
                .eq("id", config.id);

            if (saveError) throw saveError;
            toast.success("Protocol Updated", {
                description: "AI behavior configurations synchronized across all nodes."
            });
        } catch (err: any) {
            toast.error(t("error") || err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Syncing_Neural_State</span>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 font-arabic">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 relative group">
                            <BrainCircuit className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" title="Elite Squad Online" />
                        </div>
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            Neural Logic Controller
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">
                        {t("title") || "Bot Architecture"}<span className="text-purple-500">.</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed italic">
                        {t("description") || "Configure the core processing unit and behavioral constraints for your AI agents."}
                    </p>
                </div>
                
                <div className="flex items-center gap-6 bg-white/[0.02] border border-white/10 p-4 rounded-[2rem] backdrop-blur-3xl shadow-2xl">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all border",
                        config?.is_enabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-slate-800/40 border-white/5 text-slate-500"
                    )}>
                        <Activity className={cn("w-3.5 h-3.5", config?.is_enabled ? "animate-pulse" : "opacity-30")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{config?.is_enabled ? "Active" : "Locked"}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer group">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={config?.is_enabled} 
                            onChange={(e) => setConfig(prev => prev ? { ...prev, is_enabled: e.target.checked } : null)} 
                        />
                        <div className="w-14 h-8 bg-slate-800 border border-white/10 rounded-full peer peer-checked:bg-purple-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[6px] after:left-[8px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-lg peer-focus:ring-2 ring-purple-500/20"></div>
                    </label>
                </div>
            </header>

            <form onSubmit={saveConfig} className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-32">
                
                <div className="lg:col-span-8 space-y-10">
                    {/* System Prompt Section */}
                    <section className="bg-gradient-to-br from-slate-900/60 to-black/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-3xl relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none group-hover:bg-purple-600/10 transition-colors duration-1000" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 transform group-hover:rotate-12 transition-transform duration-500">
                                    <Terminal className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">{t("prompt") || "Core_Instruction"}</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{t("prompt_desc") || "Define logical constraints and identity tokens"}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-widest shadow-inner">
                                    UTF-8 Deployment
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                rows={12}
                                value={config?.system_prompt}
                                onChange={(e) => setConfig(prev => prev ? { ...prev, system_prompt: e.target.value } : null)}
                                className="w-full bg-black/40 border border-white/5 rounded-[2rem] px-10 py-8 text-white text-lg font-medium focus:ring-1 focus:ring-purple-500/30 outline-none leading-relaxed transition-all hover:bg-black/60 shadow-inner scrollbar-none"
                                placeholder={t("prompt_placeholder") || "Awaiting kernel instructions..."}
                            />
                            <div className="absolute bottom-6 left-10 flex gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest italic">
                                        {(config?.system_prompt?.length || 0)} Memory_Units
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <AIReasoningTrace steps={traceSteps} />
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <section className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-3xl space-y-10">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                    <Cpu className="w-5 h-5 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-black text-white italic tracking-tight">{t("model") || "Kernel_Node"}</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t("name") || "Alias"}</label>
                                        <div className="w-1.5 h-1.5 bg-blue-500/40 rounded-full" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={config?.bot_name} 
                                        onChange={(e) => setConfig(prev => prev ? { ...prev, bot_name: e.target.value } : null)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold focus:ring-1 ring-purple-500/50 outline-none transition-all shadow-inner" 
                                        placeholder={t("name_placeholder") || "Bot Node UID"}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t("model_select") || "Model_Engine"}</label>
                                        <div className="w-1.5 h-1.5 bg-purple-500/40 rounded-full" />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={config?.ai_model}
                                            onChange={(e) => setConfig(prev => prev ? { ...prev, ai_model: e.target.value } : null)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white font-black appearance-none outline-none focus:ring-1 ring-purple-500/50 transition-all cursor-pointer shadow-inner pr-12"
                                        >
                                            <option value="gpt-4o-mini" className="bg-slate-900 border-none">Mini-V1 (Efficient)</option>
                                            <option value="gpt-4o" className="bg-slate-900 border-none">Neural-Prime (Advanced)</option>
                                            <option value="claude-3-5-sonnet" className="bg-slate-900 border-none">Logic-Sonnet (High-IQ)</option>
                                        </select>
                                        <ChevronRight className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 transform rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10 pt-4 border-t border-white/5">
                            <div className="space-y-5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                                        {t("creativity") || "Entropy_Level"}
                                    </label>
                                    <span className="text-xs font-black text-amber-400 font-mono tracking-tighter shadow-sm bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">{config?.temperature}</span>
                                </div>
                                <input type="range" min="0" max="1" step="0.1" value={config?.temperature} onChange={(e) => setConfig(prev => prev ? { ...prev, temperature: parseFloat(e.target.value) } : null)} 
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                            </div>

                            <div className="space-y-5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 text-cyan-500" />
                                        {t("length") || "Burst_Limit"}
                                    </label>
                                    <span className="text-xs font-black text-cyan-400 font-mono tracking-tighter shadow-sm bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">{config?.max_tokens}</span>
                                </div>
                                <input type="range" min="50" max="2000" step="50" value={config?.max_tokens} onChange={(e) => setConfig(prev => prev ? { ...prev, max_tokens: parseInt(e.target.value) } : null)} 
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                            </div>
                        </div>
                    </section>

                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-3xl text-center space-y-8 relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                         <div className="p-5 bg-white/5 rounded-3xl inline-block shadow-inner border border-white/10 relative z-10">
                            <ShieldCheck className="w-10 h-10 text-white opacity-80" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Synchronize Core</h3>
                            <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-4 opacity-70">
                                Confirming updates will propagate the new logic structure globally. This action is immutable across active neural streams.
                            </p>
                        </div>
                        <button
                            onClick={saveConfig}
                            disabled={saving}
                            className="w-full h-20 bg-white text-black font-black text-[10px] tracking-[0.4em] uppercase rounded-[2rem] hover:bg-purple-500 hover:text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl relative z-10 flex items-center justify-center gap-4"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sliders className="w-4 h-4" />}
                            {saving ? "PROPAGATING..." : "COMMIT CHANGES"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
