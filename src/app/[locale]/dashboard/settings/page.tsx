"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import { Globe, Shield, Clock, Building2, Brain, Zap, Lock, LogOut, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

interface Tenant {
    id: string;
    name: string;
    phone_number: string;
    industry: string;
    timezone: string;
    settings: Record<string, any>;
}

export default function SettingsPage() {
    const t = useTranslations("Settings");
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            try {
                const { data, error } = await supabase.from("tenants").select("*").limit(1).single();
                if (data) setTenant(data);
            } catch (err: any) {
                console.error("Error loading tenant:", err.message);
                toast.error(t("error_load"));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [supabase]);

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) return;
        setSaving(true);
        try {
            const { error: saveError } = await supabase
                .from("tenants")
                .update({ 
                    name: tenant.name, 
                    industry: tenant.industry, 
                    timezone: tenant.timezone,
                    settings: tenant.settings
                })
                .eq("id", tenant.id);
            
            if (saveError) throw saveError;
            toast.success(t("success"));
        } catch (err: any) {
            toast.error(err.message || t("error_save"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-primary/20 border-t-accent-primary" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-12 animate-fade-in pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
                        SYSTEM<span className="text-accent-primary">_CONFIGURATION</span>
                    </h1>
                    <p className="text-slate-500 mt-2 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                        <Shield className="w-4 h-4 text-accent-primary" />
                        {t("description")}
                    </p>
                </div>
                <Button 
                    onClick={saveSettings} 
                    variant="gradient" 
                    loading={saving}
                    className="h-14 px-10 rounded-2xl shadow-2xl shadow-accent-primary/20"
                >
                    {t("save")}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 1. Profile & Industry */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-card p-10 space-y-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                            <Building2 className="w-6 h-6 text-accent-primary" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{t("profile")}</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("business_name")}</label>
                                <input
                                    type="text"
                                    value={tenant?.name || ""}
                                    onChange={(e) => setTenant(prev => prev ? { ...prev, name: e.target.value } : null)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-accent-primary/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("industry")}</label>
                                <input
                                    type="text"
                                    value={tenant?.industry || ""}
                                    onChange={(e) => setTenant(prev => prev ? { ...prev, industry: e.target.value } : null)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-accent-primary/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("timezone")}</label>
                            <select
                                value={tenant?.timezone || "UTC"}
                                onChange={(e) => setTenant(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-accent-primary/50 outline-none transition-all appearance-none"
                            >
                                <option value="UTC">{t("tz_utc")}</option>
                                <option value="Africa/Cairo">{t("tz_cairo")}</option>
                                <option value="Asia/Riyadh">{t("tz_riyadh")}</option>
                                <option value="Asia/Dubai">{t("tz_dubai")}</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* 2. AI Cognition (System Prompt) */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-10 space-y-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                            <Brain className="w-6 h-6 text-accent-secondary" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{t("ai_cognition")}</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("system_prompt")}</label>
                        <textarea
                            rows={5}
                            value={tenant?.settings?.system_prompt || ""}
                            onChange={(e) => setTenant(prev => prev ? { ...prev, settings: { ...prev.settings, system_prompt: e.target.value } } : null)}
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-4 text-sm text-white focus:border-accent-secondary/50 outline-none transition-all resize-none font-mono"
                            placeholder={t("prompt_placeholder")}
                        />
                    </div>
                </motion.div>

                {/* 3. Neural Ingress (WhatsApp QR) */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-10 col-span-1 lg:col-span-2 flex flex-col md:flex-row gap-12 items-center"
                >
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                <Zap className="w-6 h-6 text-accent-tertiary" />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{t("neural_ingress")}</h2>
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                            {t("qr_description")}
                        </p>
                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            <RefreshCcw className="w-4 h-4" />
                            {t("qr_refresh")}
                        </button>
                    </div>

                    <div className="w-64 h-64 bg-white p-6 rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] group relative cursor-not-allowed">
                        <div className="w-full h-full bg-slate-100 rounded-xl flex flex-col items-center justify-center p-4">
                            <div className="grid grid-cols-4 gap-2 opacity-20">
                                {Array.from({ length: 16 }).map((_, i) => (
                                    <div key={i} className="w-8 h-8 bg-black rounded-sm" />
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-[2rem] backdrop-blur-sm">
                                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Initializing...</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 4. Account Management */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-10 col-span-1 lg:col-span-2 space-y-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                            <Lock className="w-6 h-6 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{t("account_management")}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                        <div className="md:col-span-2 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("user_email")}</label>
                                <input
                                    disabled
                                    type="email"
                                    value="admin@silkbot.neural"
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 outline-none"
                                />
                            </div>
                            <Button variant="outline" className="h-12 border-white/5 hover:border-white/20">
                                {t("change_password")}
                            </Button>
                        </div>
                        
                        <div className="flex justify-end">
                            <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/10">
                                <LogOut className="w-4 h-4" />
                                {t("sign_out")}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
