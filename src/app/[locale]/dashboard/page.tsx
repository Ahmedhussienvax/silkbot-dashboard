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

import UsageMonitor from "@/components/organisms/UsageMonitor";
import DashboardHeader from "@/components/molecules/DashboardHeader";

export default async function DashboardPage(props: { 
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ search?: string }>;
}) {
    const { locale } = await props.params;
    const { search: searchQuery } = await props.searchParams;
    const t = await getTranslations("Dashboard");
    
    const supabase = await createClient();

    // Data Fetching on Server (RSC First!)
    const { data: statsData } = await supabase.from("tenant_stats").select("*").single();
    const stats = {
        conversations: statsData?.total_conversations || 0,
        messages: statsData?.total_messages || 0,
        contacts: statsData?.total_contacts || 0,
        botEnabled: statsData?.bot_active || false
    };

    // Data Fetching for Activity Stream (v5.7.1 Audit Logs Specification)
    let activityQuery = supabase
        .from("silkbot_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

    // Apply search filter if present (searching message content in logs)
    if (searchQuery) {
        activityQuery = activityQuery.ilike("message", `%${searchQuery}%`);
    }

    const { data: activityData } = await activityQuery;

    const activities = activityData?.map((log: any) => ({
        id: log.id,
        type: (log.type === "message" ? "message" : (log.type === "ai" ? "ai" : "system")) as any,
        user: log.user_name || "System",
        action: log.message || "Activity recorded",
        time: log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        status: (log.severity === "error" ? "warning" : (log.type === "ai" ? "ai" : "success")) as any
    })) || [];

    // Mock chart data
    const chartData = [
        { name: "00:00", received: 400, sent: 240 },
        { name: "04:00", received: 300, sent: 139 },
        { name: "08:00", received: 200, sent: 980 },
        { name: "12:00", received: 278, sent: 390 },
        { name: "16:00", received: 189, sent: 480 },
        { name: "20:00", received: 239, sent: 380 },
        { name: "23:59", received: 349, sent: 430 },
    ];

    // Data Fetching for AI Traces (v5.7.1 Public Specification)
    const { data: traceData } = await supabase
        .from("ai_traces")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

    const initialTraces = traceData?.map((t: any) => ({
        id: t.id,
        type: (t.trace_type || "thought") as any,
        content: t.content,
        timestamp: t.created_at ? new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        agent_name: t.agent_name
    })) || [];

    return (
        <DashboardClient>
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Global DashboardHeader is now in the layout */}

                <div className="p-6 md:p-10 space-y-8 md:space-y-12 relative z-10 overflow-y-auto max-h-[calc(100vh-6rem)]">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-none">
                                {t("title")} <span className="text-accent-primary italic">.</span>
                            </h1>
                            <p className="text-[var(--text-muted)] font-bold text-sm opacity-80">{t("welcome")}</p>
                        </div>
                    </div>

                    <div className="bento-grid">
                        <div className="bento-item-xl">
                            <StatsBento stats={stats} />
                        </div>
                        <UsageMonitor />
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
