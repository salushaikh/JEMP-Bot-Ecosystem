import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  Interaction,
  GuildMember,
  ChannelType,
  TextChannel,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';
import { jempStore } from '../db/store';
import { JempEmbeds } from './embeds';

export class JempDiscordBot {
  private client: Client;
  private isConnected = false;
  private token: string | undefined;

  constructor() {
    this.token = process.env.DISCORD_TOKEN;

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User],
    });

    this.setupEventHandlers();
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      hasToken: Boolean(this.token && this.token.length > 10),
      botTag: this.client.user ? this.client.user.tag : 'JEMP Bot#0000 (Offline)',
      guildsCount: this.client.guilds.cache.size,
    };
  }

  public async start() {
    if (!this.token || this.token.trim() === '' || this.token === 'MY_DISCORD_TOKEN') {
      console.log('[JEMP Bot] DISCORD_TOKEN not provided. Running in high-fidelity simulator mode.');
      return;
    }

    try {
      await this.client.login(this.token);
      this.isConnected = true;
      console.log(`[JEMP Bot] Successfully connected to Discord Gateway as ${this.client.user?.tag}`);
      await this.registerSlashCommands();
    } catch (err: any) {
      console.warn(`[JEMP Bot] Gateway connection notice: ${err.message}. Ready for simulation and runtime.`);
    }
  }

  private setupEventHandlers() {
    this.client.once(Events.ClientReady, (c) => {
      this.isConnected = true;
      console.log(`[JEMP Bot] Ready! Logged in as ${c.user.tag}`);
    });

    /**
     * AUTOMATION: When a member joins the guild
     * 1. Register as PENDING member
     * 2. Send verify card in #verify-me channel
     * 3. MUST mention user so they receive immediate notification!
     */
    this.client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
      try {
        // Register in store
        jempStore.createPendingMember(member.id, member.user.username, member.user.displayAvatarURL());

        const verifyChannelId = process.env.VERIFY_CHANNEL_ID;
        const verifyChannel =
          (verifyChannelId ? member.guild.channels.cache.get(verifyChannelId) : null) ||
          member.guild.channels.cache.find(
            (ch) => ch.name.includes('verify') && ch.type === ChannelType.GuildText
          );

        if (verifyChannel && verifyChannel.isTextBased()) {
          const cardData = JempEmbeds.createVerifyCard(member.id, member.user.username);
          await (verifyChannel as TextChannel).send(cardData);
          console.log(`[JEMP Bot] Sent automated verify card mentioning @${member.user.username} in #${verifyChannel.name}`);
        }
      } catch (err: any) {
        console.error('[JEMP Bot] GuildMemberAdd automation error:', err);
      }
    });

    /**
     * INTERACTIONS (Buttons, Modals, Commands)
     */
    this.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
      try {
        // 1. BUTTON INTERACTIONS
        if (interaction.isButton()) {
          const customId = interaction.customId;

          // A. VERIFY START BUTTON
          if (customId.startsWith('verify_start_')) {
            const targetUserId = customId.replace('verify_start_', '');
            if (interaction.user.id !== targetUserId && !interaction.memberPermissions?.has('Administrator')) {
              await interaction.reply({
                content: '⚠️ This verification card is designated specifically for the pinged user.',
                ephemeral: true,
              });
              return;
            }

            const modal = new ModalBuilder()
              .setCustomId(`verify_modal_submit_${interaction.message.id}`)
              .setTitle('Whitelist Email Authentication');

            const emailInput = new TextInputBuilder()
              .setCustomId('verify_email')
              .setLabel('Applicant Email Address')
              .setPlaceholder('name@despair.us or your application email')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const timezoneInput = new TextInputBuilder()
              .setCustomId('verify_timezone')
              .setLabel('Primary Timezone (e.g. UTC, EST, CET, JST)')
              .setValue('UTC')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const resumeInput = new TextInputBuilder()
              .setCustomId('verify_resume')
              .setLabel('Resume / Portfolio Link or Reference')
              .setPlaceholder('https://linkedin.com/in/... or resume file title')
              .setStyle(TextInputStyle.Short)
              .setRequired(false);

            modal.addComponents(
              new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput),
              new ActionRowBuilder<TextInputBuilder>().addComponents(timezoneInput),
              new ActionRowBuilder<TextInputBuilder>().addComponents(resumeInput)
            );

            await interaction.showModal(modal);
          }

          // B. VERIFY HELP
          else if (customId.startsWith('verify_help_')) {
            await interaction.reply({
              content:
                'ℹ️ **How Onboarding Works at Jobless Empire:**\n\n' +
                '1. You must have applied via https://despair.us and been approved by an administrator.\n' +
                '2. Click **Authenticate Whitelist Email** and input the same email address.\n' +
                '3. If approved, your **JEMP#** identity will be generated and you will be promoted to **@Member**.\n' +
                '4. If you applied recently and your email is not whitelisted yet, please wait for your admin invite confirmation email.',
              ephemeral: true,
            });
          }

          // C. PROFILE TIMELINE VIEW
          else if (customId.startsWith('profile_timeline_')) {
            const jempId = customId.replace('profile_timeline_', '');
            const events = jempStore.getTimelineEventsForMember(jempId);
            const view = JempEmbeds.createTimelineView(jempId, events);
            await interaction.reply({ ...view, ephemeral: true });
          }

          // D. PROFILE 24h SHARE LINK
          else if (customId.startsWith('profile_share_') || customId.startsWith('timeline_share_')) {
            const jempId = customId.replace('profile_share_', '').replace('timeline_share_', '');
            const share = jempStore.createTimelineShare(jempId);
            if (!share) {
              await interaction.reply({ content: '❌ Failed to generate share token. Member not found.', ephemeral: true });
              return;
            }

            const appUrl = process.env.APP_URL || 'https://despair.us';
            const shareUrl = `${appUrl}/timeline/share/${share.token}`;
            await interaction.reply({
              content:
                `🔗 **Authoritative Proof-of-Work Link Generated**\n\n` +
                `URL: \`${shareUrl}\`\n\n` +
                `• **Duration:** Valid for 24 hours (Expires <t:${Math.floor(new Date(share.expiresAt).getTime() / 1000)}:R>)\n` +
                `• **Privacy:** Only official verified events are shared. No Discord IDs, emails, or internal hashes.\n` +
                `• **Recruiters & Partners:** Suitable for professional portfolio and proof of work verification.`,
              ephemeral: true,
            });
          }

          // E. TIMELINE EXPORTS
          else if (customId.startsWith('timeline_export_')) {
            const parts = customId.split('_');
            const format = parts[2]; // json or md
            const jempId = parts[3];
            const events = jempStore.getTimelineEventsForMember(jempId);

            let content = '';
            if (format === 'json') {
              content = '```json\n' + JSON.stringify(events, null, 2).slice(0, 1900) + '\n```';
            } else {
              content =
                `# JOBLESS EMPIRE PROOF-OF-WORK TIMELINE\n**JEMP ID:** ${jempId}\n\n` +
                events
                  .map(
                    (e) =>
                      `### [${new Date(e.occurredAt).toISOString().split('T')[0]}] ${e.title}\n*Source: ${e.sourceSystem} | ${e.authorityClassification}*\n> ${e.description}\n`
                  )
                  .join('\n')
                  .slice(0, 1900);
            }

            await interaction.reply({
              content: `📁 **Timeline Export [${format.toUpperCase()}]**\n${content}`,
              ephemeral: true,
            });
          }

          // F. BRAINSTORM: APPLY
          else if (customId.startsWith('bs_join_')) {
            const code = customId.replace('bs_join_', '');
            const member = jempStore.getMemberByDiscordId(interaction.user.id);
            if (!member || !member.jempId) {
              await interaction.reply({ content: '⚠️ You must complete verification first in #verify-me.', ephemeral: true });
              return;
            }

            const modal = new ModalBuilder()
              .setCustomId(`bs_apply_modal_${code}`)
              .setTitle(`Join Brainstorm ${code}`);

            const noteInput = new TextInputBuilder()
              .setCustomId('bs_apply_role')
              .setLabel('Proposed Contribution / Role')
              .setPlaceholder('e.g. Frontend Architecture, Database Design, Cryptography')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(noteInput));
            await interaction.showModal(modal);
          }

          // G. BRAINSTORM: COOK (Convert to Project)
          else if (customId.startsWith('bs_cook_')) {
            const code = customId.replace('bs_cook_', '');
            const member = jempStore.getMemberByDiscordId(interaction.user.id);
            if (!member || !member.jempId) {
              await interaction.reply({ content: '⚠️ Verification required.', ephemeral: true });
              return;
            }

            const modal = new ModalBuilder()
              .setCustomId(`bs_cook_modal_${code}`)
              .setTitle(`Graduating ${code} to Project`);

            const descInput = new TextInputBuilder()
              .setCustomId('cook_corporate_desc')
              .setLabel('Corporate / Professional Project Description')
              .setPlaceholder('Formal engineering description for the official project ledger...')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true);

            modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(descInput));
            await interaction.showModal(modal);
          }

          // H. PROJECT: LOG WORK
          else if (customId.startsWith('proj_work_')) {
            const code = customId.replace('proj_work_', '');
            const member = jempStore.getMemberByDiscordId(interaction.user.id);
            if (!member || !member.jempId) {
              await interaction.reply({ content: '⚠️ Verification required.', ephemeral: true });
              return;
            }

            const modal = new ModalBuilder()
              .setCustomId(`proj_work_modal_${code}`)
              .setTitle(`Log Work Update for ${code}`);

            const titleInput = new TextInputBuilder()
              .setCustomId('work_title')
              .setLabel('Work Summary Title')
              .setPlaceholder('e.g. Deployed PostgreSQL indexing optimization')
              .setStyle(TextInputStyle.Short)
              .setRequired(true);

            const descInput = new TextInputBuilder()
              .setCustomId('work_desc')
              .setLabel('Detailed Technical Description')
              .setPlaceholder('Explain architectural decisions, modules touched, and outcomes...')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true);

            modal.addComponents(
              new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
              new ActionRowBuilder<TextInputBuilder>().addComponents(descInput)
            );
            await interaction.showModal(modal);
          }

          // I. PAYROLL: APPROVE PROOF
          else if (customId.startsWith('pay_approve_')) {
            const code = customId.replace('pay_approve_', '');
            const member = jempStore.getMemberByDiscordId(interaction.user.id);
            if (!member || !member.jempId) {
              await interaction.reply({ content: '⚠️ Verification required.', ephemeral: true });
              return;
            }

            const updated = jempStore.reviewPaymentProof(code, member.jempId, 'APPROVE', 'Verified by team member.');
            if (!updated) {
              await interaction.reply({ content: '❌ Payment proof not found.', ephemeral: true });
              return;
            }

            const card = JempEmbeds.createPayrollCard(updated);
            await interaction.update(card);
          }
        }

        // 2. MODAL SUBMISSIONS
        else if (interaction.isModalSubmit()) {
          const customId = interaction.customId;

          // A. VERIFICATION MODAL SUBMISSION
          if (customId.startsWith('verify_modal_submit_')) {
            const originalMessageId = customId.replace('verify_modal_submit_', '');
            const email = interaction.fields.getTextInputValue('verify_email');
            const timezone = interaction.fields.getTextInputValue('verify_timezone');
            const resumeNote = interaction.fields.getTextInputValue('verify_resume');

            const result = jempStore.verifyAndActivateMember(
              interaction.user.id,
              email,
              timezone,
              resumeNote
            );

            if (!result.success || !result.member) {
              await interaction.reply({
                content: `❌ **Verification Halted**\n\n${result.error || 'Unknown validation error.'}`,
                ephemeral: true,
              });
              return;
            }

            const verifiedMember = result.member;

            // DISCORD ROLE SYNCHRONIZATION
            try {
              if (interaction.guild && interaction.member) {
                const guildMember = await interaction.guild.members.fetch(interaction.user.id);
                const unverifiedRoleId = process.env.UNVERIFIED_ROLE_ID;
                const memberRoleId = process.env.MEMBER_ROLE_ID;

                if (unverifiedRoleId && guildMember.roles.cache.has(unverifiedRoleId)) {
                  await guildMember.roles.remove(unverifiedRoleId);
                }
                if (memberRoleId) {
                  await guildMember.roles.add(memberRoleId);
                }
              }
            } catch (roleErr) {
              console.warn('[JEMP Bot] Role synchronization note:', roleErr);
            }

            // CRITICAL MANDATE: DELETE / REMOVE THE ONE-USE VERIFY CARD!
            // "Making sure the one use cards like verify me disappears once verification and flow is completed."
            try {
              if (originalMessageId && interaction.channel && 'messages' in interaction.channel) {
                const msg = await (interaction.channel as any).messages.fetch(originalMessageId);
                if (msg) {
                  await msg.delete();
                  console.log(`[JEMP Bot] Successfully deleted one-use verify card ${originalMessageId}`);
                }
              }
            } catch (delErr) {
              // If already deleted or ephemeral, ignore
            }

            // ANNOUNCE IN #onboarding-logs
            try {
              const logsChannelId = process.env.ONBOARDING_LOGS_CHANNEL_ID;
              const logsChannel =
                (logsChannelId && interaction.guild ? interaction.guild.channels.cache.get(logsChannelId) : null) ||
                interaction.guild?.channels.cache.find(
                  (ch) => ch.name.includes('onboarding-logs') && ch.type === ChannelType.GuildText
                );

              if (logsChannel && logsChannel.isTextBased()) {
                await (logsChannel as TextChannel).send({
                  embeds: [JempEmbeds.createWelcomeLogEmbed(verifiedMember)],
                });
              }
            } catch (logErr) {
              console.warn('[JEMP Bot] Onboarding log announcement note:', logErr);
            }

            // FINAL CONFIRMATION (Ephemeral to the user)
            await interaction.reply({
              content:
                `⚔️ **AUTHENTICATION COMPLETE — WELCOME TO JOBLESS EMPIRE**\n\n` +
                `• **Your Permanent Identity:** \`${verifiedMember.jempId}\`\n` +
                `• **Status:** \`ACTIVE\`\n` +
                `• **Roles:** Granted \`@Member\` access to all Empire channels\n\n` +
                `Head over to **#profile-manager** to view your proof-of-work timeline, or jump into **#brainstorms** & **#projects** to start building.`,
              ephemeral: true,
            });
          }

          // B. BRAINSTORM APPLICATION MODAL
          else if (customId.startsWith('bs_apply_modal_')) {
            const code = customId.replace('bs_apply_modal_', '');
            const role = interaction.fields.getTextInputValue('bs_apply_role');
            const member = jempStore.getMemberByDiscordId(interaction.user.id);

            const brainstorm = jempStore.getBrainstorm(code);
            if (brainstorm && member?.jempId) {
              brainstorm.participants.push({
                discordId: interaction.user.id,
                jempId: member.jempId,
                role,
                joinedAt: new Date().toISOString(),
              });
              await interaction.reply({
                content: `✅ Joined brainstorm **${code}** as \`${role}\`. Private collaboration thread accessible.`,
                ephemeral: true,
              });
            }
          }

          // C. BRAINSTORM "START COOKING" CONVERSION
          else if (customId.startsWith('bs_cook_modal_')) {
            const code = customId.replace('bs_cook_modal_', '');
            const corporateDesc = interaction.fields.getTextInputValue('cook_corporate_desc');

            const project = jempStore.convertBrainstormToProject(code, corporateDesc, interaction.user.id);
            if (!project) {
              await interaction.reply({ content: '❌ Failed to graduate brainstorm.', ephemeral: true });
              return;
            }

            await interaction.reply({
              content: `🍳 **Brainstorm ${code} Successfully Graduated to Project ${project.code}!**\n\nOfficial project card dispatched to **#projects**. Team members carried over automatically.`,
              ephemeral: false,
            });
          }

          // D. PROJECT WORK LOG MODAL
          else if (customId.startsWith('proj_work_modal_')) {
            const code = customId.replace('proj_work_modal_', '');
            const title = interaction.fields.getTextInputValue('work_title');
            const desc = interaction.fields.getTextInputValue('work_desc');
            const member = jempStore.getMemberByDiscordId(interaction.user.id);

            if (member?.jempId) {
              jempStore.addProjectLog(code, interaction.user.id, member.jempId, 'WORK_UPDATE', title, desc);
              await interaction.reply({
                content: `✍️ **Work update recorded for ${code}!**\nTitle: *${title}*\n\nAuthoritative proof-of-work entry added to your personal Timeline.`,
                ephemeral: true,
              });
            }
          }
        }

        // 3. SLASH COMMANDS
        else if (interaction.isChatInputCommand()) {
          const { commandName } = interaction;
          const member = jempStore.getMemberByDiscordId(interaction.user.id);

          if (commandName === 'profile') {
            if (!member || !member.jempId) {
              await interaction.reply({
                content: '⚠️ You are not verified yet. Please check #verify-me.',
                ephemeral: true,
              });
              return;
            }
            const card = JempEmbeds.createProfileCard(member, {
              projectsCount: jempStore.getAllProjects().filter((p) => p.members.some((m) => m.jempId === member.jempId)).length,
              brainstormsCount: jempStore.getAllBrainstorms().filter((b) => b.participants.some((p) => p.jempId === member.jempId)).length,
              oppsCount: jempStore.getAllOpportunities().filter((o) => o.creatorJempId === member.jempId).length,
              timelineCount: jempStore.getTimelineEventsForMember(member.jempId).length,
            });
            await interaction.reply({ ...card, ephemeral: true });
          } else if (commandName === 'timeline') {
            if (!member || !member.jempId) {
              await interaction.reply({ content: '⚠️ You are not verified yet.', ephemeral: true });
              return;
            }
            const events = jempStore.getTimelineEventsForMember(member.jempId);
            const view = JempEmbeds.createTimelineView(member.jempId, events);
            await interaction.reply({ ...view, ephemeral: true });
          }
        }
      } catch (interactionErr: any) {
        console.error('[JEMP Bot] Interaction processing error:', interactionErr);
        if (interaction.isRepliable() && !interaction.replied) {
          await interaction.reply({
            content: '❌ An error occurred processing this request. The incident has been recorded.',
            ephemeral: true,
          });
        }
      }
    });
  }

  private async registerSlashCommands() {
    if (!this.token || !process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_GUILD_ID) {
      return;
    }

    const commands = [
      new SlashCommandBuilder().setName('profile').setDescription('View your official JEMP profile and HR status in #profile-manager'),
      new SlashCommandBuilder().setName('timeline').setDescription('View your authoritative proof-of-work timeline'),
      new SlashCommandBuilder().setName('verify').setDescription('Manually invoke the verification workflow in #verify-me'),
    ].map((c) => c.toJSON());

    try {
      const rest = new REST({ version: '10' }).setToken(this.token);
      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
        { body: commands }
      );
      console.log('[JEMP Bot] Registered guild slash commands.');
    } catch (err: any) {
      console.warn('[JEMP Bot] Slash command registration note:', err.message);
    }
  }
}

export const jempBot = new JempDiscordBot();
