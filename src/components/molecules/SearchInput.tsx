"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export default function SearchInput({ placeholder }: { placeholder: string }) {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState(searchParams.get("q")?.toString() || "");

    useEffect(() => {
        // Initial sync if URL changes externally
        setQuery(searchParams.get("q")?.toString() || "");
    }, [searchParams]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            const currentQ = params.get("q") || "";
            
            if (query === currentQ) return;

            if (query) {
                params.set("q", query);
            } else {
                params.delete("q");
            }

            startTransition(() => {
                replace(`${pathname}?${params.toString()}`);
            });
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query, pathname, replace, searchParams]);

    return (
        <div className="relative w-full max-w-md group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {isPending ? (
                    <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
                ) : (
                    <Search className="w-4 h-4 text-slate-500 group-focus-within:text-accent-primary transition-colors" />
                )}
            </div>
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-zinc-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-primary/30 transition-all shadow-sm focus:shadow-md"
            />
        </div>
    );
}
