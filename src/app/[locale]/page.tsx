import { Link } from "@/i18n/routing";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Animated floating orbs for depth */}
            <div className="absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-cyan-600/15 rounded-full blur-[120px] animate-pulse delay-1000" />

            <div className="relative z-10 text-center px-4 max-w-4xl">
                <div className="inline-flex items-center gap-6 mb-12 animate-float">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-purple-500/40 border border-white/10">
                        S
                    </div>
                    <h1 className="text-7xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-cyan-100 bg-clip-text text-transparent">
                        SilkBot
                    </h1>
                </div>

                <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                    The next-generation <span className="text-purple-400 font-bold">WhatsApp AI</span> platform. 
                    Built for speed, automation, and premium customer experiences.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href="/login"
                        className="premium-button cursor-pointer text-lg flex items-center gap-2 group"
                    >
                        Access Dashboard 
                        <span className="group-hover:translate-x-1 transition-transform">✨</span>
                    </Link>
                    
                    <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all backdrop-blur-md">
                        View Demo 🎥
                    </button>
                </div>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left opacity-80">
                    {[
                        { title: "Smart Routing", desc: "Automate leads with precision." },
                        { title: "Real-time Sync", desc: "Instant messages, no delay." },
                        { title: "Enterprise Grade", desc: "Built for high availability." }
                    ].map((feature, i) => (
                        <div key={i} className="glass-card !rounded-2xl p-6 border-white/5 bg-white/[0.02]">
                            <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                            <p className="text-slate-400 text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
