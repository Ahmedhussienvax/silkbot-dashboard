'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import KanbanBoard from '@/components/organisms/KanbanBoard';
import { useTranslations } from 'next-intl';
import { LayoutGrid, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lead {
  id: string; // JID
  name: string;
  phone: string;
  value: number;
  status: string;
  instance_name: string;
}

export default function PipelinesPage() {
  const t = useTranslations('Kanban');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .schema('silkbot')
          .from('contacts')
          .select('*')
          .limit(100);

        if (error) throw error;

        // Map existing contacts to Lead interface (v5.7.1 Schema)
        const mappedLeads: Lead[] = (data || []).map((c: any) => ({
          id: c.phone ? `${c.phone}@s.whatsapp.net` : (c.jid || c.contact_jid),
          name: c.name || "UNIDENTIFIED",
          phone: c.phone || 'Unknown',
          value: Number(c.lead_value || 0),
          status: c.lead_status || 'new',
          instance_name: c.tenant_id || "hub-alpha",
        }));

        setLeads(mappedLeads);
      } catch (err) {
        console.error('Pipeline Sync Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-accent-secondary/20 rounded-[2rem] animate-spin" />
          <Loader2 className="w-8 h-8 text-accent-secondary absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-text-muted font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Synchronizing_Neural_Pathways...
        </p>
      </div>
    );
  }

  const totalValue = leads.reduce((acc, lead) => acc + lead.value, 0);

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent-secondary/10 border border-accent-secondary/20 rounded-full">
            <LayoutGrid className="w-3.5 h-3.5 text-accent-secondary" />
            <span className="text-accent-secondary font-black text-[10px] uppercase tracking-widest italic">
              Strategy_Interface_v2.1
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter sm:text-5xl lg:text-6xl flex items-center gap-4 italic uppercase">
              {t('title')}
              <Sparkles className="w-8 h-8 text-accent-secondary animate-pulse" />
            </h1>
            <p className="text-text-muted text-sm max-w-xl mt-4 leading-relaxed font-medium tracking-tight">
              {t('description')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] uppercase font-bold text-text-dim tracking-widest italic">Pipeline_Value</span>
            </div>
            <div className="text-2xl font-black text-foreground">
              ${totalValue.toLocaleString()}
            </div>
          </div>
          <button className="h-full px-8 bg-accent-secondary hover:bg-accent-secondary/80 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 shadow-[0_20px_40px_-10px_rgba(var(--accent-secondary-rgb),0.3)]">
            {t('add_lead')}
          </button>
        </div>
      </header>

      <main className="h-[calc(100vh-280px)] min-h-[600px] mt-10">
        <KanbanBoard initialData={leads} />
      </main>

      {/* Decorative Neural Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--accent-secondary)_1px,transparent_1px)] bg-[length:40px_40px]" />
      </div>
    </div>
  );
}
