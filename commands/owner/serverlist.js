const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { ownerIDS } = require('../../dev.json');
const emoji = require('../../emoji.js');

module.exports = {
  name: "serverlist",
  aliases: ["srlist"],
  BotPerms: ['EmbedLinks'],
  run: async (client, message, args) => {

    if (!ownerIDS.includes(message.author.id)) return;

    const serversPerPage = 10;

    const guildsArray = Array.from(client.guilds.cache.values());
    const totalGuilds = guildsArray.length;

    let currentPage = 0;

    const totalPages = Math.ceil(totalGuilds / serversPerPage);

    const generateContainer = () => {
      const sortedGuilds = guildsArray.sort((a, b) => b.memberCount - a.memberCount);

      const startIndex = currentPage * serversPerPage;
      const endIndex = startIndex + serversPerPage;
      const currentGuilds = sortedGuilds.slice(startIndex, endIndex);

      const container = new ContainerBuilder();
      
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.information} Server List - Page ${currentPage + 1}/${totalPages}`)
      );
      
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );

      if (currentGuilds.length === 0) {
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('Nothing to show.')
        );
      } else {
        const serverList = currentGuilds
          .map((guild, index) => {
            const memberCount = guild.memberCount.toLocaleString();
            return `\`${startIndex + index + 1}\` - ${guild.name} | ${memberCount} Members | ${guild.id}`;
          })
          .join("\n");

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Total Servers:** ${totalGuilds}\n\n${serverList}`)
        );
      }

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Viewing page ${currentPage + 1} of ${totalPages}*`)
      );

      return container;
    };

    const sortedGuilds = guildsArray.sort((a, b) => b.memberCount - a.memberCount);
    const startIndex = currentPage * serversPerPage;
    const endIndex = startIndex + serversPerPage;
    const currentGuilds = sortedGuilds.slice(startIndex, endIndex);

    const firstButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId("first")
      .setLabel("≪")
      .setDisabled(true)
    const backButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setCustomId("previous")
      .setLabel("Previous")
      .setDisabled(true)
    const cancelButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setCustomId("close")
      .setLabel("Close")
      .setDisabled(false)
    const nextButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setCustomId("next")
      .setLabel("Next")
      .setDisabled(false)
    const lastButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId("last")
      .setLabel("≫")
      .setDisabled(false)

    const pag = new ActionRowBuilder().addComponents(firstButton, backButton, cancelButton, nextButton, lastButton);

    if (totalPages === 1) {
      pag.components.forEach((button) => {
        button.setDisabled(true);
      });
    }

    const msg = await message.channel.send({ components: [generateContainer(), pag], flags: MessageFlags.IsComponentsV2 });

    const collector = msg.createMessageComponentCollector({ filter: (interaction) => interaction.user.id === message.author.id, time: 60000 });

    collector.on("collect", async (interaction) => {
      try {
        if (interaction.customId === "previous") {
          if (currentPage > 0) {
            currentPage--;
          }
        } else if (interaction.customId === "next") {
          if (currentPage < totalPages - 1) {
            currentPage++;
          }
        } else if (interaction.customId === "first") {
          currentPage = 0;
        } else if (interaction.customId === "last") {
          currentPage = totalPages - 1;
        } else if (interaction.customId === "close") {
          collector.stop();
          return;
        }

        const updatedContainer = generateContainer();

        firstButton.setDisabled(currentPage === 0);
        backButton.setDisabled(currentPage === 0);
        nextButton.setDisabled(currentPage === totalPages - 1);
        lastButton.setDisabled(currentPage === totalPages - 1);

        interaction.update({ components: [updatedContainer, pag], flags: MessageFlags.IsComponentsV2 });
      } catch (error) {
        console.error("An error occurred while handling the interaction:", error);
      }
    });

    collector.on("end", () => {
      pag.components.forEach((button) => {
        button.setDisabled(true);
      });

      msg.edit({ components: [generateContainer(), pag], flags: MessageFlags.IsComponentsV2 });
    });
  },
};
