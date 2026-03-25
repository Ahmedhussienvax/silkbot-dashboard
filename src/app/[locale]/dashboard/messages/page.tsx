"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    Send, 
    Bot, 
    User, 
    Search, 
    MoreVertical, 
    Phone, 
    Video, 
    Info,
    Paperclip,
    Mic,
    CheckCheck,
    Clock,
    MessageSquare,
    Zap,
    Brain,
    Cpu,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";
import { useRoles } from "@/hooks/useRoles";
import AIReasoningTrace from "@/components/molecules/AIReasoningTrace";

interface Conversation {
    composite_chat_id: string;
    instance_name: string;
    contact_jid: string;
    contact_push_name: string | null;
    contact_avatar: string | null;
    last_message: Record<string, any> | null;
    last_message_preview: string | null;
    last_message_at: number | null;
    bot_active?: boolean;
    status?: 'open' | 'pending' | 'resolved' | 'blocked';
    assignee_id?: string | null;
    assignee_name?: string | null;
    assignee_avatar?: string | null;
}

interface Message {
    message_id: string;
    contact_jid: string;
    contact_push_name: string | null;
    is_from_me: boolean;
    content: Record<string, any>;
    content_text: string | null;
    sent_at: number;
    delivery_status: string | null;
    instance_name: string;
    composite_chat_id: string;
    isOptimistic?: boolean;
    ai_trace?: any;
    has_reasoning: boolean;
    metadata?: Record<string, any>;
}

type MessageStatus = "open" | "pending" | "resolved" | "blocked";

