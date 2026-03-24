"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ChevronLeft, Scale, Shield, FileText, Lock } from "lucide-react";
import Footer from "@/components/organisms/Footer";

export default function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
    const t = useTranslations("Common");
    const l = useTranslations("Footer");

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="w-full max-w-4xl px-8 py-20 mx-auto flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Back to Reality</span>
                </Link>

                <div className="space-y-16">
                    <header className="space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-8 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
                            <Scale className="w-8 h-8" />
                        </div>
                        <h1 className="text-6xl font-black text-foreground italic tracking-tighter uppercase leading-none">
                            System <span className="text-accent-primary">Protocols</span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-bold uppercase tracking-widest italic opacity-60">
                            Legal Governance & Neural Compliance
                        </p>
                    </header>

                    <div className="grid grid-cols-1 gap-12 text-muted-foreground">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight">1. Operational Mandate</h2>
                            <p className="leading-relaxed font-medium">
                                By accessing the SilkBot Neural Hub, you agree to abide by the standard operational protocols. Our system is designed for high-integrity automation and ethical AI interaction.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight">2. Data Sovereignty</h2>
                            <p className="leading-relaxed font-medium">
                                All metadata processed through our neural gateway remains under your absolute control. We utilize RLS-secured views to ensure zero architectural leakage between tenants.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight">3. Forbidden Architectures</h2>
                            <p className="leading-relaxed font-medium">
                                Any attempt to reverse-engineer the reasoning trace or bypass the gatekeeper protocols will result in immediate neural link termination.
                            </p>
                        </section>
                    </div>

                    <div className="pt-20 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, label: "Secure Link", desc: "AES-256 Neural Encryption" },
                            { icon: FileText, label: "Transparent", desc: "Real-time Audit Logs" },
                            { icon: Lock, label: "Isolated", desc: "PostgreSQL Row Isolation" }
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-surface border border-border rounded-3xl group hover:border-accent-primary/30 transition-all">
                                <item.icon className="w-6 h-6 text-accent-primary mb-4 transition-transform group-hover:scale-110" />
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
