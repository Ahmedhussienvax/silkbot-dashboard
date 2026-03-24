"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Shield, UserCog, UserMinus, Plus, ShieldAlert,
  Search, CheckCircle2, ChevronDown, Mail, AlertTriangle,
  Clock, X
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---
type RoleType = 'owner' | 'manager' | 'agent';

interface Member {
  id: string;
  email: string;
  role: RoleType;
  status: 'active' | 'pending';
  joinedAt: string;
}

// --- Mock Data --- (REMOVED: Live database integration now prioritized)

import { createClient } from "@/lib/supabase-browser";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function TeamManagementPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteRole, setNewInviteRole] = useState<RoleType>("agent");
  const [isSending, setIsSending] = useState(false);
  
  // RBAC State (Skill 17)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: RoleType; tenantId: string | null }>({ 
    id: '', role: 'agent', tenantId: null 
  });

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({
          id: user.id,
          role: (user.app_metadata?.tenant_role as RoleType) || 'agent',
          tenantId: user.app_metadata?.tenant_id || null
        });
      }
    };
    fetchSession();
  }, []);

  const isOwner = currentUser.role === 'owner';
  const isManager = currentUser.role === 'manager';
  const isAdmin = isOwner || isManager;

  // Real-time Data Sync (TanStack Query)
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members', currentUser.tenantId],
    queryFn: async () => {
      if (!currentUser.tenantId) return [];
      const { data, error } = await supabase
        .from('member_directory')
        .select('*')
        .eq('tenant_id', currentUser.tenantId);
      
      if (error) throw error;
      return data.map((m: any): Member => ({
          id: m.membership_id, // Map database view primary key
          email: m.email || 'unknown@silkbot.app',
          role: m.tenant_role as RoleType,
          status: 'active',
          joinedAt: new Date(m.created_at).toISOString().split('T')[0]
      }));
    },
    enabled: !!currentUser.tenantId
  });

  // --- Handlers ---
  const handleRemoveMember = async (id: string, email: string) => {
    if (id === currentUser.id) {
        toast.error("Operation Aborted", { description: "Self-deletion is restricted." });
        return;
    }
    
    const { error } = await supabase.from('tenant_members').delete().eq('id', id);
    if (!error) {
        queryClient.invalidateQueries({ queryKey: ['team-members'] });
        toast.success("Access Revoked", { description: `${email} purged.` });
    } else {
        toast.error("Protocol Error", { description: error.message });
    }
  };

  const handleRoleChange = async (id: string, newRole: RoleType) => {
    const { error } = await supabase.from('tenant_members').update({ role: newRole }).eq('id', id);
    if (!error) {
        queryClient.invalidateQueries({ queryKey: ['team-members'] });
        toast.success("Privilege Escalation Complete", { description: `Level: ${newRole.toUpperCase()}` });
    } else {
        toast.error("Protocol Error", { description: error.message });
    }
  };

  const handleSendInvite = async () => {
    if (!newInviteEmail.includes('@')) {
        toast.error("Validation Error", { description: "Invalid email syntax." });
        return;
    }
    
    setIsSending(true);
    // In a real flow, this would call a Supabase Edge Function to invite & add to tenant_members
    // For now, we simulate the backend addition
    toast.info("Invite Dispatched", { description: "Simulation: Adding new member to tenant matrix." });
    
    await new Promise(r => setTimeout(r, 1000));
    setIsSending(false);
    setIsInviteModalOpen(false);
    setNewInviteEmail("");
    queryClient.invalidateQueries({ queryKey: ['team-members'] });
  };

  const filteredMembers = members.filter((m: Member) => m.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 xl:p-12 space-y-8 select-none">
      
      {/* Skeleton Overlay during Initial Load */}
      {isLoading && <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-pulse" />}
      
      {/* Analytics & Configuration Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-2xl border border-accent-primary/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                    <Shield className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-lg">
                    Workspace <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-blue-400">Matrix</span>
                </h1>
            </div>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs ps-16 opacity-70">
                Staff Authorization & Privilege Escalation
            </p>
        </div>

        {isAdmin && (
            <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-5 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-white/10"
            >
                <Plus className="w-4 h-4" /> Provision New Agent
            </button>
        )}
      </header>

      {/* Main Content */}
      <div className="bg-surface/20 backdrop-blur-2xl border border-glass-border rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
        {/* Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 relative z-10">
            <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                    type="text"
                    placeholder="Query agent email addresses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-black/40 border border-glass-border rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all placeholder:text-muted-foreground/40"
                />
            </div>
            
            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{members.filter((m: Member) => m.status === 'active').length} Active</span>
                </div>
                <div className="w-px h-4 bg-glass-border" />
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>{members.filter((m: Member) => m.status === 'pending').length} Pending</span>
                </div>
            </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-foreground/[0.02] border-b border-glass-border">
                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-dim-foreground">Identifier (Email)</th>
                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-dim-foreground">Privilege Level</th>
                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-dim-foreground">Status Network</th>
                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-dim-foreground">Ingress Date</th>
                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-[0.3em] text-dim-foreground text-right">Overrides</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-glass-border">
                    {filteredMembers.map((member: Member, idx: number) => (
                        <tr 
                            key={member.id}
                            className="hover:bg-foreground/[0.02] transition-colors group"
                        >
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-glass-border flex items-center justify-center">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-foreground">{member.email}</div>
                                        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">ID: {member.id.toUpperCase()}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                {/* Role Selector */}
                                <div className="relative inline-block w-36">
                                    <select 
                                        disabled={
                                            member.role === 'owner' || // Cannot touch owner
                                            (isManager && member.role === 'manager') || // Manager cannot touch Managers
                                            member.id === currentUser.id // Cannot touch self
                                        }
                                        value={member.role}
                                        onChange={(e) => handleRoleChange(member.id, e.target.value as RoleType)}
                                        className="w-full appearance-none bg-surface border border-glass-border rounded-lg px-3 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent-primary transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
                                    >
                                        {isOwner && <option value="owner">Owner</option>}
                                        <option value="manager">Manager</option>
                                        <option value="agent">Agent</option>
                                    </select>
                                    <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                {member.status === 'active' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <CheckCircle2 className="w-3 h-3" /> Online
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <Clock className="w-3 h-3" /> Pending
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                                {member.joinedAt}
                            </td>
                            <td className="px-6 py-5 text-right">
                                {((isOwner && member.role !== 'owner') || (isManager && member.role === 'agent')) && member.id !== currentUser.id ? (
                                    <button 
                                        onClick={() => handleRemoveMember(member.id, member.email)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 hover:border-red-500 shadow-sm opacity-0 group-hover:opacity-100"
                                        title="Revoke Access"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <div title="Administrative override restricted">
                                      <ShieldAlert className="w-4 h-4 text-muted-foreground/30 inline-block" />
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {filteredMembers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-16">
                                <UserCog className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-sm font-bold text-muted-foreground">No entities matched the query matrix.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsInviteModalOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-[#0b141a] border border-glass-border rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl"
                >
                    <button 
                        onClick={() => setIsInviteModalOpen(false)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20 text-accent-primary shadow-inner">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic tracking-tight">Provision Agent</h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Grant Secure Workspace Access</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ms-1">Entity Email Address</label>
                            <input
                                type="email"
                                placeholder="operator@company.com"
                                value={newInviteEmail}
                                onChange={(e) => setNewInviteEmail(e.target.value)}
                                className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all placeholder:text-muted-foreground/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ms-1">Initial Privilege Matrix</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setNewInviteRole("manager")}
                                    className={`p-4 rounded-xl border text-left transition-all ${newInviteRole === 'manager' ? 'bg-accent-primary/10 border-accent-primary/40 ring-1 ring-accent-primary/20' : 'bg-surface/40 hover:bg-surface/80 border-glass-border/60 hover:border-glass-border'}`}
                                >
                                    <div className={`text-sm font-black mb-1 ${newInviteRole === 'manager' ? 'text-foreground' : 'text-muted-foreground'}`}>Manager</div>
                                    <div className="text-[10px] font-medium text-muted-foreground leading-tight">Can edit bots & monitor all chats.</div>
                                </button>
                                <button
                                    onClick={() => setNewInviteRole("agent")}
                                    className={`p-4 rounded-xl border text-left transition-all ${newInviteRole === 'agent' ? 'bg-accent-primary/10 border-accent-primary/40 ring-1 ring-accent-primary/20' : 'bg-surface/40 hover:bg-surface/80 border-glass-border/60 hover:border-glass-border'}`}
                                >
                                    <div className={`text-sm font-black mb-1 ${newInviteRole === 'agent' ? 'text-foreground' : 'text-muted-foreground'}`}>Agent</div>
                                    <div className="text-[10px] font-medium text-muted-foreground leading-tight">Restricted to responding to assigned chats only.</div>
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-glass-border">
                            <button
                                onClick={handleSendInvite}
                                disabled={isSending || !newInviteEmail}
                                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all
                                    ${(isSending || !newInviteEmail)
                                        ? 'bg-accent-primary/30 text-white/50 cursor-not-allowed' 
                                        : 'bg-accent-primary text-white hover:bg-accent-primary/90 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]'
                                    }
                                `}
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Transmitting Validation...
                                    </>
                                ) : (
                                    <>
                                        Dispatch Secured Link
                                    </>
                                )}
                            </button>
                            <div className="flex items-start gap-2 mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-400">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                                    Invoking an entity grants them access to your workspace database per their assigned matrix tier.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}
