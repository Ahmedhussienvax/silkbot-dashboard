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
    Smartphone, ShieldCheck,
    LayoutDashboard, MessageSquare, Loader2, Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Tenant {
    id: string;
    name: string;
    wa_session: string;
    industry: string;
    timezone: string;
    settings: Record<string, any>;
    api_key?: string;
}

// BotConfig interface removed — AI config now managed in /dashboard/bot

export default function SettingsPage() {
    const t = useTranslations("Settings");
    const bt = useTranslations("Bot");
    const wt = useTranslations("WhatsApp");
    // Kanban translations removed — pipeline tab moved to dedicated page
    
    // Core State
    const [activeTab, setActiveTab] = useState<"general" | "whatsapp" | "billing" | "security">("general");
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // WhatsApp Specific State
    const [wsStatus, setWsStatus] = useState<string>("disconnected");
    const [qrCode, setQrCode] = useState<string | null>(null);
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // [SEC-01] Removed direct Gateway URL/Key access. Using /api/gateway/ proxy routes.

    // Validation Schema (bot_name removed — AI config now lives in /dashboard/bot)
    const settingsSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long").regex(/^[a-zA-Z0-9\s-]+$/, "Invalid characters in name"),
        industry: z.string().min(2, "Industry must be at least 2 characters").max(30, "Industry too long"),
    });

    // Data Fetching
    const loadSystemData = useCallback(async () => {
        try {
            // 1. Load Tenant
            const { data: tenantData } = await supabase.from("tenants").select("*").limit(1).single();
            if (tenantData) {
                setTenant(tenantData as any);
                
                // 2. Check WhatsApp Status
                if (tenantData.wa_session) {
                    checkWsStatus(tenantData.wa_session);
                }
            }
        } catch (err: any) {
            console.error("System load error:", err.message);
            toast.error(t("error_load"));
        } finally {
            setLoading(false);
        }
    }, [supabase, t]);

    useEffect(() => {
        loadSystemData();
    }, [loadSystemData]);

    // WhatsApp logic
    const checkWsStatus = async (name: string) => {
        try {
            const res = await fetch(`/api/gateway/instance/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instanceName: name })
            });
            const data = await res.json();
            setWsStatus(data.instance?.state === "open" ? "connected" : "disconnected");
        } catch (err) {
            setWsStatus("disconnected");
        }
    };

    const handleConnectWs = async () => {
        if (!tenant?.wa_session || tenant.wa_session === "null") {
            toast.error(wt("tunnel_id_required"));
            return;
        }
        setWsStatus("connecting");
        try {
            const res = await fetch(`/api/gateway/instance/qr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instanceName: tenant.wa_session })
            });
            const data = await res.json();
            if (data.code || data.base64) {
                setQrCode(data.base64 || data.code);
                setWsStatus("qr");
                toast.success(wt("qr_generated"));
            } else {
                // If instance doesn't exist, create it via proxy
                await fetch(`/api/gateway/instance/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
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
        try {
            await fetch(`/api/gateway/instance/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instanceName: tenant.wa_session })
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
        if (!tenant) return;
        setErrors({});
        
        // Validate
        const validation = settingsSchema.safeParse({
            name: tenant.name,
            industry: tenant.industry,
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
                settings: tenant.settings,
                wa_session: tenant.wa_session
            }).eq("id", tenant.id);
            
            if (tError) throw tError;

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
                <div className="text-[12px] font-black text-foreground uppercase tracking-[0.6em] italic">{t("calibrating_nexus")}</div>
                <div className="text-[8px] font-bold text-text-dim uppercase tracking-[0.4em]">{t("syncing_cluster")}</div>
            </div>
        </div>
    );

    const tabs = [
        { id: "general", label: t("title"), icon: LayoutDashboard, color: "text-accent-primary" },
        { id: "whatsapp", label: wt("title"), icon: MessageSquare, color: "text-accent-tertiary" },
        { id: "billing", label: t("account_management"), icon: Lock, color: "text-amber-500" },
        { id: "security", label: t("security_sector"), icon: Shield, color: "text-text-muted" },
    ];

    return (
        <div className="p-4 md:p-12 max-w-[90rem] mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32 transition-all">
            {/* Header */}
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-accent-primary/10 border border-accent-primary/20 rounded-full shadow-lg shadow-accent-primary/5">
                            <div className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.5)]" />
                            <span className="text-[11px] font-black text-accent-primary uppercase tracking-[0.2em] italic">{t("nexus_version")}</span>
                        </div>
                        {saving && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-accent-secondary uppercase tracking-widest animate-pulse">
                                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                {t("syncing_nexus")}
                            </div>
                        )}
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-foreground tracking-tighter italic uppercase leading-[0.9] flex flex-col">
                        {t("system_title")}<br />
                        <span className="text-accent-primary">{t("system_architecture")}</span>
                    </h1>
                    <p className="text-text-dim flex items-center gap-4 font-bold uppercase tracking-[0.2em] text-[12px] max-w-2xl leading-relaxed">
                        <Shield className="w-6 h-6 text-accent-primary opacity-40 shrink-0" />
                        {t("system_paths_desc")}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Button 
                        onClick={handleGlobalSave} 
                        variant="gradient" 
                        loading={saving}
                        className="h-16 px-16 rounded-3xl shadow-[0_25px_50px_rgba(var(--accent-primary-rgb),0.2)] font-black uppercase tracking-[0.4em] italic text-[13px] hover:scale-[1.03] transition-all active:scale-95 group relative overflow-hidden"
                    >
                        <AnimatePresence>
                            {saving ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3"
                                >
                                    <RefreshCcw className="w-5 h-5 animate-spin" />
                                    {t("syncing_nexus")}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <Zap className="w-5 h-5 group-hover:animate-bounce" />
                                    {t("commit_architecture")}
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                            <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">{t("optimization_ready")}</h3>
                                            <p className="text-text-muted font-semibold text-[14px] leading-relaxed">
                                                {t("optimization_desc")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-6 py-3 bg-foreground/[0.02] border border-glass-border rounded-full text-[10px] font-black text-text-dim uppercase tracking-widest italic">
                                            {t("cluster_node")}
                                        </div>
                                    </motion.section>
                                </div>
                            </div>
                        </>
                    )}

                    {/* AI Tab removed — AI config now lives in /dashboard/bot (AI Hub) */}

                    {activeTab === "whatsapp" && (
                        <>
                            <div className="xl:col-span-12 space-y-12">
                                <motion.section className="glass-card p-12 flex flex-col md:flex-row gap-20 items-center overflow-hidden bg-gradient-to-br from-background to-accent-tertiary/[0.03]">
                                    <div className="flex-1 space-y-10 relative z-10">
                                        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-accent-tertiary/10 border border-accent-tertiary/20 rounded-full mb-2">
                                            <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse shadow-lg", wsStatus === "connected" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50")} />
                                            <span className="text-[11px] font-black text-accent-tertiary uppercase tracking-[0.2em] italic">
                                                {wsStatus === "connected" ? wt("status_active") : wt("status_locked")}
                                            </span>
                                        </div>
                                        <h2 className="text-5xl font-black text-foreground uppercase italic tracking-tighter leading-none">{wt("title")}</h2>
                                        <p className="text-text-muted font-semibold text-[16px] leading-relaxed max-w-2xl opacity-80 italic">
                                            {wt("description")}
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
                                            <div className="flex flex-col gap-4">
                                                <div className="px-8 py-5 bg-foreground/[0.03] border border-glass-border rounded-[1.8rem] text-text-dim text-[11px] font-black tracking-widest uppercase italic flex items-center gap-4">
                                                    <Activity className="w-5 h-5 text-accent-tertiary opacity-50" />
                                                    {wt("tunnel_id")}: <span className={cn("font-mono", (!tenant?.wa_session || tenant.wa_session === "null") && "text-red-500 animate-pulse bg-red-500/10 px-2 rounded")}>
                                                        {(!tenant?.wa_session || tenant.wa_session === "null") ? wt("missing_id") : tenant.wa_session}
                                                    </span>
                                                </div>
                                                
                                                {(!tenant?.wa_session || tenant.wa_session === "null") && (
                                                    <div className="max-w-xs animate-in slide-in-from-left-4 duration-500">
                                                        <InputField 
                                                            label={wt("tunnel_id")}
                                                            placeholder="e.g. business-01"
                                                            value={tenant?.wa_session === "null" ? "" : tenant?.wa_session || ""}
                                                            onChange={(val) => setTenant(prev => prev ? { ...prev, wa_session: val || "null" } : null)}
                                                        />
                                                        <p className="text-[9px] text-accent-tertiary font-black uppercase tracking-widest mt-2 ml-4">
                                                            {wt("initialize_pairing")}
                                                        </p>
                                                    </div>
                                                )}
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
                                                        <h4 className="text-foreground font-black uppercase tracking-tighter text-2xl italic">{wt("bridge_secure")}</h4>
                                                        <p className="text-text-dim font-bold text-[10px] uppercase tracking-widest italic">{wt("device_linked")}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div 
                                                    onClick={handleConnectWs}
                                                    className="text-center space-y-6 p-4 cursor-pointer hover:bg-foreground/[0.02] transition-all active:scale-95 group/btn"
                                                >
                                                    <div className="w-24 h-24 bg-foreground/[0.05] rounded-full flex items-center justify-center border border-glass-border mx-auto group-hover/btn:border-accent-tertiary/30 group-hover/btn:scale-110 transition-all">
                                                        <Smartphone className="w-12 h-12 text-text-muted group-hover:text-accent-tertiary transition-colors" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-foreground font-black uppercase tracking-tight text-xl italic group-hover:text-accent-tertiary transition-colors">{wt("no_session")}</h4>
                                                        <p className="text-text-muted font-medium text-[12px] max-w-[180px] mx-auto leading-relaxed">{wt("initialize_pairing")}</p>
                                                    </div>
                                                    {(wsStatus === "connecting" || wsStatus === "loading") && (
                                                        <div className="flex flex-col items-center gap-3 mt-4">
                                                            <Loader2 className="w-8 h-8 text-accent-tertiary animate-spin" />
                                                            <span className="text-accent-tertiary font-black text-[9px] uppercase tracking-[0.3em] italic">{wt("building_tunnel")}</span>
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

                    {activeTab === "billing" && (
                        <>
                            <div className="xl:col-span-12">
                                <motion.section className="glass-card p-12 space-y-12 relative overflow-hidden bg-gradient-to-br from-background to-amber-500/[0.03]">
                                    <div className="absolute top-0 right-0 p-12 opacity-5">
                                        <Zap className="w-48 h-48 text-amber-500 rotate-12" />
                                    </div>
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-16 h-16 bg-amber-500/10 rounded-[2rem] flex items-center justify-center border border-amber-500/20 shadow-inner">
                                            <Zap className="w-8 h-8 text-amber-500" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">{t("account_management")}</h2>
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mt-2">Quota Management & Subscription</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                                        {/* Webhook Config */}
                                        <div className="space-y-5">
                                            <label className="text-[11px] font-black text-text-dim uppercase tracking-[0.3em] ml-2 italic">Webhook Endpoint</label>
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

                                        {/* Quick Links */}
                                        <div className="flex flex-col gap-4">
                                            <a href="/dashboard/bot" className="p-6 bg-foreground/[0.02] border border-glass-border rounded-3xl hover:border-accent-secondary/30 transition-all flex items-center gap-4 group">
                                                <div className="w-12 h-12 bg-accent-secondary/10 rounded-2xl flex items-center justify-center border border-accent-secondary/20">
                                                    <Brain className="w-6 h-6 text-accent-secondary" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-[12px] font-black text-foreground uppercase tracking-tight">{bt("title")}</span>
                                                    <p className="text-[9px] text-text-dim uppercase tracking-widest font-bold">Configure AI models & prompts</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-text-dim group-hover:text-accent-secondary group-hover:translate-x-1 transition-all" />
                                            </a>
                                            <a href="/dashboard/knowledge" className="p-6 bg-foreground/[0.02] border border-glass-border rounded-3xl hover:border-accent-primary/30 transition-all flex items-center gap-4 group">
                                                <div className="w-12 h-12 bg-accent-primary/10 rounded-2xl flex items-center justify-center border border-accent-primary/20">
                                                    <Sparkles className="w-6 h-6 text-accent-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-[12px] font-black text-foreground uppercase tracking-tight">Knowledge Base</span>
                                                    <p className="text-[9px] text-text-dim uppercase tracking-widest font-bold">Upload docs & manage RAG</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-text-dim group-hover:text-accent-primary group-hover:translate-x-1 transition-all" />
                                            </a>
                                        </div>

                                        {/* Info Card */}
                                        <div className="p-8 rounded-[2.5rem] bg-foreground/[0.02] border border-glass-border space-y-4">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="w-5 h-5 text-accent-primary opacity-60" />
                                                <span className="text-[11px] font-black text-foreground uppercase tracking-tight">Subscription Status</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Plan</span>
                                            </div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic leading-relaxed">
                                                Your subscription is active. Quota usage is tracked on the dashboard overview.
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
                                                <p className="text-[11px] font-black text-text-dim uppercase tracking-[0.5em] italic">{t("nexus_version_sec")}</p>
                                            </div>
                                        </div>
                                        <div className="bg-red-500/10 px-8 py-4 rounded-[1.8rem] border border-red-500/20 flex items-center gap-4">
                                            <Shield className="w-5 h-5 text-red-500" />
                                            <span className="text-[12px] font-black text-red-500 uppercase tracking-widest italic">{t("security_sector")}</span>
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
