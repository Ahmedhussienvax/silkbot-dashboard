"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { 
    FileText, 
    UploadCloud, 
    Trash2, 
    Database, 
    ShieldCheck, 
    Clock, 
    Search, 
    FileIcon,
    AlertCircle,
    CheckCircle2,
    BookOpen,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

interface KnowledgeDoc {
    id: string;
    filename: string;
    source_type: string;
    created_at: string;
}

export default function KnowledgePage() {
    const t = useTranslations("Knowledge");
    const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClient();

    const loadDocs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("knowledge_docs")
                .select("id, filename, source_type, created_at")
                .order("created_at", { ascending: false });

            if (error) throw error;

            const uniqueDocs = (data || []).reduce((acc: KnowledgeDoc[], curr) => {
                const exists = acc.find(d => d.filename === curr.filename);
                if (!exists) acc.push(curr as KnowledgeDoc);
                return acc;
            }, []);

            setDocs(uniqueDocs);
        } catch (err: any) {
            console.error("Error loading docs:", err);
            toast.error(t("error_loading"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocs();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading(t("uploading"));

        try {
            const webhookUrl = process.env.NEXT_PUBLIC_N8N_KNOWLEDGE_WEBHOOK;
            if (!webhookUrl) throw new Error(t("error_webhook"));

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(webhookUrl, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                toast.success(t("success_msg"), { id: toastId });
                setFile(null);
                setTimeout(loadDocs, 5000); 
            } else {
                throw new Error(t("error_upload"));
            }
        } catch (err: any) {
            toast.error(err.message || t("error_upload"), { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    const deleteDoc = async (filename: string) => {
        const confirmDelete = await new Promise((resolve) => {
            toast.warning(t("delete_confirm", { filename }), {
                action: {
                    label: "Delete",
                    onClick: () => resolve(true),
                },
                cancel: {
                    label: "Cancel",
                    onClick: () => resolve(false),
                }
            });
        });

        if (!confirmDelete) return;
        
        const toastId = toast.loading("Deleting document...");
        try {
            const { error } = await supabase
                .from("knowledge_docs")
                .delete()
                .eq("filename", filename);

            if (error) throw error;
            setDocs(prev => prev.filter(d => d.filename !== filename));
            toast.success("Document purged successfully", { id: toastId });
        } catch (err: any) {
            toast.error("Error: " + err.message, { id: toastId });
        }
    };

    const filteredDocs = docs.filter(doc => 
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-12 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter">{t("title")}</h1>
                    </div>
                    <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">{t("description")}</p>
                </div>
                
                <div className="flex items-center gap-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-[1.75rem] shadow-2xl">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Intelligence</p>
                        <p className="text-2xl font-black text-white">{docs.length} <span className="text-sm text-slate-500">Docs</span></p>
                    </div>
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        <Database className="w-6 h-6 text-purple-400" />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Upload Section */}
                <div className="xl:col-span-4 space-y-8">
                    <section className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] -z-10 group-hover:bg-purple-500/10 transition-all duration-1000" />
                        
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight">{t("upload_title")}</h3>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-8">
                            <div className="group/drop relative border-2 border-dashed border-white/5 rounded-[2rem] p-12 hover:border-purple-500/40 hover:bg-black/40 transition-all text-center cursor-pointer overflow-hidden ring-4 ring-transparent hover:ring-purple-500/5">
                                <input 
                                    type="file" 
                                    accept=".pdf,.txt,.md" 
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                />
                                <div className="relative z-0 space-y-4">
                                    <div className="w-24 h-24 bg-slate-800/40 rounded-3xl flex items-center justify-center text-5xl mx-auto group-hover/drop:scale-110 transition-all duration-500 shadow-2xl border border-white/5 ring-1 ring-white/5">
                                        {file ? <FileText className="w-10 h-10 text-purple-400" /> : <Database className="w-10 h-10 text-slate-700" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-base font-black text-white group-hover/drop:text-purple-400 transition-colors px-4 truncate">
                                            {file ? file.name : t("upload_placeholder")}
                                        </p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black opacity-60 italic">Supported: PDF, TXT, MD</p>
                                    </div>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={!file || uploading} 
                                variant="gradient"
                                loading={uploading}
                                className="w-full h-16 text-lg"
                            >
                                <Zap className="w-5 h-5 mr-1" />
                                {t("upload_btn")}
                            </Button>
                        </form>
                    </section>

                    <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            <h4 className="text-white font-bold text-sm">Semantic Optimization</h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed italic">
                            All uploaded documents are automatically vectorized and indexed for ultra-fast semantic retrieval by the AI engine.
                        </p>
                    </div>
                </div>

                {/* Docs Inventory Section */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Filter knowledge pool..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-900/60 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:ring-2 focus:ring-purple-500/20 outline-none transition-all shadow-xl"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t("processed_title")}</span>
                            <div className="h-px w-12 bg-white/10" />
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl min-h-[600px]">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center h-96 gap-6">
                                <div className="w-16 h-16 border-4 border-white/5 border-t-purple-500 rounded-full animate-spin shadow-[0_0_20px_rgba(168,85,247,0.3)]" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">Synchronizing Neural Links...</p>
                            </div>
                        ) : filteredDocs.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-40 text-center space-y-6 opacity-30">
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 animate-bounce">
                                    <Database className="w-10 h-10 text-slate-500" />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-2xl mb-2">{t("no_docs")}</h4>
                                    <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium">{t("no_docs_desc")}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {filteredDocs.map((doc, idx) => (
                                        <motion.div 
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={doc.id} 
                                            className="group relative bg-black/40 border border-white/5 rounded-[2rem] p-6 hover:border-purple-500/20 transition-all hover:bg-slate-900/60 shadow-xl overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            
                                            <div className="flex items-start gap-6 relative z-10">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl border border-white/5 group-hover:scale-105 transition-transform duration-500">
                                                    {doc.filename.endsWith('.pdf') ? 
                                                        <FileText className="w-7 h-7 text-red-400" /> : 
                                                        <FileIcon className="w-7 h-7 text-blue-400" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0 pr-8">
                                                    <h4 className="text-white font-black text-base truncate mb-2" title={doc.filename}>{doc.filename}</h4>
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{t("ready")}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                                                            <span className="text-[10px] text-slate-500 font-mono">
                                                                {new Date(doc.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => deleteDoc(doc.filename)}
                                                className="absolute top-6 right-6 p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all opacity-0 group-hover:opacity-100 scale-90 hover:scale-110"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
            `}</style>
        </div>
    );
}
