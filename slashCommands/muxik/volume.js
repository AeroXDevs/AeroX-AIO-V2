const { SlashCommandBuilder, PermissionsBitField, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust the volume of the music player.')
    .addIntegerOption(option =>
      option
        .setName('level')
        .setDescription('The volume level to set (0-100).')
        .setRequired(true)),
  async execute(client,interaction) {
const player = client.manager.players.get(interaction.guild.id);
        if (!player) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("No playing in this guild!")
          );
          return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
        
        const { channel } = interaction.member.voice;
        if (!channel || interaction.member.voice.channel !== interaction.guild.members.me.voice.channel) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("I'm not in the same voice channel as you!")
          );
          return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const value = interaction.options.getInteger("level");
        if (!value) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`*Current volume:* ${player.volume}%`)
          );
          return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        await player.setVolume(Number(value));

        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`<a:Speaker:1428686474403905599> Volume Adjusted! Volume set to: ${value}`)
        );

        return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }
};
