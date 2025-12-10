const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('24-7')
    .setDescription('Make the bot stay in the voice channel 24/7'),
  async execute(client, interaction) {
    const { channel } = interaction.member.voice;
    if (!channel) {
      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`You're not in a voice channel, genius. Join one first.`)
      );
      return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    
    await client.db24_7.set(`24-7_${interaction.guild.id}`, channel.id);

    const container = new ContainerBuilder().addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`I'll stay in the voice channel \`${channel.name}\` 24/7.`)
    );
    return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  },
};
