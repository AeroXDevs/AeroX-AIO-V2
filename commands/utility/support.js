const {
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "support",
  run: async (client, message, args) => {
    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# Support Server\n*Join our support server for help and updates*`
      )
    );

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Support Server")
          .setStyle("Link")
          .setURL("https://discord.gg/8wfT8SfB5Z")
      )
    );

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
