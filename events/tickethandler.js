const fs = require('fs');
const path = require('path');
const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MediaGalleryBuilder, MediaGalleryItemBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType, MessageFlags } = require('discord.js');
const winston = require('winston');

const ticketDbPath = path.join(__dirname, 'ticketdb.json');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

function readTicketDb() {
  if (!fs.existsSync(ticketDbPath)) {
    return {};
  }

  const rawData = fs.readFileSync(ticketDbPath);
  if (rawData.length === 0) {
    return {};
  }

  return JSON.parse(rawData);
}

function writeTicketDb(data) {
  fs.writeFileSync(ticketDbPath, JSON.stringify(data, null, 2));
}

class TicketHandler {
  constructor(client) {
    this.client = client;
  }

  async createTicketPanel(interaction, ticketPanelData) {
    try {
      const { category, description, buttonLabel, supportRole, ticketChannel, ticketOpenMessage, ticketCloseMessage } = ticketPanelData;

      const supportRoleObj = interaction.guild.roles.cache.get(supportRole);
      if (!supportRoleObj) {
        logger.error(`Support role with ID ${supportRole} not found in the server ${interaction.guildId}.`);
        return interaction.reply({ content: 'The support role for this ticket panel could not be found.', flags: MessageFlags.Ephemeral });
      }

      const ticketChannelObj = interaction.guild.channels.cache.get(ticketChannel);
      if (!ticketChannelObj) {
        logger.error(`Ticket channel with ID ${ticketChannel} not found in the server ${interaction.guildId}.`);
        return interaction.reply({ content: 'The ticket channel for this panel could not be found.', flags: MessageFlags.Ephemeral });
      }

      const panelContainer = new ContainerBuilder();
      
      panelContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Welcome to Support of ${interaction.guild.name}**`)
      );
      
      panelContainer.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      
      panelContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(description)
      );
      
      panelContainer.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL("https://cdn.discordapp.com/attachments/1414256332592254986/1415398785412104222/Galaxy_Background_General_Twitch_Banner_20250910_234555_0001_1.gif")
            .setDescription("Support Panel")
        )
      );

      const panelButton = new ButtonBuilder()
        .setCustomId('ticket-create')
        .setLabel(buttonLabel)
        .setStyle(ButtonStyle.Primary);

      const panelRow = new ActionRowBuilder().addComponents(panelButton);
      
      panelContainer.addActionRowComponents(panelRow);

      
      await ticketChannelObj.send({ components: [panelContainer], flags: MessageFlags.IsComponentsV2 });

      const ticketDb = readTicketDb();
      ticketDb[interaction.guildId] = {
        category,
        supportRole: supportRole,
        ticketChannel: ticketChannel,
        ticketOpenMessage,
        ticketCloseMessage,
      };
      writeTicketDb(ticketDb);

      logger.info(`Ticket panel created in guild ${interaction.guildId}`);
      interaction.reply({ content: 'Panel sent', flags: MessageFlags.Ephemeral });
    } catch (error) {
      logger.error('Error creating ticket panel:', error);
      await interaction.reply({ content: 'An error occurred while creating the ticket panel. Please try again later.', flags: MessageFlags.Ephemeral });
    }
  }

  async handleTicketInteraction(interaction) {
    console.log('Handling ticket interaction'); 
    try {
      const ticketPanelData = this.getTicketPanelData(interaction.guildId);
      if (!ticketPanelData) {
        logger.error(`Ticket panel configuration not found for guild ${interaction.guildId}`);
        return interaction.reply({ content: 'The ticket panel configuration could not be found.', flags: MessageFlags.Ephemeral });
      }

      if (interaction.customId.startsWith('ticket-create')) {
        await this.openTicket(interaction, ticketPanelData);
      } else if (interaction.customId === 'ticket-close') {
        await this.closeTicket(interaction, ticketPanelData);
      }
    } catch (error) {
      logger.error('Error handling ticket interaction:', error);
      await interaction.reply({ content: 'An error occurred while processing your request. Please try again later.', flags: MessageFlags.Ephemeral });
    }
  }

  getTicketPanelData(guildId) {
    const ticketDb = readTicketDb();
    return ticketDb[guildId] || null;
  }

  async openTicket(interaction, ticketPanelData) {
    try {
      const existingTickets = readTicketDb();
      const ticketKey = `${interaction.guildId}-${ticketPanelData.category}-${interaction.user.id}`;
      if (existingTickets[ticketKey]) {
        logger.info('User already has an open ticket');
        return interaction.reply({ content: 'You already have an open ticket. Please use that one.', flags: MessageFlags.Ephemeral });
      }

      const supportRole = interaction.guild.roles.cache.get(ticketPanelData.supportRole);
      if (!supportRole) {
        logger.error(`Support role with ID ${ticketPanelData.supportRole} not found in the server ${interaction.guildId}.`);
        return interaction.reply({ content: 'The support role for this ticket panel could not be found.', flags: MessageFlags.Ephemeral });
      }

      logger.info('Creating new ticket channel');
      const channel = await interaction.guild.channels.create({
        name: `${ticketPanelData.category}-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ReadMessageHistory],
          },
          {
            id: interaction.client.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ReadMessageHistory],
          },
          {
            id: ticketPanelData.supportRole,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ReadMessageHistory],
          },
        ],
      });
      interaction.reply({ content: `Ticket created in ${channel}`, flags: MessageFlags.Ephemeral });

      logger.info('Creating new ticket container');
      const ticketContainer = new ContainerBuilder();
      
      ticketContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Ticket - ${ticketPanelData.category}**`)
      );
      
      ticketContainer.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      
      ticketContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${supportRole.toString()}, ${interaction.user} has opened a new ticket.\n\n**Topic:** ${ticketPanelData.ticketOpenMessage}\n\n**Ticket created by:** ${interaction.user.username}`)
      );
      
      ticketContainer.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL("https://cdn.discordapp.com/attachments/1414256332592254986/1415398785412104222/Galaxy_Background_General_Twitch_Banner_20250910_234555_0001_1.gif")
            .setDescription(`${ticketPanelData.category} Ticket`)
        )
      );

      logger.info('Creating new ticket button');
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket-close')
          .setLabel('Delete Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('<:nwrong:1428686674786783294>')
      );
      
      ticketContainer.addActionRowComponents(row);

      logger.info('Sending ticket message');
      await channel.send({ components: [ticketContainer], flags: MessageFlags.IsComponentsV2 });

      logger.info('Storing ticket information in database');
      existingTickets[ticketKey] = channel.id;
      writeTicketDb(existingTickets);

      logger.info('Replying to user');
      await interaction.reply({ content: `Your ticket has been created in ${channel}`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      logger.error('Error opening ticket:', error);
      await interaction.reply({ content: 'An error occurred while creating your ticket. Please try again later.', flags: MessageFlags.Ephemeral });
    }
  }

  async closeTicket(interaction, ticketPanelData) {
    try {
      const existingTickets = readTicketDb();
      const ticketChannelId = interaction.channel.id;
      const ticketEntry = Object.entries(existingTickets).find(([key, id]) => id === ticketChannelId);

      if (!ticketEntry) {
        logger.info('Ticket channel not found in the database');
        return interaction.reply({ content: 'The ticket channel could not be found.', flags: MessageFlags.Ephemeral });
      }

      const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
      const isManager = interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild);
      const supportRole = interaction.guild.roles.cache.get(ticketPanelData.supportRole);
      const isSupportRole = supportRole && interaction.member.roles.cache.has(supportRole.id);

      if (!isAdmin && !isManager && !isSupportRole) {
        logger.info('User does not have permission to close the ticket');
        return interaction.reply({ content: 'You do not have permission to close this ticket.', flags: MessageFlags.Ephemeral });
      }

      const closeContainer = new ContainerBuilder();
      
      closeContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Ticket Closed**`)
      );
      
      closeContainer.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      
      closeContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`The ticket has been closed by ${interaction.user}.\n\n**Reason:** ${ticketPanelData.ticketCloseMessage}\n\n**Ticket closed by:** ${interaction.user.username}`)
      );

      await interaction.reply({ components: [closeContainer], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
      
      setTimeout(async () => {
        await interaction.channel.delete();
        delete existingTickets[ticketEntry[0]];
        writeTicketDb(existingTickets);
      }, 3000);
    } catch (error) {
      logger.error('Error closing ticket:', error);
      await interaction.reply({ content: 'An error occurred while closing the ticket. Please try again later.', flags: MessageFlags.Ephemeral });
    }
  }
}

module.exports = TicketHandler;
