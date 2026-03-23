"use client";
import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import { 
    Globe, Shield, Clock, Building2, Brain, Zap, Lock, LogOut, 
    RefreshCcw, Fingerprint, Sparkles, ChevronRight, Activity, 
    Smartphone, Sliders, Cpu, Terminal, Flame, ShieldCheck,
    LayoutDashboard, Bot as BotIcon, MessageSquare, Loader2,
    Columns, Plus, Trash2, Network, Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AIReasoningTrace from "@/components/molecules/AIReasoningTrace";

interface Tenant {
    id: string;
    name: string;
    wa_session: string;
    industry: string;
    timezone: string;
    settings: Record<string, any>;
    api_key?: string;
}

interface BotConfig {
    id: string;
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

export default function SettingsPage() {
    const t = useTranslations("Settings");
    const bt = useTranslations("Bot");
    const wt = useTranslations("WhatsApp");
    const kt = useTranslations("Kanban");
    
    // Core State
    const [activeTab, setActiveTab] = useState<"general" | "ai" | "whatsapp" | "pipeline" | "security">("general");
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // WhatsApp Specific State
    const [wsStatus, setWsStatus] = useState<string>("disconnected");
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [traceSteps, setTraceSteps] = useState<any[]>([]);
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL;
    const MASTER_KEY = process.env.NEXT_PUBLIC_GATEWAY_API_KEY;

    // Validation Schema
    const settingsSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long").regex(/^[a-zA-Z0-9\s-]+$/, "Invalid characters in name"),
        industry: z.string().min(2, "Industry must be at least 2 characters").max(30, "Industry too long"),
        bot_name: z.string().min(2, "Bot name must be at least 2 characters").max(30, "Bot name too long"),
    });

    // Data Fetching
    const loadSystemData = useCallback(async () => {
        try {
            // 1. Load Tenant
            const { data: tenantData } = await supabase.from("tenants").select("*").limit(1).single();
            if (tenantData) {
                setTenant(tenantData as any);
                
                // 2. Load Bot Config
                const { data: botData } = await supabase.from("bot_configs").select("*").eq("tenant_id", tenantData.id).single();
                if (botData) setBotConfig(botData as any);
                
                // 3. Check WhatsApp Status
                if (tenantData.wa_session) {
                    checkWsStatus(tenantData.wa_session, tenantData.api_key || MASTER_KEY || "");
                }

                // 4. Load Initial AI Traces
                const { data: traceData } = await supabase
                    .from("ai_traces")
                    .select("*")
                    .eq("tenant_name", tenantData.name)
                    .order("created_at", { ascending: false })
                    .limit(5);
                
                if (traceData) {
                    setTraceSteps(traceData.map((tr: any) => ({
                        id: tr.id,
                        type: tr.trace_type,
                        content: tr.content,
                        timestamp: new Date(tr.created_at).toLocaleTimeString()
                    })).reverse());
                }
            }
        } catch (err: any) {
            console.error("System load error:", err.message);
            toast.error(t("error_load"));
        } finally {
            setLoading(false);
        }
    }, [supabase, t, MASTER_KEY]);

    useEffect(() => {
        loadSystemData();
    }, [loadSystemData]);

    // WhatsApp logic
    const checkWsStatus = async (name: string, key: string) => {
        try {
            const res = await fetch(`${GATEWAY_URL}/instance/status/${name}`, {
                headers: { "apikey": key }
            });
            const data = await res.json();
            setWsStatus(data.instance?.state === "open" ? "connected" : "disconnected");
        } catch (err) {
            setWsStatus("disconnected");
        }
    };

    const handleConnectWs = async () => {
        if (!tenant?.wa_session) return;
        setWsStatus("connecting");
        const key = tenant.api_key || MASTER_KEY || "";
        try {
            const res = await fetch(`${GATEWAY_URL}/instance/qr/${tenant.wa_session}`, {
                headers: { "apikey": key }
            });
            const data = await res.json();
                if (data.code || data.base64) {
                    setQrCode(data.base64 || data.code);
                    setWsStatus("qr");
                    toast.success(wt("qr_generated"));
                } else {
                    // If instance doesn't exist, create it
                    await fetch(`${GATEWAY_URL}/instance/create`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "apikey": key },
                        body: JSON.stringify({ instanceName: tenant.wa_session })
                    });
                    setTimeout(() => handleConnectWs(), 2000);
                }
        } catch (err) {
            setWsStatus("disconnected");
            toast.error(wt("session_init_failed"));
        }
    };

    const handleLogoutWs = async () => {
        if (!tenant?.wa_session) return;
        if (!confirm(wt("confirm_disconnect"))) return;
        const key = tenant.api_key || MASTER_KEY || "";
        try {
            await fetch(`${GATEWAY_URL}/instance/logout/${tenant.wa_session}`, {
                method: "DELETE",
                headers: { "apikey": key }
            });
            setWsStatus("disconnected");
            setQrCode(null);
            toast.info(wt("instance_disconnected"));
        } catch (err) {
            toast.error(wt("logout_failed"));
        }
    };

    // Save All Logic
    const handleGlobalSave = async () => {
        if (!tenant || !botConfig) return;
        setErrors({});
        
        // Validate
        const validation = settingsSchema.safeParse({
            name: tenant.name,
            industry: tenant.industry,
            bot_name: botConfig.bot_name
        });

        if (!validation.success) {
            const newErrors: Record<string, string> = {};
            validation.error.issues.forEach(issue => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            toast.error("Validation failed", { description: Object.values(newErrors)[0] });
            return;
        }

        setSaving(true);
        try {
            // Update Tenant
            const { error: tError } = await supabase.from("tenants").update({
                name: tenant.name,
                industry: tenant.industry,
                timezone: tenant.timezone,
                settings: tenant.settings
            }).eq("id", tenant.id);
            
            if (tError) throw tError;

            // Update Bot Config
            const { error: bError } = await supabase.from("bot_configs").update({
                bot_name: botConfig.bot_name,
                is_enabled: botConfig.is_enabled,
                ai_model: botConfig.ai_model,
                temperature: botConfig.temperature,
                max_tokens: botConfig.max_tokens,
                system_prompt: botConfig.system_prompt
            }).eq("id", botConfig.id);

            if (bError) throw bError;

            toast.success(t("success"), { description: bt("success_description") });
        } catch (err: any) {
            toast.error(err.message || t("error_save"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-pulse transition-all bg-background">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-t-accent-primary border-accent-primary/10 animate-spin" />
                <div className="absolute inset-[6px] rounded-full border-2 border-b-accent-secondary border-accent-secondary/10 animate-spin-slow" />
                <Activity className="absolute inset-0 m-auto w-8 h-8 text-accent-primary opacity-50" />
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="text-[12px] font-black text-foreground uppercase tracking-[0.6em] italic">CALIBRATING_NEXUS</div>
                <div className="text-[8px] font-bold text-text-dim uppercase tracking-[0.4em]">Synchronizing Cluster Nodes...</div>
            </div>
        </div>
    );

    const tabs = [
        { id: "general", label: t("title"), icon: LayoutDashboard, color: "text-accent-primary" },
        { id: "ai", label: bt("title"), icon: BotIcon, color: "text-accent-secondary" },
        { id: "whatsapp", label: wt("title"), icon: MessageSquare, color: "text-accent-tertiary" },
        { id: "pipeline", label: kt("title"), icon: Columns, color: "text-amber-500" },
        { id: "security", label: t("account_management"), icon: Lock, color: "text-text-muted" },
    ];

    return (
        <div className="p-4 md:p-12 max-w-[90rem] mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32 transition-all">
            {/* Header */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-accent-primary/10 border border-accent-primary/20 rounded-full shadow-lg shadow-accent-primary/5">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.5)]" />
                            <span className="text-[11px] font-black text-accent-primary uppercase tracking-[0.2em] italic">Nexus Core v5.7.1-Stable</span>
                        </div>
                        {saving && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-accent-secondary uppercase tracking-widest animate-pulse">
                                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                Synchronizing...
                            </div>
                        )}
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tighter italic uppercase leading-[0.9] flex flex-col">
                        SYSTEM<br />
                        <span className="text-accent-primary">ARCHITECTURE_</span>
                    </h1>
                    <p className="text-text-dim flex items-center gap-4 font-bold uppercase tracking-[0.2em] text-[12px] max-w-2xl leading-relaxed">
                        <Shield className="w-6 h-6 text-accent-primary opacity-40 shrink-0" />
                        Configure the neural pathways, communication ingress, and core behavioral tokens of the SilkBot ecosystem.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Button 
                        onClick={handleGlobalSave} 
                        variant="gradient" 
                        loading={saving}
                        className="h-16 px-16 rounded-3xl shadow-[0_25px_50px_rgba(var(--accent-primary-rgb),0.2)] font-black uppercase tracking-[0.4em] italic text-[13px] hover:scale-[1.03] transition-all active:scale-95 group"
                    >
                        <Zap className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                        Commit_Architecture
                    </Button>
                </div>
            </header>

            {/* Tabs Navigation */}
            <nav className="flex flex-wrap items-center gap-4 p-2 bg-foreground/[0.03] border border-glass-border rounded-[2.5rem] backdrop-blur-3xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-3 px-8 py-5 rounded-[1.8rem] text-[12px] font-black uppercase tracking-widest transition-all italic",
                            activeTab === tab.id 
                                ? "bg-surface border border-glass-border shadow-2xl scale-105 z-10" 
                                : "text-text-dim hover:text-foreground hover:bg-foreground/[0.02]"
                        )}
                    >
                        <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? tab.color : "opacity-40")} />
                        {tab.label}
                        {activeTab === tab.id && <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", tab.color.replace('text-', 'bg-'))} />}
                    </button>
                ))}
            </nav>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 xl:grid-cols-12 gap-12"
                >
                    {activeTab === "general" && (
                        <>
                            <div className="xl:col-span-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <motion.section className="glass-card p-12 space-y-12 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-12 opacity-5">
                                            <Building2 className="w-48 h-48 text-accent-primary rotate-12" />
                                        </div>
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="w-16 h-16 bg-accent-primary/10 rounded-[2rem] flex items-center justify-center border border-accent-primary/20 shadow-inner">
                                                <Building2 className="w-8 h-8 text-accent-primary" />
                                            </div>
                                            <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">{t("profile")}</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                                            <InputField 
                                                label={t("business_name")} 
                                                value={tenant?.name || ""} 
                                                error={errors.name}
                                                onChange={(val) => setTenant(prev => prev ? { ...prev, name: val } : null)}
                                            />
                                            <InputField 
                                                label={t("industry")} 
                                                value={tenant?.industry || ""} 
                                                error={errors.industry}
                                                onChange={(val) => setTenant(prev => prev ? { ...prev, industry: val } : null)}
                                            />
                                            <div className="md:col-span-2 space-y-4">
                                                <label className="text-[11px] font-black text-text-dim uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-accent-primary/50" />
                                                    {t("timezone")}
                                                </label>
                                                <div className="relative group/select">
                                                    <select
                                                        value={tenant?.timezone || "UTC"}
                                                        onChange={(e) => setTenant(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                                                        className="w-full bg-foreground/[0.03] border border-glass-border rounded-3xl px-8 py-5 text-[15px] text-foreground focus:ring-2 focus:ring-accent-primary/30 outline-none transition-all appearance-none cursor-pointer font-bold hover:bg-foreground/[0.05]"
                                                    >
                                                        <option value="UTC" className="bg-background text-foreground">{t("tz_utc")}</option>
                                                        <option value="Africa/Cairo" className="bg-background text-foreground">{t("tz_cairo")}</option>
                                                        <option value="Asia/Riyadh" className="bg-background text-foreground">{t("tz_riyadh")}</option>
                                                        <option value="Asia/Dubai" className="bg-background text-foreground">{t("tz_dubai")}</option>
                                                    </select>
                                                    <Globe className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim pointer-events-none group-focus-within/select:text-accent-primary transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.section>

                                    <motion.section className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-8 bg-gradient-to-br from-accent-primary/[0.02] to-transparent">
                                        <div className="w-24 h-24 bg-accent-primary/5 rounded-[3rem] flex items-center justify-center border border-accent-primary/10 mb-2">
                                            <Sparkles className="w-10 h-10 text-accent-primary" />
                                        </div>
                                        <div className="space-y-4 max-w-md">
                                            <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Optimization Ready</h3>
                                            <p className="text-text-muted font-semibold text-[14px] leading-relaxed">
                                                Your business identity is the foundation of the neural model. Ensure these details are accurate for optimal AI personalization.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-6 py-3 bg-foreground/[0.02] border border-glass-border rounded-full text-[10px] font-black text-text-dim uppercase tracking-widest italic">
                                            Cluster: Frankfurt-EU-01
                                        </div>
                                    </motion.section>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "ai" && (
                        <>
                            <div className="xl:col-span-8 space-y-12">
                                <motion.section className="glass-card p-12 space-y-12 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 opacity-5">
                                        <Terminal className="w-48 h-48 text-accent-secondary -rotate-12" />
                                    </div>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-accent-secondary/10 rounded-[2.2rem] flex items-center justify-center border border-accent-secondary/20 shadow-inner">
                                                <Brain className="w-8 h-8 text-accent-secondary" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">{bt("title")}</h2>
                                                <div className="text-[10px] font-black text-accent-secondary uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                                    Neural_Fabric Status: Optimal
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 px-10 py-5 bg-foreground/[0.02] border border-glass-border rounded-[2rem]">
                                            <span className={cn("text-[11px] font-black uppercase tracking-widest italic", botConfig?.is_enabled ? "text-accent-secondary" : "text-text-dim")}>
                                                {botConfig?.is_enabled ? "Operational" : "Locked"}
                                            </span>
                                            <button 
                                                onClick={() => setBotConfig(prev => prev ? { ...prev, is_enabled: !prev.is_enabled } : null)}
                                                className={cn(
                                                    "w-16 h-8 rounded-full border transition-all relative",
                                                    botConfig?.is_enabled ? "bg-accent-secondary/20 border-accent-secondary/40" : "bg-foreground/[0.05] border-glass-border"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-5 h-5 rounded-full transition-all shadow-lg",
                                                    botConfig?.is_enabled ? "left-9 bg-accent-secondary shadow-accent-secondary/50" : "left-1 bg-text-dim"
                                                )} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-8 relative z-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <InputField 
                                                label={bt("name")} 
                                                value={botConfig?.bot_name || ""} 
                                                error={errors.bot_name}
                                                onChange={(val) => setBotConfig(prev => prev ? { ...prev, bot_name: val } : null)}
                                            />
                                            <div className="space-y-4">
                                                <label className="text-[11px] font-black text-text-dim uppercase tracking-[0.3em] ml-2">{bt("model_select")}</label>
                                                <div className="relative">
                                                    <select
                                                        value={botConfig?.ai_model || "gpt-4o-mini"}
                                                        onChange={(e) => setBotConfig(prev => prev ? { ...prev, ai_model: e.target.value } : null)}
                                                        className="w-full bg-foreground/[0.03] border border-glass-border rounded-3xl px-8 py-5 text-[15px] font-black italic tracking-tight text-foreground appearance-none outline-none focus:ring-2 focus:ring-accent-secondary/30 transition-all cursor-pointer hover:bg-foreground/[0.05]"
                                                    >
                                                        <option value="gpt-4o-mini" className="bg-background text-foreground tracking-widest uppercase italic">Mini_V1 (Fast)</option>
                                                        <option value="gpt-4o" className="bg-background text-foreground tracking-widest uppercase italic">Neural_Prime (Elite)</option>
                                                        <option value="claude-3-5-sonnet" className="bg-background text-foreground tracking-widest uppercase italic">Logic_Sonnet (Refined)</option>
                                                    </select>
                                                    <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-secondary rotate-90 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-text-dim uppercase tracking-[0.3em] ml-2 italic">{bt("prompt")}</label>
                                            <textarea
                                                rows={8}
                                                value={botConfig?.system_prompt || ""}
                                                onChange={(e) => setBotConfig(prev => prev ? { ...prev, system_prompt: e.target.value } : null)}
                                                className="w-full bg-foreground/[0.02] border border-glass-border rounded-[2.5rem] px-10 py-10 text-[16px] text-foreground focus:ring-2 focus:ring-accent-secondary/30 outline-none transition-all resize-none font-mono leading-relaxed shadow-inner"
                                                placeholder={bt("prompt_placeholder")}
                                            />
                                            <div className="flex items-center gap-4 p-6 bg-accent-secondary/[0.02] border border-accent-secondary/10 rounded-3xl italic">
                                                <Fingerprint className="w-6 h-6 text-accent-secondary shrink-0 opacity-60" />
                                                <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest leading-loose drop-shadow-sm">
                                                    Quantum behavioral weights and linguistic tokens are derived strictly from this kernel instruction.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>

                                <AIReasoningTrace steps={traceSteps} />
                            </div>

                            <div className="xl:col-span-4 space-y-12">
                                <motion.section className="glass-card p-12 space-y-12 bg-gradient-to-b from-background to-accent-secondary/[0.03]">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-accent-secondary/10 rounded-[2rem] flex items-center justify-center border border-accent-secondary/20">
                                            <Sliders className="w-8 h-8 text-accent-secondary" />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Fine_Tuning</h3>
                                    </div>

                                    <div className="space-y-12">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[11px] font-black text-text-dim uppercase tracking-[0.3em] flex items-center gap-3">
                                                    <Flame className="w-4 h-4 text-amber-500" />
                                                    {bt("creativity")}
                                                </label>
                                                <span className="text-xs font-black text-white bg-amber-500 px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/20">{botConfig?.temperature}</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="1" step="0.1" 
                                                value={botConfig?.temperature || 0.7} 
                                                onChange={(e) => setBotConfig(prev => prev ? { ...prev, temperature: parseFloat(e.target.value) } : null)} 
                                                className="w-full h-1.5 bg-foreground/[0.05] rounded-full appearance-none cursor-pointer accent-amber-500" 
                                            />
                                            <div className="flex justify-between text-[8px] font-black text-text-dim uppercase tracking-widest">
                                                <span>Precise_Kernel</span>
                                                <span>Emergent_Identity</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[11px] font-black text-text-dim uppercase tracking-[0.3em] flex items-center gap-3">
                                                    <Zap className="w-4 h-4 text-accent-tertiary" />
                                                    {bt("length")}
                                                </label>
                                                <span className="text-xs font-black text-white bg-accent-tertiary px-4 py-1.5 rounded-full shadow-lg shadow-accent-tertiary/20">{botConfig?.max_tokens}</span>
                                            </div>
                                            <input 
                                                type="range" min="50" max="2000" step="50" 
                                                value={botConfig?.max_tokens || 500} 
                                                onChange={(e) => setBotConfig(prev => prev ? { ...prev, max_tokens: parseInt(e.target.value) } : null)} 
                                                className="w-full h-1.5 bg-foreground/[0.05] rounded-full appearance-none cursor-pointer accent-accent-tertiary" 
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-glass-border space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-accent-primary/5 rounded-2xl flex items-center justify-center border border-accent-primary/10">
                                                <ShieldCheck className="w-5 h-5 text-accent-primary opacity-60" />
                                            </div>
                                            <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest italic">
                                                Immutable Core: Updates apply instantly across all active conversational shards.
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            </div>
                        </>
                    )}

                    {activeTab === "whatsapp" && (
                        <>
                            <div className="xl:col-span-12 space-y-12">
                                <motion.section className="glass-card p-12 flex flex-col md:flex-row gap-20 items-center overflow-hidden bg-gradient-to-br from-background to-accent-tertiary/[0.03]">
                                    <div className="flex-1 space-y-10 relative z-10">
                                        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-accent-tertiary/10 border border-accent-tertiary/20 rounded-full mb-2">
                                            <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse shadow-lg", wsStatus === "connected" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50")} />
                                            <span className="text-[11px] font-black text-accent-tertiary uppercase tracking-[0.2em] italic">
                                                {wsStatus === "connected" ? "Neural Ingress Active" : "Bridge Connection Locked"}
                                            </span>
                                        </div>
                                        <h2 className="text-5xl font-black text-foreground uppercase italic tracking-tighter leading-none">{wt("title")}</h2>
                                        <p className="text-text-muted font-semibold text-[16px] leading-relaxed max-w-2xl opacity-80 italic">
                                            Establish a direct neural link between your WhatsApp Business endpoint and the SilkBot cloud infrastructure. This bridge enables real-time message orchestration and AI response deflection.
                                        </p>
                                        
                                        <div className="flex flex-wrap items-center gap-6">
                                            {wsStatus === "connected" ? (
                                                <button
                                                    onClick={handleLogoutWs}
                                                    className="px-12 py-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10 italic flex items-center gap-4"
                                                >
                                                    <LogOut className="w-5 h-5" />
                                                    {wt("btn_logout")}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleConnectWs}
                                                    className="px-14 py-6 bg-accent-tertiary text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.4em] hover:bg-accent-tertiary/90 hover:scale-[1.03] active:scale-95 transition-all shadow-[0_20px_40px_rgba(var(--accent-tertiary-rgb),0.3)] italic flex items-center gap-4"
                                                >
                                                    <RefreshCcw className="w-5 h-5" />
                                                    {wt("btn_connect")}
                                                </button>
                                            )}
                                            <div className="px-8 py-5 bg-foreground/[0.03] border border-glass-border rounded-[1.8rem] text-text-dim text-[11px] font-black tracking-widest uppercase italic flex items-center gap-4">
                                                <Cpu className="w-5 h-5 text-accent-tertiary opacity-50" />
                                                Tunnel_ID: <span className="text-foreground">{tenant?.wa_session || "null"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group/qr p-2">
                                        <div className="absolute -inset-8 bg-accent-tertiary/15 rounded-[4rem] blur-3xl opacity-0 group-hover/qr:opacity-100 transition-opacity duration-1000" />
                                        <div className={cn(
                                            "w-96 h-96 bg-card p-10 rounded-[4rem] shadow-2xl relative border-[12px] transition-all duration-700 overflow-hidden flex flex-col items-center justify-center",
                                            wsStatus === "connected" ? "border-emerald-500/20" : "border-accent-tertiary/10"
                                        )}>
                                            {wsStatus === "qr" && qrCode ? (
                                                <div className="relative w-full h-full animate-in zoom-in-95 duration-500">
                                                    <img src={qrCode} alt="QR Code" className="w-full h-full rounded-2xl" />
                                                    <div className="absolute top-0 left-0 w-full h-[3px] bg-accent-tertiary shadow-[0_0_20px_rgba(var(--accent-tertiary-rgb),1)] z-20 animate-scan" />
                                                </div>
                                            ) : wsStatus === "connected" ? (
                                                <div className="text-center space-y-6">
                                                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mx-auto shadow-inner">
                                                        <ShieldCheck className="w-12 h-12 text-emerald-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h4 className="text-foreground font-black uppercase tracking-tighter text-2xl italic">Bridge_Secure</h4>
                                                        <p className="text-text-dim font-bold text-[10px] uppercase tracking-widest italic">{wt("device_linked")}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-6 p-4">
                                                    <div className="w-24 h-24 bg-foreground/[0.05] rounded-full flex items-center justify-center border border-glass-border mx-auto">
                                                        <Smartphone className="w-12 h-12 text-text-muted" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-foreground font-black uppercase tracking-tight text-xl italic">{wt("no_session")}</h4>
                                                        <p className="text-text-muted font-medium text-[12px] max-w-[180px] mx-auto leading-relaxed">{wt("initialize_pairing")}</p>
                                                    </div>
                                                    {wsStatus === "connecting" && (
                                                        <div className="flex flex-col items-center gap-3 mt-4">
                                                            <Loader2 className="w-8 h-8 text-accent-tertiary animate-spin" />
                                                            <span className="text-accent-tertiary font-black text-[9px] uppercase tracking-[0.3em] italic">Building_Tunnel...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.section>
                            </div>
                        </>
                    )}

                    {activeTab === "pipeline" && (
                        <>
                            <div className="xl:col-span-8 space-y-12">
                                <motion.section className="glass-card p-12 space-y-12 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 opacity-5">
                                        <Columns className="w-48 h-48 text-amber-500 rotate-12" />
                                    </div>
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-16 h-16 bg-amber-500/10 rounded-[2rem] flex items-center justify-center border border-amber-500/20 shadow-inner">
                                            <Columns className="w-8 h-8 text-amber-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">{kt("title")} States</h2>
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mt-2">Neural Acquisition Flow</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6 relative z-10">
                                        {[
                                            { id: 'new', color: 'bg-blue-500' },
                                            { id: 'warm', color: 'bg-orange-500' },
                                            { id: 'hot', color: 'bg-red-500' },
                                            { id: 'closed', color: 'bg-emerald-500' }
                                        ].map((stage) => (
                                            <div key={stage.id} className="group/stage flex items-center gap-6 p-6 bg-foreground/[0.02] border border-glass-border rounded-3xl hover:border-amber-500/30 transition-all shadow-lg">
                                                <div className={cn("w-4 h-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]", stage.color)} />
                                                <div className="flex-1 flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <span className="text-[14px] font-black text-foreground uppercase italic tracking-tighter">{kt(stage.id)}</span>
                                                        <p className="text-[9px] text-text-dim uppercase tracking-widest font-black">Stage_Identifier: {stage.id.toUpperCase()}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover/stage:opacity-100 transition-opacity">
                                                        <button className="p-2 text-text-dim hover:text-amber-500 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                                                        <button className="p-2 text-text-dim hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="w-full py-6 border-2 border-dashed border-glass-border rounded-3xl text-[11px] font-black text-text-dim uppercase tracking-[0.3em] hover:bg-amber-500/5 hover:border-amber-500/30 hover:text-amber-500 transition-all flex items-center justify-center gap-3 group">
                                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                            Inject_New_Stage
                                        </button>
                                    </div>
                                </motion.section>
                            </div>

                            <div className="xl:col-span-4 space-y-12">
                                <motion.section className="glass-card p-12 space-y-12 bg-gradient-to-b from-background to-amber-500/[0.03]">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-amber-500/10 rounded-[2rem] flex items-center justify-center border border-amber-500/20">
                                            <Network className="w-8 h-8 text-amber-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter italic">Integrations</h3>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-5">
                                            <label className="text-[11px] font-black text-text-dim uppercase tracking-[0.3em] ml-2 italic">External_Webhook_Node</label>
                                            <div className="relative group">
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-foreground/[0.03] border border-glass-border rounded-[1.8rem] px-8 py-6 text-[13px] font-mono text-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none transition-all shadow-inner"
                                                    placeholder="https://api.yourdomain.com/webhook"
                                                    value={tenant?.settings?.webhook_url || ""}
                                                    onChange={(e) => setTenant(prev => prev ? { ...prev, settings: { ...prev.settings, webhook_url: e.target.value } } : null)}
                                                />
                                                <Zap className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 animate-pulse" />
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[2.5rem] bg-foreground/[0.02] border border-glass-border space-y-4">
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic leading-relaxed">
                                                Pipeline data will be synchronized across all cluster nodes. External nodes will receive vectorized payloads on state transition.
                                            </p>
                                        </div>
                                    </div>
                                </motion.section>
                            </div>
                        </>
                    )}

                    {activeTab === "security" && (
                        <>
                            <div className="xl:col-span-12">
                                <motion.section className="glass-card p-12 space-y-12 shadow-2xl border-t-[6px] border-t-red-500/20">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                        <div className="flex items-center gap-8">
                                            <div className="w-20 h-20 bg-foreground/[0.04] rounded-[2.5rem] flex items-center justify-center border border-glass-border shadow-inner">
                                                <Lock className="w-10 h-10 text-text-dim" />
                                            </div>
                                            <div className="space-y-2">
                                                <h2 className="text-4xl font-black text-foreground uppercase italic tracking-tighter leading-none">{t("account_management")}</h2>
                                                <p className="text-[11px] font-black text-text-dim uppercase tracking-[0.5em] italic">Access_Control_Nexus v1.0</p>
                                            </div>
                                        </div>
                                        <div className="bg-red-500/10 px-8 py-4 rounded-[1.8rem] border border-red-500/20 flex items-center gap-4">
                                            <Shield className="w-5 h-5 text-red-500" />
                                            <span className="text-[12px] font-black text-red-500 uppercase tracking-widest italic">Critical Security Sector</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-end">
                                        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-5">
                                                <label className="text-[12px] font-black text-text-dim uppercase tracking-[0.4em] ml-2 italic">{t("user_email")}</label>
                                                <div className="relative group">
                                                    <input
                                                        disabled
                                                        type="email"
                                                        value="admin@silkbot.neural"
                                                        className="w-full bg-foreground/[0.02] border border-glass-border rounded-[1.8rem] px-10 py-6 text-[16px] text-text-dim outline-none cursor-not-allowed font-semibold opacity-60 backdrop-blur-md"
                                                    />
                                                    <Lock className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim opacity-30" />
                                                </div>
                                            </div>
                                            <div className="flex items-end">
                                                <button className="w-full h-[76px] inline-flex items-center justify-center gap-5 border border-glass-border hover:bg-foreground/[0.04] rounded-[1.8rem] font-black uppercase tracking-widest italic text-[12px] transition-all group active:scale-95 shadow-xl hover:shadow-accent-primary/5">
                                                    <Fingerprint className="w-6 h-6 text-accent-primary" />
                                                    {t("change_password")}
                                                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all text-accent-primary" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-4 flex justify-end">
                                            <button className="flex items-center gap-6 px-16 py-7 rounded-[2rem] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-red-500/10 border border-red-500/20 italic group relative overflow-hidden active:scale-95">
                                                <div className="absolute inset-0 bg-red-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                                <div className="relative z-10 flex items-center gap-4">
                                                    <LogOut className="w-6 h-6" />
                                                    {t("sign_out")}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.section>
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Global Scan-line Overlay Effect */}
            <style jsx global>{`
                @keyframes scan {
                    0% { transform: translateY(0); opacity: 0; }
                    50% { opacity: 0.6; }
                    100% { transform: translateY(384px); opacity: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
                .animate-spin-slow {
                    animation: spin 12s linear infinite;
                }
            `}</style>
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, error }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string, error?: string }) {
    return (
        <div className="space-y-4 group">
            <div className="flex items-center justify-between ml-2">
                <label className={cn(
                    "text-[11px] font-black uppercase tracking-[0.3em] transition-colors italic",
                    error ? "text-red-500" : "text-text-dim group-focus-within:text-accent-primary"
                )}>
                    {label}
                </label>
                {error && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse">{error}</span>}
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full bg-foreground/[0.03] border rounded-3xl px-8 py-5 text-[15px] text-foreground",
                    "focus:ring-2 outline-none transition-all font-semibold",
                    error ? "border-red-500/50 focus:ring-red-500/30" : "border-glass-border focus:ring-accent-primary/30",
                    "placeholder:text-text-dim/40 placeholder:font-medium backdrop-blur-md group-hover:bg-foreground/[0.05] shadow-inner"
                )}
            />
        </div>
    );
}
