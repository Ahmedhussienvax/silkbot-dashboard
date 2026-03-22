"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { 
    Search, 
    Tag, 
    Database, 
    Trash2, 
    Plus, 
    Loader2, 
    Users,
    Fingerprint,
    Network,
    Clock
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Contact {
    id: string;
    jid: string;
    push_name: string | null;
    avatar: string | null;
    tenant_id: string;
    is_group: string | boolean;
    last_message_at: number;
    instance_name: string;
    tags?: string[];
}

export default function ContactsPage() {
    const t = useTranslations("Contacts");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const supabase = createClient();

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await supabase
                    .schema("silkbot")
                    .from("silkbot_contacts")
                    .select("*")
                    .order("last_message_at", { ascending: false });
                
                setContacts((data as unknown as Contact[]) || []);
            } catch (err) {
                console.error("Registry Sync Error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [supabase]);

    const addTag = async (jid: string, instance_name: string, currentTags: string[]) => {
        // Using a custom prompt or simple input for enterprise feel
        const newTag = window.prompt("INITIALIZE_TAG_INJECTION: Enter identifier name");
        if (newTag && !currentTags.includes(newTag.trim())) {
            const updatedTags = [...currentTags, newTag.trim()];
            setContacts(prev => prev.map(c => c.jid === jid && c.instance_name === instance_name ? { ...c, tags: updatedTags } : c));
            await supabase.schema("silkbot").from("silkbot_contacts").update({ tags: updatedTags }).eq("jid", jid).eq("instance_name", instance_name);
            toast.success("Segment Injected", { description: `New metadata tag applied to node ${jid.split('@')[0]}` });
        }
    };

    const removeTag = async (jid: string, instance_name: string, currentTags: string[], tagToRemove: string) => {
        const updatedTags = currentTags.filter(t => t !== tagToRemove);
        setContacts(prev => prev.map(c => c.jid === jid && c.instance_name === instance_name ? { ...c, tags: updatedTags } : c));
        await supabase.schema("silkbot").from("silkbot_contacts").update({ tags: updatedTags }).eq("jid", jid).eq("instance_name", instance_name);
        toast.info("Segment Purged", { description: `Tag ${tagToRemove} removed from node identifiers.` });
    };

    const filtered = contacts.filter(c => 
        (c.push_name?.toLowerCase().includes(search.toLowerCase()) || c.jid.includes(search)) ||
        (c.tags && c.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 border-2 border-indigo-500/20 rounded-[2rem] animate-spin" />
                    <Loader2 className="w-8 h-8 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Syncing_Neural_Registry...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <Network className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest italic">Core_Network_Nodes</span>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter italic">
                        {t("title") || "Matrix Registry"}<span className="text-indigo-500">.</span>
                    </h1>
                    <p className="text-slate-500 text-xl font-medium max-w-2xl leading-relaxed italic">
                        {t("description") || "Real-time mapping and segmentation of incoming signal sources across all instances."}
                    </p>
                </div>
                
                <div className="relative w-full lg:w-[450px] group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition-all duration-700" />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-500 group-focus-within:text-indigo-400">
                        <Search className="h-5 w-5 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="FILTER_NODES_BY_IDENTIFIER_OR_TAG..." 
                        className="w-full pl-16 pr-8 py-6 bg-slate-900/40 border border-white/5 rounded-3xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 backdrop-blur-3xl font-bold shadow-2xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-3xl relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-50" />
                
                <div className="overflow-x-auto relative">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Node_Identity</th>
                                <th className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Signal_Source</th>
                                <th className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Metadata_Segments</th>
                                <th className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Last_Activity</th>
                                <th className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Cluster</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map((c, idx) => (
                                <tr 
                                    key={c.id || c.jid} 
                                    className="hover:bg-white/[0.04] transition-all group/row cursor-default animate-in slide-in-from-bottom-2 duration-700"
                                    style={{ animationDelay: `${idx * 15}ms` }}
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover/row:opacity-100 transition-opacity rounded-full" />
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center text-white font-black text-xl border border-white/5 shadow-inner group-hover/row:scale-105 group-hover/row:border-indigo-500/30 transition-all duration-500 relative overflow-hidden">
                                                    {(c.push_name || "?").charAt(0).toUpperCase()}
                                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500/80 border-4 border-slate-950 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-white font-black tracking-tight text-lg group-hover/row:text-indigo-400 transition-colors uppercase italic">{c.push_name || "UNIDENTIFIED_NODE"}</div>
                                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                                                    <Fingerprint className="w-2.5 h-2.5" />
                                                    {c.is_group === "true" || c.is_group === true ? "COLLECTIVE_ACTOR" : "SINGULAR_ACTOR"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="font-mono text-xs text-slate-400 group-hover/row:text-white transition-colors bg-black/40 px-4 py-2 rounded-xl inline-block border border-white/5 shadow-inner">
                                            {c.jid.split("@")[0]}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {(c.tags || []).map(tag => (
                                                <button 
                                                    key={tag} 
                                                    onClick={() => removeTag(c.jid, c.instance_name, c.tags || [], tag)} 
                                                    className="group/tag inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 transition-all shadow-sm"
                                                >
                                                    <Tag className="w-3 h-3 group-hover/tag:hidden" />
                                                    <Trash2 className="w-3 h-3 hidden group-hover/tag:block" />
                                                    {tag}
                                                </button>
                                            ))}
                                            <button 
                                                onClick={() => addTag(c.jid, c.instance_name, c.tags || [])}
                                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all active:scale-95"
                                            >
                                                <Plus className="w-3 h-3" />
                                                INJECT_SEGMENT
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3 text-slate-500 text-[11px] font-black uppercase tracking-widest bg-black/20 px-4 py-2 rounded-xl border border-white/5 transition-all group-hover/row:border-indigo-500/20 group-hover/row:text-slate-300">
                                            <Clock className="w-3.5 h-3.5 opacity-40 group-hover/row:text-indigo-400 transition-colors" />
                                            {c.last_message_at ? format(new Date(c.last_message_at * 1000), "MMM dd, HH:mm") : "VOID"}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="inline-flex items-center gap-3 bg-indigo-500/10 text-indigo-400 px-5 py-2.5 rounded-2xl border border-indigo-500/10 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg group-hover/row:bg-indigo-500 group-hover/row:text-white transition-all">
                                            <Database className="w-3.5 h-3.5" />
                                            {c.instance_name || "MASTER_KRNL"}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-48 text-center bg-black/20">
                                        <div className="relative inline-block mb-10">
                                            <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-20 animate-pulse" />
                                            <div className="w-24 h-24 bg-slate-950 border border-white/10 rounded-[3rem] flex items-center justify-center relative">
                                                <Search className="h-10 w-10 text-slate-800" />
                                            </div>
                                        </div>
                                        <h3 className="text-4xl font-black text-white tracking-tighter italic mb-4 uppercase">Registry_Null</h3>
                                        <p className="text-slate-500 text-lg max-w-md mx-auto font-medium leading-relaxed italic">No entities matched the scanning parameters. Recalibrate filter or widen search radius.</p>
                                        <button onClick={() => setSearch("")} className="mt-10 px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all transform active:scale-95">
                                            RESET_SCANNER
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[3rem] backdrop-blur-3xl space-y-4 group">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                        <Database className="w-6 h-6 text-indigo-400 group-hover:text-white" />
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter tabular-nums italic">{contacts.length}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active_Cluster_Nodes</div>
                </div>
                <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[3rem] backdrop-blur-3xl space-y-4 group">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                        <Users className="w-6 h-6 text-emerald-400 group-hover:text-white" />
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter tabular-nums italic">
                        {contacts.filter(c => c.is_group !== "true" && c.is_group !== true).length}
                    </div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Singular_Profiles</div>
                </div>
                <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[3rem] backdrop-blur-3xl space-y-4 group">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                        <Tag className="w-6 h-6 text-purple-400 group-hover:text-white" />
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter tabular-nums italic">
                        {contacts.reduce((acc, c) => acc + (c.tags?.length || 0), 0)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Injected_Segments</div>
                </div>
                <div className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-900 border border-white/10 rounded-[3rem] space-y-4 cursor-pointer hover:scale-[1.02] transition-all shadow-3xl">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Search className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xl font-black text-white tracking-tighter uppercase italic">Quick_Search</div>
                    <div className="text-[10px] text-white/60 font-black uppercase tracking-widest">Scan Global Registry</div>
                </div>
            </footer>
        </div>
    );
}