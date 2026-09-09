import React, { useState } from 'react';
import { Terminal, Copy, Check, Server, Database, Shield, Box, FileCode, CheckCircle2 } from 'lucide-react';

export const DockerDeployCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compose' | 'dockerfile' | 'env' | 'cli'>('compose');
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const dockerComposeCode = `version: '3.8'

services:
  # 1. Canonical PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: jemp_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: jemp_db
      POSTGRES_USER: jemp_user
      POSTGRES_PASSWORD: jemp_secure_password_2026
    ports:
      - "5432:5432"
    volumes:
      - jemp_pgdata:/var/lib/postgresql/data
      - ./src/db/schema.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jemp_user -d jemp_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. Unified JEMP Discord Bot & Web Ecosystem
  jemp-bot:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: jemp_discord_bot
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://jemp_user:jemp_secure_password_2026@postgres:5432/jemp_db
      - DISCORD_TOKEN=\${DISCORD_TOKEN}
      - DISCORD_CLIENT_ID=\${DISCORD_CLIENT_ID}
      - DISCORD_GUILD_ID=\${DISCORD_GUILD_ID}
      - ADMIN_ROLE_ID=\${ADMIN_ROLE_ID}
      - MEMBER_ROLE_ID=\${MEMBER_ROLE_ID}
      - UNVERIFIED_ROLE_ID=\${UNVERIFIED_ROLE_ID}
      - VERIFY_CHANNEL_ID=\${VERIFY_CHANNEL_ID}
      - ONBOARDING_LOGS_CHANNEL_ID=\${ONBOARDING_LOGS_CHANNEL_ID}
      - BOT_LOGS_CHANNEL_ID=\${BOT_LOGS_CHANNEL_ID}
      - PROFILE_MANAGER_CHANNEL_ID=\${PROFILE_MANAGER_CHANNEL_ID}
      - BRAINSTORMS_CHANNEL_ID=\${BRAINSTORMS_CHANNEL_ID}
      - PROJECTS_CHANNEL_ID=\${PROJECTS_CHANNEL_ID}
      - OPPORTUNITIES_CHANNEL_ID=\${OPPORTUNITIES_CHANNEL_ID}
      - PAYROLL_CHANNEL_ID=\${PAYROLL_CHANNEL_ID}
      - APP_URL=https://despair.us
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  jemp_pgdata:
    driver: local`;

  const dockerfileCode = `# Multi-stage production build for JEMP Discord Bot
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/schema.sql ./dist/schema.sql
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`;

  const envFileCode = `# .env for JEMP Docker deployment
DISCORD_TOKEN=your_bot_token_from_discord_dev_portal
DISCORD_CLIENT_ID=your_application_client_id
DISCORD_GUILD_ID=your_discord_server_id

# Role IDs (create these in Discord Server Settings > Roles)
ADMIN_ROLE_ID=123456789012345678
MEMBER_ROLE_ID=123456789012345679
UNVERIFIED_ROLE_ID=123456789012345680
SUSPENDED_ROLE_ID=123456789012345681

# Channel IDs
VERIFY_CHANNEL_ID=123456789012345690
ONBOARDING_LOGS_CHANNEL_ID=123456789012345691
PROFILE_MANAGER_CHANNEL_ID=123456789012345692
BRAINSTORMS_CHANNEL_ID=123456789012345693
PROJECTS_CHANNEL_ID=123456789012345694
OPPORTUNITIES_CHANNEL_ID=123456789012345695
PAYROLL_CHANNEL_ID=123456789012345696
APPLICATIONS_CHANNEL_ID=123456789012345697
BOT_LOGS_CHANNEL_ID=123456789012345698

APP_URL=https://despair.us`;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-xl bg-[#111215] border border-zinc-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Docker Production Containerization
              </h3>
              <p className="text-xs text-zinc-400">
                Self-contained, production-grade deployment with PostgreSQL and healthchecks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Docker Ready
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-[#18191c] border border-zinc-800/80 space-y-1">
            <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wider">
              <Server className="w-4 h-4 text-rose-500" />
              Single Bot Ecosystem
            </div>
            <p className="text-xs text-zinc-400">
              One unified Node.js Discord bot process managing all 7 modules without multiple conflicting bots.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#18191c] border border-zinc-800/80 space-y-1">
            <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wider">
              <Database className="w-4 h-4 text-amber-500" />
              Canonical PostgreSQL
            </div>
            <p className="text-xs text-zinc-400">
              Pre-seeded schema with immutable timeline tables, foreign keys, and idempotency constraints.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#18191c] border border-zinc-800/80 space-y-1">
            <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-500" />
              Auto-Recovery & Healthchecks
            </div>
            <p className="text-xs text-zinc-400">
              Graceful restart on crash, background task supervision, and isolated database migrations.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Code Inspector */}
      <div className="rounded-xl bg-[#111215] border border-zinc-800 overflow-hidden shadow-xl">
        {/* Tab Headers */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0c] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('compose')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'compose'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              docker-compose.yml
            </button>
            <button
              onClick={() => setActiveTab('dockerfile')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'dockerfile'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Dockerfile
            </button>
            <button
              onClick={() => setActiveTab('env')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'env'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              .env Production
            </button>
            <button
              onClick={() => setActiveTab('cli')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'cli'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              CLI Quick Start
            </button>
          </div>

          <button
            onClick={() => {
              const text =
                activeTab === 'compose'
                  ? dockerComposeCode
                  : activeTab === 'dockerfile'
                  ? dockerfileCode
                  : activeTab === 'env'
                  ? envFileCode
                  : 'docker compose up -d --build';
              copyText(text, activeTab);
            }}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700"
          >
            {copied === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied === activeTab ? 'Copied' : 'Copy Content'}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-[#0d0e11] overflow-x-auto text-xs font-mono text-zinc-300">
          {activeTab === 'compose' && <pre className="leading-relaxed">{dockerComposeCode}</pre>}
          {activeTab === 'dockerfile' && <pre className="leading-relaxed">{dockerfileCode}</pre>}
          {activeTab === 'env' && <pre className="leading-relaxed">{envFileCode}</pre>}
          {activeTab === 'cli' && (
            <div className="space-y-4 p-2 font-sans">
              <h4 className="text-sm font-bold text-white font-mono">1-Minute Self-Hosting Command</h4>
              <div className="p-3 bg-black rounded-lg border border-zinc-800 flex items-center justify-between font-mono text-emerald-400">
                <code>docker compose up -d --build</code>
                <button
                  onClick={() => copyText('docker compose up -d --build', 'cli-cmd')}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded"
                >
                  {copied === 'cli-cmd' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <p className="font-semibold text-zinc-200">What this automated command does:</p>
                <ol className="list-decimal pl-5 space-y-1.5 text-zinc-400">
                  <li>Starts PostgreSQL container with healthcheck verification</li>
                  <li>Executes canonical schema <code className="text-zinc-200 font-mono">schema.sql</code> automatically on cold-start</li>
                  <li>Compiles TypeScript production bundle into <code className="text-zinc-200 font-mono">dist/server.cjs</code></li>
                  <li>Launches Discord Gateway bot listener and Express REST endpoints</li>
                  <li>Exposes port 3000 for public 24-hour proof-of-work shares (<code className="text-zinc-200 font-mono">/timeline/share/:token</code>)</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
