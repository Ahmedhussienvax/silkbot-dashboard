"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Megaphone, Send, Image as ImageIcon, Type, Users, Phone,
  BarChart3, CheckCircle2, AlertCircle, Clock, Eye, Play, 
  Target, Zap, AlignLeft, ArrowRight, History, Activity
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---
type MessageType = 'text' | 'media';

interface CampaignForm {
  name: string;
  segmentId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl: string;
}

// --- Mock Data ---
const AUDIENCE_SEGMENTS = [
  { id: 'seg_1', name: 'VIP Matrix (Global)', count: 2450 },
  { id: 'seg_2', name: 'High Yield (MENA)', count: 18200 },
  { id: 'seg_3', name: 'Tech Interests (Cairo)', count: 5400 },
  { id: 'seg_4', name: 'Raw Ingress (Unfiltered)', count: 89000 },
];

const PLATFORM_SENDERS = [
  { id: 'snd_alpha', label: 'System Alpha (+1 555-0199)', status: 'operational' },
  { id: 'snd_beta', label: 'System Beta (+44 20-7081)', status: 'operational' },
  { id: 'snd_gamma', label: 'System Gamma (+971 50-1234)', status: 'cooling' },
];

const HISTORICAL_CAMPAIGNS = [
  { id: 'c_101', name: 'Q1 VIP Outreach', sent: 2450, delivered: 2410, read: 1850, failed: 40, status: 'completed' },
  { id: 'c_102', name: 'Tech Founders Alert', sent: 5400, delivered: 5120, read: 3200, failed: 280, status: 'completed' },
  { id: 'c_103', name: 'Global Re-engagement', sent: 45000, delivered: 12000, read: 8000, failed: 15, status: 'active', progress: 28 },
];

// --- Sub-components ---
const OptionCard = ({ 
    active, 
    onClick, 
    icon: Icon, 
    title, 
    subtitle, 
    badge 
}: { 
    active: boolean; 
    onClick: () => void; 
    icon: any; 
    title: string; 
    subtitle: string;
    badge?: string;
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-start
            ${active 
                ? 'bg-accent-primary/10 border-accent-primary/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-accent-primary/20' 
                : 'bg-surface/40 hover:bg-surface/80 border-glass-border/60 hover:border-glass-border'
            }
        `}
    >
        <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${active ? 'bg-accent-primary/20 text-accent-primary' : 'bg-white/5 text-muted-foreground'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className={`font-bold text-sm ${active ? 'text-foreground' : 'text-foreground/80'}`}>{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
        </div>
        {badge && (
            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border
                ${active ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' : 'bg-surface border-glass-border text-muted-foreground'}
            `}>
                {badge}
            </span>
        )}
    </button>
);

