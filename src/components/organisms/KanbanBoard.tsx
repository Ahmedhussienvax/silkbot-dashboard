'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { User, DollarSign, Clock, MoreHorizontal, MousePointer2 } from 'lucide-react';

interface Lead {
  id: string; // JID
  name: string;
  phone: string;
  value: number;
  status: string;
  instance_name: string;
}

interface ColumnProps {
  id: string;
  title: string;
  leads: Lead[];
}

const KanbanCard = ({ lead }: { lead: Lead }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group bg-[#0A0A0A]/80 border border-white/5 p-4 rounded-xl mb-3 cursor-grab active:cursor-grabbing backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] ${
        isDragging ? 'opacity-50 grayscale scale-95' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-sm font-medium text-white/90 truncate max-w-[120px]">
            {lead.name}
          </span>
        </div>
        <button className="text-white/30 hover:text-white transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-wider">
          <DollarSign className="w-3 h-3 text-emerald-400/60" />
          <span>${lead.value.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-wider">
          <Clock className="w-3 h-3 text-amber-400/60" />
          <span>{lead.phone}</span>
        </div>
      </div>

      {/* Neural Glow Detail */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
    </div>
  );
};

const KanbanColumn = ({ id, title, leads }: ColumnProps) => {
  const t = useTranslations('Pipelines');
  
  return (
    <div className="flex flex-col h-full min-w-[300px] max-w-[350px] bg-white/[0.02] border border-white/5 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest">{title}</h3>
        </div>
        <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
          {leads.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar min-h-[500px]">
        <SortableContext id={id} items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            <AnimatePresence>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layoutId={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <KanbanCard lead={lead} />
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 border border-dashed border-white/5 rounded-xl text-white/20 text-xs italic">
                  {t('no_leads')}
                </div>
              )}
            </AnimatePresence>
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default function KanbanBoard({ initialData }: { initialData: Lead[] }) {
  const t = useTranslations('Pipelines');
  const [leads, setLeads] = useState<Lead[]>(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { id: 'new', title: t('new'), leads: leads.filter(l => l.status === 'new') },
    { id: 'warm', title: t('warm'), leads: leads.filter(l => l.status === 'warm') },
    { id: 'hot', title: t('hot'), leads: leads.filter(l => l.status === 'hot') },
    { id: 'closed', title: t('closed'), leads: leads.filter(l => l.status === 'closed') },
  ];

  const saveLeadStatus = async (lead: Lead, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/gateway/crm/update-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_GATEWAY_API_KEY || '',
        },
        body: JSON.stringify({
          remoteJid: lead.id,
          instanceId: lead.instance_name,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to persist lead status');
    } catch (err) {
      console.error('Persistence Error:', err);
      // Revert local state if needed, but for UX we keep it optimistic
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeLead = leads.find(l => l.id === active.id);
    if (!activeLead) return;

    const overId = over.id;
    const isOverAColumn = ['new', 'warm', 'hot', 'closed'].includes(overId);

    if (isOverAColumn) {
      if (activeLead.status !== overId) {
        setLeads(prev => prev.map(l => 
          l.id === active.id ? { ...l, status: overId } : l
        ));
        saveLeadStatus(activeLead, overId);
      }
    } else {
      const overLead = leads.find(l => l.id === overId);
      if (overLead && activeLead.status !== overLead.status) {
        setLeads(prev => prev.map(l => 
          l.id === active.id ? { ...l, status: overLead.status } : l
        ));
        saveLeadStatus(activeLead, overLead.status);
      }
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const activeIndex = leads.findIndex(l => l.id === active.id);
      const overIndex = leads.findIndex(l => l.id === over.id);

      if (overIndex !== -1) {
        setLeads((items) => arrayMove(items, activeIndex, overIndex));
      }
    }
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar h-full">
        {columns.map(col => (
          <KanbanColumn key={col.id} id={col.id} title={col.title} leads={col.leads} />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.4',
            },
          },
        }),
      }}>
        {activeLead && (
          <div className="w-[300px] scale-105 rotate-2">
            <KanbanCard lead={activeLead} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
