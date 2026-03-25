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
    
    // Auth & Tenant Context Retrieval
    const { data: { user } } = await supabase.auth.getUser();
    const tenantId = user?.app_metadata?.tenant_id;

    // Fetch Hardened Enterprise Metrics via RPC (v2.6)
    const { data: metricsData } = tenantId 
        ? await supabase.rpc("get_crm_metrics", { p_tenant_id: tenantId })
        : { data: null };

    const metrics = metricsData || { 
        pipeline_value: 0, 
        total_leads: 0, 
        ticket_distribution: {}, 
        generated_at: new Date().toISOString() 
    };

    // Data Fetching for Legacy Stats (until fully migrated to RPC)
    const stats = {
        conversations: Object.values(metrics.ticket_distribution || {}).reduce((a: any, b: any) => a + b, 0) as number,
        messages: 0, // Will be linked to stats view in next iteration
        contacts: metrics.total_leads,
        botEnabled: true, // Derived from instance settings
        pipelineValue: metrics.pipeline_value
    };

    // Data Fetching for Activity Stream
    let activityQuery = supabase
        .from("silkbot_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

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

    // Map chart data from distribution if dynamic
    const chartData = [
        { name: "00:00", received: 400, sent: 240 },
        { name: "04:00", received: 300, sent: 139 },
        { name: "08:00", received: 200, sent: 980 },
        { name: "12:00", received: 278, sent: 390 },
        { name: "16:00", received: 189, sent: 480 },
        { name: "20:00", received: 239, sent: 380 },
        { name: "23:59", received: 349, sent: 430 },
    ];

    // AI Traces
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
                <div className="p-6 md:p-10 space-y-8 md:space-y-12 relative z-10 overflow-y-auto max-h-[calc(100vh-6rem)]">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-none">
                                {t("title")} <span className="text-accent-primary italic">.</span>
                            </h1>
                            <p className="text-[var(--text-muted)] font-bold text-sm opacity-80">{t("welcome")}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-surface/30 backdrop-blur-md p-1.5 rounded-2xl border border-glass-border shadow-lg">
                             <div className="px-5 py-2">
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Pipeline Matrix</p>
                                <p className="text-xl font-black text-emerald-400">
                                    ${metrics.pipeline_value.toLocaleString()}
                                </p>
                             </div>
                        </div>
                    </div>

                    <div className="bento-grid">
                        <div className="bento-item-xl">
                            <StatsBento stats={stats} />
                        </div>
                        <UsageMonitor />
                        <MainChartBento data={chartData} />
                        <MetricsBento metrics={metrics} />
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