const ProgressBar = ({ label, value, max, colorClass }: { label: string, value: number, max: number, colorClass: string }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-end text-xs font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-foreground">{value.toLocaleString()} <span className="opacity-50">/ {max.toLocaleString()}</span></span>
            </div>
            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${colorClass}`}
                />
            </div>
        </div>
    );
};

export default function SuperBroadcastsPage() {
  const [form, setForm] = useState<CampaignForm>({
    name: '',
    segmentId: '',
    senderId: '',
    type: 'text',
    content: '',
    mediaUrl: ''
  });
  
  const [isInitializing, setIsInitializing] = useState(false);

  const activeSegment = AUDIENCE_SEGMENTS.find(s => s.id === form.segmentId);

  const handleInitialize = async () => {
    if (!form.name || !form.segmentId || !form.senderId || !form.content) {
        toast.error("Validation Error", { description: "Please complete all mandatory campaign matrices." });
        return;
    }

    setIsInitializing(true);
    try {
        const res = await fetch("/api/super/broadcasts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Broadcast delivery node failed.");
        }

        toast.success("Broadcast Initialized", { 
            description: `Drip campaign directed to ${activeSegment?.count.toLocaleString()} vectors.` 
        });
        
        // Reset basic fields
        setForm(prev => ({ ...prev, name: '', content: '' }));
    } catch (err: any) {
        toast.error("Fatal Exception", { description: err.message });
    } finally {
        setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 xl:p-12 space-y-8 select-none">
      
      {/* Analytics & Configuration Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
                    <Megaphone className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-lg">
                    Super <span className="text-rose-500 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">Broadcasts</span>
                </h1>
            </div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs ps-16 opacity-70">
                Data Lake Monetization & Drip Campaigns
            </p>
        </div>

        <div className="flex items-center gap-4 bg-surface/30 p-2 rounded-2xl border border-glass-border">
            <div className="px-4 py-2 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Gateway Limit</span>
                <span className="text-sm font-black text-emerald-400">Unlimited (Super)</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="px-4 py-2 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Queue Health</span>
                <span className="text-sm font-black text-blue-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Optimal</span>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
        {/* LEFT COLUMN: Campaign Builder */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface/20 backdrop-blur-2xl border border-glass-border rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                {/* Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <Target className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-lg font-black uppercase tracking-widest">Campaign Matrix</h2>
                    </div>

                    {/* Meta */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ms-1">Campaign Identifier</label>
                        <input
                            type="text"
                            placeholder="e.g., Q2 Re-engagement Blast"
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                            className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder:text-muted-foreground/40"
                        />
                    </div>

                    {/* Segment Selection */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between ms-1 mb-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Target DaaS Segment</label>
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded border border-accent-primary/20">
                                {activeSegment?.count.toLocaleString() || 0} Vectors
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {AUDIENCE_SEGMENTS.map(seg => (
                                <OptionCard 
                                    key={seg.id}
                                    active={form.segmentId === seg.id}
                                    onClick={() => setForm({...form, segmentId: seg.id})}
                                    icon={Users}
                                    title={seg.name}
                                    subtitle={`Contains ${seg.count.toLocaleString()} entities`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sender Selection */}
                    <div className="space-y-4 pt-2">
                        <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ms-1 block mb-2">Platform Sender Link (WhatsApp)</label>
                        <div className="space-y-3">
                            {PLATFORM_SENDERS.map(snd => (
                                <OptionCard 
                                    key={snd.id}
                                    active={form.senderId === snd.id}
                                    onClick={() => setForm({...form, senderId: snd.id})}
                                    icon={Phone}
                                    title={snd.label}
                                    subtitle={`Status: ${snd.status.toUpperCase()}`}
                                    badge={snd.status === 'cooling' ? 'Rate Limited' : 'Active'}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Message Builder */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between ms-1 mb-3">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Payload Architecture</label>
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-glass-border">
                                <button
                                    onClick={() => setForm({...form, type: 'text'})}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${form.type === 'text' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <AlignLeft className="w-3 h-3" /> Text
                                </button>
                                <button
                                    onClick={() => setForm({...form, type: 'media'})}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${form.type === 'media' ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <ImageIcon className="w-3 h-3" /> Media
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {form.type === 'media' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mb-4"
                                >
                                    <div className="border-2 border-dashed border-glass-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-surface/20 hover:bg-surface/40 hover:border-accent-primary/50 transition-all cursor-pointer group">
                                        <div className="p-3 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-accent-primary transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold">Drag & Drop Media Element</p>
                                            <p className="text-xs text-muted-foreground mt-1 font-medium">JPEG, PNG, or MP4 (Max 16MB)</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <textarea
                                placeholder="Enter your high-conversion message protocol..."
                                rows={5}
                                value={form.content}
                                onChange={(e) => setForm({...form, content: e.target.value})}
                                className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all resize-none placeholder:text-muted-foreground/40"
                            />
                            <div className="absolute bottom-3 right-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                {form.content.length} chars
                            </div>
                        </div>

                        {/* Variables helper */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {['{first_name}', '{city}', '{interests}'].map(variable => (
                                <button key={variable} className="px-2 py-1 bg-surface border border-glass-border rounded text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-copy" title={`Insert ${variable}`}>
                                    {variable}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-6 border-t border-white/5">
                        <button
                            onClick={handleInitialize}
                            disabled={isInitializing}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all
                                ${isInitializing 
                                    ? 'bg-rose-500/50 text-white/50 cursor-not-allowed' 
                                    : 'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:shadow-[0_0_50px_rgba(244,63,94,0.4)]'
                                }
                            `}
                        >
                            {isInitializing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Initializing Drip Campaign...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" /> Execute Global Broadcast
                                </>
                            )}
                        </button>
                        <p className="text-center mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Automated drip mechanism applies to prevent WhatsApp ban triggers.
                        </p>
                    </div>

                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Analytics & Preview */}
        <div className="lg:col-span-5 space-y-6">
            
            {/* Live Preview Console */}
            <div className="bg-[#0b141a]/90 backdrop-blur-3xl border border-glass-border rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://i.imgur.com/3q1p4Gv.png')] opacity-5 mix-blend-overlay pointer-events-none" />
                
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/5 relative z-10">
                    <Eye className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-black uppercase tracking-widest">Terminal Preview</h2>
                </div>

                <div className="bg-[#111b21] rounded-2xl p-4 shadow-inner relative z-10 min-h-[150px] font-sans">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                            <span className="text-sm font-bold text-white uppercase">{form.senderId ? form.senderId.split('_')[1].substring(0,2) : 'SY'}</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-200">{PLATFORM_SENDERS.find(s => s.id === form.senderId)?.label || 'System Node'}</p>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Online</p>
                        </div>
                    </div>

                    <AnimatePresence>
                        {form.content ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                className="bg-[#202c33] max-w-[85%] rounded-2xl rounded-tl-none p-3 shadow-sm"
                            >
                                {form.type === 'media' && (
                                    <div className="w-full h-32 bg-black/40 rounded-xl mb-2 flex items-center justify-center border border-white/5">
                                        <ImageIcon className="w-8 h-8 text-slate-500" />
                                    </div>
                                )}
                                <p className="text-[15px] text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                                    {form.content}
                                </p>
                                <div className="text-end mt-1">
                                    <span className="text-[10px] text-slate-400 font-bold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-24 opacity-30 text-slate-400">
                                <AlignLeft className="w-6 h-6 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Payload...</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Campaign Analytics Monitor */}
            <div className="bg-surface/20 backdrop-blur-2xl border border-glass-border rounded-[2rem] p-6 shadow-2xl relative">
                <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-black uppercase tracking-widest">Telemetry Dashboard</h2>
                    </div>
                </div>

                <div className="space-y-6">
                    {HISTORICAL_CAMPAIGNS.map(camp => (
                        <div key={camp.id} className="p-4 rounded-xl bg-surface/50 border border-glass-border hover:border-white/10 transition-colors group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    {camp.status === 'active' 
                                        ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                                        : <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                                    }
                                    <span className="font-bold text-sm tracking-tight">{camp.name}</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border 
                                    ${camp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-surface text-muted-foreground border-glass-border'}
                                `}>
                                    {camp.status}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <ProgressBar 
                                    label="Vectors Dispatched" 
                                    value={camp.sent} 
                                    max={camp.sent} 
                                    colorClass={camp.status === 'active' ? 'bg-blue-500 line-pulse' : 'bg-blue-500/50'} 
                                />
                                <ProgressBar 
                                    label="Confirmed Delivery" 
                                    value={camp.delivered} 
                                    max={camp.sent} 
                                    colorClass={camp.status === 'active' ? 'bg-emerald-500 line-pulse' : 'bg-emerald-500/50'} 
                                />
                                <ProgressBar 
                                    label="Read Receipt (Open Rate)" 
                                    value={camp.read} 
                                    max={camp.delivered} 
                                    colorClass="bg-accent-primary" 
                                />
                                
                                {camp.failed > 0 && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest pt-2 border-t border-white/5">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>{camp.failed} Bounce Faults (Filtered Out)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                <button className="w-full mt-4 py-3 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border border-dashed border-glass-border rounded-xl bg-surface/30 hover:bg-surface flex items-center justify-center gap-2">
                    <History className="w-4 h-4" /> Load Archival Records
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}
