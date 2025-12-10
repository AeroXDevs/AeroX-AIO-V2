const { ChannelType, PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const { ownerIDS } = require('../../dev.json');

module.exports = {
  name: "createinvite",
  aliases: ["ci", "gi", "ginvite", "guildinvite"],
  BotPerms: ['SendMessages', 'CreateInstantInvite', 'ReadMessageHistory', 'EmbedLinks', 'ViewChannel'],
  run: async (client, message, args) => {

    if (!ownerIDS.includes(message.author.id)) return;

    const guild = client.guilds.cache.get(args[0]);

    if (!guild) {
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('Guild not found')
        );
      return await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    }

    const textChannel = guild.channels.cache.find(
      (c) =>
        c.type === ChannelType.GuildText &&
        c
          .permissionsFor(guild.members.me)
          ?.has(
            PermissionFlagsBits.CreateInstantInvite |
            PermissionFlagsBits.SendMessages |
            PermissionFlagsBits.ViewChannel
          )
    );

    if (!textChannel) {
      const noChannelContainer = new ContainerBuilder()
        .setAccentColor(0xFEE75C)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('No suitable channel found')
        );
      return await message.channel.send({ components: [noChannelContainer], flags: MessageFlags.IsComponentsV2 });
    }

    try {
      const invite = await textChannel.createInvite({
        maxAge: 3600,
        maxUses: 0,
        reason: `bot usage`,
      });

      const successContainer = new ContainerBuilder()
        .setAccentColor(0x57F287)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Invite link for ${guild.name}: [Link](${invite.url})`)
        );

      return await message.channel.send({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('An error occurred while creating the invite.')
        );
      console.error('Error creating invite:', error);
      return await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    }
  },
};
