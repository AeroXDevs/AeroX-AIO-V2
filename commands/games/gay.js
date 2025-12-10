const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const emoji = require("../../emoji.js");

module.exports = {
  name: "howgay",
  aliases: ["gay"],
  description: "Calculate how gay someone is (just for fun!)",
  run: async (client, message, args) => {
    const user =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;

    let rng = Math.floor(Math.random() * 100) + 1;

    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🌈 Gay Meter`)
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## Result"),
      new TextDisplayBuilder().setContent(
        `**${user.user.username}** is **${rng}%** gay! 🌈`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    const progressBar = "█".repeat(Math.floor(rng / 5)) + "░".repeat(20 - Math.floor(rng / 5));
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`\`${progressBar}\` ${rng}%`)
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)
        .setDivider(true)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${emoji.util.arrow} Requested by **${message.author.username}**`
      )
    );

    await message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
