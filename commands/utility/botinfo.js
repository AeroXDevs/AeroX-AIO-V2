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
const emoji = require("../../emoji.js");

module.exports = {
  name: "botinfo",
  aliases: ["info", "bi", "about"],
  BotPerms: ["EmbedLinks"],
  run: async (client, message, args) => {
    const buildBasicInfoContainer = () => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${client.user.username}\n*AeroX AIO V2 - Go Beyond Imagination*`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Your Discord server's all-in-one solution. Featuring Antinuke, Automod, Autorole, Welcome, Giveaways, Music, Ticket, Custom-Roles, Extra Owner/Admin and more. Use '?' prefix to empower your server.`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Basic Information")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**NodeJs Version**: v${process.version.slice(1)}\n**Library**: [discord.js](https://discord.js.org/)`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Links")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `[Invite](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands) : [Support](https://discord.gg/8wfT8SfB5Z) : [Website](https://aeroxdev.xyz)`
        )
      );

      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(
              "https://cdn.discordapp.com/attachments/1414256332592254986/1415398785412104222/Galaxy_Background_General_Twitch_Banner_20250910_234555_0001_1.gif?ex=68f32f17&is=68f1dd97&hm=e3201c41fb92e52236fcd93992b7d554eaacc7901ae83340aa2c38a229a0cf9e&"
            )
            .setDescription(client.user.username)
        )
      );

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId("first")
            .setLabel("Basic Info")
            .setEmoji("1428686796866326709")
            .setDisabled(true),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("second")
            .setLabel("Team Info")
            .setEmoji("1329557961193816194")
            .setDisabled(false)
        )
      );

      return container;
    };

    const buildTeamInfoContainer = () => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${client.user.username}\n*Team Information*`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Developer")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `- [𝐀 𝐞 𝐠 𝐢 𝐬](https://discord.com/users/1124248109472550993)\n- [Aurora](https://discord.com/users/1149069310636064819)`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Core Team")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `- [𝐀 𝐞 𝐠 𝐢 𝐬](https://discord.com/users/1124248109472550993)\n- [Aurora](https://discord.com/users/1149069310636064819)`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Organisation")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `- [AeroX Development](https://discord.gg/8wfT8SfB5Z)`
        )
      );

      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(
              "https://cdn.discordapp.com/attachments/1414256332592254986/1415398785412104222/Galaxy_Background_General_Twitch_Banner_20250910_234555_0001_1.gif?ex=68f32f17&is=68f1dd97&hm=e3201c41fb92e52236fcd93992b7d554eaacc7901ae83340aa2c38a229a0cf9e&"
            )
            .setDescription("AeroX Development")
        )
      );

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("first")
            .setLabel("Basic Info")
            .setEmoji("1428686796866326709")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId("second")
            .setLabel("Team Info")
            .setEmoji("1329557961193816194")
            .setDisabled(true)
        )
      );

      return container;
    };

    const messageComponent = await message.channel.send({
      components: [buildBasicInfoContainer()],
      flags: MessageFlags.IsComponentsV2,
    });

    const collector = messageComponent.createMessageComponentCollector({
      filter: (interaction) => {
        if (message.author.id === interaction.user.id) return true;
        else {
          interaction.reply({
            content: `${emoji.util.cross} | This Pagination is not for you.`,
            ephemeral: true,
          });
          return false;
        }
      },
      time: 600000,
      idle: 800000 / 2,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.isButton()) {
        await interaction.deferUpdate();
        
        switch (interaction.customId) {
          case "first":
            await interaction.editReply({
              components: [buildBasicInfoContainer()],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
          case "second":
            await interaction.editReply({
              components: [buildTeamInfoContainer()],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
        }
      }
    });

    collector.on("end", async () => {
      const expiredContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# ${client.user.username}\n*This interaction has expired.*`
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
