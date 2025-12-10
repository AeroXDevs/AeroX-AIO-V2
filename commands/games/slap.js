const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const emoji = require("../../emoji.js");

module.exports = {
  name: "slap",
  description: "Slap a user (playfully of course!)",
  aliases: ["hit", "smack"],
  run: async (client, message, args) => {
    let member = message.mentions.members.first();

    if (!member) {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 👋 Slap Command`)
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${emoji.util.cross} You need to mention a user to slap!\n\n**Usage:** \`slap @user\``
        )
      );

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    if (member.id === message.author.id) {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 👋 Slap Command`)
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${emoji.util.cross} Wanna slap yourself? Ouch! That's a bit extreme, don't you think?`
        )
      );

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    if (member.id === client.user.id) {
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 👋 Slap Command`)
      );

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${emoji.util.cross} After all the great service I've provided, you want to slap me? Rude!`
        )
      );

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 👋 Slap Action!`)
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## What Happened?"),
      new TextDisplayBuilder().setContent(
        `**${message.author.username}** slapped <a:slapthatbich:1428686025646936094> **${member.user.username}**`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${emoji.util.arrow} And now, **${member.user.username}** is taking an unplanned vacation at the Hospital Resort! 🏥`
      )
    );

    await message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
