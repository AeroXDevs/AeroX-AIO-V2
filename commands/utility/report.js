const {
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "report",
  BotPerms: ["EmbedLinks"],
  run: async (client, message, args) => {
    const buildReportContainer = (description) => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# Report Form\n${description}`)
      );

      return container;
    };

    const reportMessage = await message.channel.send({
      components: [
        buildReportContainer(
          "Please provide the necessary details for your report below."
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
    });

    const messageCollectorFilter = (msg) => msg.author.id === message.author.id;
    const messageCollector = message.channel.createMessageCollector({
      filter: messageCollectorFilter,
      max: 1,
      time: 60000,
    });

    messageCollector.on("collect", async (collectedMessage) => {
      const userReportContent = collectedMessage.content;
      collectedMessage.delete();

      const containerWithButtons = new ContainerBuilder();

      containerWithButtons.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# Report Form\n${userReportContent}`
        )
      );

      containerWithButtons.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("submit")
            .setLabel("Submit")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger)
        )
      );

      reportMessage.edit({
        components: [containerWithButtons],
        flags: MessageFlags.IsComponentsV2,
      });

      const collectorFilter = (i) =>
        (i.customId === "submit" || i.customId === "cancel") &&
        i.user.id === message.author.id;
      const collector = reportMessage.createMessageComponentCollector({
        filter: collectorFilter,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.customId === "submit") {
          await i.update({
            components: [
              buildReportContainer(
                "Your report has been submitted. Thank you for your feedback!"
              ),
            ],
            flags: MessageFlags.IsComponentsV2,
          });

          const targetChannel = await client.channels.fetch(
            "1232367782985859237"
          );
          const serverName = message.guild
            ? message.guild.name
            : "Direct Messages";
          const authorInfo = `User: ${message.author.tag} (${message.author.id})\nServer: ${serverName}\n\nComplain: ${userReportContent}`;

          const reportContainer = new ContainerBuilder();
          reportContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Report\n${authorInfo}`)
          );

          targetChannel.send({
            components: [reportContainer],
            flags: MessageFlags.IsComponentsV2,
          });
        } else if (i.customId === "cancel") {
          await i.update({
            components: [
              buildReportContainer("Report submission has been canceled."),
            ],
            flags: MessageFlags.IsComponentsV2,
          });
        }
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          reportMessage.edit({
            components: [
              buildReportContainer(
                "Please provide the necessary details for your report below."
              ),
            ],
            flags: MessageFlags.IsComponentsV2,
          });
        }
      });
    });

    messageCollector.on("end", (collected) => {
      if (collected.size === 0) {
        reportMessage.edit({
          components: [
            buildReportContainer(
              "Please provide the necessary details for your report below."
            ),
          ],
          flags: MessageFlags.IsComponentsV2,
        });
      }
    });
  },
};
