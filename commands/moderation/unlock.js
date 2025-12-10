const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');
const emoji = require("../../emoji.js");
const { ChannelType } = require("discord.js");

module.exports = {
  name: "unlock",
  UserPerms: ["ManageChannels"],
  BotPerms: ["EmbedLinks", "ManageRoles"],
  run: async function (client, message, args) {
    function getChannel(message, args) {
      return (
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[0]) ||
        message.channel
      );
    }

    const channel = getChannel(message, args);

    if (channel.type === ChannelType.GuildVoice) {
      channel.permissionOverwrites.edit(message.guild.id, {
        Connect: true,
        reason: `${message.author.tag} (${message.author.id})`,
      });

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔓 Voice Channel Unlocked')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} ${channel} has been successfully unlocked. Users can now join the voice channel.`)
      );
      
      let msg = await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      setTimeout(() => {
        message.delete();
        msg.delete().catch(() => {});
      }, 5000);
    } else {
      channel.permissionOverwrites.edit(message.guild.id, {
        SendMessages: true,
        reason: `${message.author.tag} (${message.author.id})`,
      });

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔓 Channel Unlocked')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} ${channel} has been successfully unlocked. Users can now send messages.`)
      );
      
      let msg = await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      setTimeout(() => {
        message.delete();
        msg.delete().catch(() => {});
      }, 5000);
    }
  },
};
