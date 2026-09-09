import {
  Member,
  WhitelistApplicant,
  TimelineEvent,
  TimelineShare,
  Brainstorm,
  Project,
  ProjectLog,
  Opportunity,
  PaymentProof,
  DistributionProposal,
  AdminTransfer,
  AuditLog,
} from '../types';

class JempStore {
  private members: Map<string, Member> = new Map(); // discordUserId -> Member
  private whitelist: Map<string, WhitelistApplicant> = new Map(); // lowercase email -> WhitelistApplicant
  private timelineEvents: TimelineEvent[] = [];
  private timelineShares: Map<string, TimelineShare> = new Map(); // token -> TimelineShare
  private brainstorms: Map<string, Brainstorm> = new Map(); // code -> Brainstorm
  private projects: Map<string, Project> = new Map(); // code -> Project
  private opportunities: Map<string, Opportunity> = new Map(); // code -> Opportunity
  private paymentProofs: Map<string, PaymentProof> = new Map(); // code -> PaymentProof
  private distributionProposals: Map<string, DistributionProposal> = new Map(); // projectId -> Proposal
  private adminTransfers: AdminTransfer[] = [];
  private auditLogs: AuditLog[] = [];

  // Sequential counters
  private memberCounter = 3;
  private brainstormCounter = 2;
  private projectCounter = 2;
  private opportunityCounter = 1;
  private proofCounter = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Whitelist Applicants ready for instant testing
    const defaultApplicants: WhitelistApplicant[] = [
      {
        id: 'wl_001',
        email: 'alex.builder@despair.us',
        fullName: 'Alex Vance',
        joblessStatusConfirmed: true,
        resumeFileName: 'alex_vance_cv_2026.pdf',
        status: 'APPROVED',
        approvedBy: 'Admin_Lead',
        approvedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        notes: 'Ex-Stripe engineer, wants to collaborate on decentralized finance & rust.',
      },
      {
        id: 'wl_002',
        email: 'dev@despair.us',
        fullName: 'Jordan Lee',
        joblessStatusConfirmed: true,
        resumeFileName: 'jordan_lee_portfolio.pdf',
        status: 'APPROVED',
        approvedBy: 'Admin_Lead',
        approvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        notes: 'Full-stack builder specializing in modern TypeScript UI/UX.',
      },
      {
        id: 'wl_003',
        email: 'sarah.craft@builder.io',
        fullName: 'Sarah Chen',
        joblessStatusConfirmed: true,
        resumeFileName: 'sarah_chen_ai_research.pdf',
        status: 'APPROVED',
        approvedBy: 'Admin_Lead',
        approvedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        notes: 'Systems designer & distributed worker.',
      },
    ];

    for (const applicant of defaultApplicants) {
      this.whitelist.set(applicant.email.toLowerCase(), applicant);
    }

    // 2. Existing Onboarded Members
    const member1: Member = {
      id: 'mem_001',
      discordUserId: 'user_101',
      username: 'vex_architect',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      jempId: 'JEMP#001',
      email: 'founder@despair.us',
      status: 'ACTIVE',
      timezone: 'UTC-5 (EST)',
      resumeCurrent: true,
      resumeFileName: 'vex_architect_core.pdf',
      joinedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      verifiedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    };

    const member2: Member = {
      id: 'mem_002',
      discordUserId: 'user_102',
      username: 'cipher_kai',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      jempId: 'JEMP#002',
      email: 'kai.cipher@despair.us',
      status: 'ACTIVE',
      timezone: 'UTC+1 (CET)',
      resumeCurrent: true,
      resumeFileName: 'cipher_kai_backend.pdf',
      joinedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      verifiedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    };

    const member3: Member = {
      id: 'mem_003',
      discordUserId: 'user_103',
      username: 'nova_pulse',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      jempId: 'JEMP#003',
      email: 'nova@despair.us',
      status: 'ACTIVE',
      timezone: 'UTC+9 (JST)',
      resumeCurrent: true,
      resumeFileName: 'nova_pulse_ui.pdf',
      joinedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      verifiedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    };

    this.members.set(member1.discordUserId, member1);
    this.members.set(member2.discordUserId, member2);
    this.members.set(member3.discordUserId, member3);

