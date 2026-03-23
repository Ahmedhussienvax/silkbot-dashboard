"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { ChevronLeft, Zap, Shield, Code, Globe } from "lucide-react";
import Footer from "@/components/organisms/Footer";
import { useTranslations } from "next-intl";

export default function APIDocsPage() {
    const t = useTranslations("Dashboard");

    return (
        <main className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] bg-accent-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-accent-secondary/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-6xl px-8 py-20 mx-auto flex-1 relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 text-text-dim hover:text-foreground transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">{t("return_to_origin")}</span>
                </Link>

                <div className="space-y-16">
                    <header className="space-y-4">
                        <div className="w-20 h-20 rounded-[2rem] bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-8 shadow-2xl">
                            <Code className="w-10 h-10" />
                        </div>
                        <h1 className="text-7xl font-black text-foreground italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                            Neural <span className="text-accent-primary">Gatekeeper</span> API
                        </h1>
                        <p className="text-text-dim text-lg font-bold uppercase tracking-widest italic opacity-60">
                            Secure Integration Protocols v5.7.1
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12">
                        <div className="lg:col-span-2 space-y-12">
                            <section className="p-12 bento-item glass-card border border-glass-border space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Shield className="w-24 h-24" />
                                </div>
                                <h2 className="text-4xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                                    1. Vector Authorization
                                </h2>
                                <p className="text-text-dim font-bold italic leading-relaxed text-lg opacity-80">
                                    All requests to the SilkBot Hub must be signed with a Neural JWT bearer token. This ensures end-to-end trace isolation for your AI agent.
                                </p>
                                <div className="p-10 bg-black/40 dark:bg-black/60 rounded-[2.5rem] border border-glass-border font-mono text-sm text-accent-primary shadow-inner relative group/code overflow-x-auto">
                                    <div className="flex items-center gap-2 mb-4 opacity-40">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                    <code>
                                        curl -H "Authorization: Bearer &lt;YOUR_NEURAL_JWT&gt;" \<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;https://api.silkbot.ai/v1/orchestrator/reason
                                    </code>
                                    <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-transparent opacity-0 group-hover/code:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            </section>

                            <section className="p-12 bento-item glass-card border border-glass-border space-y-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Zap className="w-24 h-24 text-accent-secondary" />
                                </div>
                                <h2 className="text-4xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                                    2. Message Ingress
                                </h2>
                                <p className="text-text-dim font-bold italic leading-relaxed text-lg opacity-80">
                                    Trigger the AI reasoning loop manually or subscribe to real-time events via the Neural Webhook gateway.
                                </p>
                                <div className="p-10 bg-black/40 dark:bg-black/60 rounded-[2.5rem] border border-glass-border font-mono text-sm text-emerald-500 shadow-inner relative group/code overflow-x-auto">
                                    <div className="flex items-center gap-2 mb-4 opacity-40">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                    </div>
                                    <code>
                                        POST /v1/gateway/whatsapp/send<br />
                                        &#123;<br />
                                        &nbsp;&nbsp;"recipient": "97150XXXXXXX",<br />
                                        &nbsp;&nbsp;"content": "Protocol initiated.",<br />
                                        &nbsp;&nbsp;"orchestrate": true<br />
                                        &#125;
                                    </code>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover/code:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <div className="p-10 glass-card border border-glass-border space-y-8 bg-accent-primary/[0.02] sticky top-8 animate-in slide-in-from-right duration-700">
                                <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Documentation Core</h3>
                                <div className="space-y-6">
                                    {[
                                        { icon: Globe, label: "REST Endpoints", desc: "Standard HTTPS JSON API", color: "text-accent-primary" },
                                        { icon: Zap, label: "Neural Hooks", desc: "Real-time AI Triggers", color: "text-accent-secondary" },
                                        { icon: Shield, label: "Secure Views", desc: "Supabase PG Integration", color: "text-emerald-500" }
                                    ].map((ref, k) => (
                                        <div key={k} className="flex items-center gap-5 p-6 rounded-3xl bg-foreground/[0.02] border border-glass-border hover:border-accent-primary/30 hover:bg-foreground/[0.04] transition-all cursor-pointer group/nav">
                                            <div className={`p-3 rounded-2xl bg-foreground/[0.03] border border-glass-border group-hover/nav:scale-110 transition-transform ${ref.color}`}>
                                                <ref.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-foreground uppercase tracking-widest">{ref.label}</div>
                                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-tight italic opacity-60 leading-tight">{ref.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-6 border-t border-glass-border">
                                    <div className="p-6 rounded-[2rem] bg-accent-secondary/5 border border-accent-secondary/10 flex flex-col gap-2">
                                        <span className="text-[10px] font-black text-accent-secondary uppercase tracking-[0.2em] italic">System Health</span>
                                        <div className="h-1.5 w-full bg-accent-secondary/20 rounded-full overflow-hidden">
                                            <div className="h-full w-[94%] bg-accent-secondary animate-pulse" />
                                        </div>
                                        <span className="text-[9px] font-bold text-accent-secondary uppercase opacity-60 italic text-right">94% Efficiency</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
