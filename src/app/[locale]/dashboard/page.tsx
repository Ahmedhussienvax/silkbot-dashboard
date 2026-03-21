"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, Zap, Activity as ActivityIcon } from "lucide-react";

// Modular Components
import NavigationSidebar from "@/components/organisms/NavigationSidebar";
import StatsBento from "@/components/organisms/StatsBento";
import MainChartBento from "@/components/organisms/MainChartBento";
import MetricsBento from "@/components/organisms/MetricsBento";
import ActivityStream from "@/components/organisms/ActivityStream";
import AIReasoningTrace from "@/components/molecules/AIReasoningTrace";
import OnboardingWizard from "@/components/OnboardingWizard";

interface Stats {
    conversations: number;
    messages: number;
    contacts: number;
    botEnabled: boolean;
}

export default function DashboardPage() {
    const t = useTranslations("Dashboard");
    const sidebarT = useTranslations("Sidebar");
    const [mounted, setMounted] = useState(false);
    const [activeNavItem, setActiveNavItem] = useState("dashboard");
    const [stats, setStats] = useState<Stats>({ conversations: 0, messages: 0, contacts: 0, botEnabled: false });
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeChartTab, setActiveChartTab] = useState("day");
    const [showWizard, setShowWizard] = useState(false);
    
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Stats
            const { data: statsData } = await supabase.schema("silkbot").from("tenant_stats").select("*").single();
            if (statsData) {
                setStats({
                    conversations: statsData.total_conversations || 0,
                    messages: statsData.total_messages || 0,
                    contacts: statsData.total_contacts || 0,
                    botEnabled: statsData.bot_active || false
                });
            }

            // Fetch Mock/Real Activities
            const { data: activityData } = await supabase.schema("silkbot").from("silkbot_messages").select("*").order("sent_at", { ascending: false }).limit(5);
            if (activityData) {
                const mapped = activityData.map((m: any) => ({
                    id: m.message_id,
                    type: "message",
                    user: m.contact_push_name || "Unknown",
                    action: m.content?.body || "Sent a message",
                    time: new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: "success"
                }));
                setActivities(mapped);
            } else {
                // High-End Mock Data for "WOW" factor if empty
                setActivities([
                    { id: "1", type: "security", user: "System", action: "Neural Shield activated", time: "12:04 PM", status: "success" },
                    { id: "2", type: "message", user: "Ahmed", action: "Inquiry about API pricing", time: "11:45 AM", status: "info" },
                    { id: "3", type: "user", user: "New Lead", action: "Joined via Instagram", time: "10:30 AM", status: "success" },
                ]);
            }
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const chartData = [
        { name: "00:00", received: 400, sent: 240 },
        { name: "04:00", received: 300, sent: 139 },
        { name: "08:00", received: 200, sent: 980 },
        { name: "12:00", received: 278, sent: 390 },
        { name: "16:00", received: 189, sent: 480 },
        { name: "20:00", received: 239, sent: 380 },
        { name: "23:59", received: 349, sent: 430 },
    ];

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-accent-primary/30">
            {/* Sidebar Integration */}
            <NavigationSidebar 
                activeItem={activeNavItem}
                setActiveItem={setActiveNavItem}
                translations={sidebarT}
                locale="en"
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Global Background Mesh */}
                <div className="fixed inset-0 pointer-events-none opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/20 blur-[120px] rounded-full" />
                </div>

                {/* Dashboard Top Bar */}
                <header className="h-24 sticky top-0 z-40 bg-black/10 backdrop-blur-3xl border-b border-white/5 px-10 flex items-center justify-between">
                    <div className="flex items-center gap-12 flex-1">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent-primary transition-colors" />
                            <input 
                                type="text" 
                                placeholder={t("search_placeholder") || "Search SilkBot intelligence..."}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-accent-primary/30 focus:bg-white/[0.05] transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <button className="relative p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-primary/30 transition-all group">
                            <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
                        </button>
                        
                        <div className="flex items-center gap-4 pl-8 border-l border-white/5 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-white leading-none mb-1">Ahmed Hussien</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">System Admin</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center group-hover:border-accent-primary/50 transition-all shadow-2xl">
                                <User className="w-6 h-6 text-slate-400 group-hover:text-white transition-all" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Dashboard Content */}
                <div className="p-10 space-y-12 relative z-10 custom-scrollbar overflow-y-auto max-h-[calc(100vh-6rem)]">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-4xl font-black tracking-tight text-white leading-none"
                            >
                                {t("title")} <span className="text-accent-primary italic">.</span>
                            </motion.h1>
                            <p className="text-slate-500 font-bold text-sm opacity-80">{t("welcome")}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 px-4 py-2 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
                                <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-accent-primary uppercase tracking-widest leading-none">Cluster 01</span>
                            </div>
                        </div>
                    </div>

                    {/* Bento Grid Integration */}
                    <div className="bento-grid">
                        {/* Stats Section (Top Row) */}
                        <StatsBento stats={stats} translations={t} />

                        {/* Main Charts Section (Large Row) */}
                        <MainChartBento 
                            data={chartData} 
                            activeTab={activeChartTab} 
                            setActiveTab={setActiveChartTab} 
                            translations={t} 
                        />

                        {/* AI Metrics & Activity (Middle Row) */}
                        <MetricsBento translations={t} />
                        <ActivityStream activities={activities} translations={t} />
                        
                        {/* AI Trace (Bottom Row - Wide) */}
                        <div className="bento-item-xl">
                             <AIReasoningTrace />
                        </div>
                    </div>
                </div>

                {/* Overlays */}
                <OnboardingWizard show={showWizard} onComplete={() => setShowWizard(false)} />
            </main>
        </div>
    );
}
