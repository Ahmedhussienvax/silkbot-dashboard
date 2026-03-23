"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { ChevronLeft, Rss, Clock, Calendar, Brain } from "lucide-react";
import Footer from "@/components/organisms/Footer";

export default function BlogPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="w-full max-w-6xl px-8 py-20 mx-auto flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Origin</span>
                </Link>

                <div className="space-y-16">
                    <header className="space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500 mb-8">
                            <Rss className="w-8 h-8" />
                        </div>
                        <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Neural <span className="text-pink-500">Transmissions</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-bold uppercase tracking-widest italic opacity-60">
                            Updates, Insights & Future Architectures
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
                        {[
                            { title: "Evolution of Neural Hub", date: "Mar 22, 2026", min: "5m", desc: "Understanding the move to v5.7.0 and autonomous agents." },
                            { title: "Zero-Leakage RLS Policies", date: "Mar 18, 2026", min: "8m", desc: "How we secured tenant-level PostgreSQL isolation." },
                            { title: "WhatsApp Gateway 2.0", date: "Mar 12, 2026", min: "12m", desc: "Deep dive into our high-throughput secure node-gateway link." }
                        ].map((post, i) => (
                            <div key={i} className="p-8 glass-card border border-white/5 hover:border-pink-500/30 transition-all flex flex-col justify-between group cursor-pointer">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                        <Calendar className="w-3 h-3" /> {post.date} // <Clock className="w-3 h-3" /> {post.min}
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover:text-pink-500 transition-colors leading-tight">{post.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 opacity-80">{post.desc}</p>
                                </div>
                                <button className="mt-8 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-pink-500 hover:text-white transition-all w-fit">Read Log</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
