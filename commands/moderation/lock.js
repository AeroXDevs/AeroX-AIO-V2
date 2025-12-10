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
  name: "lock",
  UserPerms: ["ManageChannels"],
  BotPerms: ["EmbedLinks", "ManageRoles"],
  run: async function (client, message, args) {
    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]) ||
      message.channel;

    if (channel.type === ChannelType.GuildVoice) {
      channel.permissionOverwrites.edit(message.guild.id, {
        Connect: false,
        reason: `${message.author.tag} (${message.author.id})`,
      });

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔒 Voice Channel Locked')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} ${channel} has been securely locked. Users cannot join the voice channel.`)
      );
      
      let msg = await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      setTimeout(() => {
        message.delete();
        msg.delete().catch(() => {});
      }, 5000);
    } else {
      channel.permissionOverwrites.edit(message.guild.id, {
        SendMessages: false,
        reason: `${message.author.tag} (${message.author.id})`,
      });

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔒 Channel Locked')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} ${channel} has been securely locked. Users cannot send messages.`)
      );
      
      const msg = await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      setTimeout(() => {
        message.delete();
        msg.delete().catch(() => {});
      }, 5000);
    }
  },
};
