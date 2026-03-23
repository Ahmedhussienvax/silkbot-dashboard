"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { ChevronLeft, Zap, Target, Shield, Check } from "lucide-react";
import Footer from "@/components/organisms/Footer";
import { createClient } from "@/lib/supabase-browser";
import { useEffect, useState } from "react";

export default function PricingPage() {
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, []);

    const targetHref = user ? "/dashboard" : "/register";
    const buttonText = user ? "Activate Upgrade" : "Initialize Node";

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="w-full max-w-6xl px-8 py-20 mx-auto flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Origin</span>
                </Link>

                <div className="space-y-16">
                    <header className="space-y-4 text-center">
                        <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Operational <span className="text-accent-primary">Plans</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-bold uppercase tracking-widest italic opacity-60">
                            Neural Capacity & Automation Limits
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                        {[
                            { icon: Target, name: "Node", price: "$49", desc: "Core Automation Hub", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", features: ["1,000 Messages/mo", "Basic Agent", "1 Neural Ingress"] },
                            { icon: Zap, name: "Hub", price: "$149", desc: "Scale Your Intelligence", color: "text-accent-primary", bg: "bg-accent-primary/10", border: "border-accent-primary/20", features: ["10,000 Messages/mo", "Advanced Reasoning", "3 Neural Ingresses", "Custom Prompting"], popular: true },
                            { icon: Shield, name: "Matrix", price: "Custom", desc: "Enterprise Infrastructure", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", features: ["Unlimited Throughput", "Dedicated Instance", "SLA & Hardware Vault", "Direct API Support"] }
                        ].map((plan, i) => (
                            <div key={i} className={`p-10 glass-card border ${plan.border} relative group ${plan.popular ? 'scale-110 z-10 shadow-[0_0_80px_rgba(168,85,247,0.1)]' : ''}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-primary text-white text-[8px] font-black uppercase rounded-full tracking-[0.3em]">Dominant Flow</div>
                                )}
                                <div className={`w-14 h-14 rounded-2xl ${plan.bg} ${plan.color} flex items-center justify-center mb-8`}>
                                    <plan.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{plan.name}</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 mb-6">{plan.desc}</p>
                                <div className="text-5xl font-black text-white tracking-tighter mb-8">{plan.price}<span className="text-sm font-bold text-slate-600">/mo</span></div>
                                
                                <div className="space-y-4 mb-10">
                                    {plan.features.map((f, j) => (
                                        <div key={j} className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                            <Check className={`w-4 h-4 ${plan.color}`} />
                                            {f}
                                        </div>
                                    ))}
                                </div>

                                <Link 
                                    href={targetHref as any}
                                    className={`block w-full text-center py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${plan.popular ? 'bg-accent-primary text-white hover:scale-105 shadow-lg' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'}`}
                                >
                                    {buttonText}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
