const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const moment = require("moment");
moment.locale("ENG");

const verificationLevels = {
  NONE: "None",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  VERY_HIGH: "Very High",
};

const disabled = "<:disabled:1428686058022768732>";
const enabled = "<:enabled:1428686066205986896>";

module.exports = {
  name: "serverinfo",
  aliases: ["si"],
  category: "utility",
  run: async (client, message, args) => {
    const server = message.guild;
    const owner = await server.fetchOwner();
    const memberCount = server.memberCount;
    const userCount = server.members.cache.filter(
      (member) => !member.user.bot
    ).size;
    const botCount = server.members.cache.filter(
      (member) => member.user.bot
    ).size;
    const emojiCount = server.emojis.cache.size;
    const roles = server.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString())
      .slice(0, -1);

    let rolesDisplay =
      roles.length < 25 ? roles.join(" ") : "Too many roles to show.";
    if (rolesDisplay.length > 1024)
      rolesDisplay = `${roles.slice(4).join(" ")} more.`;

    let baseVerification = verificationLevels[server.verificationLevel] || "Unknown";

    const buildGeneralContainer = () => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${server.name}\n*Server Information*`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## About")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Name:** ${server}\n**ID:** ${server.id}\n**Owner <:icons_eventcolour_416:1428686074057855087>:** ${owner.user.tag} (${owner.user})\n**Members:** ${memberCount}\n**Created At:** <t:${moment(server.createdAt).format("X")}:R>`
        )
      );

      if (server.iconURL({ dynamic: true })) {
        container.addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder()
              .setURL(server.iconURL({ dynamic: true }))
              .setDescription(server.name)
          )
        );
      }

      if (server.bannerURL({ size: 4096, dynamic: true, format: "gif" })) {
        container.addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder()
              .setURL(server.bannerURL({ size: 4096, dynamic: true, format: "gif" }))
              .setDescription(`${server.name} Banner`)
          )
        );
      }

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("general")
            .setLabel("General")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("system")
            .setLabel("System")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("modules")
            .setLabel("Modules")
            .setStyle(ButtonStyle.Secondary)
        )
      );

      return container;
    };

    const buildSystemContainer = () => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${server.name}\n*System Information*`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Server Information")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Verification Level:** ${baseVerification}\n**Inactive Channel:** ${server.afkChannelId ? `<#${server.afkChannelId}>` : `${disabled}`}\n**Inactive Timeout:** ${server.afkTimeout / 60} mins\n**System Messages Channel:** ${server.systemChannelId ? `<#${server.systemChannelId}>` : disabled}\n**Boost Bar Enabled:** ${server.premiumProgressBarEnabled ? enabled : disabled}`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Emojis")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`Total Emojis: ${emojiCount}`)
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Boost Status")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Count <:qsfgqsegf:1428686082341470278>: ${server.premiumSubscriptionCount}`
        )
      );

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("general")
            .setLabel("General")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("system")
            .setLabel("System")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("modules")
            .setLabel("Modules")
            .setStyle(ButtonStyle.Secondary)
        )
      );

      return container;
    };

    const buildModulesContainer = () => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${server.name}\n*Server Roles*`)
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Server Roles")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`[${roles.length}] ${rolesDisplay}`)
      );

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("general")
            .setLabel("General")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("system")
            .setLabel("System")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("modules")
            .setLabel("Modules")
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
        )
      );

      return container;
    };

    const messageComponent = await message.reply({
      components: [buildGeneralContainer()],
      flags: MessageFlags.IsComponentsV2,
    });

    const collector = messageComponent.createMessageComponentCollector({
      time: 600000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.isButton()) {
        await interaction.deferUpdate();

        switch (interaction.customId) {
          case "general":
            await interaction.editReply({
              components: [buildGeneralContainer()],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
          case "system":
            await interaction.editReply({
              components: [buildSystemContainer()],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
          case "modules":
            await interaction.editReply({
              components: [buildModulesContainer()],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
        }
      }
    });

    collector.on("end", async () => {
      const expiredContainer = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${server.name}\n*This interaction has expired.*`
        )
      );

      try {
        await messageComponent.edit({
          components: [expiredContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch (e) {
        
      }
    });
  },
};
