const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
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

function saveGiveaways(data) {
  const filePath = path.join(__dirname, "giveaways.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

module.exports = {
  name: "gcancel",
  aliases: ["gcancel"],
  userPerms: ["Manage_Guild"],
  botPerms: ["Embed_Links", "Manage_Messages"],
  run: async (client, message, args) => {
    const giveaways = loadGiveaways();
    const guildId = message.guild.id;

    if (giveaways[guildId]) {
      const giveawayId = args[0];
      if (!giveawayId) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# ${emoji.id.giveaway} End Giveaway`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${emoji.util.cross} Please provide the ID of the giveaway you want to end.\n\n**Usage:** \`gcancel <message_id>\``
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

      delete giveaways[guildId][giveawayId];
      saveGiveaways(giveaways);

      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.util.tick} Giveaway Ended`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `The giveaway with ID **${giveawayId}** has been successfully ended.\n\n**Participants:** ${participants.length}`
        )
      );
      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
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
      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};
