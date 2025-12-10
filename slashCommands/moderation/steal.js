
const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
const emoji = require('../../emoji.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('steal')
    .setDescription('Steal an emoji and add it to the server')
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to steal (paste the emoji)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Custom name for the emoji (optional)')
        .setRequired(false)
    ),
  UserPerms: ['ManageEmojisAndStickers'],
  BotPerms: ['ManageEmojisAndStickers'],
  async execute(client, interaction) {
    await interaction.deferReply();

    const emojiInput = interaction.options.getString('emoji');
    const customName = interaction.options.getString('name');

    try {
      
      let animemojis = emojiInput.match(/[a][:]([A-Za-z0-9_~])+[:]\d{1,}/g);
      
      let normemojis = emojiInput.match(/[^a][:]([A-Za-z0-9_~])+[:]\d{1,}/g);

      if (animemojis) {
        if (animemojis.length > 1) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.cross} You can only add 1 emoji at a time!`)
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        for (let aemoji of animemojis) {
          const list = aemoji.split(":");
          const emojiId = list[2];
          const emojiName = customName || list[1];
          const Url = `https://cdn.discordapp.com/emojis/${emojiId}.gif`;
          
          await interaction.guild.emojis.create({ attachment: Url, name: emojiName });

          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.tick} **Emoji Added Successfully**\n${emojiName} has been added to the server`)
          );

          return interaction.editReply({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }
      }

      if (normemojis) {
        if (normemojis.length > 1) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.cross} You can only add 1 emoji at a time!`)
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        for (let emojis of normemojis) {
          const list = emojis.split(":");
          const emojiId = list[2];
          const emojiName = customName || list[1];
          const Url = `https://cdn.discordapp.com/emojis/${emojiId}.png`;
          
          await interaction.guild.emojis.create({ attachment: Url, name: emojiName });

          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.tick} **Emoji Added Successfully**\n${emojiName} has been added to the server`)
          );

          return interaction.editReply({ 
            components: [container],
            flags: MessageFlags.IsComponentsV2
          });
        }
      }

      
      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.cross} Invalid emoji format! Please provide a valid Discord emoji.`)
      );
      return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

    } catch (e) {
      console.error(e);
      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.cross} Failed to add the emoji. The server might be at the emoji limit or the emoji size exceeds Discord's limit.`)
      );
      return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  },
};
