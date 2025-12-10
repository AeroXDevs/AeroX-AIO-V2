const { PermissionFlagsBits, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { ownerIDS } = require('../../dev.json');
const emoji = require('../../emoji.js');

module.exports = {
  name: "say",
  aliases: ["echo"],
  BotPerms: ['SendMessages', 'EmbedLinks'],
  run: async (client, message, args) => {
    if (!ownerIDS.includes(message.author.id)) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.util.cross} Access Denied`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('This command is restricted to bot owners.')
      );
      return await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    if (args.length === 0) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.util.cross} Missing Message`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('Please provide a message for the bot to say.')
      );
      return await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    const sayMessage = args.join(' ');

    try {
      if (message.guild && message.channel.permissionsFor(client.user).has(PermissionFlagsBits.ManageMessages)) {
        await message.delete();
      }

      await message.channel.send(sayMessage);
    } catch (error) {
      console.error('Error in say command:', error);
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.util.cross} Error`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('An error occurred while executing the command.')
      );
      await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  },
};
