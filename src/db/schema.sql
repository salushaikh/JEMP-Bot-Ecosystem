-- ==============================================================================
-- JOBLESS EMPIRE (JEMP) CANONICAL POSTGRESQL SCHEMA (despair.us)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(64) PRIMARY KEY,
    discord_user_id VARCHAR(64) UNIQUE NOT NULL,
    username VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    jemp_id VARCHAR(32) UNIQUE,
    email VARCHAR(255) UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    timezone VARCHAR(64),
    resume_current BOOLEAN NOT NULL DEFAULT FALSE,
    resume_file_name VARCHAR(255),
    status_reason TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_whitelist (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    jobless_status_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    resume_file_name VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
    approved_by VARCHAR(64) NOT NULL,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS timeline_events (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) UNIQUE NOT NULL,
    member_id VARCHAR(64) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    jemp_id VARCHAR(32) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source_system VARCHAR(32) NOT NULL,
    source_event_id VARCHAR(64) NOT NULL,
    source_entity_type VARCHAR(64),
    source_entity_id VARCHAR(64),
    source_entity_name VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    visibility VARCHAR(32) NOT NULL DEFAULT 'PUBLIC',
    authority_classification VARCHAR(64) NOT NULL DEFAULT 'VERIFIED_OFFICIAL',
    immutable BOOLEAN NOT NULL DEFAULT TRUE,
    correction_ref_id VARCHAR(64),
    CONSTRAINT uk_source_event UNIQUE (source_system, source_event_id)
);

CREATE TABLE IF NOT EXISTS timeline_shares (
    id VARCHAR(64) PRIMARY KEY,
    token VARCHAR(128) UNIQUE NOT NULL,
    token_hash VARCHAR(128) UNIQUE NOT NULL,
    member_id VARCHAR(64) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    jemp_id VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    views_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS brainstorms (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL, -- e.g. B#001
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    problem_explored TEXT NOT NULL,
    creator_discord_id VARCHAR(64) NOT NULL,
    creator_jemp_id VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Brainstorming',
    status_reason TEXT,
    linked_project_code VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brainstorm_members (
    id VARCHAR(64) PRIMARY KEY,
    brainstorm_id VARCHAR(64) NOT NULL REFERENCES brainstorms(id) ON DELETE CASCADE,
    discord_id VARCHAR(64) NOT NULL,
    jemp_id VARCHAR(32) NOT NULL,
    role VARCHAR(64) NOT NULL DEFAULT 'Collaborator',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL, -- e.g. P#001
    title VARCHAR(255) NOT NULL,
    corporate_description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'In Progress',
    status_reason TEXT,
    owner_discord_id VARCHAR(64) NOT NULL,
    owner_jemp_id VARCHAR(32) NOT NULL,
    linked_brainstorm_code VARCHAR(32),
    linked_opportunity_code VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    discord_id VARCHAR(64) NOT NULL,
    jemp_id VARCHAR(32) NOT NULL,
    username VARCHAR(128) NOT NULL,
    role VARCHAR(64) NOT NULL DEFAULT 'Builder',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_logs (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_code VARCHAR(32) NOT NULL,
    author_discord_id VARCHAR(64) NOT NULL,
    author_jemp_id VARCHAR(32) NOT NULL,
    log_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunities (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL, -- e.g. HC#001
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]'::jsonb,
    budget VARCHAR(128),
    revenue_share_info TEXT,
    creator_discord_id VARCHAR(64) NOT NULL,
    creator_jemp_id VARCHAR(32) NOT NULL,
    linked_project_code VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_proofs (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL, -- e.g. PAY#001
    project_id VARCHAR(64) NOT NULL,
    project_code VARCHAR(32) NOT NULL,
    submitter_jemp_id VARCHAR(32) NOT NULL,
    proof_type VARCHAR(32) NOT NULL,
    client_total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'USD',
    details TEXT NOT NULL,
    tx_hash_or_ref VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proof_reviews (
    id VARCHAR(64) PRIMARY KEY,
    proof_id VARCHAR(64) NOT NULL REFERENCES payment_proofs(id) ON DELETE CASCADE,
    reviewer_jemp_id VARCHAR(32) NOT NULL,
    decision VARCHAR(32) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenue_distributions (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_code VARCHAR(32) NOT NULL,
    proposer_jemp_id VARCHAR(32) NOT NULL,
    platform_fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    distributions JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_transfers (
    id VARCHAR(64) PRIMARY KEY,
    project_code VARCHAR(32) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'USD',
    payment_mode VARCHAR(32) NOT NULL,
    tx_reference VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'AWAITING_PAYMENT',
    submitted_by_jemp_id VARCHAR(32) NOT NULL,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    action VARCHAR(128) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_type VARCHAR(32) NOT NULL DEFAULT 'SYSTEM',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
