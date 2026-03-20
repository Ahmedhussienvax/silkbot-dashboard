"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "@/i18n/routing";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Clear loading if component unmounts or after a long timeout
    useEffect(() => {
        return () => setLoading(false);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError("");
        
        try {
            const supabase = createClient();
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message === "Invalid login credentials" ? "خطأ في البريد الإلكتروني أو كلمة المرور" : authError.message);
                setLoading(false);
            } else if (data?.user) {
                // Successful login
                router.push("/dashboard");
                // We don't set loading to false here to keep the button in state until navigation happens
            } else {
                setError("حدث خطأ غير متوقع");
                setLoading(false);
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError("تعذر الاتصال بالسيرفر، تأكد من إعدادات Supabase");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden" dir="rtl">
            {/* Animated gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2 flex-row-reverse">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30">
                            S
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                            SilkBot
                        </h1>
                    </div>
                    <p className="text-slate-400 text-sm">منصة الذكاء الاصطناعي للواتساب</p>
                </div>

                {/* Login Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold text-white mb-2 text-right">تسجيل الدخول 👋</h2>
                    <p className="text-slate-400 text-sm mb-6 text-right">
                        أدخل بياناتك للوصول إلى لوحة التحكم
                    </p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="text-right">
                            <label className="block text-sm text-slate-300 mb-2">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                dir="ltr"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-left"
                            />
                        </div>
                        <div className="text-right">
                            <label className="block text-sm text-slate-300 mb-2">كلمة المرور</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                dir="ltr"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-left"
                            />
                        </div>
                        {error && (
                            <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3 text-right border border-red-500/20">
                                ⚠️ {error}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold hover:from-purple-500 hover:to-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 mt-6"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    جاري التحقق...
                                </span>
                            ) : (
                                "دخول الآن 🚀"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-600 text-xs mt-6" dir="ltr">
                    SilkBot &copy; 2026. Powered by Supabase + Next.js
                </p>
            </div>
        </div>
    );
}
