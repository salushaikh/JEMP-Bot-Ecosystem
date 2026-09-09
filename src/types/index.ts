export type MemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export interface Member {
  id: string;
  discordUserId: string;
  username: string;
  avatarUrl?: string;
  jempId?: string; // e.g. JEMP#001
  email?: string;
  status: MemberStatus;
  timezone?: string;
  resumeCurrent: boolean;
  resumeFileName?: string;
  joinedAt: string;
  verifiedAt?: string;
  statusReason?: string;
}

export interface WhitelistApplicant {
  id: string;
  email: string;
  fullName: string;
  joblessStatusConfirmed: boolean;
  resumeFileName?: string;
  status: 'APPROVED' | 'USED' | 'REVOKED';
  approvedBy: string;
  approvedAt: string;
  notes?: string;
}

export type TimelineEventType =
  | 'MEMBER_JOINED'
  | 'EMAIL_VERIFIED'
  | 'RULES_ACCEPTED'
  | 'TIMEZONE_SELECTED'
  | 'JEMP_ASSIGNED'
  | 'MEMBERSHIP_ACTIVATED'
  | 'MEMBERSHIP_SUSPENDED'
  | 'MEMBERSHIP_RESTORED'
  | 'MEMBERSHIP_TERMINATED'
  | 'BRAINSTORM_JOINED'
  | 'BRAINSTORM_CONTRIBUTION'
  | 'BRAINSTORM_MILESTONE'
  | 'BRAINSTORM_COMPLETED'
  | 'BRAINSTORM_LEFT'
  | 'PROJECT_JOINED'
  | 'PROJECT_LEFT'
  | 'PROJECT_REMOVED'
  | 'WORK_UPDATE'
  | 'PROJECT_REPORT'
  | 'MILESTONE_STARTED'
  | 'MILESTONE_COMPLETED'
  | 'PROJECT_INCIDENT'
  | 'PROJECT_COMPLETED'
  | 'OPPORTUNITY_JOINED'
  | 'CLIENT_PROJECT_PARTICIPATION'
  | 'CLIENT_MILESTONE'
  | 'CLIENT_REPORT'
  | 'CLIENT_INCIDENT'
  | 'CLIENT_PROJECT_COMPLETED'
  | 'PAYMENT_VERIFIED'
  | 'PAYMENT_RECEIVED'
  | 'PAYROLL_EVENT'
  | 'ADMIN_CORRECTION';

export interface TimelineEvent {
  id: string;
  eventId: string;
  memberId: string;
  jempId: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  occurredAt: string;
  recordedAt: string;
  sourceSystem: 'MEMBERSHIP' | 'BRAINSTORM' | 'PROJECT' | 'OPPORTUNITY' | 'PAYROLL' | 'ADMIN';
  sourceEventId: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  sourceEntityName?: string;
  metadata?: Record<string, unknown>;
  visibility: 'PUBLIC' | 'COMMUNITY' | 'PRIVATE';
  authorityClassification: 'VERIFIED_OFFICIAL' | 'SYSTEM_GENERATED' | 'ADMIN_AUDITED';
  immutable: boolean;
  correctionRefId?: string;
}

export interface TimelineShare {
  id: string;
  token: string;
  tokenHash: string;
  memberId: string;
  jempId: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  viewsCount: number;
}

export type BrainstormStatus = 'Brainstorming' | 'Cooking' | 'Paused' | 'Cancelled' | "It's Alive";

export interface Brainstorm {
  id: string;
  code: string; // e.g. B#001
  title: string;
  category: string;
  description: string;
  problemExplored: string;
  creatorDiscordId: string;
  creatorJempId: string;
  status: BrainstormStatus;
  statusReason: string;
  linkedProjectCode?: string; // e.g. P#001
  participants: Array<{
    discordId: string;
    jempId: string;
    role: string;
    joinedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'In Progress' | 'Paused' | 'Cancelled' | 'Completed';

export interface ProjectMember {
  discordId: string;
  jempId: string;
  username: string;
  role: string;
  joinedAt: string;
}

export interface ProjectLog {
  id: string;
  projectId: string;
  projectCode: string;
  authorDiscordId: string;
  authorJempId: string;
  type: 'WORK_UPDATE' | 'PROJECT_REPORT' | 'MILESTONE_STARTED' | 'MILESTONE_COMPLETED' | 'PROJECT_INCIDENT';
  title: string;
  description: string;
  createdAt: string;
}

export interface Project {
  id: string;
  code: string; // e.g. P#001
  title: string;
  corporateDescription: string;
  status: ProjectStatus;
  statusReason: string;
  ownerDiscordId: string;
  ownerJempId: string;
  linkedBrainstormCode?: string;
  linkedOpportunityCode?: string;
  members: ProjectMember[];
  logs: ProjectLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  code: string; // e.g. HC#001
  title: string;
  description: string;
  requirements: string[];
  budget?: string;
  revenueShareInfo?: string;
  creatorDiscordId: string;
  creatorJempId: string;
  linkedProjectCode?: string;
  applicants: Array<{
    discordId: string;
    jempId: string;
    note: string;
    appliedAt: string;
  }>;
  createdAt: string;
}

export type ProofStatus = 'PENDING_REVIEW' | 'VERIFIED' | 'DISPUTED';

export interface PaymentProof {
  id: string;
  code: string; // e.g. PAY#001
  projectId: string;
  projectCode: string;
  submitterJempId: string;
  proofType: 'ADVANCE' | 'MILESTONE' | 'FINAL' | 'MAINTENANCE' | 'REVISION';
  clientTotalAmount: number;
  currency: string;
  details: string;
  txHashOrRef: string;
  status: ProofStatus;
  reviews: Array<{
    reviewerJempId: string;
    decision: 'APPROVE' | 'NOT_SATISFIED';
    comment: string;
    timestamp: string;
  }>;
  createdAt: string;
}

export interface DistributionProposal {
  id: string;
  projectId: string;
  projectCode: string;
  proposerJempId: string;
  platformFeePercent: number; // 5% default
  distributions: Array<{
    jempId: string;
    sharePercent: number;
    amount: number;
    reason: string;
  }>;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'DISPUTED';
  reviews: Array<{
    reviewerJempId: string;
    decision: 'APPROVE' | 'NOT_SATISFIED';
    comment?: string;
  }>;
  createdAt: string;
}

export interface AdminTransfer {
  id: string;
  projectCode: string;
  amount: number;
  currency: string;
  paymentMode: 'PAYPAL' | 'CRYPTO' | 'WIRE' | 'BANK' | 'OTHER';
  txReference: string;
  status: 'AWAITING_PAYMENT' | 'CONFIRMED' | 'REJECTED';
  submittedByJempId: string;
  confirmedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorType: 'MEMBER' | 'ADMIN' | 'SYSTEM';
  details: Record<string, unknown>;
  timestamp: string;
}
