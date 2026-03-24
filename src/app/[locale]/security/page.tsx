"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ChevronLeft, ShieldCheck, Lock, Fingerprint, Eye } from "lucide-react";
import Footer from "@/components/organisms/Footer";

export default function SecurityPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="w-full max-w-4xl px-8 py-20 mx-auto flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Back to Reality</span>
                </Link>

                <div className="space-y-16">
                    <header className="space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h1 className="text-6xl font-black text-foreground italic tracking-tighter uppercase leading-none">
                            Neural <span className="text-emerald-500">Security</span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-bold uppercase tracking-widest italic opacity-60">
                            AES-256 Encryption & Zero-Leakage Architecture
                        </p>
                    </header>

                    <div className="grid grid-cols-1 gap-12 text-muted-foreground">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight">1. Infrastructure Hardening</h2>
                            <p className="leading-relaxed font-medium">
                                SilkBot utilizes a high-availability Kubernetes cluster with isolated namespaces for every tenant. Our database is hosted on Supabase with strict Row Level Security (RLS) policies.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight">2. Encryption Protocol</h2>
                            <p className="leading-relaxed font-medium">
                                All message payloads are encrypted at rest using AES-256 and transmitted via TLS 1.3. Your WhatsApp session tokens are stored in a hardware-encrypted vault.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight">3. Threat Response</h2>
                            <p className="leading-relaxed font-medium">
                                Our automated sentinel system monitors neural traffic 24/7. Any suspicious activity triggers an immediate lockdown of the affected node identifiers.
                            </p>
                        </section>
                    </div>

                    <div className="pt-20 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Lock, label: "Vaulted", desc: "Token Encryption" },
                            { icon: Fingerprint, label: "Biometric", desc: "Identity Access" },
                            { icon: Eye, label: "Audit", desc: "Full Traceability" }
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-surface border border-border rounded-3xl group hover:border-emerald-500/30 transition-all">
                                <item.icon className="w-6 h-6 text-emerald-500 mb-4 transition-transform group-hover:scale-110" />
                                <div className="text-[10px] font-black text-foreground uppercase tracking-widest mb-1">{item.label}</div>
                                <div className="text-xs text-muted-foreground font-bold">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
