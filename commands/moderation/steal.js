const { ContainerBuilder, TextDisplayBuilder, ImageBuilder, MessageFlags } = require("discord.js");
const emoji = require('../../emoji.js');

module.exports = {
  name: "steal",
  UserPerms: ['MANAGE_EMOJIS'],
  BotPerms: ['EMBED_LINKS', 'MANAGE_EMOJIS'],
  run: async (client, message, args) => {
    if (!args[0]) {
      return message.reply({ content: `${emoji.util.cross} Please provide the emojis to steal!` });
    }

    try {
      let steal = args.join("") || message.stickers.first();
      let stealname = args[1] || steal.name;

      if (args[0]) {
        let animemojis = steal.match(/[a][:]([A-Za-z0-9_~])+[:]\d{1,}/g);
        let normemojis = steal.match(/[^a][:]([A-Za-z0-9_~])+[:]\d{1,}/g);

        if (animemojis) {
          if (animemojis.length > 1) {
            return message.reply({ content: `${emoji.util.cross} You can only add 1 emoji at a time!` });
          }

          for (let aemoji in animemojis) {
            const list = animemojis[aemoji].split(":");
            const Url = `https://cdn.discordapp.com/emojis/${list[2]}.gif`;
            await message.guild.emojis.create({ attachment: Url, name: list[1] });

            const container = new ContainerBuilder()
              .addComponents(
                new TextDisplayBuilder()
                  .setHeading(`${emoji.util.tick} Emoji Added Successfully`)
                  .setText(`${list[1]} has been added to the server`)
                  .setFontSize("medium"),
                new ImageBuilder()
                  .setUrl(Url)
              );

            message.reply({ 
              components: [container],
              flags: MessageFlags.IsComponentsV2
            });
          }
        }

        if (normemojis) {
          if (normemojis.length > 1) {
            return message.reply({ content: `${emoji.util.cross} You can only add 1 emoji at a time!` });
          }

          for (let emojis in normemojis) {
            const list = normemojis[emojis].split(":");
            const Url = `https://cdn.discordapp.com/emojis/${list[2]}.png`;
            await message.guild.emojis.create({ attachment: Url, name: list[1] });

            const container = new ContainerBuilder()
              .addComponents(
                new TextDisplayBuilder()
                  .setHeading(`${emoji.util.tick} Emoji Added Successfully`)
                  .setText(`${list[1]} has been added to the server`)
                  .setFontSize("medium"),
                new ImageBuilder()
                  .setUrl(Url)
              );

            message.reply({ 
              components: [container],
              flags: MessageFlags.IsComponentsV2
            });
          }
        }
      } else if (message.stickers.first()) {
        const Url = `https://media.discordapp.net/stickers/${steal.id}.${steal.animated ? "gif" : "png"}?size=320`;
        await message.guild.stickers.create({ file: { attachment: Url }, name: stealname });

        const container = new ContainerBuilder()
          .addComponents(
            new TextDisplayBuilder()
              .setHeading(`${emoji.util.tick} Sticker Added Successfully`)
              .setText(`${stealname} has been added to the server`)
              .setFontSize("medium"),
            new ImageBuilder()
              .setUrl(Url)
          );

        message.reply({ 
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });
      }
    } catch (e) {
      message.reply(`${emoji.util.cross} Failed to create the sticker. Maybe slots full or size above discord limit.`);
    }
  }
};
