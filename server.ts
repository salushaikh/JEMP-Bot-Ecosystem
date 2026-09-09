import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { jempStore } from './src/db/store';
import { jempBot } from './src/bot/client';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ==============================================================================
// REST API ENDPOINTS
// ==============================================================================

// 1. Health & Bot Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    ecosystem: 'Jobless Empire (despair.us)',
    bot: jempBot.getStatus(),
    timestamp: new Date().toISOString(),
  });
});

// 2. Full State for Live Interactive Discord Terminal & Simulator
app.get('/api/state', (req, res) => {
  res.json({
    members: jempStore.getAllMembers(),
    whitelist: jempStore.getWhitelist(),
    brainstorms: jempStore.getAllBrainstorms(),
    projects: jempStore.getAllProjects(),
    opportunities: jempStore.getAllOpportunities(),
    paymentProofs: jempStore.getAllPaymentProofs(),
    adminTransfers: jempStore.getAllAdminTransfers(),
    auditLogs: jempStore.getAuditLogs().slice(0, 50),
    botStatus: jempBot.getStatus(),
  });
});

// 3. Member Verification Workflow Endpoint
app.post('/api/verify', (req, res) => {
  const { discordUserId, username, email, timezone, resumeFileName } = req.body;

  if (!discordUserId || !email) {
    return res.status(400).json({ error: 'discordUserId and email are required' });
  }

  // Ensure member exists in pending state
  jempStore.createPendingMember(discordUserId, username || 'NewApplicant');

  const result = jempStore.verifyAndActivateMember(
    discordUserId,
    email,
    timezone || 'UTC',
    resumeFileName
  );

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    member: result.member,
    cardDisappeared: true, // Signals UI to remove the one-use card
    message: `Verification complete. Granted @Member role and assigned ${result.member?.jempId}. One-use verification card removed.`,
  });
});

// 4. Whitelist Management (Admin)
app.get('/api/whitelist', (req, res) => {
  res.json(jempStore.getWhitelist());
});

app.post('/api/whitelist', (req, res) => {
  const { email, fullName, joblessStatusConfirmed, notes, approvedBy } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: 'email and fullName are required' });
  }

  const newEntry = jempStore.addWhitelistApplicant({
    email,
    fullName,
    joblessStatusConfirmed: Boolean(joblessStatusConfirmed),
    approvedBy: approvedBy || 'Admin_Console',
    notes,
  });

  res.json({ success: true, applicant: newEntry });
});

// 5. Timeline & Public 24h Share Links
app.get('/api/timeline/member/:jempId', (req, res) => {
  const events = jempStore.getTimelineEventsForMember(req.params.jempId);
  res.json(events);
});

app.post('/api/timeline/share', (req, res) => {
  const { jempId } = req.body;
  if (!jempId) return res.status(400).json({ error: 'jempId is required' });

  const share = jempStore.createTimelineShare(jempId);
  if (!share) return res.status(404).json({ error: 'Member not found' });

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const shareUrl = `${protocol}://${host}/timeline/share/${share.token}`;

  res.json({
    success: true,
    share,
    shareUrl,
  });
});

app.get('/api/timeline/share/:token', (req, res) => {
  const result = jempStore.getTimelineShareByToken(req.params.token);
  if (!result) {
    return res.status(404).json({ error: 'Timeline share token expired, revoked, or invalid.' });
  }
  res.json(result);
});

// 6. Brainstorm Actions
app.post('/api/brainstorms', (req, res) => {
  const { title, category, description, problemExplored, creatorDiscordId, creatorJempId } = req.body;
  if (!title || !category || !description || !problemExplored) {
    return res.status(400).json({ error: 'Missing required brainstorm fields' });
  }

  const brainstorm = jempStore.createBrainstorm(
    title,
    category,
    description,
    problemExplored,
    creatorDiscordId || 'user_101',
    creatorJempId || 'JEMP#001'
  );

  res.json({ success: true, brainstorm });
});

app.post('/api/brainstorms/cook', (req, res) => {
  const { brainstormCode, corporateDescription, actorDiscordId } = req.body;
  if (!brainstormCode) return res.status(400).json({ error: 'brainstormCode is required' });

  const project = jempStore.convertBrainstormToProject(
    brainstormCode,
    corporateDescription || 'Graduated from ideation to active execution.',
    actorDiscordId || 'user_101'
  );

  if (!project) return res.status(404).json({ error: 'Brainstorm not found' });
  res.json({ success: true, project });
});

// 7. Projects & Work Updates
app.post('/api/projects/log', (req, res) => {
  const { projectCode, authorDiscordId, authorJempId, type, title, description } = req.body;
  if (!projectCode || !title || !description) {
    return res.status(400).json({ error: 'projectCode, title, description are required' });
  }

  const log = jempStore.addProjectLog(
    projectCode,
    authorDiscordId || 'user_101',
    authorJempId || 'JEMP#001',
    type || 'WORK_UPDATE',
    title,
    description
  );

  if (!log) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true, log });
});

// 8. Payroll Actions
app.post('/api/payroll/proof', (req, res) => {
  const { projectCode, submitterJempId, proofType, clientTotalAmount, currency, details, txHashOrRef } = req.body;
  if (!projectCode || !clientTotalAmount || !details || !txHashOrRef) {
    return res.status(400).json({ error: 'Missing required payment proof fields' });
  }

  const proof = jempStore.createPaymentProof(
    projectCode,
    submitterJempId || 'JEMP#001',
    proofType || 'MILESTONE',
    Number(clientTotalAmount),
    currency || 'USD',
    details,
    txHashOrRef
  );

  if (!proof) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true, proof });
});

app.post('/api/payroll/review', (req, res) => {
  const { proofCode, reviewerJempId, decision, comment } = req.body;
  const updated = jempStore.reviewPaymentProof(
    proofCode,
    reviewerJempId || 'JEMP#002',
    decision || 'APPROVE',
    comment || 'Approved by team member'
  );

  if (!updated) return res.status(404).json({ error: 'Proof not found' });
  res.json({ success: true, proof: updated });
});

// ==============================================================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==============================================================================

async function startServer() {
  // Start Discord Bot (Gateway connection if token configured)
  await jempBot.start();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JEMP Server] Ecosystem server running on port ${PORT}`);
  });
}

startServer();
