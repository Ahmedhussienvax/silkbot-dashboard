"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Database, Sparkles, Download, FilterX, 
  Users, ChevronDown, CheckCircle2, AlertCircle, RefreshCw, BarChart3, Target,
  Activity, Star
} from "lucide-react";

// --- Types ---
interface GlobalAudienceData {
  phone_number: string;
  first_name: string;
  location_city: string;
  purchasing_power: 'low' | 'medium' | 'high' | 'VIP';
  interests: string[];
  source_tenants: string[];
  last_seen: string;
}

interface AudienceApiResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: GlobalAudienceData[];
}

interface Filters {
  search: string;
  city: string;
  min_purchasing_power: string;
  interests: string;
}

// --- Hooks ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Components ---
const CustomDropdown = ({ 
  label, 
  icon: Icon, 
  options, 
  value, 
  onChange,
  onClear
}: { 
  label: string, 
  icon: any, 
  options: {value: string, label: string}[], 
  value: string, 
  onChange: (v: string) => void,
  onClear?: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 min-w-[180px]
          ${value 
            ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
            : 'bg-surface/50 border-glass-border/50 text-muted-foreground hover:bg-surface/80 hover:border-glass-border'}
        `}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 opacity-70" />
          <span className="text-sm font-medium tracking-wide truncate max-w-[100px]">{selectedLabel}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full mt-2 w-full min-w-[200px] bg-[#0A0A0B]/95 backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl p-2 hide-scrollbar max-h-64 overflow-y-auto"
          >
            {onClear && value && (
              <button 
                onClick={() => { onClear(); setIsOpen(false); }}
                className="w-full text-start px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg mb-1 flex items-center gap-2 transition-colors uppercase tracking-widest"
              >
                <FilterX className="w-3 h-3" /> Clear Selection
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-start px-3 py-2.5 text-sm font-medium rounded-lg flex items-center justify-between transition-colors
                  ${value === opt.value 
                    ? 'bg-accent-primary/20 text-accent-primary' 
                    : 'text-foreground hover:bg-white/5'}`}
              >
                {opt.label}
                {value === opt.value && <CheckCircle2 className="w-4 h-4 text-accent-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function GlobalAudiencesPage() {
  const [data, setData] = useState<GlobalAudienceData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    city: '',
    min_purchasing_power: '',
    interests: '',
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  // Computed Metrics (In real scenario, the API might return these in a separate endpoint, 
  // but we compute based on current data for demonstration if not total)
  const computeMetrics = () => {
    const vipCount = data.filter(d => d.purchasing_power === 'VIP').length;
    
    // Calculate top region locally just for the current page visualization, 
    // or display a global stat if backend provided.
    const cityCounts: Record<string, number> = {};
    data.forEach(d => {
      cityCounts[d.location_city] = (cityCounts[d.location_city] || 0) + 1;
    });
    const topCity = Object.keys(cityCounts).sort((a,b) => cityCounts[b] - cityCounts[a])[0] || "N/A";

    return { vipCount, topCity };
  };

  const { vipCount, topCity } = computeMetrics();
  const hasActiveFilters = filters.search || filters.city || filters.min_purchasing_power || filters.interests;

  // Fetch logic
  const fetchData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);
    setIsError(false);

    try {
      const gUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3000";
      const apiKey = process.env.NEXT_PUBLIC_GATEWAY_API_KEY || "fallback_key";

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.city && { city: filters.city }),
        ...(filters.min_purchasing_power && { min_purchasing_power: filters.min_purchasing_power }),
        ...(filters.interests && { interests: filters.interests }),
      });

      const res = await fetch(`${gUrl}/api/super/audiences?${queryParams.toString()}`, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error("Validation Failed");
      
      const json: AudienceApiResponse = await res.json();
      
      if (json.success) {
        setData(json.data || []);
        setTotal(json.total || 0);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, filters.city, filters.min_purchasing_power, filters.interests]);

  // Actions
  const handleClearFilters = () => {
    setFilters({ search: '', city: '', min_purchasing_power: '', interests: '' });
    setPage(1);
  };

  const handleExportCSV = () => {
    if (!data.length) return;
    
    const headers = ["Phone Number,First Name,City,Purchasing Power,Interests,Found In Tenants,Last Active"];
    const rows = data.map(row => 
      `${row.phone_number},${row.first_name},${row.location_city},${row.purchasing_power},"${row.interests.join(' | ')}",${row.source_tenants.length},${row.last_seen}`
    );
    
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Global_Audience_Extract_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Extraction Complete", { description: "Audience CSV downloaded successfully." });
  };

  // Render Helpers
  const getPowerGlow = (power: string) => {
    switch (power) {
      case 'VIP': return 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 'high': return 'bg-blue-500/10 text-blue-500 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
      case 'medium': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  // Mock Dropdown Options
  const cityOptions = [
    { value: 'Cairo', label: 'Cairo' },
    { value: 'Alexandria', label: 'Alexandria' },
    { value: 'Giza', label: 'Giza' },
    { value: 'Riyadh', label: 'Riyadh' },
    { value: 'Dubai', label: 'Dubai' },
  ];

  const powerOptions = [
    { value: 'low', label: 'Low Content' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High Yield' },
    { value: 'VIP', label: 'VIP Matrix' },
  ];

  const interestOptions = [
    { value: 'tech', label: 'Technology' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'health', label: 'Healthcare' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 xl:p-12 space-y-8 select-none">
      
      {/* 1. Analytics Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-2xl border border-accent-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                    <Database className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-lg">
                    Data <span className="text-accent-primary text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-purple-400">Lake</span>
                </h1>
            </div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs ps-16 opacity-70">
                Global Audience DaaS Terminal
            </p>
        </div>

        <div className="flex items-center gap-4">
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchData(true)}
                disabled={isLoading || isRefreshing}
                className="p-3 rounded-xl bg-surface border border-glass-border text-foreground hover:bg-white/5 transition-all"
            >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-accent-primary' : ''}`} />
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-primary text-white font-black uppercase tracking-widest text-xs hover:bg-accent-primary/90 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
                <Download className="w-4 h-4" /> Export Network
            </motion.button>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: "Total Global Audience", value: total.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Visually VIP Profiles", value: isLoading ? "-" : vipCount.toString(), icon: Star, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
            { label: "Top Active Region", value: isLoading ? "-" : topCity, icon: MapPin, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        ].map((stat, i) => (
            <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-3xl bg-surface/50 backdrop-blur-xl border ${stat.border} relative overflow-hidden group`}
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
                    <stat.icon className={`w-24 h-24 ${stat.color}`} />
                </div>
                <div className="relative z-10 flex flex-col gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest leading-relaxed">{stat.label}</p>
                        <h3 className="text-4xl font-black tracking-tighter">{isLoading ? <span className="opacity-0">0</span> : stat.value}</h3>
                        {isLoading && <div className="absolute bottom-1 w-24 h-10 bg-white/5 rounded-md animate-pulse" />}
                    </div>
                </div>
            </motion.div>
        ))}
      </div>

      {/* 2. Filtering Engine */}
      <div className="p-4 md:p-6 rounded-3xl bg-surface/30 backdrop-blur-2xl border border-glass-border flex flex-col xl:flex-row items-stretch xl:items-center gap-4 shadow-xl">
        
        {/* Search */}
        <div className="relative flex-1 group">
            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-accent-primary transition-colors">
                <Search className="w-5 h-5" />
            </div>
            <input 
                type="text"
                placeholder="Query network by Phone or Name..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full bg-black/40 border border-glass-border rounded-xl py-3 ps-12 pe-4 text-sm font-medium focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <CustomDropdown 
                label="City Vector" 
                icon={MapPin} 
                options={cityOptions} 
                value={filters.city} 
                onChange={(v) => setFilters({...filters, city: v})} 
                onClear={() => setFilters({...filters, city: ''})}
            />
            <CustomDropdown 
                label="Purchasing Power" 
                icon={Sparkles} 
                options={powerOptions} 
                value={filters.min_purchasing_power} 
                onChange={(v) => setFilters({...filters, min_purchasing_power: v})} 
                onClear={() => setFilters({...filters, min_purchasing_power: ''})}
            />
            <CustomDropdown 
                label="Interest Tags" 
                icon={Target} 
                options={interestOptions} 
                value={filters.interests} 
                onChange={(v) => setFilters({...filters, interests: v})} 
                onClear={() => setFilters({...filters, interests: ''})}
            />
            
            <AnimatePresence>
                {hasActiveFilters && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, width: 0 }}
                        animate={{ opacity: 1, scale: 1, width: 'auto' }}
                        exit={{ opacity: 0, scale: 0.8, width: 0 }}
                        onClick={handleClearFilters}
                        className="px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest whitespace-nowrap"
                    >
                        <FilterX className="w-4 h-4" /> Reset
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* 3. DaaS Data Grid */}
      <div className="bg-surface/20 border border-glass-border rounded-[2rem] overflow-hidden shadow-2xl relative min-h-[500px]">
        {/* Blur Decorative Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="overflow-x-auto relative z-10">
            <table className="w-full text-start border-collapse">
                <thead>
                    <tr className="border-b border-white/5 bg-foreground/[0.02]">
                        <th className="py-5 px-6 font-bold text-xs uppercase tracking-widest text-muted-foreground w-[20%]">Signal Origin (Phone)</th>
                        <th className="py-5 px-6 font-bold text-xs uppercase tracking-widest text-muted-foreground w-[15%]">Entity Name</th>
                        <th className="py-5 px-6 font-bold text-xs uppercase tracking-widest text-muted-foreground w-[15%]">Sector (City)</th>
                        <th className="py-5 px-6 font-bold text-xs uppercase tracking-widest text-muted-foreground w-[15%]">Power Index</th>
                        <th className="py-5 px-6 font-bold text-xs uppercase tracking-widest text-muted-foreground w-[15%]">Vector Interests</th>
                        <th className="py-5 px-6 font-bold text-xs uppercase tracking-widest text-muted-foreground w-[10%]">Tenants</th>
                        <th className="py-5 px-6 font-bold text-xs uppercase tracking-widest text-muted-foreground w-[10%] text-end">Last Sync</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                {Array.from({ length: 7 }).map((_, colIndex) => (
                                    <td key={colIndex} className="py-6 px-6">
                                        <div className={`h-4 bg-white/5 rounded-md ${colIndex === 0 ? 'w-32' : colIndex === 6 ? 'w-24 ms-auto' : 'w-24'}`} />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : isError ? (
                        <tr>
                            <td colSpan={7} className="py-32">
                                <div className="flex flex-col items-center justify-center text-rose-400 gap-4">
                                    <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                                        <AlertCircle className="w-10 h-10" />
                                    </div>
                                    <p className="font-bold text-lg">System Integrity Error</p>
                                    <p className="text-sm opacity-80 text-muted-foreground">Unable to establish secure uplink with Global Gateway.</p>
                                    <button onClick={() => fetchData(true)} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors">
                                        Retry Connection
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-32">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="relative">
                                        <Database className="w-16 h-16 text-muted-foreground/30 animate-pulse" />
                                        <FilterX className="w-6 h-6 text-accent-primary absolute -bottom-1 -right-1" />
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <p className="font-bold text-lg text-foreground">Zero Vectors Found</p>
                                        <p className="text-sm text-muted-foreground">Adjust your sub-routines (filters) to scan a wider area.</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        <AnimatePresence>
                            {data.map((row, i) => (
                                <motion.tr 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    key={`${row.phone_number}-${i}`}
                                    className="hover:bg-foreground/[0.02] transition-colors group cursor-pointer"
                                >
                                    <td className="py-5 px-6">
                                        <div className="font-mono text-sm tracking-widest text-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                            +{row.phone_number}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-sm font-semibold">{row.first_name || "Unknown"}</td>
                                    <td className="py-5 px-6">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs font-medium text-muted-foreground border border-white/5">
                                            <MapPin className="w-3 h-3" /> {row.location_city || "Unmapped"}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getPowerGlow(row.purchasing_power)}`}>
                                            {row.purchasing_power}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {row.interests.slice(0, 2).map((interest, k) => (
                                                <span key={k} className="px-2 py-1 bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 rounded text-[10px] font-bold uppercase tracking-widest">
                                                    {interest}
                                                </span>
                                            ))}
                                            {row.interests.length > 2 && (
                                                <span className="px-2 py-1 bg-surface border border-glass-border rounded text-[10px] text-muted-foreground font-bold cursor-help" title={row.interests.slice(2).join(', ')}>
                                                    +{row.interests.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Activity className="w-4 h-4 text-emerald-400 opacity-70" />
                                            {row.source_tenants.length} Node(s)
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-end font-mono text-xs text-muted-foreground">
                                        {new Date(row.last_seen).toLocaleDateString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && !isError && total > 0 && (
            <div className="px-6 py-4 border-t border-white/5 bg-background/50 backdrop-blur flex items-center justify-between relative z-10">
                <p className="text-xs font-medium text-muted-foreground">
                    Showing <span className="text-foreground font-bold">{(page - 1) * limit + 1}</span> to <span className="text-foreground font-bold">{Math.min(page * limit, total)}</span> of <span className="text-foreground font-bold">{total}</span> vectors
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-glass-border bg-surface hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Prev
                    </button>
                    <button 
                        onClick={() => setPage(p => p + 1)}
                        disabled={page * limit >= total}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-glass-border bg-surface hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next
                    </button>
                </div>
            </div>
        )}
      </div>

    </div>
  );
}
