const {
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "website",
  aliases: ["web", "invite"],
  run: async (client, message, args) => {
    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${client.user.username}\n*Click the button below to visit our website*`
      )
    );

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Website")
          .setStyle("Link")
          .setURL(client.website || "https://aeroxdev.xyz")
      )
    );

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
