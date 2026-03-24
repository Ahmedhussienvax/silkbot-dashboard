"use client";
import React from "react";
import { Link } from "@/i18n/routing";
import { ChevronLeft, GraduationCap, Briefcase, Users, Target } from "lucide-react";
import Footer from "@/components/organisms/Footer";

export default function CareersPage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="w-full max-w-4xl px-8 py-20 mx-auto flex-1">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-12 group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Return to Node</span>
                </Link>

                <div className="space-y-16">
                    <header className="space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-8">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h1 className="text-6xl font-black text-foreground italic tracking-tighter uppercase leading-none">
                            Join the <span className="text-blue-500">Collective</span>
                        </h1>
                        <p className="text-muted-foreground text-lg font-bold uppercase tracking-widest italic opacity-60">
                            Build the future of Intelligent Automation
                        </p>
                    </header>

                    <div className="grid grid-cols-1 gap-12 text-muted-foreground">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tight">Open Vectors</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { title: "AI Engineer", type: "R&D", location: "Global / Remote" },
                                    { title: "Protocol Architect", type: "Security", location: "Hybrid" },
                                    { title: "UX Sentinel", type: "Design", location: "Global" }
                                ].map((job, i) => (
                                    <div key={i} className="p-8 glass-card border border-border hover:border-blue-500/30 transition-all flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-black text-foreground italic uppercase">{job.title}</h3>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{job.type} // {job.location}</p>
                                        </div>
                                        <button className="px-6 py-2 bg-surface border border-border rounded-xl text-[10px] font-black uppercase hover:bg-blue-500 hover:text-foreground transition-all">Apply Link</button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
