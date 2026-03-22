import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase-server";

// Modular Components (Server-Side capable where possible)
import StatsBento from "@/components/organisms/StatsBento";
import MainChartBento from "@/components/organisms/MainChartBento";
import MetricsBento from "@/components/organisms/MetricsBento";
import ActivityStream from "@/components/organisms/ActivityStream";
import AIReasoningTrace from "@/components/molecules/AIReasoningTrace";
import SearchInput from "@/components/molecules/SearchInput";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage(props: { 
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string }>;
}) {
    const { locale } = await props.params;
    const { q: searchQuery } = await props.searchParams;
    const t = await getTranslations("Dashboard");
    
    const supabase = await createClient();

    // Data Fetching on Server (RSC First!)
    const { data: statsData } = await supabase.schema("silkbot").from("tenant_stats").select("*").single();
    const stats = {
        conversations: statsData?.total_conversations || 0,
        messages: statsData?.total_messages || 0,
        contacts: statsData?.total_contacts || 0,
        botEnabled: statsData?.bot_active || false
    };

    let activityQuery = supabase
        .schema("silkbot")
        .from("silkbot_messages")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(5);

    // Apply search filter if present
    if (searchQuery) {
        activityQuery = activityQuery.ilike("contact_push_name", `%${searchQuery}%`);
    }

    const { data: activityData } = await activityQuery;

    const activities = activityData?.map((m: any) => ({
        id: m.message_id,
        type: "message" as const,
        user: m.contact_push_name || "Unknown",
        action: m.content?.body || "Sent a message",
        time: m.sent_at ? new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        status: "success" as const
    })) || [];

    // Mock chart data (In production, this could also be server-side or fetched via Server Action)
    const chartData = [
        { name: "00:00", received: 400, sent: 240 },
        { name: "04:00", received: 300, sent: 139 },
        { name: "08:00", received: 200, sent: 980 },
        { name: "12:00", received: 278, sent: 390 },
        { name: "16:00", received: 189, sent: 480 },
        { name: "20:00", received: 239, sent: 380 },
        { name: "23:59", received: 349, sent: 430 },
    ];

    const { data: traceData } = await supabase
        .schema("silkbot")
        .from("ai_traces")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

    const initialTraces = traceData?.map((t: any) => ({
        id: t.trace_id,
        type: t.step_type as any,
        content: t.content,
        timestamp: t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
    })) || [];

    return (
        <DashboardClient>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mesh-1 blur-[100px] opacity-30 font-black" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-mesh-2 blur-[100px] opacity-30 font-black" />
                </div>

                {/* Dashboard Top Bar (Simplified for RSC) */}
                <header className="h-24 sticky top-0 z-40 bg-zinc-900/5 dark:bg-black/10 backdrop-blur-3xl border-b border-zinc-200/50 dark:border-white/5 px-10 flex items-center justify-between">
                    <div className="flex items-center gap-12 flex-1">
                        <SearchInput placeholder={t("search_placeholder")} />
                    </div>
                </header>

                <div className="p-10 space-y-12 relative z-10 overflow-y-auto max-h-[calc(100vh-6rem)]">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
                                {t("title")} <span className="text-accent-primary italic">.</span>
                            </h1>
                            <p className="text-slate-500 font-bold text-sm opacity-80">{t("welcome")}</p>
                        </div>
                    </div>

                    <div className="bento-grid">
                        <div className="bento-item-xl">
                            <StatsBento stats={stats} />
                        </div>
                        <MainChartBento data={chartData} />
                        <MetricsBento />
                        <ActivityStream activities={activities} />
                        <div className="bento-item-xl">
                             <AIReasoningTrace steps={initialTraces} />
                        </div>
                    </div>
                </div>
            </main>
        </DashboardClient>
    );
}
