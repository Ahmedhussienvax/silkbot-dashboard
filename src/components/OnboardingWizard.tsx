"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { 
    Check, 
    Smartphone, 
    Bot, 
    Library, 
    ArrowRight, 
    Rocket, 
    Loader2, 
    Terminal, 
    ShieldAlert, 
    Cpu, 
    Globe, 
    Database,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingWizardProps {
    show: boolean;
    onComplete: () => void;
}

const TERMINAL_LOGS = [
    "Establishing neural link with global gateway...",
    "Synchronizing multi-tenant encryption keys...",
    "Injecting core-v2 memory persistence layers...",
    "Scanning instance metadata for anomalies...",
    "Initializing Evolution API bridge protocols...",
    "Neural weights loaded. System readiness: 98%."
];

export default function OnboardingWizard({ show, onComplete }: OnboardingWizardProps) {
    if (!show) return null;

    const t = useTranslations("Dashboard");
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isChecking, setIsChecking] = useState(false);
    const [logIndex, setLogIndex] = useState(0);

    useEffect(() => {
        if (isChecking) {
            const interval = setInterval(() => {
                setLogIndex(prev => (prev + 1) % TERMINAL_LOGS.length);
            }, 800);
            return () => clearInterval(interval);
        }
    }, [isChecking]);

    const STEPS = [
        { 
            id: 1, 
            title: "Signal Link", 
            icon: Smartphone, 
            desc: "Establish core hardware synchronization via Signal/WhatsApp proxy.", 
            path: "/dashboard/whatsapp", 
            color: "from-indigo-500 to-blue-600",
            tag: "PHYSICAL_LAYER"
        },
        { 
            id: 2, 
            title: "Neural Persona", 
            icon: Bot, 
            desc: "Define synthetic personality and cognitive response thresholds.", 
            path: "/dashboard/bot", 
            color: "from-purple-500 to-fuchsia-600",
            tag: "COGNITIVE_LAYER"
        },
        { 
            id: 3, 
            title: "Data Injection", 
            icon: Library, 
            desc: "Populate Knowledge Graph with enterprise vectors and domain logic.", 
            path: "/dashboard/knowledge", 
            color: "from-emerald-500 to-teal-600",
            tag: "INFO_LAYER"
        }
    ];

    const handleNext = async () => {
        setIsChecking(true);
        setTimeout(() => {
            if (step < 3) {
                setStep(step + 1);
            } else {
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }
            setIsChecking(false);
            setLogIndex(0);
        }, 3000); // 3 seconds of "fake" technical verification
    };

    const navigateToStep = (path: string) => {
        if (typeof onComplete === 'function') {
            onComplete();
        }
        router.push(path as any);
    };

    const currentStepData = STEPS[step - 1];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020617]/95 backdrop-blur-[40px] p-4 md:p-8 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 blur-[200px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 blur-[200px] animate-pulse" />

            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="bg-slate-900/40 border border-white/10 rounded-[3.5rem] w-full max-w-6xl overflow-hidden shadow-[0_100px_200px_rgba(0,0,0,0.8)] flex flex-col xl:flex-row min-h-[750px] backdrop-blur-3xl relative"
            >
                {/* Left Sidebar Strategy Panel */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black p-12 xl:w-1/3 flex flex-col justify-between border-r border-white/5 relative">
                    <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                    
                    <div className="relative space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Rocket className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tighter leading-none italic uppercase">
                                    SilkBot<span className="text-purple-500">.</span>
                                </h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Initialization_Wizard</p>
                            </div>
                        </div>

                        <nav className="space-y-12 mt-16">
                            {STEPS.map((s) => (
                                <div key={s.id} className="relative group">
                                    <div className="flex items-center gap-6 relative z-10 transition-all duration-700">
                                        <div className={cn(
                                            "w-12 h-12 rounded-[1.2rem] flex items-center justify-center font-black text-sm transition-all duration-500 border",
                                            step === s.id ? "bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)] scale-110" :
                                            step > s.id ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                                            "bg-white/5 border-white/10 text-white/40"
                                        )}>
                                            {step > s.id ? <Check className="w-6 h-6 stroke-[3px]" /> : `0${s.id}`}
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-slate-600 font-black text-[9px] uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">Phase_Module</span>
                                            <p className={cn(
                                                "font-black text-sm uppercase tracking-tighter transition-all duration-500",
                                                step === s.id ? "text-white scale-105 origin-left" : "text-slate-600"
                                            )}>{s.title}</p>
                                        </div>
                                    </div>
                                    {/* Connection Line */}
                                    {s.id < 3 && (
                                        <div className={cn(
                                            "absolute left-[23px] top-12 w-px h-12 transition-colors duration-1000",
                                            step > s.id ? "bg-emerald-500/50" : "bg-white/5"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="relative p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Protocol_Standard</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                            All neural clusters deployed are fully encrypted and tenant-isolated by default.
                        </p>
                    </div>
                </div>

                {/* Right Content Viewport */}
                <div className="p-8 md:p-16 xl:w-2/3 flex flex-col bg-slate-950/20 relative">
                    <AnimatePresence mode="wait">
                        {isChecking ? (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
                            >
                                <div className="relative">
                                    <div className="w-48 h-48 border-[6px] border-purple-500/10 border-t-purple-500 rounded-full animate-spin shadow-[0_0_100px_rgba(168,85,247,0.1)]" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Cpu className="w-16 h-16 text-white animate-pulse" />
                                    </div>
                                </div>
                                
                                <div className="space-y-6 max-w-md w-full">
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Initializing_Synapse</h3>
                                    <div className="bg-black/60 border border-white/5 rounded-2xl p-6 font-mono text-[10px] text-left space-y-2 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-2 opacity-20"><Activity className="w-4 h-4 text-emerald-500" /></div>
                                        {TERMINAL_LOGS.slice(0, logIndex + 1).map((log, i) => (
                                            <div key={i} className="flex gap-3">
                                                <span className="text-slate-700">[{format(new Date(), "HH:mm:ss")}]</span>
                                                <span className="text-purple-400">SYS_LOG:</span>
                                                <span className="text-slate-300">{log}</span>
                                            </div>
                                        ))}
                                        <div className="w-1.5 h-3 bg-emerald-500 animate-pulse inline-block ml-1" />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key={`step-${step}`}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
                            >
                                <div className="relative group">
                                    <div className={cn(
                                        "absolute -inset-12 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br",
                                        currentStepData.color
                                    )} />
                                    <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-700 hover:rotate-6 hover:scale-110">
                                        <currentStepData.icon className="w-16 h-16 text-white opacity-80" />
                                    </div>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-900 border border-white/10 rounded-full shadow-lg">
                                        <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase">{currentStepData.tag}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-6 max-w-xl px-4">
                                    <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-tight">
                                        {currentStepData.title}
                                    </h3>
                                    <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                        {currentStepData.desc} This module is critical for <strong>autonomous orchestration</strong> and multi-agent synergy.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
                                    <button 
                                        onClick={() => navigateToStep(currentStepData.path)}
                                        className="flex-1 px-8 py-5 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.03] active:scale-95"
                                    >
                                        Configure_Node
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer Controls */}
                    <div className="flex justify-between items-center mt-auto pt-10 border-t border-white/5">
                        <button 
                            onClick={() => typeof onComplete === 'function' && onComplete()} 
                            className="text-slate-700 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-0"
                            disabled={isChecking}
                        >
                            Terminate_Wizard
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end mr-6">
                                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Global_Status</span>
                                <span className="text-xs text-emerald-500 font-black">STABLE</span>
                            </div>
                            <button 
                                onClick={handleNext} 
                                disabled={isChecking}
                                className="group bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-purple-500/20 flex items-center gap-4 disabled:opacity-20"
                            >
                                {step === 3 ? "Complete_Core" : "Bypass_Validation"}
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function ChevronRight(props: any) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}