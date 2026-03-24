"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { 
    Megaphone, 
    Users, 
    Send, 
    AlertCircle, 
    Loader2, 
    Download, 
    BarChart3, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Target,
    Zap,
    History,
    FileJson,
    Activity,
    Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { cn } from "@/lib/utils";

const COLORS = [
    'hsl(var(--accent-primary))',
    'hsl(var(--accent-secondary))',
    'hsl(var(--accent-tertiary, 280 80% 60%))',
    '#ef4444' // Error state remains red for urgency
];

// --- Premium Animated Counter ---
function AnimatedCounter({ value, className }: { value: number; className?: string }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = displayValue;
        const end = value;
        if (start === end) return;
        
        const duration = 1200; // 1.2s smooth animation
        const startTime = performance.now();
        
        const update = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(start + (end - start) * easeProgress));
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                setDisplayValue(end);
            }
        };
        requestAnimationFrame(update);
    }, [value]);

    return <span className={className}>{displayValue}</span>;
}

export default function CampaignsPage() {
    const t = useTranslations("Campaigns");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [instances, setInstances] = useState<any[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<string>("");
    const [message, setMessage] = useState("");
    const [estimatedAudience, setEstimatedAudience] = useState<number>(0);
    const [downloading, setDownloading] = useState(false);
    const [analytics, setAnalytics] = useState({ sent: 0, delivered: 0, read: 0, failed: 0 });
    const supabase = createClient();

    useEffect(() => {
        const loadInitialData = async () => {
            const { data: contactsData } = await supabase.from("silkbot_contacts").select("tags, instance_name");
            
            if (contactsData) {
                const uniqueTags = new Set<string>();
                const uniqueInstances = new Set<string>();
                
                contactsData.forEach((c: any) => {
                    if (c.instance_name) uniqueInstances.add(c.instance_name);
                    if (c.tags && Array.isArray(c.tags)) {
                        c.tags.forEach((tag: string) => uniqueTags.add(tag));
                    }
                });
                
                setTags(Array.from(uniqueTags));
                const instancesArr = Array.from(uniqueInstances).map(name => ({ instanceName: name }));
                setInstances(instancesArr);
                if (instancesArr.length > 0) {
                    setSelectedInstance(instancesArr[0].instanceName);
                }
            }
            setLoading(false);
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedInstance) return;
            
            let query = supabase.from("silkbot_contacts").select("id", { count: "exact" }).eq("instance_name", selectedInstance);
            if (selectedTags.length > 0) query = query.contains("tags", selectedTags);
            const { count } = await query;
            setEstimatedAudience(count || 0);

            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
            const { data } = await supabase.from("silkbot_messages").select("delivery_status").eq("instance_name", selectedInstance).eq("from_me", true).gte("timestamp", threeDaysAgo);
                
            if (data) {
                const stats = { sent: 0, delivered: 0, read: 0, failed: 0 };
                data.forEach((msg: any) => {
                    const status = msg.delivery_status?.toUpperCase() || "SENT";
                    if (status.includes("READ")) stats.read++;
                    else if (status.includes("DELIVERED") || status.includes("RECEIVED")) stats.delivered++;
                    else if (status.includes("FAIL") || status.includes("ERROR")) stats.failed++;
                    else stats.sent++;
                });
                setAnalytics(stats);
            }
        };
        fetchData();
    }, [selectedInstance, selectedTags]);

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const handleExportCSV = async () => {
        if (!selectedInstance || estimatedAudience === 0) return;
        setDownloading(true);
        toast.info(t("export_preparing"));
        try {
            let query = supabase.from("silkbot_contacts").select("contact_jid, push_name, tags").eq("instance_name", selectedInstance);
            if (selectedTags.length > 0) query = query.contains("tags", selectedTags);
            const { data } = await query;
            
            if (data && data.length > 0) {
                const header = "JID,Name,Tags\n";
                const rows = data.map((c: any) => `"${c.contact_jid}","${c.push_name || ''}","${c.tags?.join(', ') || ''}"`).join("\n");
                const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `audiences_${selectedInstance}_${Date.now()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(t("export_success"));
            }
        } catch (e: any) {
            toast.error(`${t("export_failed")}: ${e.message}`);
        } finally {
            setDownloading(false);
        }
    };

    const handleSendBroadcast = async () => {
        if (!selectedInstance || !message.trim() || estimatedAudience === 0) {
            toast.error(t("validation_error"));
            return;
        }

        toast.info(t("broadcast_preparing"), { duration: 2000 });
        setSending(true);
        try {
            let query = supabase.from("silkbot_contacts").select("contact_jid").eq("instance_name", selectedInstance);
            if (selectedTags.length > 0) query = query.contains("tags", selectedTags);
            const { data: targetContacts } = await query;
            const jidList = targetContacts?.map((c: any) => c.contact_jid) || [];

            const res = await fetch(`/api/gateway/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instance: selectedInstance, targets: jidList, message: message.trim() })
            });

            if (!res.ok) {
                let errorMsg = `Gateway Error: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMsg = errorData?.error || errorMsg;
                } catch(e) {}
                throw new Error(errorMsg);
            }
            
            toast.success(`${t("broadcast_started")} (${jidList.length})`);
            setMessage("");
        } catch (error: any) {
            console.error("🔴 [INFRA-01] Broadcast Execution Failure:", error);
            toast.error(t("broadcast_failed"));
        } finally {
            setSending(false);
        }
    };

    const pieData = [
        { name: 'Sent', value: analytics.sent || 1 },
        { name: 'Delivered', value: analytics.delivered },
        { name: 'Read', value: analytics.read },
        { name: 'Failed', value: analytics.failed },
    ].filter(d => d.value > 0);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-background">
                <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-accent-primary" />
                    <div className="absolute inset-0 blur-xl bg-accent-primary/20 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-10 font-sans selection:bg-accent-primary/30">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-[1700px] mx-auto space-y-12"
            >
                {/* Header Section */}
                <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-accent-primary/10 border border-accent-primary/20 rounded-full text-[10px] font-black text-accent-primary tracking-widest uppercase italic">
                                {t("signal_source")}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-dim-foreground font-bold uppercase tracking-wider">
                                <History className="w-3 h-3" /> {t("system_uptime")}
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-text-muted italic">
                            {t("title")}
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                            {t("description")}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <button 
                            className="bg-accent-primary text-foreground px-8 py-5 rounded-3xl font-black uppercase text-xs tracking-widest italic flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(var(--accent-rgb),0.3)]"
                            onClick={() => {
                                // Trigger modal or scroll to payload composer
                                document.getElementById("message-composer")?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <Plus className="w-5 h-5" />
                            {t("btn_new")}
                        </button>

                        <div className="glass-card p-5 flex items-center gap-5 shadow-2xl">
                            <div className="w-12 h-12 bg-accent-primary/10 rounded-2xl flex items-center justify-center border border-accent-primary/20 text-accent-primary shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] text-dim-foreground font-black uppercase tracking-widest mb-1">{t("target_reach")}</p>
                                <p className="text-2xl font-black text-foreground leading-none">
                                    <AnimatedCounter value={estimatedAudience} />
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-8 space-y-10">
                        {/* Audience Targeting Card */}
                        <motion.section className="glass-card p-10 space-y-10 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
                            
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center border border-glass-border text-accent-primary">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight italic uppercase tracking-tighter">{t("audience_targeting")}</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-dim-foreground uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                        <Zap className="h-3 w-3 text-accent-primary" />
                                        {t("signal_hub_selection")}
                                    </label>
                                    <select 
                                        className="w-full bg-surface border border-glass-border rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-accent-primary/20 text-foreground font-bold transition-all appearance-none cursor-pointer hover:bg-foreground/[0.05]"
                                        value={selectedInstance}
                                        onChange={(e) => setSelectedInstance(e.target.value)}
                                    >
                                        <option value="" disabled className="bg-background text-foreground">{t("select_hub_placeholder")}</option>
                                        {instances.map(inst => (
                                            <option key={inst.instanceName} value={inst.instanceName} className="bg-background text-foreground">
                                                {inst.instanceName.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-dim-foreground uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                        <FileJson className="h-3 w-3 text-accent-secondary" />
                                        {t("segment_categorization")}
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {tags.length > 0 ? tags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => handleTagToggle(tag)}
                                                className={cn(
                                                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                    selectedTags.includes(tag) 
                                                        ? "bg-accent-primary/20 border-accent-primary/40 text-accent-primary shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]" 
                                                        : "bg-surface border-glass-border text-muted-foreground hover:text-foreground hover:bg-foreground/10"
                                                )}
                                            >
                                                {tag.replace(/_/g, ' ')}
                                            </button>
                                        )) : (
                                            <p className="text-[10px] text-dim-foreground font-bold uppercase tracking-widest italic pt-2">{t("no_segments")}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* Message Composer Card */}
                        <motion.section id="message-composer" className="glass-card p-10 shadow-2xl relative group">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
                            
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center border border-glass-border text-accent-primary">
                                        <Send className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight underline-offset-4 decoration-accent-primary italic uppercase tracking-tighter">{t("message_payload")}</h2>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-surface rounded-full border border-glass-border">
                                    <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{t("protocol_direct")}</span>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea 
                                    className="w-full bg-surface border border-glass-border rounded-3xl p-8 min-h-[300px] outline-none focus:border-accent-primary/30 text-foreground transition-all font-medium text-lg leading-relaxed shadow-inner"
                                    placeholder={t("message_placeholder")}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <div className="absolute bottom-6 right-8 text-[10px] font-black text-dim-foreground uppercase tracking-widest">
                                    {message.length} {t("characters")}
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-4 p-5 bg-accent-primary/5 border border-accent-primary/10 rounded-2xl">
                                <AlertCircle className="h-5 w-5 text-accent-primary/50 shrink-0" />
                                <p className="text-xs text-muted-foreground font-medium italic">
                                    {t("throttling_notice")}
                                </p>
                            </div>
                        </motion.section>
                    </div>

                    <div className="xl:col-span-4 space-y-10">
                        {/* Deployment Status Card */}
                        <motion.section className="glass-card p-10 bg-gradient-to-br from-accent-primary to-accent-secondary shadow-[0_40px_100px_rgba(var(--accent-rgb),0.4)] text-foreground relative overflow-hidden group border-none">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-foreground/20 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-white/30 transition-all duration-1000" />
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-background/10 blur-[80px] rounded-full group-hover:bg-background/20 transition-all duration-1000" />
                            
                            <div className="relative z-10 space-y-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/70 italic drop-shadow-sm">{t("deployment_matrix")}</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-7xl font-black tabular-nums tracking-tighter">
                                            <AnimatedCounter value={estimatedAudience} />
                                        </span>
                                        <span className="text-xl font-black opacity-50 uppercase tracking-widest italic">{t("nodes")}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={handleSendBroadcast}
                                        disabled={sending || estimatedAudience === 0 || !message.trim()}
                                        className="w-full py-6 bg-white text-accent-primary font-black rounded-3xl flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] hover:shadow-white/20 transition-all outline-none text-lg tracking-tighter"
                                    >
                                        {sending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6" />}
                                        {sending ? t("btn_deploying") : t("btn_activate")}
                                    </button>

                                    <button
                                        onClick={handleExportCSV}
                                        disabled={downloading || estimatedAudience === 0}
                                        className="w-full py-4 bg-foreground/10 hover:bg-foreground/20 border border-border text-foreground font-black rounded-2xl flex items-center justify-center gap-3 transition-all text-[10px] uppercase tracking-[0.2em] italic disabled:opacity-30"
                                    >
                                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                        {t("btn_export_registry")}
                                    </button>
                                </div>
                            </div>
                        </motion.section>

                        {/* Analytics Card */}
                        <section className="glass-card p-10 shadow-2xl">
                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-foreground tracking-tight uppercase tracking-tighter italic">{t("transmission_analytics")}</h2>
                                    <p className="text-[10px] text-dim-foreground font-black uppercase tracking-widest">{t("cycle_72h")}</p>
                                </div>
                                <Activity className="w-5 h-5 text-accent-primary" />
                            </div>

                            <div className="h-[240px] w-full relative group/chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={pieData} 
                                            innerRadius={70} 
                                            outerRadius={100} 
                                            paddingAngle={10} 
                                            dataKey="value" 
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={COLORS[index % COLORS.length]} 
                                                    className="outline-none"
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'hsl(var(--card))', 
                                                backdropFilter: 'blur(16px)', 
                                                border: '1px solid hsl(var(--glass-border))', 
                                                borderRadius: '24px', 
                                                color: 'hsl(var(--foreground))',
                                                fontSize: '11px',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                            }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                    <span className="text-4xl font-black text-foreground tracking-tighter">
                                        {Math.round((analytics.delivered / (analytics.sent || 1)) * 100)}%
                                    </span>
                                    <span className="text-[9px] text-dim-foreground font-black uppercase tracking-[0.2em] italic">{t("success_rate")}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-10">
                                {[
                                    { label: t("stat_transmitted"), val: analytics.sent, icon: Clock, color: 'text-muted-foreground', bg: 'bg-surface' },
                                    { label: t("stat_delivered"), val: analytics.delivered, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: t("stat_read"), val: analytics.read, icon: Zap, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
                                    { label: t("stat_failed"), val: analytics.failed, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' }
                                ].map((stat) => (
                                    <div key={stat.label} className="p-5 bg-foreground/[0.02] rounded-3xl border border-glass-border hover:bg-foreground/[0.05] transition-colors group/stat">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px]", stat.bg, stat.color)}>
                                                <stat.icon className="h-3 w-3" />
                                            </div>
                                            <span className="text-[9px] font-black text-dim-foreground uppercase tracking-widest italic">{stat.label}</span>
                                        </div>
                                        <div className="text-2xl font-black text-foreground tracking-tight group-hover/stat:text-accent-primary transition-colors">
                                            <AnimatedCounter value={stat.val} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </motion.div>
        </div>

    );
}
