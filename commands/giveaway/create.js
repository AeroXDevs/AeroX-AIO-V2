const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const Settings = require("../../settings.js");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const emoji = require("../../emoji.js");

module.exports = {
  name: "gcreate",
  aliases: ["giveaway create"],
  userPerms: [PermissionFlagsBits.ManageGuild],
  botPerms: ["Embed_Links", "Manage_Messages", "Add_Reactions", "Read_Message_History"],
  run: async (client, message, args) => {
    const prefix = (await client.db8.get(`${message.guild.id}_prefix`)) || Settings.bot.info.prefix;

    const userPermissions = message.member.permissions;
    if (!userPermissions.has(PermissionFlagsBits.ManageGuild)) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.giveaway} Giveaway Creation`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${emoji.util.cross} You need the \`Manage Guild\` permission to create a giveaway.`
        )
      );
      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const webhookURL = "https://discord.com/api/webhooks/1329483464365576283/tQZYKtT7l_AgYDdkTWOrKvKsbbDQ558X0Foe2BGDvmKNgQMcb5NCKzjYhq83IMGMipJ7";

    async function sendToWebhook(logMessage) {
      try {
        await axios.post(webhookURL, { content: logMessage });
      } catch (error) {
        console.error("Error sending message to webhook:", error);
      }
    }

    if (args.length < 3) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.giveaway} Giveaway Creation`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Usage"),
        new TextDisplayBuilder().setContent(
          `\`${prefix}gcreate <time> <prize> <winners>\`\n\n**Examples:**\n• \`${prefix}gcreate 1d Discord Nitro 2\`\n• \`${prefix}gcreate 2h $50 Amazon Gift Card 1\``
        )
      );
      sendToWebhook(`Usage: \`${prefix}gcreate <time> <prize> <winners>\``);
      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const timeInput = args.shift().toLowerCase();
    const time = parseTime(timeInput);

    if (!time) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.util.cross} Invalid Time Format`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "Please use a valid time format:\n\n**Valid formats:**\n• `s` - seconds\n• `m` - minutes\n• `h` - hours\n• `d` - days\n• `w` - weeks\n\n**Example:** `1d`, `2h`, `30m`"
        )
      );
      sendToWebhook("Invalid time format. Please use a valid time format (e.g., 1d, 2h, 30m).");
      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const prize = args.slice(0, -1).join(" ");
    const winners = parseInt(args[args.length - 1]);

    if (isNaN(winners)) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.util.cross} Invalid Winners Count`)
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("The number of winners must be a valid number.")
      );
      sendToWebhook("The number of winners must be a valid number.");
      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const endDate = new Date(Date.now() + time * 1000);
    const timestamp = `<t:${Math.floor(endDate.getTime() / 1000)}:R>`;

    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# <a:tada:1428686033653858465> ${prize} <a:tada:1428686033653858465>\n*🎉 Giveaway Time! React to enter! 🎉*`
      )
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## Giveaway Details"),
      new TextDisplayBuilder().setContent(
        `${emoji.util.arrow} **Winners:** ${winners}\n${emoji.util.arrow} **Ends At:** ${timestamp}\n${emoji.util.arrow} **Hosted By:** ${message.author}`
      )
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("*Good luck to all participants!*")
    );

    const exportedWinnersCount = winners;
    sendToWebhook(`Exported winners count: ${exportedWinnersCount}`);

    const enterButton = new ButtonBuilder()
      .setCustomId(`giveaway_enter_${message.guild.id}`)
      .setLabel("🎉 Enter Giveaway")
      .setStyle(ButtonStyle.Success);

    const buttonRow = new ActionRowBuilder().addComponents(enterButton);

    const sentMessage = await message.channel.send({
      components: [container, buttonRow],
      flags: MessageFlags.IsComponentsV2,
    });

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
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    }

    let giveaways = loadGiveaways();
    if (!giveaways[message.guild.id]) {
      giveaways[message.guild.id] = {};
    }
    giveaways[message.guild.id][sentMessage.id] = {
      participants: [],
      endTime: endDate.getTime(),
      prize: prize,
      winners: winners,
      host: message.author.id
    };
    saveGiveaways(giveaways);

    setTimeout(() => {
      sendToWebhook("Giveaway has ended.");

      const giveaways = loadGiveaways();
      const guildId = message.guild.id;
      const messageId = sentMessage.id;

      if (giveaways[guildId] && giveaways[guildId][messageId]) {
        const giveawayData = giveaways[guildId][messageId];
        const participants = giveawayData.participants || [];
        if (participants.length > 0) {
          let winnersCount = Math.min(winners, participants.length);

          let winnersList = [];
          for (let i = 0; i < winnersCount; i++) {
            let randomIndex = Math.floor(Math.random() * participants.length);
            winnersList.push(participants.splice(randomIndex, 1)[0]);
          }

          const endContainer = new ContainerBuilder();
          endContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# <a:tada:1428686033653858465> ${prize} <a:tada:1428686033653858465>\n*🎉 Giveaway Ended! 🎉*`
            )
          );
          endContainer.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          );
          endContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## Winners"),
            new TextDisplayBuilder().setContent(
              `${emoji.util.tick} ${winnersList.map((tag) => `<@${tag}>`).join(", ")}`
            )
          );
          endContainer.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
          );
          endContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Prize:** ${prize}\n**Ended At:** ${timestamp}\n**Hosted By:** <@${message.author.id}>`
            )
          );

          const disabledButton = new ButtonBuilder()
            .setCustomId(`giveaway_ended`)
            .setLabel("Giveaway Ended")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

          const disabledRow = new ActionRowBuilder().addComponents(disabledButton);

          sentMessage.edit({ components: [endContainer, disabledRow], flags: MessageFlags.IsComponentsV2 });

          sentMessage.reply(
            `<a:tada:1428686033653858465> Congratulations ${winnersList.map((tag) => `<@${tag}>`).join(", ")}, you won the giveaway!`
          );
        } else {
          const endContainer = new ContainerBuilder();
          endContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# <a:tada:1428686033653858465> ${prize} <a:tada:1428686033653858465>\n*🎉 Giveaway Ended! 🎉*`
            )
          );
          endContainer.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          );
          endContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("## No Winners"),
            new TextDisplayBuilder().setContent(
              `${emoji.util.cross} No one entered this giveaway.`
            )
          );

          const disabledButton = new ButtonBuilder()
            .setCustomId(`giveaway_ended`)
            .setLabel("Giveaway Ended")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

          const disabledRow = new ActionRowBuilder().addComponents(disabledButton);

          sentMessage.edit({ components: [endContainer, disabledRow], flags: MessageFlags.IsComponentsV2 });
          sentMessage.reply("No participants in this giveaway.");
        }
      } else {
        sendToWebhook("No data found for this giveaway.");
        console.log("No data found for this giveaway.");
        sentMessage.reply("No participants in this giveaway.");
      }
    }, time * 1000);
  },
};

function parseTime(timeInput) {
  const timeRegex = /^(\d+)(s|m|h|d|w|M|y)$/;
  const matches = timeInput.match(timeRegex);

  if (!matches) {
    return null;
  }

  const [, value, unit] = matches;
  const secondsPerUnit = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
    M: 2592000,
    y: 31536000,
  };

  return parseInt(value) * secondsPerUnit[unit];
}
