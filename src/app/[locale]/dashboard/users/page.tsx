"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import {
    Search,
    Tag as TagIcon,
    Database,
    Trash2,
    Plus,
    Loader2,
    Users,
    Fingerprint,
    Network,
    Clock,
    User,
    X,
    Info,
    Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Contact {
    id: number;
    jid: string;
    push_name: string;
    last_message_at: number;
    instance_name: string;
    tags?: string[];
    lead_value?: number;
    lead_source?: string;
    notes?: string;
}

export default function ContactsPage() {
    const t = useTranslations("Contacts");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedNode, setExpandedNode] = useState<string | null>(null);
    const [notesBuffer, setNotesBuffer] = useState<string>("");
    const supabase = createClient();

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            // Updated to source from the 'silkbot.contacts' secure view (v5.7.1 Enterprise Specification)
            const { data, error } = await supabase
                .schema("silkbot")
                .from("contacts")
                .select("*");

            if (error) throw error;
            
            // Map the view fields to the internal Contact interface
            const mappedData: Contact[] = (data || []).map((c: any) => ({
                id: c.id,
                jid: c.phone ? `${c.phone}@s.whatsapp.net` : c.jid,
                push_name: c.name || "UNIDENTIFIED",
                last_message_at: c.updated_at ? new Date(c.updated_at).getTime() / 1000 : (c.last_message_at ? new Date(c.last_message_at).getTime() / 1000 : 0),
                instance_name: c.tenant_id || "hub-alpha",
                lead_value: Number(c.lead_value || 0),
                lead_source: c.lead_source || "Organic",
                tags: Array.isArray(c.tags) ? c.tags : (typeof c.tags === 'string' ? JSON.parse(c.tags) : []),
                notes: c.notes || c.lead_notes,
                bot_active: c.bot_active
            }));

            setContacts(mappedData);
        } catch (error: any) {
            console.error("🔴 [FAIL-03] Node Sync Failure:", error);
            toast.error("Signal Disruption", { description: "Failed to synchronize with neural network. Please retry." });
        } finally {
            setLoading(false);
        }
    };

    const removeTag = async (jid: string, instance_name: string, tagToRemove: string) => {
        const contact = contacts.find(c => c.jid === jid && c.instance_name === instance_name);
        if (!contact) return;
        
        const newTags = (contact.tags || []).filter(t => t !== tagToRemove);
        setContacts(prev => prev.map(c => c.jid === jid && c.instance_name === instance_name ? { ...c, tags: newTags } : c));
        
        await supabase.from("Contact").update({ tags: newTags }).eq("id", contact.id);
        toast.info("Segment Purged", { description: `Tag ${tagToRemove} removed from node identifiers.` });
    };

    const saveNotes = async (jid: string, instance_name: string) => {
        const contact = contacts.find(c => c.jid === jid && c.instance_name === instance_name);
        if (!contact) return;

        setContacts(prev => prev.map(c => c.jid === jid && c.instance_name === instance_name ? { ...c, notes: notesBuffer } : c));
        await supabase.from("Contact").update({ lead_notes: notesBuffer }).eq("id", contact.id);
        toast.success("Intelligence Updated", { description: "Internal notes synchronized with the core registry." });
    };

    const filtered = contacts.filter(c => 
        (c.push_name?.toLowerCase().includes(search.toLowerCase()) || c.jid.includes(search)) ||
        (c.tags && c.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6 animate-pulse transition-colors duration-700 bg-background">
                <div className="w-16 h-16 rounded-full border-2 border-t-accent-primary border-accent-primary/20 animate-spin" />
                <div className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em]">{t("syncing")}</div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-10 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/20">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tighter italic">{t("title")}</h1>
                    </div>
                    <p className="text-text-muted text-sm font-medium tracking-wide max-w-lg">
                        {t("description")}
                    </p>
                </div>

                <div className="relative group min-w-[320px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-accent-primary transition-colors" />
                    <input 
                        type="text"
                        placeholder={t("search_placeholder")}
                        className="w-full bg-surface border border-glass-border rounded-2xl py-4 pl-14 pr-6 text-sm font-medium text-foreground placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all shadow-2xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-surface border border-glass-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-foreground/[0.02] border-b border-glass-border">
                                <th scope="col" role="columnheader" aria-label="Contact Identity" className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">{t("header_node")}</th>
                                <th scope="col" role="columnheader" aria-label="Lead Source" className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">{t("header_signal")}</th>
                                <th scope="col" role="columnheader" aria-label="Valuation" className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">{t("header_value")}</th>
                                <th scope="col" role="columnheader" aria-label="Tags and Segments" className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">{t("header_metadata")}</th>
                                <th scope="col" role="columnheader" aria-label="Last Activity Timestamp" className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-text-dim">{t("header_activity")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {filtered.map((c, idx) => (
                                <React.Fragment key={c.id || c.jid}>
                                <tr 
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={expandedNode === c.jid}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            setExpandedNode(expandedNode === c.jid ? null : c.jid);
                                        }
                                    }}
                                    className={cn(
                                        "hover:bg-foreground/[0.04] transition-all group/row cursor-pointer animate-in slide-in-from-bottom-2 duration-700 outline-none focus:bg-foreground/[0.04]",
                                        expandedNode === c.jid && "bg-accent-primary/5 shadow-inner border-l-2 border-accent-primary"
                                    )}
                                    style={{ animationDelay: `${idx * 15}ms` }}
                                    onClick={() => {
                                        if (expandedNode === c.jid) {
                                            setExpandedNode(null);
                                        } else {
                                            setExpandedNode(c.jid);
                                            setNotesBuffer(c.notes || "");
                                        }
                                    }}
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary p-[1px] shadow-lg group-hover/row:scale-105 transition-transform duration-500">
                                                <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center overflow-hidden">
                                                    <User className="w-6 h-6 text-text-dim/40" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-foreground font-black tracking-tight text-lg italic group-hover/row:text-accent-primary transition-colors">
                                                    {c.push_name || t("null_identity")}
                                                </div>
                                                <div className="text-[10px] font-mono text-text-dim flex items-center gap-2">
                                                    <Fingerprint className="w-3 h-3 text-accent-primary/50" />
                                                    {c.jid}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                                                <Network className="w-4 h-4 text-accent-primary" />
                                            </div>
                                            <span className="text-[11px] font-black text-text-muted uppercase tracking-widest italic">{c.lead_source || t("organic_link")}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-foreground font-mono text-sm group-hover/row:text-accent-primary transition-colors">
                                                ${(c.lead_value || 0).toLocaleString()}
                                            </div>
                                            <div className="text-[9px] text-text-dim font-black uppercase tracking-widest opacity-60 italic">
                                                {t("value_node")}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {(c.tags || []).map((tag: string) => (
                                                <button 
                                                    key={tag}
                                                    onClick={(e) => { e.stopPropagation(); removeTag(c.jid, c.instance_name, tag); }}
                                                    className="group/tag inline-flex items-center gap-2 bg-foreground/[0.03] hover:bg-red-500/10 text-text-dim hover:text-red-400 px-3 py-1.5 rounded-lg border border-glass-border hover:border-red-500/20 text-[9px] font-black uppercase tracking-widest transition-all"
                                                >
                                                    {tag}
                                                    <X className="w-2.5 h-2.5 opacity-0 group-hover/tag:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                            <button className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center border border-accent-primary/10 hover:bg-accent-primary hover:text-white transition-all">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3 text-text-dim text-[11px] font-black uppercase tracking-widest bg-foreground/[0.05] px-4 py-2 rounded-xl border border-glass-border transition-all group-hover/row:border-accent-primary/20 group-hover/row:text-text-muted">
                                            <Clock className="w-3.5 h-3.5 opacity-40 group-hover/row:text-accent-primary transition-colors" />
                                            {c.last_message_at ? format(new Date(c.last_message_at * 1000), "MMM dd, HH:mm") : t("void")}
                                        </div>
                                    </td>
                                </tr>
                                
                                <AnimatePresence>
                                    {expandedNode === c.jid && (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-0 bg-transparent overflow-hidden">
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="py-10 border-t border-glass-border"
                                                >
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] flex items-center gap-2">
                                                                    <Info className="w-3 h-3 text-accent-primary" />
                                                                    {t("notes")}
                                                                </h4>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); saveNotes(c.jid, c.instance_name); }}
                                                                    className="px-4 py-1.5 bg-accent-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-accent-primary/80 transition-all shadow-lg"
                                                                >
                                                                    {t("save_notes")}
                                                                </button>
                                                            </div>
                                                            <textarea 
                                                                className="w-full h-32 bg-surface border border-glass-border rounded-2xl p-6 text-text-muted text-sm focus:ring-1 focus:ring-accent-primary outline-none transition-all placeholder:text-text-dim font-medium leading-relaxed"
                                                                placeholder={t("notes_placeholder")}
                                                                value={notesBuffer}
                                                                onChange={(e) => setNotesBuffer(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-6 bg-surface border border-glass-border rounded-2xl">
                                                                    <div className="text-[9px] font-black text-text-dim uppercase tracking-widest mb-2 italic">{t("neural_instance")}</div>
                                                                    <div className="text-sm font-black text-foreground">{c.instance_name}</div>
                                                                </div>
                                                                <div className="p-6 bg-surface border border-glass-border rounded-2xl">
                                                                    <div className="text-[9px] font-black text-text-dim uppercase tracking-widest mb-2 italic">{t("signal_hash")}</div>
                                                                    <div className="text-xs font-mono text-text-muted truncate">{c.jid}</div>
                                                                </div>
                                                            </div>
                                                            <div className="p-6 bg-accent-primary/5 border border-accent-primary/10 rounded-2xl flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-full bg-accent-primary text-white flex items-center justify-center">
                                                                        <Sparkles className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="text-[10px] font-black text-accent-primary uppercase tracking-widest italic">{t("priority_node")}</div>
                                                                </div>
                                                                <div className="text-xl font-black text-foreground italic">{t("level")}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                                </React.Fragment>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 text-text-dim">
                                            <Database className="w-10 h-10 text-text-dim opacity-40 animate-pulse" />
                                            <div className="text-[10px] font-black text-text-dim uppercase tracking-[0.4em]">{t("no_signals")}</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}