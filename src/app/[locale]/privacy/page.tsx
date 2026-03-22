"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronLeft, ShieldCheck, Lock, EyeOff } from "lucide-react";
import Footer from "@/components/organisms/Footer";

export default function PrivacyPage() {
    const t = useTranslations("Common");

    return (
        <main className="min-h-screen bg-slate-950 flex flex-col items-center selection:bg-accent-primary/30">
            <div className="w-full max-w-4xl px-8 py-20 flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic font-bold uppercase tracking-widest italic transition-colors">Back to Reality</span>
                </Link>

                <div className="space-y-16">
                    <header>
                        <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase mb-6">
                            NEURAL<span className="text-accent-primary">_PRIVACY</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed italic">
                            Your data integrity is the foundational layer of our neural architecture.
                        </p>
                    </header>

                    <div className="space-y-10">
                        {[
                            { title: "Encryption First", icon: Lock, content: "All neural vectors are encrypted at rest and in transit using military-grade SHA-512 standards." },
                            { title: "Zero Knowledge", icon: EyeOff, content: "We do not 'see' your messages. Our AI agents process tokens in ephemeral memory buffers that vanish after execution." },
                            { title: "Compliance", icon: ShieldCheck, content: "SilkBot is designed with GDPR and CCPA structural principles at its core." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-8 group">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-accent-primary/50 transition-all shrink-0">
                                    <item.icon className="w-6 h-6 text-accent-primary" />
                                </div>
                                <div className="space-y-2 pt-2">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{item.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-bold uppercase tracking-widest italic">{item.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
