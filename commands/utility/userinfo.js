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
  name: "userinfo",
  aliases: ["whois", "user", "ui"],
  BotPerms: ["EmbedLinks"],
  run: async (client, message, args) => {
    const permissions = {
      AddReactions: "Add Reactions",
      Administrator: "Administrator",
      AttachFiles: "Attach files",
      BanMembers: "Ban members",
      ChangeNickname: "Change nickname",
      Connect: "Connect",
      CreateInstantInvite: "Create instant invite",
      CreatePrivateThreads: "Create private threads",
      CreatePublicThreads: "Create public threads",
      DeafenMembers: "Deafen members",
      EmbedLinks: "Embed links",
      KickMembers: "Kick members",
      ManageChannels: "Manage channels",
      ManageEmojisAndStickers: "Manage emojis and stickers",
      ManageEvents: "Manage Events",
      ManageGuild: "Manage server",
      ManageMessages: "Manage messages",
      ManageNicknames: "Manage nicknames",
      ManageRoles: "Manage roles",
      ManageThreads: "Manage Threads",
      ManageWebhooks: "Manage webhooks",
      MentionEveryone: "Mention everyone",
      ModerateMembers: "Moderate Members",
      MoveMembers: "Move members",
      MuteMembers: "Mute members",
      PrioritySpeaker: "Priority speaker",
      ReadMessageHistory: "Read message history",
      RequestToSpeak: "Request to Speak",
      SendMessages: "Send messages",
      SendMessagesInThreads: "Send Messages In Threads",
      SendTTSMessages: "Send TTS messages",
      Speak: "Speak",
      Stream: "Video",
      UseApplicationCommands: "Use Application Commands",
      UseEmbeddedActivities: "Use Embedded Activities",
      UseExternalEmojis: "Use External Emojis",
      UseExternalStickers: "Use External Stickers",
      UseVAD: "Use voice activity",
      ViewAuditLog: "View audit log",
      ViewChannel: "View channel",
      ViewGuildInsights: "View server insights",
    };

    const badgeNames = {
      ActiveDeveloper: `${emoji.flag.activedev}`,
      Staff: `${emoji.flag.staff}`,
      PartneredServerOwner: `${emoji.flag.partner}`,
      BugHunterLevel1: `${emoji.flag.bug1}`,
      BugHunterLevel2: `${emoji.flag.bug2}`,
      HypeSquadEvents: `${emoji.flag.hypesquad}`,
      HypeSquadOnlineHouse1: `${emoji.flag.hype1}`,
      HypeSquadOnlineHouse2: `${emoji.flag.hype2}`,
      HypeSquadOnlineHouse3: `${emoji.flag.hype3}`,
      PremiumEarlySupporter: `${emoji.badges.supporter}`,
      VerifiedBot: `${emoji.flag.verifiedbot}`,
      VerifiedDeveloper: `${emoji.flag.verifieddev}`,
    };

    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;
    const registrationDate = `<t:${Math.floor(member.user.createdAt / 1000)}:F> [<t:${Math.floor(member.user.createdAt / 1000)}:R>]`;
    const avatarURL = member.user.displayAvatarURL({ dynamic: true });
    const isAnimated = avatarURL.endsWith(".gif");
    const nick = member.user.nickname || "None";
    const roles = member.roles.cache.filter(role => role.name !== "@everyone");
    const roleCount = roles.size;
    const rolesText =
      roleCount > 20
        ? "Too many roles to show"
        : roles.map((role) => role.name).join(", ") || "No Roles";
    const serverName = message.guild.name;
    const joinedDate = `<t:${Math.floor(member.joinedAt / 1000)}:F> [<t:${Math.floor(member.joinedAt / 1000)}:R>]`;
    const mentionPermissions = member.permissions.toArray() || [];
    const isServerOwner = message.guild.ownerId === member.id;
    const isAdmin = member.permissions.has("Administrator");
    const isBot = member.user.bot;
    let acknowledgementsText = "Server Member";
    if (isServerOwner) acknowledgementsText = "Server Owner";
    else if (isAdmin && !isBot) acknowledgementsText = "Server Admin";
    else if (isBot) acknowledgementsText = "Server Bot";
    const boosterStatus = member.premiumSince
      ? `${emoji.util.tick}`
      : `${emoji.util.cross}`;
    const boostingSince = member.premiumSince
      ? `<t:${Math.floor(member.premiumSince / 1000)}:F> [<t:${Math.floor(member.premiumSince / 1000)}:R>]`
      : "Not Boosting";
    let badges =
      member.user.flags
        .toArray()
        .map((flag) => badgeNames[flag])
        .filter((name) => name !== "undefined")
        .join(` `) || "None";
    const finalPermissions = Object.keys(permissions)
      .filter((permission) => mentionPermissions.includes(permission))
      .map((permission) => permissions[permission]);

    const buildAccountContainer = () => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${member.user.tag}\n*Account Information*`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## General Information")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Username:** ${member.user.username}\n**Display Name:** ${member.displayName}\n**ID:** ${member.id}\n**Registered:** ${registrationDate}\n**Is Bot?**: ${member.user.bot ? `${emoji.util.tick}` : `${emoji.util.cross}`}\n**Badges**: ${badges}`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Profile Picture")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Animated**: ${isAnimated ? `${emoji.util.tick}` : `${emoji.util.cross}`}\n**Download**: [Click Me](${avatarURL})`
        )
      );

      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(avatarURL)
            .setDescription(member.user.tag)
        )
      );

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId("first")
            .setLabel("Account")
            .setDisabled(true),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("second")
            .setLabel("Guild")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("third")
            .setLabel("Roles")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("fourth")
            .setLabel("Permissions")
            .setDisabled(false)
        )
      );

      return container;
    };

    const buildGuildContainer = () => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${member.user.tag}\n*Guild Information*`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## Information in ${serverName}`)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Joined**: ${joinedDate}\n**Nickname**: ${nick}\n**Booster**: ${boosterStatus}\n**Boosting Since**: ${boostingSince}\n**Acknowledgements**: ${acknowledgementsText}`
        )
      );

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("first")
            .setLabel("Account")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId("second")
            .setLabel("Guild")
            .setDisabled(true),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("third")
            .setLabel("Roles")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("fourth")
            .setLabel("Permissions")
            .setDisabled(false)
        )
      );

      return container;
    };

    const buildRolesContainer = () => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${member.user.tag}\n*Role Information*`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Role Info")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Highest Role**: ${member.roles.highest.name}\n**Roles**: ${rolesText}\n**Color**: ${member.displayHexColor}`
        )
      );

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("first")
            .setLabel("Account")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("second")
            .setLabel("Guild")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId("third")
            .setLabel("Roles")
            .setDisabled(true),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("fourth")
            .setLabel("Permissions")
            .setDisabled(false)
        )
      );

      return container;
    };

    const buildPermissionsContainer = () => {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${member.user.tag}\n*Permissions*`
        )
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("## Permissions")
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          finalPermissions.join(", ") || "No Permissions"
        )
      );

      container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("first")
            .setLabel("Account")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("second")
            .setLabel("Guild")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("third")
            .setLabel("Roles")
            .setDisabled(false),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId("fourth")
            .setLabel("Permissions")
            .setDisabled(true)
        )
      );

      return container;
    };

    const messageComponent = await message.channel.send({
      components: [buildAccountContainer()],
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
              components: [buildAccountContainer()],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
          case "second":
            await interaction.editReply({
              components: [buildGuildContainer()],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
          case "third":
            await interaction.editReply({
              components: [buildRolesContainer()],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
          case "fourth":
            await interaction.editReply({
              components: [buildPermissionsContainer()],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
        }
      }
    });

    collector.on("end", async () => {
      const expiredContainer = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# ${member.user.tag}\n*This interaction has expired.*`
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
