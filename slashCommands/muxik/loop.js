const { SlashCommandBuilder, PermissionsBitField, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Toggle looping of the currently playing track.'),
  async execute(client, interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        await interaction.deferReply({ ephemeral: false });

        const { channel } = interaction.member.voice;

        if (!channel) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("You are not in a voice channel!")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Connect)) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("I don't have permission to join your voice channel!")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Speak)) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("I don't have permission to speak in your voice channel!")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const player = client.manager.players.get(interaction.guild.id);

        if (!player || !player.queue.current) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("There is no track currently playing.")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const loopStatus = player.queue.current.loop;
        player.queue.current.loop = !loopStatus;

        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`<:nx_loading:1428686490963148922> Loop ${player.queue.current.loop ? 'Enabled' : 'Disabled'}! │\nThe loop for the current track has been ${player.queue.current.loop ? 'enabled' : 'disabled'}.`)
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    } catch (error) {
      console.log(error);
      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent("An error occurred while processing your request. Please try again later.")
      );
      await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  },
};