export default function InboxPage() {
    const t = useTranslations("Inbox");
    const queryClient = useQueryClient();
    const [activeConv, setActiveConv] = useState<string | null>(null);
    const [newMsg, setNewMsg] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<"all" | "bot" | "human" | "open" | "pending" | "resolved" | "blocked">("all");
    const [selectedTraceMsg, setSelectedTraceMsg] = useState<string | null>(null);
    const [liveTraces, setLiveTraces] = useState<any[]>([]);
    const msgEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const { userRoles } = useRoles();
    const currentUserId = userRoles?.id;

    // Fetch Conversations
    const { data: conversations = [], isLoading: loadingConvs } = useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("conversations")
                .select(`
                    composite_chat_id: id,
                    instance_name,
                    contact_jid,
                    contact_push_name: contact_name,
                    contact_avatar,
                    last_message,
                    last_message_preview,
                    last_message_at: updated_at,
                    bot_active,
                    status: ticket_status,
                    assignee_id,
                    assignee_name,
                    assignee_avatar
                `)
                .order("last_message_at", { ascending: false });
            if (error) throw error;
            return (data as unknown as Conversation[]) || [];
        },
    });

    // Fetch Messages for active conversation
    const { data: messages = [], isLoading: loadingMsgs } = useQuery({
        queryKey: ["messages", activeConv],
        queryFn: async () => {
            if (!activeConv) return [];
            
            // v3.2: Using the optimized paged messages RPC
            const { data, error } = await supabase
                .rpc('get_paged_messages', {
                    p_chat_id: activeConv,
                    p_limit: 50,
                    p_offset: 0
                });

            if (error) throw error;
            
            const processMessages = ((data as unknown as any[]) || []).map(msg => {
                const isBot = msg.is_from_me === "true" || msg.is_from_me === true;
                return {
                    ...msg,
                    is_from_me: isBot,
                    metadata: msg.metadata || {},
                    ai_trace: msg.metadata?.ai_trace || null,
                    has_reasoning: !!msg.has_reasoning
                } as Message;
            });
            
            return processMessages.reverse();
        },
        enabled: !!activeConv,
    });

    const activeConvData = (conversations as Conversation[]).find(c => c.composite_chat_id === activeConv);

    // Real-time listener for new messages
    useEffect(() => {
        const channel = supabase
            .channel("realtime-inbox")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "silkbot_messages" },
                (payload: any) => {
                    const newMessage = payload.new as any;
                    // We invalidate queries here because we need consistent data from the synchronized view
                    queryClient.invalidateQueries({ queryKey: ["messages", activeConv] });
                    queryClient.invalidateQueries({ queryKey: ["conversations"] });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, queryClient, activeConv]);

    // Clear live traces when a new bot message arrives or when switching conversations
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.is_from_me) {
                setLiveTraces([]);
            }
        }
    }, [messages]);

    useEffect(() => {
        setLiveTraces([]);
    }, [activeConv]);

    useEffect(() => { 
        if (messages.length > 0) {
            msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Real-time listener for AI traces
    useEffect(() => {
        if (!activeConvData) return;

        const channel = supabase
            .channel(`live-traces-${activeConvData.composite_chat_id}`)
            .on(
                "postgres_changes",
                { 
                    event: "INSERT", 
                    schema: "public", 
                    table: "ai_traces",
                    filter: `conversation_id=eq.${activeConvData.contact_jid}`
                },
                (payload: any) => {
                    const newTrace = payload.new as any;
                    setLiveTraces(prev => {
                        // Deduplicate
                        if (prev.some(t => t.id === newTrace.id)) return prev;
                        return [...prev, {
                            id: newTrace.id,
                            type: newTrace.trace_type,
                            severity: newTrace.severity,
                            content: newTrace.content,
                            timestamp: new Date(newTrace.created_at).toLocaleTimeString(),
                            metadata: newTrace.metadata
                        }];
                    });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeConvData, supabase]);


    // Send Message Mutation
    const sendMutation = useMutation({
        mutationFn: async ({ conv, text }: { conv: Conversation, text: string }) => {
            const res = await fetch(`/api/gateway/send-message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    instance: conv.instance_name, 
                    to: conv.contact_jid, 
                    message: text 
                })
            });
            
            if (!res.ok) {
                let errorMsg = `Server error: ${res.status}`;
                try {
                    const data = await res.json();
                    errorMsg = data?.error || errorMsg;
                } catch(e) { /* ignore parse error */ }
                throw new Error(errorMsg);
            }
            return res.json();
        },
        onMutate: async ({ conv, text }) => {
            await queryClient.cancelQueries({ queryKey: ["messages", conv.composite_chat_id] });
            const previousMessages = queryClient.getQueryData(["messages", conv.composite_chat_id]);

            const optimisticMsg: Message = {
                message_id: `temp-${Date.now()}`,
                contact_jid: conv.contact_jid,
                contact_push_name: "Me",
                is_from_me: true,
                content: { conversation: text },
                content_text: text,
                has_reasoning: false,
                sent_at: Math.floor(Date.now() / 1000),
                delivery_status: "pending",
                instance_name: conv.instance_name,
                composite_chat_id: conv.composite_chat_id,
                isOptimistic: true,
            };

            queryClient.setQueryData(["messages", conv.composite_chat_id], (old: Message[] = []) => [...old, optimisticMsg]);
            setNewMsg("");
            return { previousMessages };
        },
        onError: (err: any, variables, context) => {
            queryClient.setQueryData(["messages", variables.conv.composite_chat_id], context?.previousMessages);
            toast.error(err.message || t("network_error_send"));
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["messages", variables.conv.composite_chat_id] });
        },
    });

    const statusMutation = useMutation({
        mutationFn: async ({ conv, status }: { conv: Conversation, status: string }) => {
            const res = await fetch(`/api/gateway/crm/update-ticket`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    remoteJid: conv.contact_jid,
                    instanceId: conv.instance_name,
                    status 
                })
            });
            if (!res.ok) throw new Error("Failed to update status");
        },
        onMutate: async ({ conv, status }) => {
            await queryClient.cancelQueries({ queryKey: ["conversations"] });
            const previousConvs = queryClient.getQueryData<Conversation[]>(["conversations"]);
            queryClient.setQueryData(["conversations"], (old: Conversation[] = []) => 
                old.map(c => c.composite_chat_id === conv.composite_chat_id ? { ...c, status: status as any } : c)
            );
            return { previousConvs };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(["conversations"], context?.previousConvs);
            toast.error(t("move_error"));
        },
        onSettled: () => { queryClient.invalidateQueries({ queryKey: ["conversations"] }); }
    });

    const botToggleMutation = useMutation({
        mutationFn: async ({ conv, newStatus }: { conv: Conversation, newStatus: boolean }) => {
            const res = await fetch(`/api/gateway/crm/update-lead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    remoteJid: conv.contact_jid,
                    instanceId: conv.instance_name,
                    bot_active: newStatus 
                })
            });
            if (!res.ok) throw new Error("Failed to toggle AI mode");
        },
        onMutate: async ({ conv, newStatus }) => {
            await queryClient.cancelQueries({ queryKey: ["conversations"] });
            const previousConvs = queryClient.getQueryData<Conversation[]>(["conversations"]);
            queryClient.setQueryData(["conversations"], (old: Conversation[] = []) => 
                old.map(c => c.composite_chat_id === conv.composite_chat_id ? { ...c, bot_active: newStatus } : c)
            );
            return { previousConvs };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(["conversations"], context?.previousConvs);
            toast.error(t("mode_override_failed"));
        },
        onSettled: () => { queryClient.invalidateQueries({ queryKey: ["conversations"] }); }
    });

    const assigneeMutation = useMutation({
        mutationFn: async ({ conv, newAssigneeId }: { conv: Conversation, newAssigneeId: string | null }) => {
            const targetId = newAssigneeId === "current_user" ? currentUserId : newAssigneeId;
            const { error } = await supabase
                .from("Chat")
                .update({ 
                    assignee_id: targetId,
                    assigned_at: targetId ? new Date().toISOString() : null
                })
                .eq("id", conv.composite_chat_id);
            if (error) throw error;
            if (targetId) await botToggleMutation.mutateAsync({ conv, newStatus: false });
        },
        onMutate: async ({ conv, newAssigneeId }) => {
            await queryClient.cancelQueries({ queryKey: ["conversations"] });
            const previousConvs = queryClient.getQueryData<Conversation[]>(["conversations"]);
            const targetId = newAssigneeId === "current_user" ? currentUserId : newAssigneeId;
            queryClient.setQueryData(["conversations"], (old: Conversation[] = []) => 
                old.map(c => c.composite_chat_id === conv.composite_chat_id ? { 
                    ...c, assignee_id: targetId, bot_active: targetId ? false : c.bot_active 
                } : c)
            );
            return { previousConvs };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(["conversations"], context?.previousConvs);
            toast.error(t("assignment_failed") || "Failed to update assignment");
        },
        onSettled: () => { queryClient.invalidateQueries({ queryKey: ["conversations"] }); }
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMsg.trim() || !activeConvData) return;
        sendMutation.mutate({ conv: activeConvData, text: newMsg });
    };

    const extractText = (content: any): string => {
        if (!content) return "";
        return content.conversation || content.extendedTextMessage?.text || t("media_received");
    };

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = (c.contact_push_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              c.contact_jid.includes(searchQuery));
        const matchesFilter = filter === "all" || 
                             (filter === "bot" && c.bot_active !== false) || 
                             (filter === "human" && c.bot_active === false) ||
                             (filter === c.status);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex bg-background/40 backdrop-blur-3xl border border-border rounded-[2.5rem] overflow-hidden h-[calc(100vh-6rem)] shadow-2xl relative">
            
            {/* Sidebar: Chat List */}
            <div className="w-80 md:w-[400px] border-r border-border flex flex-col bg-background/20">
                <div className="p-8 pb-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-foreground tracking-tighter">{t("title")}</h2>
                        <div className="flex gap-2">
                            <button 
                                aria-label="Refresh Messages"
                                className="p-2 bg-surface rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all transform active:scale-90"
                            >
                                <Zap className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder={t("search_contacts")} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface border border-border rounded-2xl pl-12 pr-6 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-purple-500/30 outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 bg-surface p-1.5 rounded-2xl border border-border">
                        <button onClick={() => setFilter("all")} className={cn("flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all", filter === "all" ? "bg-foreground/10 text-foreground shadow-lg" : "text-muted-foreground hover:text-foreground")}>{t("filter_all")}</button>
                        <button onClick={() => setFilter("bot")} className={cn("flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5", filter === "bot" ? "bg-purple-500 text-foreground shadow-lg shadow-purple-500/20" : "text-muted-foreground hover:text-foreground")}>
                            <Bot className="w-3 h-3" /> {t("filter_ai")}
                        </button>
                        <button onClick={() => setFilter("human")} className={cn("flex-1 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5", filter === "human" ? "bg-cyan-500 text-foreground shadow-lg shadow-cyan-500/20" : "text-muted-foreground hover:text-foreground")}>
                            <User className="w-3 h-3" /> {t("filter_human")}
                        </button>
                    </div>

                    <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border mt-2 overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setFilter("open")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                filter === "open" 
                                    ? "bg-accent-primary text-white shadow-[0_8px_20px_-6px_rgba(168,85,247,0.5)] scale-[1.02]" 
                                    : "bg-surface/50 text-dim-foreground hover:bg-surface border border-transparent hover:border-glass-border"
                            )}
                        >
                            <Sparkles className="w-3 h-3" />
                            {t("status_new")}
                        </button>
                        <button 
                            onClick={() => setFilter("pending")} 
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === "pending" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-surface/50 text-muted-foreground hover:bg-surface border border-transparent"
                            )}
                        >
                            <Clock className="w-3 h-3" />
                            {t("status_pending")}
                        </button>
                        <button 
                            onClick={() => setFilter("resolved")} 
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === "resolved" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-surface/50 text-muted-foreground hover:bg-surface border border-transparent"
                            )}
                        >
                            <CheckCheck className="w-3 h-3" />
                            {t("status_resolved")}
                        </button>
                        <button 
                            onClick={() => setFilter("blocked")} 
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === "blocked" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-surface/50 text-muted-foreground hover:bg-surface border border-transparent"
                            )}
                        >
                            <Info className="w-3 h-3" />
                            {t("status_blocked") || "Blocked"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-8">
                    <AnimatePresence mode="popLayout">
                        {loadingConvs ? (
                            <div className="py-20 text-center animate-pulse">
                                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">{t("stream_encrypting")}</p>
                            </div>
                        ) : filteredConversations.map((conv) => (
                            <motion.button 
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={conv.composite_chat_id} 
                                onClick={() => setActiveConv(conv.composite_chat_id)}
                                className={cn(
                                    "w-full text-left p-5 rounded-[1.75rem] mb-2 transition-all group relative border border-transparent",
                                    activeConv === conv.composite_chat_id 
                                        ? "bg-foreground/10 border-border shadow-xl scale-[1.02]" 
                                        : "hover:bg-surface"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-border flex items-center justify-center text-foreground font-black text-xl overflow-hidden shadow-inner">
                                            {conv.contact_avatar ? (
                                                <img src={conv.contact_avatar} alt={`${conv.contact_push_name || "Contact"}'s avatar`} className="w-full h-full object-cover opacity-80" />
                                            ) : (
                                                (conv.contact_push_name || "?").charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className={cn(
                                            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900",
                                            conv.bot_active !== false ? "bg-purple-500" : "bg-cyan-500"
                                        )} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-black text-foreground truncate">{conv.contact_push_name || "Nexus Guest"}</h4>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                {conv.last_message_at ? new Date(conv.last_message_at * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ""}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate font-medium flex items-center gap-1">
                                            {conv.bot_active !== false ? (
                                                <span className="flex items-center gap-1 text-purple-400 font-bold uppercase text-[8px] bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                                                    <Brain className="w-2 h-2" /> AI
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-cyan-400 font-bold uppercase text-[8px] bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20">
                                                    <User className="w-2 h-2" /> MNL
                                                </span>
                                            )}
                                            <span className="truncate">{conv.last_message_preview || t("no_messages") || "Chat started"}</span>
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            {conv.status && (
                                                <div className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                    conv.status === 'open' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                    conv.status === 'pending' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    conv.status === 'blocked' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                )}>
                                                    {t(`status_${conv.status}`)}
                                                </div>
                                            )}
                                            
                                            {conv.assignee_id && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-foreground/5 rounded-md border border-border">
                                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[6px] font-black uppercase text-white overflow-hidden">
                                                        {conv.assignee_avatar ? (
                                                            <img src={conv.assignee_avatar} alt="Agent" className="w-full h-full object-cover" />
                                                        ) : (conv.assignee_name || "?").charAt(0)}
                                                    </div>
                                                    <span className="text-[8px] font-bold text-muted-foreground truncate max-w-[60px]">
                                                        {conv.assignee_name || "Agent"}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        botToggleMutation.mutate({ conv, newStatus: conv.bot_active === false });
                                                    }}
                                                    className="p-1.5 bg-surface hover:bg-foreground/10 rounded-lg border border-border transition-all"
                                                    title={conv.bot_active !== false ? "Switch to Manual" : "Switch to AI"}
                                                >
                                                    {conv.bot_active !== false ? <User className="w-3 h-3 text-cyan-400" /> : <Bot className="w-3 h-3 text-purple-400" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-background/20">
                {activeConv ? (
                    <>
                        {/* Chat Header */}
                        <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-surface backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-0.5 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400">
                                    <div className="w-12 h-12 rounded-[0.9rem] bg-background flex items-center justify-center text-foreground font-black text-lg">
                                        {(activeConvData?.contact_push_name || "?").charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-lg font-black text-foreground tracking-tight leading-none mb-1">{activeConvData?.contact_push_name || activeConvData?.contact_jid}</h3>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        {t("encryption_active")} • {activeConvData?.instance_name}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex gap-2 mr-4 border-r border-border pr-6">
                                    <button aria-label="Audio Call" className="p-3 bg-surface rounded-2xl text-muted-foreground hover:text-foreground border border-border transition-all"><Phone className="w-4 h-4" /></button>
                                    <button aria-label="Video Call" className="p-3 bg-surface rounded-2xl text-muted-foreground hover:text-foreground border border-border transition-all"><Video className="w-4 h-4" /></button>
                                </div>
                                
                                <div className="flex items-center gap-2 mr-4 border-r border-border pr-6">
                                    <select 
                                        value={activeConvData?.status || 'open'}
                                        onChange={(e) => statusMutation.mutate({ conv: activeConvData!, status: e.target.value })}
                                        className="bg-surface border border-border rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 outline-none focus:ring-1 focus:ring-purple-500/50 transition-all cursor-pointer"
                                    >
                                        <option value="open" className="bg-background">{t("status_new")}</option>
                                        <option value="pending" className="bg-background">{t("status_pending")}</option>
                                        <option value="resolved" className="bg-background">{t("status_resolved")}</option>
                                        <option value="blocked" className="bg-background">{t("status_blocked") || "Blocked"}</option>
                                    </select>
                                </div>

                                <div className="hidden lg:flex items-center gap-2 mr-4 border-r border-border pr-6">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 px-4 rounded-xl gap-2 font-black text-[9px] uppercase tracking-widest transition-all"
                                        onClick={() => {
                                            const isMe = activeConvData?.assignee_id === "me"; // Hook will use session identity
                                            assigneeMutation.mutate({ 
                                                conv: activeConvData!, 
                                                newAssigneeId: activeConvData?.assignee_id ? null : "current_user" 
                                            });
                                        }}
                                    >
                                        {activeConvData?.assignee_id ? <User className="w-3 h-3 text-cyan-400" /> : <Brain className="w-3 h-3 text-purple-400" />}
                                        {activeConvData?.assignee_id ? t("release_chat") || "Release Chat" : t("take_over") || "Take Over Chat"}
                                    </Button>
                                </div>

                                <Button 
                                    size="sm"
                                    aria-label={activeConvData?.bot_active !== false ? "Switch to Manual Mode" : "Switch to AI Mode"}
                                    onClick={() => botToggleMutation.mutate({ conv: activeConvData!, newStatus: activeConvData?.bot_active === false })}
                                    variant={activeConvData?.bot_active !== false ? "gradient" : "outline"}
                                    className="h-11 px-6 rounded-2xl gap-2 active:scale-95 transition-transform"
                                >
                                    {activeConvData?.bot_active !== false ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    <span className="text-[10px] uppercase font-black tracking-widest decoration-slate-500">
                                        {activeConvData?.bot_active !== false ? t("mode_ai") : t("mode_manual")}
                                    </span>
                                </Button>
                                <button aria-label="Conversation Options" className="p-3 bg-surface rounded-2xl text-muted-foreground border border-border hover:bg-foreground/10 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar scroll-smooth">
                            <AnimatePresence initial={false}>
                                {messages.map((msg, idx) => {
                                    const fromMe = msg.is_from_me;
                                    const isLast = idx === messages.length - 1;
                                    const hasTrace = msg.has_reasoning || !!msg.ai_trace || (msg.metadata && (msg.metadata as any).reasoning);

                                    return (
                                        <div key={msg.message_id} className="space-y-4">
                                            <motion.div 
                                                layout
                                                initial={{ opacity: 0, x: fromMe ? 20 : -20, scale: 0.95 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                className={cn("flex group", fromMe ? "justify-end" : "justify-start")}
                                            >
                                                <div className={cn(
                                                    "max-w-[70%] relative",
                                                    fromMe ? "text-right" : "text-left"
                                                )}>
                                                    <div className={cn(
                                                        "px-6 py-4 shadow-2xl transition-all duration-300 relative overflow-hidden group/msg",
                                                        fromMe 
                                                            ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-foreground rounded-[2rem] rounded-tr-none border border-border" 
                                                            : "bg-background border border-border text-slate-200 rounded-[2rem] rounded-tl-none",
                                                        msg.isOptimistic && "opacity-50 blur-[1px]"
                                                    )}>
                                                        {hasTrace && (
                                                            <button 
                                                                onClick={() => setSelectedTraceMsg(selectedTraceMsg === msg.message_id ? null : msg.message_id)}
                                                                className={cn(
                                                                    "absolute top-2 p-1.5 bg-purple-500/20 rounded-lg border border-purple-500/30 opacity-0 group-hover/msg:opacity-100 transition-all hover:bg-purple-500/40 z-10",
                                                                    fromMe ? "left-2" : "right-2"
                                                                )}
                                                                title="View AI Reasoning"
                                                            >
                                                                <Brain className="w-3 h-3 text-purple-400" />
                                                            </button>
                                                        )}
                                                        <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{msg.content_text || extractText(msg.content)}</p>
                                                        <div className={cn(
                                                            "mt-2 flex items-center gap-1.5 opacity-40",
                                                            fromMe ? "justify-end" : "justify-start"
                                                        )}>
                                                            <span className="text-[9px] font-mono font-bold">
                                                                {new Date(msg.sent_at * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                            </span>
                                                            {fromMe && (
                                                                msg.isOptimistic ? <Clock className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3 text-emerald-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                            
                                            <AnimatePresence>
                                                {selectedTraceMsg === msg.message_id && hasTrace && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="max-w-[85%] mx-auto py-4">
                                                            <AIReasoningTrace steps={
                                                                msg.ai_trace || (
                                                                    Array.isArray((msg.metadata as any)?.reasoning) 
                                                                        ? (msg.metadata as any).reasoning 
                                                                        : [(msg.metadata as any)?.reasoning].filter(Boolean).map(r => ({
                                                                            id: `r-${msg.message_id}`,
                                                                            type: 'reasoning',
                                                                            content: typeof r === 'string' ? r : JSON.stringify(r),
                                                                            timestamp: new Date(msg.sent_at * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
                                                                        }))
                                                                )
                                                            } />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                                
                                {/* Live Trace Area */}
                                {liveTraces.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="flex justify-start mb-6"
                                    >
                                        <div className="max-w-[85%] w-full">
                                            <div className="flex items-center gap-3 mb-4 pl-4">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                                    <Cpu className="w-3 h-3 text-purple-400 animate-spin" />
                                                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">{t("neural_active")}</span>
                                                </div>
                                            </div>
                                            <AIReasoningTrace steps={liveTraces} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={msgEndRef} className="h-4" />
                        </div>

                        {/* Input Area */}
                        <footer className="p-8 bg-background/60 backdrop-blur-3xl border-t border-border">
                            <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex items-center gap-4 bg-background/60 p-2.5 rounded-[2rem] border border-border shadow-2xl ring-1 ring-white/5 focus-within:ring-purple-500/30 transition-all group">
                                <div className="flex gap-1 pl-2">
                                    <button type="button" title="Attach Payload" className="p-3 text-muted-foreground hover:text-foreground transition-colors"><Paperclip className="w-5 h-5" /></button>
                                </div>
                                
                                <input 
                                    type="text" 
                                    value={newMsg} 
                                    onChange={(e) => setNewMsg(e.target.value)} 
                                    placeholder={t("input_placeholder")}
                                    className="flex-1 bg-transparent border-none px-2 py-4 text-foreground placeholder:text-muted-foreground text-lg focus:ring-0 outline-none" 
                                />
                                
                                <div className="flex items-center gap-2 pr-1">
                                    <button aria-label="Voice Message" type="button" className="p-3 text-muted-foreground hover:text-foreground transition-colors"><Mic className="w-5 h-5" /></button>
                                    <button 
                                        aria-label="Send Transmission"
                                        type="submit" 
                                        disabled={!newMsg.trim() || sendMutation.isPending} 
                                        className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95",
                                            newMsg.trim() ? "bg-purple-500 text-foreground hover:bg-purple-600" : "bg-surface text-muted-foreground"
                                        )}
                                    >
                                        <Send className={cn("w-6 h-6 transition-all", newMsg.trim() && "group-hover:translate-x-1 group-hover:-translate-y-1")} />
                                    </button>
                                </div>
                            </form>
                            <p className="text-center text-[9px] text-muted-foreground font-bold uppercase tracking-[0.3em] mt-4">
                                {t("quantum_link")}
                            </p>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="relative">
                            <div className="w-32 h-32 bg-purple-500/10 rounded-[3rem] border-2 border-dashed border-purple-500/20 flex items-center justify-center animate-spin-slow">
                                <MessageSquare className="w-12 h-12 text-purple-400 rotate-12" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-background rounded-full border border-border flex items-center justify-center shadow-2xl">
                                <Cpu className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-foreground tracking-tighter mb-2">{t("select_chat")}</h3>
                            <p className="text-muted-foreground font-medium max-w-xs mx-auto">{t("select_chat_desc")}</p>
                        </div>
                        <Button variant="outline" className="rounded-2xl border-border">{t("btn_docs")}</Button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.2); }
                
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
            `}</style>
        </div>
    );
}
