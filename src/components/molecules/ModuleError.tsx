"use client";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

/**
 * Reusable error UI for Next.js error.tsx files.
 * Follows SilkBot design system with module-specific context.
 */
export default function ModuleError({
  error,
  reset,
  moduleName = "Module",
  moduleIcon,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  moduleName?: string;
  moduleIcon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 animate-in fade-in duration-500">
      <div className="max-w-lg w-full space-y-8 text-center">
        {/* Error Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-red-500/10 rounded-full blur-2xl" />
          <div className="relative w-24 h-24 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Error Info */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
            {moduleIcon}
            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">
              {moduleName}_Fault
            </span>
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight italic">
            System Interrupt<span className="text-red-500">.</span>
          </h2>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-md mx-auto">
            The <strong>{moduleName}</strong> module encountered an error and has been safely isolated.
            Your other dashboard modules remain fully operational.
          </p>
        </div>

        {/* Error Detail (collapsible) */}
        <details className="text-left bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
          <summary className="flex items-center gap-2 cursor-pointer text-[10px] font-black text-red-400 uppercase tracking-widest">
            <Bug className="w-3.5 h-3.5" />
            Error_Trace
          </summary>
          <pre className="mt-4 text-[11px] text-dim-foreground font-mono whitespace-pre-wrap break-words leading-relaxed overflow-hidden max-h-32">
            {error.message}
          </pre>
        </details>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-accent-primary hover:text-foreground transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Module
          </button>
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-8 py-4 bg-surface border border-glass-border font-black text-[10px] text-muted-foreground uppercase tracking-[0.3em] rounded-2xl hover:bg-surface-hover hover:text-foreground transition-all"
          >
            <Home className="w-4 h-4" />
            Return Home
          </a>
        </div>

        <p className="text-[9px] text-dim-foreground font-bold italic opacity-50">
          SilkBot_Module_Isolation_Protocol // v5.7.1
        </p>
      </div>
    </div>
  );
}
