const { SlashCommandBuilder, PermissionsBitField, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearqueue')
    .setDescription('Clear the entire song queue.'),
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

        const player = client.manager.get(interaction.guild.id);

        if (!player || !player.queue.current) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("There is no track currently playing.")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        player.queue.clear();

        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`<:eg_stop:1428686764779769857> | Queue Cleared! The entire song queue has been cleared.`)
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