    // 3. Seed Authoritative Timeline Events for Member 1 & 2
    const seedEvents: TimelineEvent[] = [
      {
        id: 'tle_001',
        eventId: 'EVT_001',
        memberId: member1.id,
        jempId: 'JEMP#001',
        eventType: 'MEMBER_JOINED',
        title: 'Initial Deployment to Empire',
        description: 'Completed website application and received initial clearance to enter onboarding.',
        occurredAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        recordedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        sourceSystem: 'MEMBERSHIP',
        sourceEventId: 'ONB_001',
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
      },
      {
        id: 'tle_002',
        eventId: 'EVT_002',
        memberId: member1.id,
        jempId: 'JEMP#001',
        eventType: 'EMAIL_VERIFIED',
        title: 'Whitelist Authentication Confirmed',
        description: 'Verified whitelist credential for founder@despair.us. Automated audit signed.',
        occurredAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        recordedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        sourceSystem: 'MEMBERSHIP',
        sourceEventId: 'ONB_002',
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
      },
      {
        id: 'tle_003',
        eventId: 'EVT_003',
        memberId: member1.id,
        jempId: 'JEMP#001',
        eventType: 'JEMP_ASSIGNED',
        title: 'Permanent Identity Assigned: JEMP#001',
        description: 'Assigned sequential permanent identity JEMP#001. Synchronized @Member permissions.',
        occurredAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        recordedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        sourceSystem: 'MEMBERSHIP',
        sourceEventId: 'ONB_003',
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
      },
      {
        id: 'tle_004',
        eventId: 'EVT_004',
        memberId: member1.id,
        jempId: 'JEMP#001',
        eventType: 'PROJECT_JOINED',
        title: 'Initiated Project P#001 (Despair Engine)',
        description: 'Established repository and architectural specifications for headless client.',
        occurredAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        recordedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        sourceSystem: 'PROJECT',
        sourceEventId: 'PRJ_INIT_001',
        sourceEntityType: 'PROJECT',
        sourceEntityId: 'P#001',
        sourceEntityName: 'Despair Engine',
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
      },
      {
        id: 'tle_005',
        eventId: 'EVT_005',
        memberId: member1.id,
        jempId: 'JEMP#001',
        eventType: 'MILESTONE_COMPLETED',
        title: 'Shipped P#001 Milestone 1: Core Gateway',
        description: 'Successfully deployed high-throughput gateway integration layer.',
        occurredAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        recordedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        sourceSystem: 'PROJECT',
        sourceEventId: 'PRJ_MS_001',
        sourceEntityType: 'PROJECT',
        sourceEntityId: 'P#001',
        sourceEntityName: 'Despair Engine',
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
      },
      {
        id: 'tle_006',
        eventId: 'EVT_006',
        memberId: member1.id,
        jempId: 'JEMP#001',
        eventType: 'PAYMENT_VERIFIED',
        title: 'Payment Proof Verified for P#001 ($4,500)',
        description: 'Client milestone payment verified via TX hash 0x7f4...a9c. 5% platform fee recorded.',
        occurredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        recordedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        sourceSystem: 'PAYROLL',
        sourceEventId: 'PAY_PRF_001',
        sourceEntityType: 'PAYMENT_PROOF',
        sourceEntityId: 'PAY#001',
        sourceEntityName: 'Milestone 1 Advance',
        visibility: 'COMMUNITY',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
      },
    ];

    this.timelineEvents.push(...seedEvents);

    // 4. Seed Brainstorm B#001
    const brainstorm1: Brainstorm = {
      id: 'bs_001',
      code: 'B#001',
      title: 'Decentralized Proof-of-Skill Attestation Matrix',
      category: 'Cryptography & Identity',
      description: 'Protocol to mathematically verify software contributions without revealing sensitive proprietary client source code.',
      problemExplored: 'How can unemployed builders prove client impact while respecting strict NDA boundaries?',
      creatorDiscordId: member1.discordUserId,
      creatorJempId: 'JEMP#001',
      status: 'Cooking',
      statusReason: 'Initial RFC accepted. Ready to transition into formal project implementation.',
      linkedProjectCode: 'P#001',
      participants: [
        { discordId: member1.discordUserId, jempId: 'JEMP#001', role: 'Lead Architect', joinedAt: new Date(Date.now() - 86400000 * 40).toISOString() },
        { discordId: member2.discordUserId, jempId: 'JEMP#002', role: 'Cryptographic Reviewer', joinedAt: new Date(Date.now() - 86400000 * 35).toISOString() },
      ],
      createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    };

    const brainstorm2: Brainstorm = {
      id: 'bs_002',
      code: 'B#002',
      title: 'Autonomous Client Billing Reconciliation Bot',
      category: 'Fintech & Tooling',
      description: 'Transparent multi-currency escrow automation for freelance cohorts using zero-knowledge milestones.',
      problemExplored: 'Freelancers frequently wait 60+ days for net-30 client payments. Need trustless milestone release.',
      creatorDiscordId: member2.discordUserId,
      creatorJempId: 'JEMP#002',
      status: 'Brainstorming',
      statusReason: 'Reviewing cross-border banking rails and Stripe connect vs crypto payment splits.',
      participants: [
        { discordId: member2.discordUserId, jempId: 'JEMP#002', role: 'Lead', joinedAt: new Date(Date.now() - 86400000 * 12).toISOString() },
      ],
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    };

    this.brainstorms.set(brainstorm1.code, brainstorm1);
    this.brainstorms.set(brainstorm2.code, brainstorm2);

