"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import OnboardingWizard from "@/components/OnboardingWizard";
import AIReasoningTrace from "@/components/molecules/AIReasoningTrace";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar 
} from "recharts";
import { 
    LayoutDashboard, 
    MessageSquare, 
    Users, 
    Bot, 
    Zap, 
    ArrowUpRight, 
    Activity, 
    Shield, 
    Globe, 
    TrendingUp,
    Clock,
    CheckCircle2,
    Search,
    ChevronRight,
    Send,
    ShieldCheck,
    Sun,
    Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Stats {
    conversations: number;
    messages: number;
    contacts: number;
    botEnabled: boolean;
}

interface RecentActivity {
    message_id: string;
    contact_push_name: string | null;
    contact_jid: string;
    content: Record<string, any>;
    sent_at: number;
    is_from_me: string;
}

export default function DashboardPage() {
    const t = useTranslations("Dashboard");
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    const [stats, setStats] = useState<Stats>({ conversations: 0, messages: 0, contacts: 0, botEnabled: false });
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [latency, setLatency] = useState<number | null>(null);
    const [clusterStatus, setClusterStatus] = useState<"healthy" | "degraded" | "unhealthy" | "loading">("loading");
    const [traces, setTraces] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Ping Gateway Health
    useEffect(() => {
        const checkHealth = async () => {
            const start = Date.now();
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/health`);
                const end = Date.now();
                const data = await res.json();
                setLatency(end - start);
                setClusterStatus(data.status);
            } catch (err) {
                setClusterStatus("unhealthy");
                setLatency(null);
            }
        };
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Pulse every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const { data: statsData, error: statsError } = await supabase
                    .schema("silkbot")
                    .from("tenant_stats")
                    .select("*")
                    .single();

                if (!statsError) {
                    setStats({
                        conversations: statsData?.total_chats || 0,
                        messages: statsData?.total_messages || 0,
                        contacts: statsData?.total_contacts || 0,
                        botEnabled: statsData?.instances_total > 0
                    });

                    const onboardingCompleted = localStorage.getItem("silkbot_onboarding_completed");
                    if (!onboardingCompleted && statsData?.instances_total === 0) {
                        setShowWizard(true);
                    }
                }

                const { data: activityData, error: activityError } = await supabase
                    .schema("silkbot")
                    .from("inbox")
                    .select("*")
                    .order('sent_at', { ascending: false })
                    .limit(5);

                if (!activityError) {
                    setActivities((activityData as unknown as RecentActivity[]) || []);
                }
            } catch (err) {
                console.error("Error loading dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();

        // 🟢 Realtime Neural Trace Listener
        const traceChannel = supabase
            .channel('neural-traces')
            .on(
                'postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'ai_traces' }, 
                (payload) => {
                    const newTrace = {
                        id: payload.new.id,
                        type: payload.new.trace_type,
                        content: payload.new.content,
                        timestamp: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    };
                    setTraces(prev => [newTrace, ...prev].slice(0, 5)); // Keep last 5
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(traceChannel);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#020617]">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin shadow-[0_0_30px_rgba(168,85,247,0.2)]" />
                    <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-400 animate-pulse" />
                </div>
                <div className="mt-8 text-center space-y-2">
                    <h2 className="text-white font-black text-xl tracking-tighter uppercase italic">{t("booting_engine")}</h2>
                    <p className="text-slate-500 text-xs font-mono animate-pulse">{t("syncing_cluster_nodes")}</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: t("conversations"), value: stats.conversations, icon: <MessageSquare className="w-6 h-6" />, color: "from-purple-500 to-indigo-600", trend: "+12.5%", desc: t("conversations_desc") },
        { label: t("messages"), value: stats.messages, icon: <Activity className="w-6 h-6" />, color: "from-blue-500 to-cyan-600", trend: "+8.2%", desc: t("messages_desc") },
        { label: t("contacts"), value: stats.contacts, icon: <Users className="w-6 h-6" />, color: "from-emerald-500 to-teal-600", trend: "+24.1%", desc: t("contacts_desc") },
        { label: t("bot_status"), value: stats.botEnabled ? t("online") : t("offline"), icon: <Bot className="w-6 h-6" />, color: stats.botEnabled ? "from-amber-400 to-orange-500" : "from-slate-600 to-slate-800", trend: t("stable"), desc: t("bot_status_desc") },
    ];

    return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-10 text-white selection:bg-purple-500/30">
            {showWizard && (
                <OnboardingWizard onComplete={() => {
                    localStorage.setItem("silkbot_onboarding_completed", "true");
                    setShowWizard(false);
                }} />
            )}

            <div className="max-w-[1700px] mx-auto space-y-12">
                {/* Header Section */}
                <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 tracking-widest uppercase italic">
                                {t("enterprise_badge")}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                                <Globe className="w-3 h-3" /> {t("api_cluster")}
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                            {t("title")}<span className="text-purple-500">.</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                            {t("welcome")}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-4 rounded-3xl flex items-center gap-5 shadow-2xl">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                                clusterStatus === "healthy" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                clusterStatus === "degraded" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                "bg-red-500/10 border-red-500/20 text-red-400"
                            )}>
                                <Shield className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t("security_shield")}</p>
                                <p className="text-sm font-black text-white">
                                    {clusterStatus === "healthy" ? t("active_secure") : 
                                     clusterStatus === "degraded" ? t("partial_shield") : 
                                     clusterStatus === "loading" ? t("scanning") : t("bypassed_null")}
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-4 rounded-3xl flex items-center gap-5 shadow-2xl">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t("latency")}</p>
                                <p className="text-sm font-black text-white">
                                    {latency ? `${latency}ms` : "--ms"} 
                                    <span className={cn(
                                        "text-[10px] ml-2 font-black",
                                        (latency && latency < 100) ? "text-emerald-500" : "text-amber-500"
                                    )}>
                                        {(latency && latency < 100) ? t("ultra") : t("standard")}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Grid Stats */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {statCards.map((stat, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={stat.label}
                            className="group relative bg-slate-900/30 backdrop-blur-sm border border-white/5 rounded-[2.5rem] p-8 hover:bg-slate-800/40 hover:border-white/10 transition-all duration-500 overflow-hidden shadow-2xl"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 blur-[60px] group-hover:opacity-10 transition-opacity`} />
                            
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 text-white shadow-inner group-hover:rotate-12 transition-transform duration-500">
                                    {stat.icon}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                                    <span className="text-[10px] font-black text-emerald-400">{stat.trend}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                    {stat.label}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white tracking-tighter">
                                        {stat.value}
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-[10px] text-slate-600 mt-6 font-bold leading-relaxed tracking-wide group-hover:text-slate-400 transition-colors uppercase">
                                {stat.desc}
                            </p>
                        </motion.div>
                    ))}
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    {/* Primary Chart Area */}
                    <motion.section 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="xl:col-span-8 bg-slate-900/30 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-emerald-400 to-purple-600 opacity-20" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-white font-black text-2xl tracking-tight">{t("message_activity")}</h3>
                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded uppercase">{t("live")}</span>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">{t("network_throughput_overview")}</p>
                            </div>
                            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                {[t("tab_day"), t("tab_week"), t("tab_month")].map((tab) => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            activeTab === tab.toLowerCase() ? "bg-white/10 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { name: "00:00", received: 140, sent: 110 },
                                    { name: "04:00", received: 250, sent: 180 },
                                    { name: "08:00", received: 180, sent: 220 },
                                    { name: "12:00", received: 420, sent: 390 },
                                    { name: "16:00", received: 310, sent: 200 },
                                    { name: "20:00", received: 390, sent: 350 },
                                    { name: "23:59", received: 180, sent: 160 },
                                ]}>
                                    <defs>
                                        <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={15} />
                                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                                        cursor={{ stroke: 'rgba(168, 85, 247, 0.2)', strokeWidth: 2 }}
                                    />
                                    <Area type="monotone" dataKey="received" stroke="#a855f7" strokeWidth={4} fillOpacity={1} fill="url(#colorReceived)" />
                                    <Area type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSent)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-8 pt-8 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">{t("peak_volume")}</p>
                                    <p className="text-lg font-black text-white tracking-tight">{t("peak_volume_value")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">{t("success_rate")}</p>
                                    <p className="text-lg font-black text-white tracking-tight">{t("success_rate_value")}</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Secondary Metrics / Quick Actions */}
                    <div className="xl:col-span-4 space-y-10">
                        <section className="bg-slate-900/30 border border-white/5 rounded-[3rem] p-10 flex flex-col items-center shadow-2xl relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 p-8">
                                <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
                            </div>
                            
                            <div className="w-full mb-10">
                                <h3 className="text-white font-black text-xl tracking-tight leading-none mb-2">{t("neural_deflection")}</h3>
                                <p className="text-slate-500 text-xs font-medium">{t("ai_automation_performance")}</p>
                            </div>
                            
                            <div className="relative w-full aspect-square flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: t("automated"), value: 84 },
                                                { name: t("human"), value: 16 }
                                            ]}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={10}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            <Cell fill="#a855f7" />
                                            <Cell fill="#1e293b" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className="text-5xl font-black text-white tracking-tighter">84%</span>
                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">{t("neural_load")}</span>
                                </div>
                            </div>

                            <div className="w-full space-y-6 mt-10">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">{t("response_accuracy")}</span>
                                        <span className="text-purple-400">96.4%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "96.4%" }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">{t("uptime_reliability")}</span>
                                        <span className="text-emerald-400">100.0%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* AI Neural Trace Board */}
                        <AIReasoningTrace steps={traces} />
                    </div>
                </div>

                {/* Bottom Section: Activity & Actions */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 pb-20">
                    {/* Activity Feed */}
                    <section className="xl:col-span-8 bg-slate-900/30 border border-white/5 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-10 w-40 h-[1px] bg-gradient-to-l from-white/10 to-transparent" />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="space-y-1">
                                <h3 className="text-white font-black text-2xl tracking-tight leading-none">{t("recent_activity")}</h3>
                                <p className="text-slate-500 text-sm font-medium">{t("global_communication_stream")}</p>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder={t("scan_neural_logs")}
                                    className="bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-xs text-white focus:ring-2 focus:ring-purple-500/20 outline-none w-64 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {activities.length > 0 ? activities.map((act, idx) => {
                                    const name = act.contact_push_name || act.contact_jid?.split('@')[0] || t("member");
                                    const preview = act.content?.conversation || act.content?.extendedTextMessage?.text || t("media_message");
                                    const isMe = act.is_from_me === 'true';
                                    
                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={act.message_id} 
                                            className="group flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-slate-800/40 hover:border-purple-500/20 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-5 min-w-0">
                                                <div className="relative group/avatar">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center text-white font-black text-lg group-hover/avatar:scale-105 transition-transform">
                                                        {name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#020617] scale-110",
                                                        isMe ? "bg-cyan-500" : "bg-purple-500"
                                                    )} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <p className="text-white font-black tracking-tight text-sm truncate">{name}</p>
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border",
                                                            isMe ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-500" : "bg-purple-500/10 border-purple-500/20 text-purple-500"
                                                        )}>
                                                            {isMe ? t("sent") : t("received")}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 text-xs truncate max-w-sm md:max-w-md font-medium italic group-hover:text-slate-300 transition-colors">
                                                        "{preview}"
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono font-black group-hover:text-slate-400 transition-colors">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(act.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </motion.div>
                                    );
                                }) : (
                                    <div className="py-24 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <Activity className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-xl">{t("no_activity")}</p>
                                            <p className="text-slate-500 text-xs font-mono">{t("neural_cluster_standby")}</p>
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* Navigation Shortcuts & System Status */}
                    <aside className="xl:col-span-4 flex flex-col min-h-full">
                        <section className="bg-slate-900/30 border border-white/5 rounded-[3rem] p-8 shadow-2xl flex flex-col flex-1 relative overflow-hidden group/nav-box">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[80px] -z-10" />
                            
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-white font-black text-xl tracking-tight leading-none">{t("quick_actions")}</h3>
                                {mounted && (
                                    <button 
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-inner"
                                        title="Toggle Mode"
                                    >
                                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>

                            <nav className="space-y-3 flex-1" aria-label="Quick Navigation">
                                {[
                                    { href: "/dashboard/inbox", icon: <MessageSquare className="w-5 h-5" />, title: t("inbox"), sub: t("quick_action_omnichannel"), color: "from-purple-500/20" },
                                    { href: "/dashboard/whatsapp", icon: <Globe className="w-5 h-5" />, title: t("whatsapp"), sub: t("quick_action_instance_control"), color: "from-emerald-500/20" },
                                    { href: "/dashboard/bot", icon: <Bot className="w-5 h-5" />, title: t("bot_settings"), sub: t("quick_action_agent_synthesis"), color: "from-blue-500/20" },
                                    { href: "/dashboard/campaigns", icon: <Send className="w-5 h-5" />, title: t("campaigns"), sub: t("quick_action_mass_broadcast"), color: "from-pink-500/20" },
                                    { href: "/dashboard/audit", icon: <ShieldCheck className="w-5 h-5" />, title: t("audit_log"), sub: t("quick_action_security_audit"), color: "from-amber-500/20" }
                                ].map((item, idx) => (
                                    <Link 
                                        key={item.href} 
                                        href={item.href as any} 
                                        className="group relative flex items-center gap-4 p-4 rounded-[1.75rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all overflow-hidden"
                                    >
                                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity", item.color)} />
                                        <div className="w-10 h-10 rounded-xl bg-slate-900/80 flex items-center justify-center border border-white/5 text-slate-400 group-hover:text-white transition-all relative z-10 shrink-0">
                                            {item.icon}
                                        </div>
                                        <div className="relative z-10 min-w-0">
                                            <p className="text-white font-bold text-sm tracking-tight mb-0.5">{item.title}</p>
                                            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.15em] opacity-60 group-hover:opacity-100 transition-opacity truncate">{item.sub}</p>
                                        </div>
                                        <div className="ml-auto relative z-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                            <ChevronRight className="w-4 h-4 text-white/30" />
                                        </div>
                                    </Link>
                                ))}
                            </nav>
                            
                            <div className="mt-10 p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl relative overflow-hidden group/upgrade">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 blur-3xl group-hover/upgrade:bg-purple-500/20 transition-all font-inter" />
                                <div className="relative z-10">
                                    <p className="text-white font-black text-[11px] mb-2 uppercase tracking-tighter">{t("power_user_tip")}</p>
                                    <p className="text-slate-500 text-[10px] leading-relaxed italic mb-4 opacity-70">
                                        {t("power_user_tip_body")}
                                    </p>
                                    <Link href="/dashboard/campaigns" className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-2 hover:text-purple-300 transition-colors">
                                        {t("explore_campaigns")} <ArrowUpRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>

                            {/* Powered By - Now strictly at the bottom of the card content area */}
                            <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">✨ Powered by SilkBot Engine v10</p>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] text-emerald-500/80 font-black uppercase tracking-tighter">System Normal</span>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
