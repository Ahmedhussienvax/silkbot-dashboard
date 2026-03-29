import React from 'react';

// 🚀 SilkBot Minimalist Loading State
// This page appears automatically during data fetching or page transitions.
export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#030410] z-[9999]">
      <div className="flex flex-col items-center gap-6">
        {/* Logo Icon with Elegant Pulse */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse ring-1 ring-white/10">
            <span className="text-white font-bold text-3xl italic tracking-tighter select-none">S</span>
          </div>
          {/* Subtle Outer Glow */}
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full -z-10 animate-pulse" />
        </div>
        
        {/* Minimalist Loading Text */}
        <span className="text-indigo-400/40 text-[10px] font-mono tracking-[0.3em] uppercase animate-pulse select-none">
          Loading Systems...
        </span>
      </div>
    </div>
  );
}
