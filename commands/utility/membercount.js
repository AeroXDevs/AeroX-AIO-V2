const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "membercount",
  aliases: ["mc"],
  BotPerms: ["EmbedLinks"],
  run: async (client, message, args) => {
    const memberCount = message.guild.memberCount;

    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${message.guild.name}\n**${memberCount}** members`
      )
    );

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
