const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const emoji = require("../../emoji.js");

module.exports = {
  name: "nitro",
  description: "Get a free Discord Nitro gift (totally real, we promise!)",
  aliases: ["freenitro", "gift"],
  run: async (client, message) => {
    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${emoji.flag.nitro} Free Discord Nitro!\n*Click the button below to claim your gift!*`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## 🎁 Gift Details"),
      new TextDisplayBuilder().setContent(
        `**Type:** Discord Nitro Monthly\n**Value:** $9.99\n**Duration:** 1 Month\n**Expiry:** Never!`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)
        .setDivider(true)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${emoji.util.arrow} Click the button below to redeem your Nitro gift!`
      )
    );

    const button = new ButtonBuilder()
      .setCustomId(`nitro_claim_${message.id}`)
      .setLabel("Claim Nitro Gift")
      .setStyle(ButtonStyle.Success)
      .setEmoji("🎁");

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(button)
    );

    const sentMessage = await message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    const collector = sentMessage.createMessageComponentCollector({
      time: 300000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === `nitro_claim_${message.id}`) {
        await interaction.reply({
          content: `${emoji.util.cross} Just kidding! Here's your real gift: https://tenor.com/view/rickroll-roll-rick-never-gonna-give-you-up-never-gonna-gif-22954713`,
          ephemeral: true,
        });
      }
    });

    collector.on("end", async () => {
      const expiredContainer = new ContainerBuilder();

      expiredContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${emoji.flag.nitro} Free Discord Nitro!\n*This gift has expired.*`
        )
      );

      try {
        await sentMessage.edit({
          components: [expiredContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch (e) {
        
      }
    });
  },
};
