const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const Settings = require("../../settings.js");
const emoji = require("../../emoji.js");
const fs = require("fs");
const path = require("path");

function loadGiveaways() {
  const filePath = path.join(__dirname, "giveaways.json");
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    try {
      return JSON.parse(fileContent);
    } catch (error) {
      console.error("Error parsing giveaways.json:", error);
      return {};
    }
  } else {
    return {};
  }
}

module.exports = {
  name: "reroll",
  aliases: ["rr"],
  userPerms: ["Manage_Guild"],
  botPerms: ["Embed_Links", "Manage_Messages"],
  run: async (client, message, args) => {
    const prefix = (await client.db8.get(`${message.guild.id}_prefix`)) || Settings.bot.info.prefix;

    const giveaways = loadGiveaways();
    const guildId = message.guild.id;

    if (giveaways[guildId]) {
      const giveawayId = args[0];
      if (!giveawayId) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# ${emoji.id.giveaway} Reroll Giveaway`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${emoji.util.cross} Please provide the ID of the giveaway you want to reroll.\n\n**Usage:** \`${prefix}reroll <message_id>\``
          )
        );
        return message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (!giveaways[guildId][giveawayId]) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# ${emoji.util.cross} Giveaway Not Found`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent("The specified giveaway ID does not exist.")
        );
        return message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      const giveawayData = giveaways[guildId][giveawayId];
      const participants = giveawayData.participants || giveawayData || [];
      
      if (participants.length === 0) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# ${emoji.util.cross} No Participants`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent("There are no participants in this giveaway to reroll.")
        );
        return message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      const newWinnerIndex = Math.floor(Math.random() * participants.length);
      const newWinnerId = participants[newWinnerIndex];

      message.channel.messages
        .fetch(giveawayId)
        .then((giveawayMessage) => {
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# <a:tada:1428686033653858465> New Winner!`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## Reroll Result"),
            new TextDisplayBuilder().setContent(
              `${emoji.util.tick} Congratulations <@${newWinnerId}>!\n\nYou are the new winner of the giveaway!`
            )
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.arrow} Rerolled by **${message.author.username}**`)
          );

          giveawayMessage.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        })
        .catch((error) => {
          console.error("Error fetching giveaway message:", error);
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.util.cross} Error`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("An error occurred while fetching the giveaway message.")
          );
          message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        });
    } else {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.util.cross} No Active Giveaways`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("There are no active giveaways in this server.")
      );
      message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};
