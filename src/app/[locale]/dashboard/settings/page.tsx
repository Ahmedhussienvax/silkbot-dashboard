"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import { Globe, Shield, Clock, Building2 } from "lucide-react";

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
                    timezone: tenant.timezone 
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
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500/20 border-t-purple-500" />
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">{t("title")}</h1>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-500" />
                        {t("description")}
                    </p>
                </div>
            </div>

            <form onSubmit={saveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-right bg-transparent">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[80px] -z-10" />
                        
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white">{t("profile")}</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t("business_name")}</label>
                                    <input
                                        type="text"
                                        value={tenant?.name || ""}
                                        onChange={(e) => setTenant(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-purple-500/30 outline-none transition-all hover:bg-black/60"
                                        placeholder={t("business_name_placeholder")}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">{t("industry")}</label>
                                    <input
                                        type="text"
                                        value={tenant?.industry || ""}
                                        onChange={(e) => setTenant(prev => prev ? { ...prev, industry: e.target.value } : null)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-purple-500/30 outline-none transition-all hover:bg-black/60"
                                        placeholder={t("industry_placeholder")}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    {t("timezone")}
                                </label>
                                <div className="relative group">
                                    <select
                                        value={tenant?.timezone || "UTC"}
                                        onChange={(e) => setTenant(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-purple-500/30 outline-none transition-all appearance-none cursor-pointer hover:bg-black/60"
                                    >
                                        <option value="UTC">UTC (Universal Time)</option>
                                        <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                                        <option value="Asia/Riyadh">Asia/Riyadh (AST)</option>
                                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                    </select>
                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-purple-400 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-purple-600/20 to-cyan-500/20 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">{t("quick_setup_title")}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            {t("quick_setup_description")}
                        </p>
                        <Button
                            type="submit"
                            variant="gradient"
                            loading={saving}
                            className="w-full h-14"
                        >
                            {t("save")}
                        </Button>
                    </div>
                    
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h4 className="text-white font-bold text-sm mb-2 italic">{t("trusted_environment_title")}</h4>
                        <p className="text-[11px] text-slate-500 leading-tight">
                            {t("trusted_environment_description")}
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
