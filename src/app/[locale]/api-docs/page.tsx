"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { ChevronLeft, Zap, Target, Shield, Cpu, Code, Database, Globe } from "lucide-react";
import Footer from "@/components/organisms/Footer";

export default function APIDocsPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="w-full max-w-6xl px-8 py-20 mx-auto flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Origin</span>
                </Link>

                <div className="space-y-16">
                    <header className="space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-8">
                            <Code className="w-8 h-8" />
                        </div>
                        <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
                            Neural <span className="text-accent-primary">Gatekeeper</span> API
                        </h1>
                        <p className="text-slate-500 text-lg font-bold uppercase tracking-widest italic opacity-60">
                            Secure Integration Protocols v5.7.0
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                        <div className="md:col-span-2 space-y-12">
                            <section className="p-10 glass-card border border-white/5 space-y-6">
                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">1. Vector Authorization</h2>
                                <p className="text-slate-400 font-bold italic leading-relaxed">
                                    All requests to the SilkBot Hub must be signed with a Neural JWT bearer token. This ensures end-to-end trace isolation for your AI agent.
                                </p>
                                <div className="p-8 bg-black/50 rounded-3xl border border-white/5 font-mono text-xs text-accent-primary">
                                    curl -H "Authorization: Bearer <YOUR_NEURAL_JWT>" \<br />
                                    &nbsp;&nbsp;&nbsp;&nbsp;https://api.silkbot.ai/v1/orchestrator/reason
                                </div>
                            </section>

                            <section className="p-10 glass-card border border-white/5 space-y-6">
                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">2. Message Ingress</h2>
                                <p className="text-slate-400 font-bold italic leading-relaxed">
                                    Trigger the AI reasoning loop manually or subscribe to real-time events via the Neural Webhook gateway.
                                </p>
                                <div className="p-8 bg-black/50 rounded-3xl border border-white/5 font-mono text-xs text-emerald-500">
                                    POST /v1/gateway/whatsapp/send<br />
                                    &#123;<br />
                                    &nbsp;&nbsp;"recipient": "97150XXXXXXX",<br />
                                    &nbsp;&nbsp;"content": "Protocol initiated.",<br />
                                    &nbsp;&nbsp;"orchestrate": true<br />
                                    &#125;
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <div className="p-10 glass-card border border-white/5 space-y-6 bg-accent-primary/[0.03]">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Quick References</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: Globe, label: "REST Endpoints", desc: "Standard HTTPS JSON API" },
                                        { icon: Zap, label: "Neural Hooks", desc: "Real-time AI Triggers" },
                                        { icon: Shield, label: "Secure Views", desc: "Supabase PG Integration" }
                                    ].map((ref, k) => (
                                        <div key={k} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent-primary/30 transition-all cursor-pointer">
                                            <ref.icon className="w-5 h-5 text-accent-primary" />
                                            <div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-widest">{ref.label}</div>
                                                <div className="text-[9px] font-black text-slate-500 uppercase">{ref.desc}</div>
                                            </div>
                                        </div>
                                    ))}
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
