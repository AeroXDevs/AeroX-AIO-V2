const {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require("discord.js");
const Settings = require("../../settings.js");
const emoji = require("../../emoji.js");
const owner = Settings.bot.credits.developerId;

module.exports = {
  name: "help",
  aliases: ["h"],
  BotPerms: ["EmbedLinks"],
  run: async function (client, message, args) {
    const prefix =
      (await client.db8.get(`${message.guild.id}_prefix`)) ||
      Settings.bot.info.prefix;
    const aerox = await client.users.fetch(owner);
    const premium = await client.db12.get(`${message.guild.id}_premium`);

    const menuOptionsPrefix = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("helpOptionPrefix")
        .setPlaceholder("Prefix Commands")
        .addOptions([
          new StringSelectMenuOptionBuilder()
            .setLabel("Automod")
            .setValue("automod")
            .setEmoji("1428686163513704549")
            .setDescription("Explore Automod Commands"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Moderation")
            .setValue("moderation")
            .setEmoji("1428686179586543647")
            .setDescription("Explore Moderation Commands"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Security")
            .setValue("server")
            .setEmoji("1428686228160774285")
            .setDescription("Explore Security Commands"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Giveaway")
            .setValue("giveaway")
            .setEmoji("1428686203447676959")
            .setDescription("Explore Giveaway Commands"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Utility")
            .setValue("utility")
            .setEmoji("1428686236855566367")
            .setDescription("Explore Utility Commands"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Sticky Message")
            .setValue("sticky")
            .setEmoji("1428686244723818517")
            .setDescription("Explore Sticky Message Commands"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Vanity")
            .setValue("vanity")
            .setEmoji("1428686252319838284")
            .setDescription("Explore Vanity Commands"),
        ])
    );

    const menuOptionsSlash = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("helpOptionSlash")
        .setPlaceholder("Slash Commands")
        .addOptions([
          new StringSelectMenuOptionBuilder()
            .setLabel("Welcome")
            .setValue("welcome")
            .setEmoji("1428686211828023426")
            .setDescription("Explore Welcome Commands"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Ticket")
            .setValue("ticket")
            .setEmoji("1428686219734417519")
            .setDescription("Explore Ticket Commands"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Music")
            .setValue("music")
            .setEmoji("1428686187211657250")
            .setDescription("Explore Music Commands"),
          new StringSelectMenuOptionBuilder()
            .setLabel("AI")
            .setValue("ai")
            .setEmoji("1428686195377963080")
            .setDescription("Explore AI Commands"),
        ])
    );

    const container1 = new ContainerBuilder();
    
    container1.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "**Welcome to AeroX AIO V2!**\n**Your ultimate Versatile bot.**\n" +
        "*Use the dropdown menu below to explore various command categories.*"
      )
    );
    
    container1.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    
    container1.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("**Categories**"),
      new TextDisplayBuilder().setContent(
        `> ${emoji.id.automod} - **Automod**\n` +
        `> ${emoji.id.moderation} - **Moderation**\n` +
        `> ${emoji.id.welcome} - **Welcome**\n` +
        `> ${emoji.id.music} - **Music**\n` +
        `> ${emoji.id.ticket} - **Ticket**\n` +
        `> ${emoji.id.giveaway} - **Giveaway**\n` +
        `> ${emoji.id.information} - **Security**\n` +
        `> ${emoji.id.utility} - **Utility**\n` +
        `> ${emoji.id.sticky} - **Sticky Message**\n` +
        `> ${emoji.id.ai} - **AI**\n` +
        `> ${emoji.id.vanity} - **Vanity**`
      )
    );
    
    container1.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
    );
    
    container1.addActionRowComponents(menuOptionsPrefix);
    container1.addActionRowComponents(menuOptionsSlash);

    const containers = {
      automod: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.automod} Automod Commands**`),
        new TextDisplayBuilder().setContent(
          "automod, automod anti message spam enable/disable, automod anti mention spam enable/disable, automod anti toxicity enable/disable, automod config, automod reset"
        )
      ),
      moderation: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.moderation} Moderation Commands**`),
        new TextDisplayBuilder().setContent(
          "timeout <user>, untimeout <user>, clear bots, clear humans, clear embeds, clear files, clear mentions, clear pins, ban <user>, unban <user>, kick <user>, hide <channel>, unhide <channel>, lock <channel>, unlock <channel>, nuke, purge, voice, voice muteall, voice unmuteall, voice deafenall, voice undeafenall, voice mute <user>, voice unmute <user>, voice deafen <user>, voice undeafen <user>"
        )
      ),
      welcome: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.welcome} Welcome Commands**`),
        new TextDisplayBuilder().setContent(
          "welcome setup, welcome variable, autorole, autorole humans add <role mention/id>, autorole humans remove <role mention/id>, autorole bots add <role mention/id>, autorole bots remove <role mention/id>, autorole config, autorole reset"
        )
      ),
      server: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.ignore} Security Commands**`),
        new TextDisplayBuilder().setContent(
          "**Extra Owners/Admins:**\nextra, extra owner add <user mention/id>, extra admin add <user mention/id>, extra owner remove <user mention/id>, extra admin remove <user mention/id>, extra owner show, extra admin show, extra owner reset, extra admin reset\n\n**Anti-Nuke:**\nantinuke, antinuke enable, antinuke disable, antinuke antiban enable, antinuke antiban disable, antinuke antikick enable, antinuke antikick disable, antinuke antibot enable, antinuke antibot disable, antinuke whitelist show, antinuke whitelist add <user>, antinuke whitelist remove <user>, antinuke whitelist reset"
        )
      ),
      giveaway: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.giveaway} Giveaway Commands**`),
        new TextDisplayBuilder().setContent("gcreate, reroll, end")
      ),
      ticket: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.ticket} Ticket Commands**`),
        new TextDisplayBuilder().setContent("ticket-panel")
      ),
      utility: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.utility} Utility Commands**`),
        new TextDisplayBuilder().setContent(
          "help, invite, ping, prefix, support, uptime, userinfo, serverinfo, avatar user, botinfo, afk, report, roles, membercount, vote"
        )
      ),
      music: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.music} Music Commands**`),
        new TextDisplayBuilder().setContent(
          "play, pause, resume, stop, skip, volume, loop, nowplaying, queue, remove, clear, leave, search, forward, rewind"
        )
      ),
      sticky: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.sticky} Sticky Message Commands**`),
        new TextDisplayBuilder().setContent("stickyadd, stickyremove")
      ),
      ai: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.ai} AI Commands**`),
        new TextDisplayBuilder().setContent("ai-enable, ai-disable")
      ),
      vanity: new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.vanity} Vanity Commands**`),
        new TextDisplayBuilder().setContent("vanity set, vanity remove, vanity list")
      ),
    };

    await message.reply({
      components: [container1],
      flags: MessageFlags.IsComponentsV2,
    });

    const collector = message.channel.createMessageComponentCollector({
      filter: (interaction) =>
        interaction.user.id === message.author.id &&
        (interaction.customId === "helpOptionPrefix" ||
          interaction.customId === "helpOptionSlash"),
      componentType: ComponentType.StringSelect,
      time: 120000,
    });

    collector.on("collect", async (interaction) => {
      const value = interaction.values[0];
      const selectedContainer = containers[value];
      await interaction.reply({
        components: [selectedContainer],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true,
      });
    });
  },
};
