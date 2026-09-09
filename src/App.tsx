import React, { useState, useEffect } from 'react';
import {
  Shield,
  Hash,
  Sparkles,
  Users,
  Terminal,
  FolderGit2,
  Coins,
  FileCheck2,
  Calendar,
  Lock,
  ArrowRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Eye,
} from 'lucide-react';
import { Member, WhitelistApplicant, Brainstorm, Project, Opportunity, PaymentProof, TimelineEvent, AuditLog } from './types';
import { DiscordEmbedView, EmbedButton } from './components/DiscordEmbedView';
import { VerifyModal } from './components/ActionModals';
import { TimelineModal } from './components/TimelineModal';
import { DockerDeployCenter } from './components/DockerDeployCenter';
import { PublicShareView } from './components/PublicShareView';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'discord' | 'timeline' | 'docker' | 'ledger'>('discord');
  const [activeChannel, setActiveChannel] = useState<string>('verify-me');

  // Simulated Persona
  const [currentPersona, setCurrentPersona] = useState<{
    id: string;
    username: string;
    avatar: string;
    role: '@Unverified' | '@Member' | '@Admin';
    jempId?: string;
    email?: string;
  }>({
    id: 'user_alex_99',
    username: 'alex_vance',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    role: '@Unverified',
  });

  // State from server/store
  const [members, setMembers] = useState<Member[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistApplicant[]>([]);
  const [brainstorms, setBrainstorms] = useState<Brainstorm[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [botStatus, setBotStatus] = useState<any>({ connected: false, botTag: 'JEMP Bot#0000' });

  // Verification flow state
  // KEY REQUIREMENT: Making sure the one use cards like verify me disappears once verification and flow is completed.
  const [verifyCardDisappeared, setVerifyCardDisappeared] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>();
  const [verifySuccessNotice, setVerifySuccessNotice] = useState<string | null>(null);

  // Timeline modal state
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [timelineMemberJempId, setTimelineMemberJempId] = useState<string>('JEMP#001');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Public Share Preview state
  const [publicShareData, setPublicShareData] = useState<{
    member: Member;
    events: TimelineEvent[];
    expiresAt: string;
  } | null>(null);

  // Quick Action Modals
  const [isNewBrainstormModalOpen, setIsNewBrainstormModalOpen] = useState(false);
  const [isNewWorkLogModalOpen, setIsNewWorkLogModalOpen] = useState(false);
  const [selectedProjectForLog, setSelectedProjectForLog] = useState<string>('P#001');
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDesc, setNewLogDesc] = useState('');

  // Fetch state from server
  const loadState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setWhitelist(data.whitelist || []);
        setBrainstorms(data.brainstorms || []);
        setProjects(data.projects || []);
        setOpportunities(data.opportunities || []);
        setPaymentProofs(data.paymentProofs || []);
        setAuditLogs(data.auditLogs || []);
        setBotStatus(data.botStatus || {});
      }
    } catch (err) {
      console.warn('API fetch note: using local cache');
    }
  };

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle Verification Submit
  const handleVerifySubmit = async (email: string, timezone: string, resumeFileName: string) => {
    setVerifySubmitting(true);
    setVerifyError(undefined);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordUserId: currentPersona.id,
          username: currentPersona.username,
          email,
          timezone,
          resumeFileName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setVerifyError(data.error || 'Verification halted. Check application email.');
        return;
      }

      // Verification successful!
      // 1. Synchronize Persona Role & JEMP ID
      const assignedMember = data.member;
      setCurrentPersona((prev) => ({
        ...prev,
        role: '@Member',
        jempId: assignedMember.jempId,
        email: assignedMember.email,
      }));

      // 2. KEY MANDATE: DISAPPEAR ONE-USE VERIFICATION CARD
      setVerifyCardDisappeared(true);
      setIsVerifyModalOpen(false);
      setVerifySuccessNotice(
        `⚔️ Verification Completed! Assigned ${assignedMember.jempId}. One-use verification card removed from channel.`
      );

      // 3. Reload state so onboarding-logs and timeline reflect updates
      await loadState();
    } catch (err: any) {
      setVerifyError(err.message || 'Network error during verification.');
    } finally {
      setVerifySubmitting(false);
    }
  };

  // Open Timeline
  const openTimelineForMember = async (jempId: string) => {
    try {
      const res = await fetch(`/api/timeline/member/${jempId}`);
      if (res.ok) {
        const events = await res.json();
        setTimelineEvents(events);
        setTimelineMemberJempId(jempId);
        setTimelineModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create 24h Share Link
  const handleCreateShareLink = async (jempId: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/timeline/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jempId }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.shareUrl;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  // Switch persona helper for testing
  const switchPersona = (personaType: 'unverified' | 'jemp001' | 'admin') => {
    if (personaType === 'unverified') {
      setCurrentPersona({
        id: `user_new_${Date.now().toString().slice(-4)}`,
        username: 'alex_vance',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        role: '@Unverified',
      });
      setVerifyCardDisappeared(false);
      setVerifySuccessNotice(null);
      setActiveChannel('verify-me');
    } else if (personaType === 'jemp001') {
      setCurrentPersona({
        id: 'user_101',
        username: 'vex_architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: '@Member',
        jempId: 'JEMP#001',
        email: 'founder@despair.us',
      });
      setActiveChannel('profile-manager');
    } else if (personaType === 'admin') {
      setCurrentPersona({
        id: 'user_admin_01',
        username: 'Admin_Lead',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        role: '@Admin',
        jempId: 'JEMP#000',
        email: 'admin@despair.us',
      });
      setActiveChannel('applications');
    }
  };

  // Convert Brainstorm to Project (Start Cooking)
  const handleStartCooking = async (brainstormCode: string) => {
    const desc = prompt(
      `Enter corporate / professional project description for ${brainstormCode}:`,
      'Enterprise proof-of-work infrastructure designed for trustless builder attribution.'
    );
    if (!desc) return;

    try {
      const res = await fetch('/api/brainstorms/cook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brainstormCode,
          corporateDescription: desc,
          actorDiscordId: currentPersona.id,
        }),
      });
      if (res.ok) {
        await loadState();
        setActiveChannel('projects');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Log Work Update
  const handleLogWorkUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle || !newLogDesc) return;

    try {
      const res = await fetch('/api/projects/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectCode: selectedProjectForLog,
          authorDiscordId: currentPersona.id,
          authorJempId: currentPersona.jempId || 'JEMP#001',
          type: 'WORK_UPDATE',
          title: newLogTitle,
          description: newLogDesc,
        }),
      });
      if (res.ok) {
        setNewLogTitle('');
        setNewLogDesc('');
        setIsNewWorkLogModalOpen(false);
        await loadState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Approve Payment Proof
  const handleApproveProof = async (proofCode: string) => {
    try {
      const res = await fetch('/api/payroll/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofCode,
          reviewerJempId: currentPersona.jempId || 'JEMP#001',
          decision: 'APPROVE',
          comment: 'Wire reference reconciled with banking receipt.',
        }),
      });
      if (res.ok) {
        await loadState();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // View Public Share Screen
  if (publicShareData) {
    return (
      <PublicShareView
        member={publicShareData.member}
        events={publicShareData.events}
        expiresAt={publicShareData.expiresAt}
        onBack={() => setPublicShareData(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0c] text-zinc-100 flex flex-col">
      {/* 1. TOP ECOSYSTEM HEADER */}
      <header className="bg-[#0e1013] border-b border-zinc-800/80 px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-lg shadow-rose-950/50 border border-rose-500/30">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white uppercase">
                  Jobless Empire
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] border border-zinc-700">
                  despair.us
                </span>
                <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-mono">
                  v1.0 Production
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium tracking-wide">
                NO JOB. STILL BUILDING. • One Unified Discord Bot Ecosystem
              </p>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <div className="flex items-center gap-1 bg-[#16171b] p-1 rounded-lg border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('discord')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'discord' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              Discord Channels
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'timeline' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Timeline Ledger
            </button>
            <button
              onClick={() => setActiveTab('docker')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'docker' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Docker Deploy
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'ledger' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              DB Database
            </button>
          </div>

          {/* Persona Switcher for Quick Interactive Testing */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 uppercase font-mono hidden md:inline">
              Testing As:
            </span>
            <div className="flex items-center gap-1 bg-[#18191c] p-1 rounded-md border border-zinc-800 text-xs">
              <button
                onClick={() => switchPersona('unverified')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  currentPersona.role === '@Unverified'
                    ? 'bg-rose-950/80 text-rose-300 font-bold border border-rose-800'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                @Unverified
              </button>
              <button
                onClick={() => switchPersona('jemp001')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  currentPersona.role === '@Member'
                    ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                JEMP#001
              </button>
              <button
                onClick={() => switchPersona('admin')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  currentPersona.role === '@Admin'
                    ? 'bg-amber-950/80 text-amber-300 font-bold border border-amber-800'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN APPLICATION CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* =========================================================================
            TAB 1: DISCORD LIVE SIMULATOR
           ========================================================================= */}
        {activeTab === 'discord' && (
          <div className="bg-[#111215] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[720px]">
            {/* Left Column: Discord Channel Sidebar */}
            <div className="w-full md:w-64 bg-[#1e1f22] border-r border-zinc-800 flex flex-col shrink-0">
              {/* Guild Header */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between font-bold text-white tracking-wide">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">⚔️</span>
                  <span className="truncate">JOBLESS EMPIRE</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Bot Online" />
              </div>

              {/* Channels List */}
              <div className="p-3 space-y-5 overflow-y-auto flex-1 text-xs">
                {/* Onboarding Category */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 flex items-center justify-between">
                    <span>👋 Onboarding</span>
                    {currentPersona.role === '@Unverified' && !verifyCardDisappeared && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                  <button
                    onClick={() => setActiveChannel('verify-me')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      activeChannel === 'verify-me'
                        ? 'bg-[#35373c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2d31]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Hash className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">verify-me</span>
                    </div>
                    {currentPersona.role === '@Unverified' && !verifyCardDisappeared && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-bold">
                        1
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveChannel('onboarding-logs')}
                    className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      activeChannel === 'onboarding-logs'
                        ? 'bg-[#35373c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2d31]'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">onboarding-logs</span>
                  </button>
                </div>

                {/* Member Hub */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                    🪪 Member Hub
                  </div>
                  <button
                    onClick={() => setActiveChannel('profile-manager')}
                    className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      activeChannel === 'profile-manager'
                        ? 'bg-[#35373c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2d31]'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">profile-manager</span>
                  </button>
                </div>

                {/* Workspaces */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                    🧠 Ideas & Execution
                  </div>
                  <button
                    onClick={() => setActiveChannel('brainstorms')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      activeChannel === 'brainstorms'
                        ? 'bg-[#35373c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2d31]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Hash className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">brainstorms</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {brainstorms.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveChannel('projects')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      activeChannel === 'projects'
                        ? 'bg-[#35373c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2d31]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Hash className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">projects</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {projects.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveChannel('opportunities')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      activeChannel === 'opportunities'
                        ? 'bg-[#35373c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2d31]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Hash className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">opportunities</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {opportunities.length}
                    </span>
                  </button>
                </div>

                {/* Financial Transparency */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                    💰 Financial Transparency
                  </div>
                  <button
                    onClick={() => setActiveChannel('payroll')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      activeChannel === 'payroll'
                        ? 'bg-[#35373c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2d31]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Hash className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">payroll</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">5% Fee</span>
                  </button>
                </div>

                {/* Administration */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 flex items-center justify-between">
                    <span>🔒 Admin Only</span>
                    <Lock className="w-3 h-3 text-zinc-500" />
                  </div>
                  <button
                    onClick={() => setActiveChannel('applications')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      activeChannel === 'applications'
                        ? 'bg-[#35373c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2d31]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Hash className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">applications</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {whitelist.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveChannel('bot-logs')}
                    className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                      activeChannel === 'bot-logs'
                        ? 'bg-[#35373c] text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2b2d31]'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">bot-logs</span>
                  </button>
                </div>
              </div>

              {/* User Profile Bar at bottom */}
              <div className="p-3 bg-[#111214] border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={currentPersona.avatar}
                    alt={currentPersona.username}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate flex items-center gap-1">
                      {currentPersona.username}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate">
                      {currentPersona.jempId || currentPersona.role}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  {currentPersona.role}
                </span>
              </div>
            </div>

            {/* Right Column: Active Channel Messages & Cards */}
            <div className="flex-1 bg-[#313338] flex flex-col overflow-hidden">
              {/* Channel Header Bar */}
              <div className="p-3.5 bg-[#2b2d31] border-b border-[#1f2023] flex items-center justify-between text-sm shadow-sm">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Hash className="w-4 h-4 text-zinc-400" />
                  <span>{activeChannel}</span>
                  <span className="text-zinc-400 text-xs font-normal border-l border-zinc-600 pl-2">
                    {activeChannel === 'verify-me' &&
                      'Single-use automated card: Mentions user & self-destructs upon completion'}
                    {activeChannel === 'profile-manager' &&
                      'Official builder credentials, proof-of-work metrics, and timeline export'}
                    {activeChannel === 'brainstorms' &&
                      'Brainstorming Club: Ideate, form teams, and cook into official projects'}
                    {activeChannel === 'projects' &&
                      'Active project workspaces: Meaningful work logging and milestone attestation'}
                    {activeChannel === 'payroll' &&
                      'Financial transparency: 5% platform maintenance fee & milestone proof releases'}
                    {activeChannel === 'applications' &&
                      'Admin review desk: Whitelist approval and applicant triage'}
                    {activeChannel === 'onboarding-logs' &&
                      'Public community-safe welcome ledger'}
                    {activeChannel === 'bot-logs' &&
                      'Admin system audit records and operation traces'}
                  </span>
                </div>

                {activeChannel === 'brainstorms' && (
                  <button
                    onClick={() => setIsNewBrainstormModalOpen(true)}
                    className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Brainstorm
                  </button>
                )}

                {activeChannel === 'projects' && (
                  <button
                    onClick={() => setIsNewWorkLogModalOpen(true)}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Log Work Update
                  </button>
                )}
              </div>

              {/* Channel Messages Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
                {/* -------------------------------------------------------------
                    CHANNEL: #verify-me
                   ------------------------------------------------------------- */}
                {activeChannel === 'verify-me' && (
                  <div className="space-y-4">
                    {verifySuccessNotice && (
                      <div className="p-4 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{verifySuccessNotice}</span>
                        </div>
                        <button
                          onClick={() => setActiveChannel('profile-manager')}
                          className="px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded font-bold"
                        >
                          Go to #profile-manager →
                        </button>
                      </div>
                    )}

                    {!verifyCardDisappeared ? (
                      <div>
                        {/* THE VERIFY ME CARD */}
                        <DiscordEmbedView
                          contentMention={`<@${currentPersona.username}>`}
                          disappearingNotice="One-use card • Disappears upon verification"
                          embed={{
                            color: '#e11d48',
                            title: '⚔️ JOBLESS EMPIRE — VERIFICATION PROTOCOL',
                            description:
                              `Welcome <@${currentPersona.username}> to the **Jobless Empire**.\n\n` +
                              `> *"Jobless doesn't mean useless. No job. Still building."*\n\n` +
                              `You are currently marked as **@Unverified**. To join the private builder collective and receive your permanent **JEMP#** identity, please authenticate your application credentials below.`,
                            fields: [
                              {
                                name: '1. Whitelist Verification',
                                value:
                                  'Ensure you submit the exact email address used in your despair.us application.',
                                inline: true,
                              },
                              {
                                name: '2. One-Time Protocol',
                                value:
                                  'This verification card will **self-destruct immediately** once verification is completed.',
                                inline: true,
                              },
                              {
                                name: '3. Identity Allocation',
                                value:
                                  'Sequential **JEMP#** badge will be immutably allocated to your profile.',
                                inline: false,
                              },
                            ],
                            footer: {
                              text: 'despair.us • Builder Verification Protocol • Immutable Security',
                            },
                          }}
                          buttons={[
                            {
                              id: 'btn_verify_auth',
                              label: 'Authenticate Whitelist Email',
                              style: 'danger',
                              icon: <Shield className="w-3.5 h-3.5" />,
                              onClick: () => setIsVerifyModalOpen(true),
                            },
                            {
                              id: 'btn_verify_help',
                              label: 'Application Help',
                              style: 'secondary',
                              onClick: () =>
                                alert(
                                  'Applications must be approved via despair.us before accessing Discord. Whitelist approvals are checked in real-time.'
                                ),
                            },
                          ]}
                        />
                      </div>
                    ) : (
                      <div className="p-8 rounded-lg bg-[#2b2d31]/50 border border-dashed border-zinc-700 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-white text-sm">
                          Verification Complete & Card Self-Destructed
                        </h4>
                        <p className="text-xs text-zinc-400 max-w-md mx-auto">
                          In accordance with JEMP protocol, one-use verification cards disappear
                          completely to prevent channel clutter. Your permanent identity is active.
                        </p>
                        <button
                          onClick={() => switchPersona('unverified')}
                          className="mt-3 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                        >
                          Simulate Another New Applicant
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------------------------------------------------
                    CHANNEL: #profile-manager
                   ------------------------------------------------------------- */}
                {activeChannel === 'profile-manager' && (
                  <div className="space-y-4">
                    {/* Render Profile Card */}
                    <DiscordEmbedView
                      embed={{
                        color: '#16181d',
                        title: `⚔️ YOUR JEMP PROFILE — ${currentPersona.jempId || 'JEMP#001'}`,
                        description:
                          `**DISCORD:** <@${currentPersona.username}> | \`${currentPersona.username}\`\n` +
                          `**STATUS:** \`ACTIVE\`\n` +
                          `**TIMEZONE:** UTC-5 (EST)\n\n` +
                          `> *"Your work should leave a trail."*`,
                        fields: [
                          {
                            name: 'HR & CREDENTIALS',
                            value: `Resume: **CURRENT**\nFile: \`alex_vance_cv_2026.pdf\`\nEmail: \`${currentPersona.email || 'alex.builder@despair.us'}\``,
                            inline: true,
                          },
                          {
                            name: 'PROOF OF WORK STATS',
                            value: `Projects: **${projects.length}**\nBrainstorms: **${brainstorms.length}**\nOpportunities: **${opportunities.length}**\nTimeline: **Authoritative Ledger**`,
                            inline: true,
                          },
                        ],
                        footer: {
                          text: 'despair.us • Permanent Identity Matrix',
                        },
                      }}
                      buttons={[
                        {
                          id: 'prof_btn_timeline',
                          label: 'View Timeline',
                          style: 'primary',
                          icon: <Calendar className="w-3.5 h-3.5" />,
                          onClick: () =>
                            openTimelineForMember(currentPersona.jempId || 'JEMP#001'),
                        },
                        {
                          id: 'prof_btn_share',
                          label: 'Create 24h Public Link',
                          style: 'secondary',
                          icon: <ExternalLink className="w-3.5 h-3.5" />,
                          onClick: async () => {
                            const url = await handleCreateShareLink(
                              currentPersona.jempId || 'JEMP#001'
                            );
                            if (url) {
                              const token = url.split('/').pop();
                              const res = await fetch(`/api/timeline/share/${token}`);
                              if (res.ok) {
                                const data = await res.json();
                                setPublicShareData({
                                  member: data.member,
                                  events: data.events,
                                  expiresAt: data.share.expiresAt,
                                });
                              }
                            }
                          },
                        },
                        {
                          id: 'prof_btn_export',
                          label: 'Export Record',
                          style: 'secondary',
                          onClick: () =>
                            openTimelineForMember(currentPersona.jempId || 'JEMP#001'),
                        },
                      ]}
                    />
                  </div>
                )}

                {/* -------------------------------------------------------------
                    CHANNEL: #brainstorms
                   ------------------------------------------------------------- */}
                {activeChannel === 'brainstorms' && (
                  <div className="space-y-6">
                    {brainstorms.map((b) => (
                      <DiscordEmbedView
                        key={b.id}
                        embed={{
                          color: b.status === "It's Alive" ? '#10b981' : '#f59e0b',
                          title: `🧠 [${b.code}] ${b.title}`,
                          description:
                            `**DOMAIN:** \`${b.category}\`\n` +
                            `**CREATOR:** ${b.creatorJempId}\n` +
                            `**STATUS:** \`${b.status}\`\n` +
                            `**STATUS REASON:** *${b.statusReason}*\n\n` +
                            `**PROBLEM STATEMENT:**\n> ${b.problemExplored}\n\n` +
                            `**SPECIFICATION:**\n${b.description}`,
                          fields: [
                            {
                              name: `COLLABORATORS (${b.participants.length})`,
                              value:
                                b.participants
                                  .map((p) => `• **${p.jempId}** (${p.role})`)
                                  .join('\n') || 'None',
                              inline: false,
                            },
                          ],
                          footer: {
                            text: b.linkedProjectCode
                              ? `Graduated to Project ${b.linkedProjectCode} • despair.us`
                              : 'despair.us • Brainstorming Club System',
                          },
                        }}
                        buttons={[
                          {
                            id: `btn_cook_${b.code}`,
                            label: 'Start Cooking (Convert to P#)',
                            style: 'success',
                            disabled: b.status === "It's Alive",
                            onClick: () => handleStartCooking(b.code),
                          },
                          {
                            id: `btn_join_${b.code}`,
                            label: 'Apply to Collaborate',
                            style: 'primary',
                            onClick: () =>
                              alert(
                                `Applied to collaborate on ${b.code}. Project lead notified.`
                              ),
                          },
                        ]}
                      />
                    ))}
                  </div>
                )}

                {/* -------------------------------------------------------------
                    CHANNEL: #projects
                   ------------------------------------------------------------- */}
                {activeChannel === 'projects' && (
                  <div className="space-y-6">
                    {projects.map((p) => (
                      <DiscordEmbedView
                        key={p.id}
                        embed={{
                          color: '#10b981',
                          title: `🛠️ [${p.code}] ${p.title}`,
                          description:
                            `**LEAD:** ${p.ownerJempId}\n` +
                            `**STATUS:** \`${p.status}\`\n` +
                            `**STATUS REASON:** *${p.statusReason}*\n` +
                            (p.linkedBrainstormCode
                              ? `**ORIGIN BRAINSTORM:** \`${p.linkedBrainstormCode}\`\n`
                              : '') +
                            `\n**EXECUTIVE SUMMARY:**\n> ${p.corporateDescription}`,
                          fields: [
                            {
                              name: `TEAM (${p.members.length})`,
                              value:
                                p.members
                                  .map((m) => `• **${m.jempId}** — ${m.role}`)
                                  .join('\n') || 'None',
                              inline: true,
                            },
                            {
                              name: 'RECENT LOGS (PROVEN WORK)',
                              value:
                                p.logs.length > 0
                                  ? p.logs
                                      .slice(-2)
                                      .map((l) => `• **${l.type}**: ${l.title}`)
                                      .join('\n')
                                  : 'No work updates recorded yet.',
                              inline: true,
                            },
                          ],
                          footer: {
                            text: 'despair.us • Project Management System',
                          },
                        }}
                        buttons={[
                          {
                            id: `btn_log_${p.code}`,
                            label: 'Log Work Update',
                            style: 'primary',
                            onClick: () => {
                              setSelectedProjectForLog(p.code);
                              setIsNewWorkLogModalOpen(true);
                            },
                          },
                          {
                            id: `btn_view_tl_${p.code}`,
                            label: 'View Timeline Proof',
                            style: 'secondary',
                            onClick: () => openTimelineForMember(p.ownerJempId),
                          },
                        ]}
                      />
                    ))}
                  </div>
                )}

                {/* -------------------------------------------------------------
                    CHANNEL: #opportunities
                   ------------------------------------------------------------- */}
                {activeChannel === 'opportunities' && (
                  <div className="space-y-6">
                    {opportunities.map((opp) => (
                      <DiscordEmbedView
                        key={opp.id}
                        embed={{
                          color: '#f59e0b',
                          title: `💼 [${opp.code}] ${opp.title}`,
                          description:
                            `**POSTER:** ${opp.creatorJempId}\n` +
                            `**BUDGET:** \`${opp.budget || 'Negotiable'}\`\n` +
                            `**REVENUE SHARE:** ${opp.revenueShareInfo || '95% Team / 5% Platform'}\n\n` +
                            `**PROJECT SCOPE:**\n${opp.description}`,
                          fields: [
                            {
                              name: 'REQUIREMENTS',
                              value: opp.requirements.map((r) => `• ${r}`).join('\n') || 'None',
                              inline: true,
                            },
                            {
                              name: `APPLICANTS (${opp.applicants.length})`,
                              value:
                                opp.applicants
                                  .map((a) => `• **${a.jempId}** (${a.note})`)
                                  .join('\n') || 'None yet.',
                              inline: true,
                            },
                          ],
                          footer: {
                            text: 'despair.us • Client & Hiring System',
                          },
                        }}
                        buttons={[
                          {
                            id: `btn_opp_${opp.code}`,
                            label: 'Apply for Opportunity',
                            style: 'primary',
                            onClick: () =>
                              alert(`Application submitted to opportunity ${opp.code}`),
                          },
                        ]}
                      />
                    ))}
                  </div>
                )}

                {/* -------------------------------------------------------------
                    CHANNEL: #payroll
                   ------------------------------------------------------------- */}
                {activeChannel === 'payroll' && (
                  <div className="space-y-6">
                    {paymentProofs.map((prf) => (
                      <DiscordEmbedView
                        key={prf.id}
                        embed={{
                          color: prf.status === 'VERIFIED' ? '#10b981' : '#f59e0b',
                          title: `💰 [${prf.code}] PROOF OF CLIENT PAYMENT`,
                          description:
                            `**PROJECT:** \`${prf.projectCode}\`\n` +
                            `**SUBMITTER:** ${prf.submitterJempId}\n` +
                            `**PAYMENT TYPE:** \`${prf.proofType}\`\n` +
                            `**STATUS:** \`${prf.status}\`\n` +
                            `**TX HASH / WIRE REF:** \`${prf.txHashOrRef}\`\n\n` +
                            `**DETAILS:**\n> ${prf.details}`,
                          fields: [
                            {
                              name: 'FINANCIAL TRANSPARENCY (5% PLATFORM FEE)',
                              value:
                                `• Gross Client Payment: **${prf.currency} ${prf.clientTotalAmount.toLocaleString()}**\n` +
                                `• JEMP Platform Fee (5%): **${prf.currency} ${(prf.clientTotalAmount * 0.05).toFixed(2)}**\n` +
                                `• Team Distribution Pool (95%): **${prf.currency} ${(prf.clientTotalAmount * 0.95).toFixed(2)}**`,
                              inline: false,
                            },
                            {
                              name: `TEAM AUDIT REVIEWS (${prf.reviews.length})`,
                              value:
                                prf.reviews.length > 0
                                  ? prf.reviews
                                      .map((r) => `• **${r.reviewerJempId}**: \`${r.decision}\` (${r.comment})`)
                                      .join('\n')
                                  : 'No team reviews logged yet.',
                              inline: false,
                            },
                          ],
                          footer: {
                            text: 'despair.us • Transparent Payroll & Escrow Audit',
                          },
                        }}
                        buttons={[
                          {
                            id: `btn_pay_app_${prf.code}`,
                            label: 'Approve Proof',
                            style: 'success',
                            disabled: prf.status === 'VERIFIED',
                            onClick: () => handleApproveProof(prf.code),
                          },
                          {
                            id: `btn_pay_disp_${prf.code}`,
                            label: 'Dispute / Request Details',
                            style: 'danger',
                            onClick: () =>
                              alert(
                                `Dispute logged for ${prf.code}. Preserved in official audit history.`
                              ),
                          },
                        ]}
                      />
                    ))}
                  </div>
                )}

                {/* -------------------------------------------------------------
                    CHANNEL: #applications (Admin Only)
                   ------------------------------------------------------------- */}
                {activeChannel === 'applications' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[#1e1f22] border border-zinc-700 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          Website Applications Whitelist
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Pre-approved applicant credentials ready for automated Discord onboarding.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/30">
                        Admin Workspace
                      </span>
                    </div>

                    <div className="space-y-3">
                      {whitelist.map((app) => (
                        <div
                          key={app.id}
                          className="p-4 rounded-lg bg-[#18191c] border border-zinc-800 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{app.fullName}</span>
                              <span className="text-xs font-mono text-zinc-400">({app.email})</span>
                            </div>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                app.status === 'APPROVED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : app.status === 'USED'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300">{app.notes || 'Website applicant'}</p>
                          <div className="text-[11px] text-zinc-500 font-mono flex items-center justify-between pt-1 border-t border-zinc-800">
                            <span>Approved by: {app.approvedBy}</span>
                            <span>Resume: {app.resumeFileName || 'On file'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    CHANNEL: #onboarding-logs
                   ------------------------------------------------------------- */}
                {activeChannel === 'onboarding-logs' && (
                  <div className="space-y-4">
                    {members.map((m) => (
                      <DiscordEmbedView
                        key={m.id}
                        embed={{
                          color: '#f59e0b',
                          title: '⚔️ WELCOME TO JOBLESS EMPIRE',
                          description:
                            `Please welcome **${m.jempId || 'New Builder'}** (<@${m.username}>) to the builder collective.\n\n` +
                            `• **Status:** ACTIVE BUILDER\n` +
                            `• **Timezone:** ${m.timezone || 'UTC'}\n` +
                            `• **Role Synchronized:** @Member Granted\n` +
                            `• **Proof-of-Work Trail:** Initialized in #profile-manager`,
                          footer: {
                            text: 'despair.us • Official Onboarding Ledger',
                          },
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* -------------------------------------------------------------
                    CHANNEL: #bot-logs
                   ------------------------------------------------------------- */}
                {activeChannel === 'bot-logs' && (
                  <div className="space-y-2 font-mono text-xs">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded bg-[#1e1f22] border border-zinc-800 text-zinc-300 flex items-start justify-between gap-4"
                      >
                        <div>
                          <span className="text-rose-400 font-bold">[{log.action}]</span>{' '}
                          <span className="text-zinc-400">by {log.actorId}</span>
                          <div className="text-[11px] text-zinc-400 mt-1">
                            {JSON.stringify(log.details)}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: TIMELINE EXPLORER & PUBLIC SHARES
           ========================================================================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-[#111215] border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Proof-of-Work Timeline Engine
                </h3>
                <p className="text-xs text-zinc-400">
                  Authoritative chronological records • Hierarchical Year/Month/Date navigation • No message scraping
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openTimelineForMember('JEMP#001')}
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg"
                >
                  Explore JEMP#001 Full Timeline
                </button>
              </div>
            </div>

            {/* Public Share Cards Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#18191c] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">JEMP#001 (Vex Architect)</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Lead
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Repository specifications, cryptographic milestones, and verified wire transfers for P#001.
                </p>
                <button
                  onClick={() => openTimelineForMember('JEMP#001')}
                  className="w-full py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                >
                  Open Timeline Hierarchy →
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#18191c] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">JEMP#002 (Cipher Kai)</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    Security
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Database architecture, client billing reconciliation bot B#002, and financial audits.
                </p>
                <button
                  onClick={() => openTimelineForMember('JEMP#002')}
                  className="w-full py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                >
                  Open Timeline Hierarchy →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: DOCKER & PRODUCTION DEPLOYMENT
           ========================================================================= */}
        {activeTab === 'docker' && <DockerDeployCenter />}

        {/* =========================================================================
            TAB 4: MASTER CANONICAL LEDGER
           ========================================================================= */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-[#111215] border border-zinc-800 space-y-2">
              <h3 className="text-base font-bold text-white">Canonical PostgreSQL Database</h3>
              <p className="text-xs text-zinc-400">
                Single source of truth. All modules reference canonical IDs (JEMP#, B#, P#, HC#, PAY#) without duplicated records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#18191c] border border-zinc-800 space-y-2">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Members Count</span>
                <div className="text-2xl font-bold font-mono text-white">{members.length}</div>
                <p className="text-[11px] text-zinc-500">Permanent identities with assigned JEMP#</p>
              </div>

              <div className="p-4 rounded-xl bg-[#18191c] border border-zinc-800 space-y-2">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Active Projects</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">{projects.length}</div>
                <p className="text-[11px] text-zinc-500">P# initiatives with logged proof of work</p>
              </div>

              <div className="p-4 rounded-xl bg-[#18191c] border border-zinc-800 space-y-2">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Audit Records</span>
                <div className="text-2xl font-bold font-mono text-rose-400">{auditLogs.length}</div>
                <p className="text-[11px] text-zinc-500">Immutable security and status change logs</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. MODALS */}
      <VerifyModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSubmit={handleVerifySubmit}
        defaultEmail="alex.builder@despair.us"
        isSubmitting={verifySubmitting}
        errorMessage={verifyError}
      />

      <TimelineModal
        isOpen={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        jempId={timelineMemberJempId}
        events={timelineEvents}
        onCreateShareLink={handleCreateShareLink}
      />

      {/* New Work Log Modal */}
      {isNewWorkLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1f22] border border-zinc-700 w-full max-w-lg rounded-xl shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Log Official Work Update</h3>
            <form onSubmit={handleLogWorkUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Target Project</label>
                <select
                  value={selectedProjectForLog}
                  onChange={(e) => setSelectedProjectForLog(e.target.value)}
                  className="w-full bg-[#2b2d31] border border-zinc-700 rounded p-2 text-white"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Update Title</label>
                <input
                  type="text"
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  placeholder="e.g. Optimized Docker cold-start layer caching"
                  className="w-full bg-[#2b2d31] border border-zinc-700 rounded p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Technical Description</label>
                <textarea
                  value={newLogDesc}
                  onChange={(e) => setNewLogDesc(e.target.value)}
                  rows={3}
                  placeholder="Explain the architectural outcome..."
                  className="w-full bg-[#2b2d31] border border-zinc-700 rounded p-2 text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewWorkLogModalOpen(false)}
                  className="px-3 py-1.5 rounded text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Record to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Brainstorm Modal */}
      {isNewBrainstormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1f22] border border-zinc-700 w-full max-w-lg rounded-xl shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Create New Brainstorm (#brainstorms)</h3>
            <div className="text-xs text-zinc-400 space-y-3">
              <p>
                Brainstorms receive permanent B# codes. When mature, use <strong>Start Cooking</strong> to
                convert directly into an active P# project with automatic team carryover.
              </p>
              <button
                onClick={async () => {
                  await fetch('/api/brainstorms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: 'Zero-Knowledge Freelancer Escrow Rail',
                      category: 'Fintech & Tooling',
                      description:
                        'Automated cryptographic escrow release on verified GitHub pull request merges.',
                      problemExplored:
                        'Freelance builders need milestone security without manual client bank transfer delays.',
                      creatorDiscordId: currentPersona.id,
                      creatorJempId: currentPersona.jempId || 'JEMP#001',
                    }),
                  });
                  setIsNewBrainstormModalOpen(false);
                  await loadState();
                }}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded"
              >
                Create Sample ZK Escrow Brainstorm
              </button>
              <button
                type="button"
                onClick={() => setIsNewBrainstormModalOpen(false)}
                className="w-full py-1 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
