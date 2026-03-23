"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { Cookie, ChevronLeft, Info, Settings, Trash } from "lucide-react";
import Footer from "@/components/organisms/Footer";

export default function CookiesPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="w-full max-w-4xl px-8 py-20 mx-auto flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Back to Reality</span>
                </Link>

                <div className="space-y-16">
                    <header className="space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-8 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                            <Cookie className="w-8 h-8" />
                        </div>
                        <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Cookie <span className="text-amber-500">Manifest</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-bold uppercase tracking-widest italic opacity-60">
                            Session Management & Interface Persistence
                        </p>
                    </header>

                    <div className="grid grid-cols-1 gap-12 text-slate-400">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">1. Why We Use Cookies</h2>
                            <p className="leading-relaxed font-medium">
                                We utilize micro-storage to preserve your neural theme preferences, language selection, and secure session identifiers. This ensures a seamless transition across the hub.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">2. Necessary Cookies</h2>
                            <p className="leading-relaxed font-medium">
                                Essential identifiers for authentication and security. These cannot be disabled as they are required for the SilkBot gateway to maintain a stable link to your WhatsApp node.
                            </p>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">3. User Control</h2>
                            <p className="leading-relaxed font-medium">
                                You can manage or delete cookies via your browser settings at any time. Note that doing so may result in the loss of session persistence.
                            </p>
                        </section>
                    </div>

                    <div className="pt-20 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Info, label: "Transparency", desc: "No Third-Party Tracking" },
                            { icon: Settings, label: "Configurable", desc: "User Preference Storage" },
                            { icon: Trash, label: "Removable", desc: "Session Termination" }
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-amber-500/30 transition-all">
                                <item.icon className="w-6 h-6 text-amber-500 mb-4 transition-transform group-hover:scale-110" />
                                <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{item.label}</div>
                                <div className="text-xs text-slate-500 font-bold">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
