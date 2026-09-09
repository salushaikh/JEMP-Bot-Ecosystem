import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { Member, Brainstorm, Project, Opportunity, PaymentProof, TimelineEvent } from '../types';

export const JEMP_COLORS = {
  CANVAS_BLACK: 0x0a0a0c,
  STEEL_DARK: 0x16181d,
  CRIMSON: 0xe11d48,
  GOLD_AMBER: 0xf59e0b,
  EMERALD: 0x10b981,
  MUTED: 0x71717a,
};

export class JempEmbeds {
  /**
   * 1. VERIFY ME CARD
   * Mandatory: ALWAYS mentions the user in the content/card so they get notified immediately.
   * Disappears once completed.
   */
  public static createVerifyCard(discordUserId: string, username: string) {
    const embed = new EmbedBuilder()
      .setColor(JEMP_COLORS.CRIMSON)
      .setTitle('⚔️ JOBLESS EMPIRE — VERIFICATION PROTOCOL')
      .setDescription(
        `Welcome <@${discordUserId}> to the **Jobless Empire**.\n\n` +
          `> *"Jobless doesn't mean useless. No job. Still building."*\n\n` +
          `You are currently marked as **@Unverified**. To join the private builder collective and receive your permanent **JEMP#** identity, please authenticate your application credentials below.`
      )
      .addFields(
        {
          name: '1. Whitelist Verification',
          value: 'Ensure you submit the exact email address used in your despair.us application.',
          inline: true,
        },
        {
          name: '2. One-Time Protocol',
          value: 'This verification card will **self-destruct immediately** upon successful activation.',
          inline: true,
        },
        {
          name: '3. Identity Allocation',
          value: 'Sequential **JEMP#** badge will be immutably allocated to your profile.',
          inline: false,
        }
      )
      .setFooter({
        text: 'despair.us • Builder Verification Protocol • Immutable Security',
      })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`verify_start_${discordUserId}`)
        .setLabel('Authenticate Whitelist Email')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🛡️'),
      new ButtonBuilder()
        .setCustomId(`verify_help_${discordUserId}`)
        .setLabel('Application Help')
        .setStyle(ButtonStyle.Secondary)
    );

    return {
      content: `<@${discordUserId}> — Verification Required to unlock server channels`,
      embeds: [embed],
      components: [row],
    };
  }

  /**
   * 2. ONBOARDING WELCOME ANNOUNCEMENT (Sent to #onboarding-logs)
   * Safe for public/community display. Never exposes private email or resume.
   */
  public static createWelcomeLogEmbed(member: Member) {
    return new EmbedBuilder()
      .setColor(JEMP_COLORS.GOLD_AMBER)
      .setTitle(`⚔️ WELCOME TO JOBLESS EMPIRE`)
      .setDescription(
        `Please welcome **${member.jempId}** (<@${member.discordUserId}>) to the builder collective.\n\n` +
          `• **Status:** ACTIVE BUILDER\n` +
          `• **Timezone:** ${member.timezone || 'Not Specified'}\n` +
          `• **Role Synchronized:** @Member Granted\n` +
          `• **Proof-of-Work Trail:** Initialized in #profile-manager`
      )
      .setFooter({ text: 'despair.us • Official Onboarding Ledger' })
      .setTimestamp();
  }

  /**
   * 3. PROFILE CARD (#profile-manager)
   */
  public static createProfileCard(
    member: Member,
    stats: { projectsCount: number; brainstormsCount: number; timelineCount: number; oppsCount: number }
  ) {
    const embed = new EmbedBuilder()
      .setColor(JEMP_COLORS.CANVAS_BLACK)
      .setTitle(`⚔️ YOUR JEMP PROFILE — ${member.jempId || 'PENDING'}`)
      .setDescription(
        `**DISCORD:** <@${member.discordUserId}> | \`${member.username}\`\n` +
          `**STATUS:** \`${member.status}\`\n` +
          `**TIMEZONE:** ${member.timezone || 'UTC'}\n\n` +
          `> *"Your work should leave a trail."*`
      )
      .addFields(
        {
          name: 'HR & CREDENTIALS',
          value: `Resume: **${member.resumeCurrent ? 'CURRENT' : 'PENDING'}**\nFile: \`${member.resumeFileName || 'None'}\`\nEmail: \`${member.email || 'Private'}\``,
          inline: true,
        },
        {
          name: 'PROOF OF WORK STATS',
          value: `Projects: **${stats.projectsCount}**\nBrainstorms: **${stats.brainstormsCount}**\nOpportunities: **${stats.oppsCount}**\nTimeline: **${stats.timelineCount} entries**`,
          inline: true,
        }
      )
      .setFooter({ text: 'despair.us • Permanent Identity Matrix' })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`profile_timeline_${member.jempId}`)
        .setLabel('View Timeline')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📜'),
      new ButtonBuilder()
        .setCustomId(`profile_share_${member.jempId}`)
        .setLabel('Create 24h Public Link')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔗'),
      new ButtonBuilder()
        .setCustomId(`profile_export_${member.jempId}`)
        .setLabel('Export Record')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📁'),
      new ButtonBuilder()
        .setCustomId(`profile_resume_${member.jempId}`)
        .setLabel('Update Resume')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📄')
    );

    return { embeds: [embed], components: [row] };
  }

  /**
   * 4. TIMELINE HIERARCHICAL CARD
   */
  public static createTimelineView(
    jempId: string,
    events: TimelineEvent[],
    selectedYear?: number,
    selectedMonth?: number
  ) {
    const isLarge = events.length > 5;
    const embed = new EmbedBuilder()
      .setColor(JEMP_COLORS.STEEL_DARK)
      .setTitle(`📜 OFFICIAL TIMELINE — ${jempId}`)
      .setDescription(
        `Authoritative, immutable proof-of-work ledger.\n` +
          `*Official events only. Never inferred hours or Discord chatter.*`
      );

    if (events.length === 0) {
      embed.addFields({
        name: 'No Events Recorded',
        value: 'Participate in #brainstorms, #projects, or #opportunities to establish proof of work.',
      });
    } else {
      // Group by Year -> Month
      const sampleEvents = events.slice(0, 6);
      for (const evt of sampleEvents) {
        const dateStr = new Date(evt.occurredAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        embed.addFields({
          name: `${dateStr} — ${evt.title}`,
          value: `> ${evt.description}\n\`Source: [${evt.sourceSystem}] | ${evt.authorityClassification}\``,
        });
      }

      if (events.length > 6) {
        embed.setFooter({
          text: `Showing 6 of ${events.length} events • Use hierarchy navigation below to filter`,
        });
      } else {
        embed.setFooter({ text: 'despair.us • Immutable Proof-of-Work' });
      }
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`timeline_share_${jempId}`)
        .setLabel('24h Public Share Link')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🔗'),
      new ButtonBuilder()
        .setCustomId(`timeline_export_json_${jempId}`)
        .setLabel('Export JSON')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`timeline_export_md_${jempId}`)
        .setLabel('Export Markdown')
        .setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row] };
  }

  /**
   * 5. BRAINSTORM CARD (#brainstorms)
   */
  public static createBrainstormCard(brainstorm: Brainstorm) {
    let color = JEMP_COLORS.GOLD_AMBER;
    if (brainstorm.status === "It's Alive") color = JEMP_COLORS.EMERALD;
    if (brainstorm.status === 'Cancelled') color = JEMP_COLORS.MUTED;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🧠 [${brainstorm.code}] ${brainstorm.title}`)
      .setDescription(
        `**DOMAIN:** \`${brainstorm.category}\`\n` +
          `**CREATOR:** ${brainstorm.creatorJempId} (<@${brainstorm.creatorDiscordId}>)\n` +
          `**STATUS:** \`${brainstorm.status}\`\n` +
          `**STATUS REASON:** *${brainstorm.statusReason}*\n\n` +
          `**PROBLEM STATEMENT:**\n> ${brainstorm.problemExplored}\n\n` +
          `**CONCEPT SPECIFICATION:**\n${brainstorm.description}`
      )
      .addFields({
        name: `COLLABORATORS (${brainstorm.participants.length})`,
        value:
          brainstorm.participants.map((p) => `• **${p.jempId}** (${p.role})`).join('\n') || 'None joined yet.',
      })
      .setFooter({
        text: brainstorm.linkedProjectCode
          ? `Graduated to Project ${brainstorm.linkedProjectCode} • despair.us`
          : 'despair.us • Brainstorming Club System',
      })
      .setTimestamp(new Date(brainstorm.createdAt));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`bs_join_${brainstorm.code}`)
        .setLabel('Apply to Collaborate')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🤝'),
      new ButtonBuilder()
        .setCustomId(`bs_cook_${brainstorm.code}`)
        .setLabel('Start Cooking (Convert to P#)')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🍳'),
      new ButtonBuilder()
        .setCustomId(`bs_status_${brainstorm.code}`)
        .setLabel('Update Status')
        .setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row] };
  }

  /**
   * 6. PROJECT CARD (#projects)
   */
  public static createProjectCard(project: Project) {
    let color = JEMP_COLORS.EMERALD;
    if (project.status === 'Paused') color = JEMP_COLORS.GOLD_AMBER;
    if (project.status === 'Cancelled') color = JEMP_COLORS.MUTED;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🛠️ [${project.code}] ${project.title}`)
      .setDescription(
        `**LEAD:** ${project.ownerJempId} (<@${project.ownerDiscordId}>)\n` +
          `**STATUS:** \`${project.status}\`\n` +
          `**STATUS REASON:** *${project.statusReason}*\n` +
          (project.linkedBrainstormCode ? `**ORIGIN BRAINSTORM:** \`${project.linkedBrainstormCode}\`\n` : '') +
          (project.linkedOpportunityCode ? `**LINKED OPPORTUNITY:** \`${project.linkedOpportunityCode}\`\n` : '') +
          `\n**EXECUTIVE SUMMARY:**\n> ${project.corporateDescription}`
      )
      .addFields(
        {
          name: `TEAM (${project.members.length})`,
          value: project.members.map((m) => `• **${m.jempId}** — ${m.role}`).join('\n') || 'None',
          inline: true,
        },
        {
          name: 'RECENT LOGS',
          value:
            project.logs.length > 0
              ? project.logs
                  .slice(-2)
                  .map((l) => `• **${l.type}**: ${l.title}`)
                  .join('\n')
              : 'No work logged yet.',
          inline: true,
        }
      )
      .setFooter({ text: 'despair.us • Project Management System' })
      .setTimestamp(new Date(project.updatedAt));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`proj_work_${project.code}`)
        .setLabel('Log Work Update')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('✍️'),
      new ButtonBuilder()
        .setCustomId(`proj_milestone_${project.code}`)
        .setLabel('Log Milestone')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🚩'),
      new ButtonBuilder()
        .setCustomId(`proj_join_${project.code}`)
        .setLabel('Join Team')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('👥'),
      new ButtonBuilder()
        .setCustomId(`proj_status_${project.code}`)
        .setLabel('Update Status')
        .setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row] };
  }

  /**
   * 7. OPPORTUNITY CARD (#opportunities)
   */
  public static createOpportunityCard(opp: Opportunity) {
    const embed = new EmbedBuilder()
      .setColor(JEMP_COLORS.GOLD_AMBER)
      .setTitle(`💼 [${opp.code}] ${opp.title}`)
      .setDescription(
        `**POSTER:** ${opp.creatorJempId} (<@${opp.creatorDiscordId}>)\n` +
          `**BUDGET:** \`${opp.budget || 'Negotiable'}\`\n` +
          `**REVENUE SHARE:** ${opp.revenueShareInfo || '95% Team / 5% Platform fee'}\n\n` +
          `**PROJECT SCOPE:**\n${opp.description}`
      )
      .addFields(
        {
          name: 'REQUIREMENTS',
          value: opp.requirements.map((r) => `• ${r}`).join('\n') || 'None specified.',
        },
        {
          name: `APPLICANTS (${opp.applicants.length})`,
          value: opp.applicants.map((a) => `• **${a.jempId}** (${a.note})`).join('\n') || 'None yet.',
        }
      )
      .setFooter({ text: 'despair.us • Client & Hiring Opportunities' })
      .setTimestamp(new Date(opp.createdAt));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`opp_apply_${opp.code}`)
        .setLabel('Apply to Work')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝'),
      new ButtonBuilder()
        .setCustomId(`opp_convert_${opp.code}`)
        .setLabel('Convert to P# Project')
        .setStyle(ButtonStyle.Success)
        .setEmoji('⚡')
    );

    return { embeds: [embed], components: [row] };
  }

  /**
   * 8. PAYROLL & PROOF VERIFICATION CARD (#payroll)
   */
  public static createPayrollCard(proof: PaymentProof) {
    let color = JEMP_COLORS.GOLD_AMBER;
    if (proof.status === 'VERIFIED') color = JEMP_COLORS.EMERALD;
    if (proof.status === 'DISPUTED') color = JEMP_COLORS.CRIMSON;

    const platformFee = (proof.clientTotalAmount * 0.05).toFixed(2);
    const teamPool = (proof.clientTotalAmount * 0.95).toFixed(2);

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`💰 [${proof.code}] PROOF OF CLIENT PAYMENT`)
      .setDescription(
        `**PROJECT:** \`${proof.projectCode}\`\n` +
          `**SUBMITTER:** ${proof.submitterJempId}\n` +
          `**PAYMENT TYPE:** \`${proof.proofType}\`\n` +
          `**STATUS:** \`${proof.status}\`\n` +
          `**TX HASH / WIRE REF:** \`${proof.txHashOrRef}\`\n\n` +
          `**DETAILS:**\n> ${proof.details}`
      )
      .addFields(
        {
          name: 'FINANCIAL TRANSPARENCY CALCULATION',
          value:
            `• Gross Client Payment: **${proof.currency} ${proof.clientTotalAmount.toLocaleString()}**\n` +
            `• JEMP Platform Maintenance Fee (5%): **${proof.currency} ${platformFee}**\n` +
            `• Team Distribution Pool (95%): **${proof.currency} ${teamPool}**`,
        },
        {
          name: `TEAM AUDIT REVIEWS (${proof.reviews.length})`,
          value:
            proof.reviews.length > 0
              ? proof.reviews.map((r) => `• **${r.reviewerJempId}**: \`${r.decision}\` (${r.comment})`).join('\n')
              : 'No team reviews logged yet. Approval required before payroll release.',
        }
      )
      .setFooter({ text: 'despair.us • Transparent Payroll & Escrow Audit' })
      .setTimestamp(new Date(proof.createdAt));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`pay_approve_${proof.code}`)
        .setLabel('Approve Proof')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId(`pay_dispute_${proof.code}`)
        .setLabel('Dispute / Request Details')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚠️'),
      new ButtonBuilder()
        .setCustomId(`pay_propose_${proof.code}`)
        .setLabel('Propose Distribution')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊'),
      new ButtonBuilder()
        .setCustomId(`pay_transfer_${proof.code}`)
        .setLabel('Admin Transfer Proof')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💸')
    );

    return { embeds: [embed], components: [row] };
  }
}
