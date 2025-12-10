const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');
const emoji = require("../../emoji.js");

module.exports = {
  name: "hide",
  UserPerms: ["ManageChannels"],
  BotPerms: ["EmbedLinks", "ManageRoles"],
  run: async function (client, message, args) {
    const channel = getChannel(message, args);

    if (channel.manageable) {
      await channel.permissionOverwrites.edit(message.guild.id, {
        ViewChannel: false,
        reason: `${message.author.tag} (${message.author.id})`,
      });

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🙈 Channel Hidden')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} ${channel} has been successfully hidden from all users.`)
      );
      
      let msg = await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      setTimeout(() => {
        message.delete();
        msg.delete().catch(() => {});
      }, 5000);
    }
  },
};

function getChannel(message, args) {
  return (
    message.mentions.channels.first() ||
    message.guild.channels.cache.get(args[0]) ||
    message.channel
  );
}
