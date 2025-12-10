const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MediaGalleryBuilder, MediaGalleryItemBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const TicketHandler = require('../../events/tickethandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Create a new ticket panel')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('The category of the ticket')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('The description of the ticket panel')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('button-label')
        .setDescription('The label for the ticket button')
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName('support-role')
        .setDescription('The role that can manage the tickets')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('ticket-channel')
        .setDescription('The channel where the tickets will be created')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('ticket-open-message')
        .setDescription('The message that will be sent when a ticket is opened')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('ticket-close-message')
        .setDescription('The message that will be sent when a ticket is closed')
        .setRequired(true)
    ),
    async execute(client, interaction) {
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: 'You need to be an administrator to use this command.', flags: MessageFlags.Ephemeral });
    }

    const ticketHandler = new TicketHandler(interaction.client);
    const category = interaction.options.getString('category');
    const description = interaction.options.getString('description');
    const buttonLabel = interaction.options.getString('button-label');
    const supportRole = interaction.options.getRole('support-role');
    const ticketChannel = interaction.options.getChannel('ticket-channel');
    const ticketOpenMessage = interaction.options.getString('ticket-open-message');
    const ticketCloseMessage = interaction.options.getString('ticket-close-message');

    const ticketPanelData = {
      category,
      description,
      buttonLabel,
      supportRole: supportRole.id,
      ticketChannel: ticketChannel.id,
      ticketOpenMessage,
      ticketCloseMessage,
    };

    await ticketHandler.createTicketPanel(interaction, ticketPanelData);
  },
};
