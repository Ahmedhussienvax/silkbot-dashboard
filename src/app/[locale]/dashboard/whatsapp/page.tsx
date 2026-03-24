"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTenantConfig } from "@/hooks/useTenantConfig";
import { 
    Zap, 
    Smartphone, 
    RefreshCw, 
    Lock, 
    Info, 
    LogOut, 
    Link as LinkIcon,
    ShieldCheck,
    Signal,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppPage() {
    const t = useTranslations("WhatsApp");
    const { tenant, loading: tenantLoading } = useTenantConfig();
    const [status, setStatus] = useState<string>("loading");
    const [qrCode, setQrCode] = useState<string | null>(null);

    const instanceName = tenant?.wa_session || null;

    useEffect(() => {
        if (tenantLoading) return;
        if (instanceName) {
            checkStatus(instanceName);
        } else {
            setStatus("disconnected");
        }
    }, [tenantLoading, instanceName]);

    const checkStatus = async (name: string) => {
        try {
            const res = await fetch(`/api/gateway/instance/status/${name}`);
            const data = await res.json();
            if (data.instance?.state === "open") {
                setStatus("connected");
            } else {
                setStatus("disconnected");
            }
        } catch {
            setStatus("disconnected");
        }
    };

    const handleConnect = async () => {
        if (!instanceName) return;
        setStatus("connecting");
        try {
            const res = await fetch(`/api/gateway/instance/qr/${instanceName}`);
            const data = await res.json();
            
            if (data.code || data.base64) {
                setQrCode(data.base64 || data.code);
                setStatus("qr");
                toast.success(t("qr_generated"));
            } else {
                await fetch(`/api/gateway/instance/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ instanceName })
                });
                setTimeout(handleConnect, 2000);
            }
        } catch {
            setStatus("disconnected");
            toast.error(t("session_init_failed"));
        }
    };

    const handleLogout = async () => {
        if (!instanceName) return;
        if (!confirm(t("confirm_disconnect"))) return;
        try {
            await fetch(`/api/gateway/instance/logout/${instanceName}`, {
                method: "DELETE"
            });
            setStatus("disconnected");
            setQrCode(null);
            toast.info(t("instance_disconnected"));
        } catch {
            toast.error(t("logout_failed"));
        }
    };

    if (tenantLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto font-arabic">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Signal className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">{t("gateway_connectivity")}</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">{t("title")}</h1>
                    <p className="text-slate-400 mt-2 max-w-lg">{t("description")}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${status === "connected" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                            {status === "connected" ? t("system_online") : (status === "loading" ? "SCANNING..." : "BRIDGE CONNECTION LOCKED")}
                        </span>
                    </div>
                    {status !== "connected" && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md">
                            <Lock className="w-2.5 h-2.5 text-red-500" />
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter">SECURE HANDSHAKE REJECTED</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full -ml-20 -mb-20 pointer-events-none" />
                    
                    <div className="flex flex-col h-full justify-between gap-12 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl border transition-all duration-500 ${
                                    status === "connected" 
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 scale-110" 
                                        : "bg-slate-800/50 border-white/10 text-slate-500"
                                }`}>
                                    {status === "connected" ? <Zap size={40} strokeWidth={1.5} /> : <Smartphone size={40} strokeWidth={1.5} />}
                                </div>
                                <div>
                                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{t("status")}</h3>
                                    <p className={`text-3xl font-black tracking-tight ${status === "connected" ? "text-emerald-400" : "text-white"}`}>
                                        {status === "connected" ? t("connected") : 
                                         status === "qr" ? t("qr_code") :
                                         status === "connecting" ? t("connecting") : t("disconnected")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-2 italic">NULL :TUNNEL ID</span>
                                <div className={`px-6 py-3 rounded-2xl border font-mono text-sm tracking-widest shadow-inner transition-all duration-300 ${
                                    instanceName ? "bg-black/40 border-white/5 text-cyan-400" : "bg-red-500/5 border-red-500/20 text-red-400 animate-pulse"
                                }`}>
                                    {instanceName || "NO INSTANCE MOUNTED"}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {status === "disconnected" && (
                                <button
                                    onClick={handleConnect}
                                    className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-2xl hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                                >
                                    <LinkIcon size={20} className="group-hover:rotate-12 transition-transform" />
                                    {t("btn_connect")}
                                </button>
                            )}
                            {status === "connected" && (
                                <button
                                    onClick={handleLogout}
                                    className="px-10 py-4 bg-red-500/5 border border-red-500/20 text-red-400 font-bold rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 shadow-lg shadow-red-500/5"
                                >
                                    <LogOut size={20} />
                                    {t("btn_logout")}
                                </button>
                            )}
                            <button 
                                onClick={() => instanceName && checkStatus(instanceName)}
                                className="p-4 bg-white/5 text-slate-400 rounded-2xl hover:bg-white/10 hover:text-white transition-all border border-white/10 active:rotate-180 duration-500"
                                title={t("btn_refresh")}
                            >
                                <RefreshCw size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* QR Code Section */}
                <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-6 min-h-[400px] backdrop-blur-xl group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {status === "qr" && qrCode ? (
                        <>
                            <div className="relative p-2 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform group-hover:scale-[1.02] duration-500 cursor-pointer" onClick={() => instanceName && checkStatus(instanceName)}>
                                <img src={qrCode} alt="QR Code" className="w-full h-auto rounded-[1.5rem]" />
                                <div className="absolute -inset-4 border-2 border-dashed border-purple-500/20 rounded-[2.5rem] -z-10 animate-[spin_20s_linear_infinite]" />
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">{t("safe_connection")}</span>
                                </div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center">{t("scan_with_whatsapp")}</p>
                            </div>
                        </>
                    ) : (
                        <div 
                            className="text-center cursor-pointer group/node"
                            onClick={handleConnect}
                        >
                            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center border border-white/5 mx-auto mb-6 transform transition-all group-hover:scale-110 group-hover:border-purple-500/30 group-hover:bg-purple-500/5 duration-500">
                                <Lock size={40} className="text-slate-600 group-hover/node:text-purple-400 transition-colors" />
                            </div>
                            <h4 className="text-white font-black uppercase tracking-tight mb-1 group-hover/node:text-purple-400 transition-colors">
                                {status === "connected" ? t("connection_active") : t("no_session")}
                            </h4>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest max-w-[180px] mx-auto opacity-60">
                                {status === "connected" ? t("device_linked") : t("initialize_pairing")}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] p-8 text-indigo-300/80 text-sm flex items-start gap-6 backdrop-blur-sm">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <Info className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="leading-relaxed">
                    <h5 className="text-white font-bold mb-1 tracking-wide">تعليمات الربط الآمن</h5>
                    <p className="opacity-70">
                        تأكد من فتح تطبيق الواتساب على هاتفك، ثم اذهب إلى <b>الأجهزة المرتبطة</b> واضغط على <b>ربط جهاز</b> وقم بمسح الكود أعلاه. بمجرد المسح، سيقوم النظام تلقائياً بتحديث الحالة وتفعيل خوادم التجهيز.
                    </p>
                </div>
            </div>
        </div>
    );
}