    // 5. Seed Project P#001
    const project1: Project = {
      id: 'prj_001',
      code: 'P#001',
      title: 'Despair Engine (JEMP Core Infrastructure)',
      corporateDescription: 'Unified builder operating system providing authenticated proof of work, payroll transparency, and developer portfolio generation.',
      status: 'In Progress',
      statusReason: 'Milestone 1 shipped; progressing on automated timeline synchronization.',
      ownerDiscordId: member1.discordUserId,
      ownerJempId: 'JEMP#001',
      linkedBrainstormCode: 'B#001',
      members: [
        { discordId: member1.discordUserId, jempId: 'JEMP#001', username: 'vex_architect', role: 'Lead Engineer', joinedAt: new Date(Date.now() - 86400000 * 30).toISOString() },
        { discordId: member2.discordUserId, jempId: 'JEMP#002', username: 'cipher_kai', role: 'Security Architect', joinedAt: new Date(Date.now() - 86400000 * 28).toISOString() },
      ],
      logs: [
        {
          id: 'log_001',
          projectId: 'prj_001',
          projectCode: 'P#001',
          authorDiscordId: member1.discordUserId,
          authorJempId: 'JEMP#001',
          type: 'MILESTONE_COMPLETED',
          title: 'Vite & Express Bot Runner Architecture Deployed',
          description: 'Constructed isolated sandbox with channel-aware context dispatch and auto-vanishing verification card.',
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
        {
          id: 'log_002',
          projectId: 'prj_001',
          projectCode: 'P#001',
          authorDiscordId: member2.discordUserId,
          authorJempId: 'JEMP#002',
          type: 'WORK_UPDATE',
          title: 'Channel-Aware Command Permissions Audit',
          description: 'Validated that non-admins cannot execute administrative actions in #applications and verified users bypass prompt cards.',
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    };

    this.projects.set(project1.code, project1);

    // 6. Seed Opportunity HC#001
    const opportunity1: Opportunity = {
      id: 'opp_001',
      code: 'HC#001',
      title: 'Full-Stack Performance Optimization for FinTech SaaS',
      description: 'External client project sourced by member. Requires PostgreSQL tuning, Docker container optimization, and React frontend polish.',
      requirements: ['TypeScript / Node.js', 'PostgreSQL indexing & query plans', 'Docker production staging'],
      budget: '$8,000 USD Fixed',
      revenueShareInfo: '95% to project team (pro-rata by milestone), 5% standard JEMP platform maintenance fee.',
      creatorDiscordId: member2.discordUserId,
      creatorJempId: 'JEMP#002',
      linkedProjectCode: 'P#001',
      applicants: [
        { discordId: member3.discordUserId, jempId: 'JEMP#003', note: 'Strong database performance background. Ready to take indexing milestone.', appliedAt: new Date(Date.now() - 86400000 * 3).toISOString() }
      ],
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    };

    this.opportunities.set(opportunity1.code, opportunity1);

    // 7. Seed Payment Proof PAY#001
    const proof1: PaymentProof = {
      id: 'proof_001',
      code: 'PAY#001',
      projectId: project1.id,
      projectCode: project1.code,
      submitterJempId: 'JEMP#001',
      proofType: 'MILESTONE',
      clientTotalAmount: 4500,
      currency: 'USD',
      details: 'Milestone 1 invoice accepted and funded by client. Wire settlement confirmed.',
      txHashOrRef: 'WIRE-US-994821-ACH',
      status: 'VERIFIED',
      reviews: [
        { reviewerJempId: 'JEMP#002', decision: 'APPROVE', comment: 'Wire receipt cross-referenced with bank statement snapshot.', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() }
      ],
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    };

    this.paymentProofs.set(proof1.code, proof1);

    // 8. Seed Distribution Proposal
    const proposal1: DistributionProposal = {
      id: 'prop_001',
      projectId: project1.id,
      projectCode: project1.code,
      proposerJempId: 'JEMP#001',
      platformFeePercent: 5.0,
      distributions: [
        { jempId: 'JEMP#001', sharePercent: 55.0, amount: 2475, reason: 'Architecture lead and core backend gateway implementation.' },
        { jempId: 'JEMP#002', sharePercent: 40.0, amount: 1800, reason: 'Security review, database indexing, and testing suite.' },
      ],
      status: 'APPROVED',
      reviews: [
        { reviewerJempId: 'JEMP#002', decision: 'APPROVE', comment: 'Fair division relative to delivered modules.' }
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    };

    this.distributionProposals.set(project1.id, proposal1);

    // 9. Public share token for JEMP#001
    const share1: TimelineShare = {
      id: 'shr_001',
      token: 'jemp_demo_token_vance_88',
      tokenHash: 'hash_88294719284712',
      memberId: member1.id,
      jempId: 'JEMP#001',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      revoked: false,
      viewsCount: 14,
    };
    this.timelineShares.set(share1.token, share1);

    // Initial audit entry
    this.addAuditLog('SYSTEM_BOOT', 'SYSTEM', 'SYSTEM', { status: 'Database initialized with JEMP canonical seed state' });
  }

  // --- Members ---
  public getMemberByDiscordId(discordUserId: string): Member | undefined {
    return this.members.get(discordUserId);
  }

  public getMemberByJempId(jempId: string): Member | undefined {
    for (const member of this.members.values()) {
      if (member.jempId === jempId) return member;
    }
    return undefined;
  }

  public getAllMembers(): Member[] {
    return Array.from(this.members.values());
  }

  public createPendingMember(discordUserId: string, username: string, avatarUrl?: string): Member {
    const existing = this.members.get(discordUserId);
    if (existing) return existing;

    const newMember: Member = {
      id: `mem_${Date.now()}`,
      discordUserId,
      username,
      avatarUrl,
      status: 'PENDING',
      resumeCurrent: false,
      joinedAt: new Date().toISOString(),
    };
    this.members.set(discordUserId, newMember);
    return newMember;
  }

  public verifyAndActivateMember(
    discordUserId: string,
    email: string,
    timezone: string,
    resumeFileName?: string
  ): { success: boolean; member?: Member; error?: string } {
    const member = this.members.get(discordUserId);
    if (!member) {
      return { success: false, error: 'Member record not found. Please re-enter #verify-me.' };
    }

    // Check whitelist
    const whitelistEntry = this.whitelist.get(email.toLowerCase().trim());
    if (!whitelistEntry) {
      return {
        success: false,
        error: 'Email not whitelisted. Are you sure you applied with this same email? If yes, reply to your invitation email explaining the issue.',
      };
    }

    if (whitelistEntry.status === 'REVOKED') {
      return { success: false, error: 'This email application status has been revoked. Contact despair.us support.' };
    }

    // Generate permanent sequential JEMP#
    this.memberCounter += 1;
    const formattedCounter = String(this.memberCounter).padStart(3, '0');
    const assignedJempId = `JEMP#${formattedCounter}`;

    const now = new Date().toISOString();
    member.email = email;
    member.jempId = assignedJempId;
    member.status = 'ACTIVE';
    member.timezone = timezone;
    member.resumeCurrent = true;
    member.resumeFileName = resumeFileName || whitelistEntry.resumeFileName || 'uploaded_resume.pdf';
    member.verifiedAt = now;

    // Mark whitelist entry used
    whitelistEntry.status = 'USED';

    // Record authoritative Timeline events
    this.addTimelineEvent({
      memberId: member.id,
      jempId: assignedJempId,
      eventType: 'MEMBER_JOINED',
      title: 'Joined Jobless Empire Community',
      description: 'Accepted onboarding invitation to private builder ecosystem.',
      sourceSystem: 'MEMBERSHIP',
      sourceEventId: `EVT_${Date.now()}_JOIN`,
      visibility: 'PUBLIC',
      authorityClassification: 'VERIFIED_OFFICIAL',
      immutable: true,
      occurredAt: member.joinedAt,
    });

    this.addTimelineEvent({
      memberId: member.id,
      jempId: assignedJempId,
      eventType: 'EMAIL_VERIFIED',
      title: 'Email Whitelist Authenticated',
      description: `Verified application credentials for ${email}. Approved by ${whitelistEntry.approvedBy}.`,
      sourceSystem: 'MEMBERSHIP',
      sourceEventId: `EVT_${Date.now()}_EMAIL`,
      visibility: 'PUBLIC',
      authorityClassification: 'VERIFIED_OFFICIAL',
      immutable: true,
      occurredAt: now,
    });

    this.addTimelineEvent({
      memberId: member.id,
      jempId: assignedJempId,
      eventType: 'JEMP_ASSIGNED',
      title: `Permanent Identity Assigned: ${assignedJempId}`,
      description: `Sequential builder identity activated. Discord role synchronized from @Unverified to @Member.`,
      sourceSystem: 'MEMBERSHIP',
      sourceEventId: `EVT_${Date.now()}_JEMP`,
      visibility: 'PUBLIC',
      authorityClassification: 'VERIFIED_OFFICIAL',
      immutable: true,
      occurredAt: now,
    });

    this.addAuditLog('MEMBER_VERIFIED', member.discordUserId, 'MEMBER', {
      jempId: assignedJempId,
      email,
      timezone,
    });

    return { success: true, member };
  }

  public updateMemberStatus(
    discordUserId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED',
    reason: string,
    adminId: string
  ): boolean {
    const member = this.members.get(discordUserId);
    if (!member || !member.jempId) return false;

    member.status = status;
    member.statusReason = reason;

    const eventType =
      status === 'SUSPENDED'
        ? 'MEMBERSHIP_SUSPENDED'
        : status === 'TERMINATED'
        ? 'MEMBERSHIP_TERMINATED'
        : 'MEMBERSHIP_RESTORED';

    this.addTimelineEvent({
      memberId: member.id,
      jempId: member.jempId,
      eventType,
      title: `Membership Status Updated: ${status}`,
      description: `Administrative lifecycle action: ${reason}`,
      sourceSystem: 'ADMIN',
      sourceEventId: `EVT_${Date.now()}_STAT`,
      visibility: 'COMMUNITY',
      authorityClassification: 'ADMIN_AUDITED',
      immutable: true,
      occurredAt: new Date().toISOString(),
    });

    this.addAuditLog('STATUS_CHANGE', adminId, 'ADMIN', {
      targetDiscordId: discordUserId,
      targetJempId: member.jempId,
      newStatus: status,
      reason,
    });

    return true;
  }

  // --- Whitelist ---
  public getWhitelist(): WhitelistApplicant[] {
    return Array.from(this.whitelist.values());
  }

  public addWhitelistApplicant(applicant: Omit<WhitelistApplicant, 'id' | 'approvedAt' | 'status'>): WhitelistApplicant {
    const newEntry: WhitelistApplicant = {
      ...applicant,
      id: `wl_${Date.now()}`,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
    };
    this.whitelist.set(newEntry.email.toLowerCase().trim(), newEntry);
    this.addAuditLog('WHITELIST_ADDED', applicant.approvedBy, 'ADMIN', { email: applicant.email, name: applicant.fullName });
    return newEntry;
  }

  public revokeWhitelist(email: string, adminId: string): boolean {
    const entry = this.whitelist.get(email.toLowerCase().trim());
    if (!entry) return false;
    entry.status = 'REVOKED';
    this.addAuditLog('WHITELIST_REVOKED', adminId, 'ADMIN', { email });
    return true;
  }

  // --- Timeline ---
  public addTimelineEvent(eventData: Omit<TimelineEvent, 'id' | 'eventId' | 'recordedAt'>): TimelineEvent {
    const event: TimelineEvent = {
      ...eventData,
      id: `tle_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventId: `EVT_${Date.now().toString(36).toUpperCase()}`,
      recordedAt: new Date().toISOString(),
    };
    this.timelineEvents.push(event);
    return event;
  }

  public getTimelineEventsForMember(jempId: string): TimelineEvent[] {
    return this.timelineEvents
      .filter((e) => e.jempId === jempId)
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }

  public getAllTimelineEvents(): TimelineEvent[] {
    return [...this.timelineEvents].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }

  // --- Timeline Shares ---
  public createTimelineShare(jempId: string): TimelineShare | null {
    const member = this.getMemberByJempId(jempId);
    if (!member) return null;

    const token = `jemp_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const share: TimelineShare = {
      id: `shr_${Date.now()}`,
      token,
      tokenHash: `hash_${token.slice(0, 10)}`,
      memberId: member.id,
      jempId: member.jempId!,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours
      revoked: false,
      viewsCount: 0,
    };
    this.timelineShares.set(token, share);
    this.addAuditLog('TIMELINE_SHARED', member.discordUserId, 'MEMBER', { jempId, token });
    return share;
  }

  public getTimelineShareByToken(token: string): { share: TimelineShare; member: Member; events: TimelineEvent[] } | null {
    const share = this.timelineShares.get(token);
    if (!share) return null;

    if (share.revoked) return null;
    if (new Date(share.expiresAt).getTime() < Date.now()) return null;

    share.viewsCount += 1;
    const member = this.getMemberByJempId(share.jempId);
    if (!member) return null;

    // Filter to shareable public/community events only (no private data)
    const events = this.getTimelineEventsForMember(share.jempId).filter(
      (e) => e.visibility === 'PUBLIC' || e.visibility === 'COMMUNITY'
    );

    return { share, member, events };
  }

  public revokeTimelineShare(token: string, memberJempId: string): boolean {
    const share = this.timelineShares.get(token);
    if (!share || share.jempId !== memberJempId) return false;
    share.revoked = true;
    return true;
  }

  // --- Brainstorms ---
  public getAllBrainstorms(): Brainstorm[] {
    return Array.from(this.brainstorms.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getBrainstorm(code: string): Brainstorm | undefined {
    return this.brainstorms.get(code);
  }

  public createBrainstorm(
    title: string,
    category: string,
    description: string,
    problemExplored: string,
    creatorDiscordId: string,
    creatorJempId: string
  ): Brainstorm {
    this.brainstormCounter += 1;
    const code = `B#${String(this.brainstormCounter).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const brainstorm: Brainstorm = {
      id: `bs_${Date.now()}`,
      code,
      title,
      category,
      description,
      problemExplored,
      creatorDiscordId,
      creatorJempId,
      status: 'Brainstorming',
      statusReason: 'Initial proposal opened for collaborator intake.',
      participants: [{ discordId: creatorDiscordId, jempId: creatorJempId, role: 'Author', joinedAt: now }],
      createdAt: now,
      updatedAt: now,
    };

    this.brainstorms.set(code, brainstorm);

    // Record timeline
    const member = this.getMemberByDiscordId(creatorDiscordId);
    if (member) {
      this.addTimelineEvent({
        memberId: member.id,
        jempId: creatorJempId,
        eventType: 'BRAINSTORM_JOINED',
        title: `Opened Brainstorm ${code}: ${title}`,
        description: `Exploring domain: ${category}. Problem: ${problemExplored}`,
        sourceSystem: 'BRAINSTORM',
        sourceEventId: `BS_${code}_INIT`,
        sourceEntityType: 'BRAINSTORM',
        sourceEntityId: code,
        sourceEntityName: title,
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
        occurredAt: now,
      });
    }

    this.addAuditLog('BRAINSTORM_CREATED', creatorDiscordId, 'MEMBER', { code, title, category });
    return brainstorm;
  }

  public updateBrainstormStatus(
    code: string,
    status: Brainstorm['status'],
    statusReason: string,
    actorDiscordId: string
  ): Brainstorm | null {
    const brainstorm = this.brainstorms.get(code);
    if (!brainstorm) return null;

    brainstorm.status = status;
    brainstorm.statusReason = statusReason;
    brainstorm.updatedAt = new Date().toISOString();

    this.addAuditLog('BRAINSTORM_STATUS_UPDATED', actorDiscordId, 'MEMBER', { code, status, statusReason });
    return brainstorm;
  }

  public convertBrainstormToProject(
    brainstormCode: string,
    corporateDescription: string,
    actorDiscordId: string
  ): Project | null {
    const brainstorm = this.brainstorms.get(brainstormCode);
    if (!brainstorm) return null;

    // Create project
    this.projectCounter += 1;
    const projectCode = `P#${String(this.projectCounter).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const creatorMember = this.getMemberByDiscordId(actorDiscordId);
    const ownerJempId = creatorMember?.jempId || brainstorm.creatorJempId;

    const project: Project = {
      id: `prj_${Date.now()}`,
      code: projectCode,
      title: brainstorm.title,
      corporateDescription: corporateDescription || brainstorm.description,
      status: 'In Progress',
      statusReason: `Graduated from ${brainstormCode} into active development.`,
      ownerDiscordId: actorDiscordId,
      ownerJempId,
      linkedBrainstormCode: brainstormCode,
      members: brainstorm.participants.map((p) => ({
        discordId: p.discordId,
        jempId: p.jempId,
        username: this.getMemberByDiscordId(p.discordId)?.username || 'Builder',
        role: p.role,
        joinedAt: now,
      })),
      logs: [
        {
          id: `log_${Date.now()}`,
          projectId: `prj_${Date.now()}`,
          projectCode,
          authorDiscordId: actorDiscordId,
          authorJempId: ownerJempId,
          type: 'WORK_UPDATE',
          title: `Project Initialized from Brainstorm ${brainstormCode}`,
          description: `Team carried over. Commencing milestone definitions.`,
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.projects.set(projectCode, project);

    // Update brainstorm
    brainstorm.status = "It's Alive";
    brainstorm.statusReason = `Transformed into active project ${projectCode}`;
    brainstorm.linkedProjectCode = projectCode;
    brainstorm.updatedAt = now;

    // Timeline event
    if (creatorMember) {
      this.addTimelineEvent({
        memberId: creatorMember.id,
        jempId: ownerJempId,
        eventType: 'PROJECT_JOINED',
        title: `Launched Project ${projectCode}: ${project.title}`,
        description: `Project evolved from ideation ${brainstormCode} to build stage.`,
        sourceSystem: 'PROJECT',
        sourceEventId: `PRJ_${projectCode}_START`,
        sourceEntityType: 'PROJECT',
        sourceEntityId: projectCode,
        sourceEntityName: project.title,
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
        occurredAt: now,
      });
    }

    return project;
  }

  // --- Projects ---
  public getAllProjects(): Project[] {
    return Array.from(this.projects.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getProject(code: string): Project | undefined {
    return this.projects.get(code);
  }

  public createProjectDirect(
    title: string,
    corporateDescription: string,
    ownerDiscordId: string,
    ownerJempId: string,
    linkedOpportunityCode?: string
  ): Project {
    this.projectCounter += 1;
    const projectCode = `P#${String(this.projectCounter).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const project: Project = {
      id: `prj_${Date.now()}`,
      code: projectCode,
      title,
      corporateDescription,
      status: 'In Progress',
      statusReason: 'Project repository initialized.',
      ownerDiscordId,
      ownerJempId,
      linkedOpportunityCode,
      members: [
        {
          discordId: ownerDiscordId,
          jempId: ownerJempId,
          username: this.getMemberByDiscordId(ownerDiscordId)?.username || 'Project Lead',
          role: 'Lead Architect',
          joinedAt: now,
        },
      ],
      logs: [],
      createdAt: now,
      updatedAt: now,
    };

    this.projects.set(projectCode, project);

    const member = this.getMemberByDiscordId(ownerDiscordId);
    if (member) {
      this.addTimelineEvent({
        memberId: member.id,
        jempId: ownerJempId,
        eventType: 'PROJECT_JOINED',
        title: `Created Project ${projectCode}: ${title}`,
        description: corporateDescription,
        sourceSystem: 'PROJECT',
        sourceEventId: `PRJ_${projectCode}_INIT`,
        sourceEntityType: 'PROJECT',
        sourceEntityId: projectCode,
        sourceEntityName: title,
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
        occurredAt: now,
      });
    }

    this.addAuditLog('PROJECT_CREATED', ownerDiscordId, 'MEMBER', { projectCode, title });
    return project;
  }

  public addProjectLog(
    projectCode: string,
    authorDiscordId: string,
    authorJempId: string,
    type: ProjectLog['type'],
    title: string,
    description: string
  ): ProjectLog | null {
    const project = this.projects.get(projectCode);
    if (!project) return null;

    const now = new Date().toISOString();
    const log: ProjectLog = {
      id: `log_${Date.now()}`,
      projectId: project.id,
      projectCode,
      authorDiscordId,
      authorJempId,
      type,
      title,
      description,
      createdAt: now,
    };

    project.logs.push(log);
    project.updatedAt = now;

    // Timeline event
    const member = this.getMemberByDiscordId(authorDiscordId) || this.getMemberByJempId(authorJempId);
    if (member) {
      this.addTimelineEvent({
        memberId: member.id,
        jempId: authorJempId,
        eventType: type === 'WORK_UPDATE' ? 'WORK_UPDATE' : 'PROJECT_REPORT',
        title: `[${projectCode}] ${title}`,
        description,
        sourceSystem: 'PROJECT',
        sourceEventId: `LOG_${log.id}`,
        sourceEntityType: 'PROJECT',
        sourceEntityId: projectCode,
        sourceEntityName: project.title,
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
        occurredAt: now,
      });
    }

    return log;
  }

  public updateProjectStatus(
    projectCode: string,
    status: Project['status'],
    statusReason: string,
    actorDiscordId: string
  ): Project | null {
    const project = this.projects.get(projectCode);
    if (!project) return null;

    project.status = status;
    project.statusReason = statusReason;
    project.updatedAt = new Date().toISOString();

    this.addAuditLog('PROJECT_STATUS_UPDATE', actorDiscordId, 'MEMBER', { projectCode, status, statusReason });
    return project;
  }

  public addProjectMember(projectCode: string, discordId: string, jempId: string, role: string): boolean {
    const project = this.projects.get(projectCode);
    if (!project) return false;

    if (project.members.some((m) => m.jempId === jempId)) return true;

    const now = new Date().toISOString();
    const username = this.getMemberByDiscordId(discordId)?.username || 'Builder';
    project.members.push({ discordId, jempId, username, role, joinedAt: now });

    const member = this.getMemberByDiscordId(discordId);
    if (member) {
      this.addTimelineEvent({
        memberId: member.id,
        jempId,
        eventType: 'PROJECT_JOINED',
        title: `Joined ${projectCode} (${project.title}) as ${role}`,
        description: `Admitted to project development group.`,
        sourceSystem: 'PROJECT',
        sourceEventId: `PRJ_JOIN_${projectCode}_${jempId}`,
        sourceEntityType: 'PROJECT',
        sourceEntityId: projectCode,
        sourceEntityName: project.title,
        visibility: 'PUBLIC',
        authorityClassification: 'VERIFIED_OFFICIAL',
        immutable: true,
        occurredAt: now,
      });
    }

    return true;
  }

  // --- Opportunities ---
  public getAllOpportunities(): Opportunity[] {
    return Array.from(this.opportunities.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOpportunity(code: string): Opportunity | undefined {
    return this.opportunities.get(code);
  }

  public createOpportunity(
    title: string,
    description: string,
    requirements: string[],
    budget: string,
    revenueShareInfo: string,
    creatorDiscordId: string,
    creatorJempId: string
  ): Opportunity {
    this.opportunityCounter += 1;
    const code = `HC#${String(this.opportunityCounter).padStart(3, '0')}`;
    const opp: Opportunity = {
      id: `opp_${Date.now()}`,
      code,
      title,
      description,
      requirements,
      budget,
      revenueShareInfo,
      creatorDiscordId,
      creatorJempId,
      applicants: [],
      createdAt: new Date().toISOString(),
    };
    this.opportunities.set(code, opp);
    this.addAuditLog('OPPORTUNITY_CREATED', creatorDiscordId, 'MEMBER', { code, title });
    return opp;
  }

  public applyOpportunity(code: string, discordId: string, jempId: string, note: string): boolean {
    const opp = this.opportunities.get(code);
    if (!opp) return false;
    opp.applicants.push({ discordId, jempId, note, appliedAt: new Date().toISOString() });
    return true;
  }

  // --- Payroll & Proofs ---
  public getAllPaymentProofs(): PaymentProof[] {
    return Array.from(this.paymentProofs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createPaymentProof(
    projectCode: string,
    submitterJempId: string,
    proofType: PaymentProof['proofType'],
    clientTotalAmount: number,
    currency: string,
    details: string,
    txHashOrRef: string
  ): PaymentProof | null {
    const project = this.projects.get(projectCode);
    if (!project) return null;

    this.proofCounter += 1;
    const proofCode = `PAY#${String(this.proofCounter).padStart(3, '0')}`;

    const proof: PaymentProof = {
      id: `proof_${Date.now()}`,
      code: proofCode,
      projectId: project.id,
      projectCode,
      submitterJempId,
      proofType,
      clientTotalAmount,
      currency,
      details,
      txHashOrRef,
      status: 'PENDING_REVIEW',
      reviews: [],
      createdAt: new Date().toISOString(),
    };

    this.paymentProofs.set(proofCode, proof);
    this.addAuditLog('PAYMENT_PROOF_SUBMITTED', submitterJempId, 'MEMBER', { proofCode, projectCode, amount: clientTotalAmount });
    return proof;
  }

  public reviewPaymentProof(
    proofCode: string,
    reviewerJempId: string,
    decision: 'APPROVE' | 'NOT_SATISFIED',
    comment: string
  ): PaymentProof | null {
    const proof = this.paymentProofs.get(proofCode);
    if (!proof) return null;

    proof.reviews.push({
      reviewerJempId,
      decision,
      comment,
      timestamp: new Date().toISOString(),
    });

    if (decision === 'NOT_SATISFIED') {
      proof.status = 'DISPUTED';
    } else if (proof.reviews.filter((r) => r.decision === 'APPROVE').length >= 1) {
      proof.status = 'VERIFIED';

      // Record timeline for verified payment
      const member = this.getMemberByJempId(proof.submitterJempId);
      if (member) {
        this.addTimelineEvent({
          memberId: member.id,
          jempId: proof.submitterJempId,
          eventType: 'PAYMENT_VERIFIED',
          title: `Client Payment Verified for ${proof.projectCode} (${proof.currency} ${proof.clientTotalAmount.toLocaleString()})`,
          description: `Proof reference ${proof.txHashOrRef} validated by team review. Platform 5% fee staged.`,
          sourceSystem: 'PAYROLL',
          sourceEventId: `PAY_${proof.code}`,
          sourceEntityType: 'PAYMENT_PROOF',
          sourceEntityId: proof.code,
          sourceEntityName: proof.projectCode,
          visibility: 'COMMUNITY',
          authorityClassification: 'VERIFIED_OFFICIAL',
          immutable: true,
          occurredAt: new Date().toISOString(),
        });
      }
    }

    return proof;
  }

  public getDistributionProposal(projectId: string): DistributionProposal | undefined {
    return this.distributionProposals.get(projectId);
  }

  public createDistributionProposal(
    projectCode: string,
    proposerJempId: string,
    distributions: DistributionProposal['distributions']
  ): DistributionProposal | null {
    const project = this.projects.get(projectCode);
    if (!project) return null;

    const proposal: DistributionProposal = {
      id: `prop_${Date.now()}`,
      projectId: project.id,
      projectCode,
      proposerJempId,
      platformFeePercent: 5.0,
      distributions,
      status: 'PENDING_APPROVAL',
      reviews: [],
      createdAt: new Date().toISOString(),
    };

    this.distributionProposals.set(project.id, proposal);
    return proposal;
  }

  public submitAdminTransfer(
    projectCode: string,
    amount: number,
    currency: string,
    paymentMode: AdminTransfer['paymentMode'],
    txReference: string,
    submittedByJempId: string
  ): AdminTransfer {
    const transfer: AdminTransfer = {
      id: `tx_${Date.now()}`,
      projectCode,
      amount,
      currency,
      paymentMode,
      txReference,
      status: 'AWAITING_PAYMENT',
      submittedByJempId,
      createdAt: new Date().toISOString(),
    };
    this.adminTransfers.push(transfer);
    return transfer;
  }

  public getAllAdminTransfers(): AdminTransfer[] {
    return [...this.adminTransfers].reverse();
  }

  // --- Audit ---
  public addAuditLog(action: string, actorId: string, actorType: AuditLog['actorType'], details: Record<string, unknown>) {
    this.auditLogs.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      action,
      actorId,
      actorType,
      details,
      timestamp: new Date().toISOString(),
    });
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
}

export const jempStore = new JempStore();
