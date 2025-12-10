const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai-disable')
    .setDescription('Disable AI chat in this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    try {
      const channelId = interaction.channel.id;
      const guildId = interaction.guild.id;
      
      const currentChannels = await client.db.get(`${guildId}_ai_channels`) || [];
      
      if (!currentChannels.includes(channelId)) {
        const container = new ContainerBuilder()
          .setAccentColor(0xFEE75C)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('AI chat is not enabled in this channel.')
          );
        return await interaction.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
          ephemeral: true
        });
      }
      
      const updatedChannels = currentChannels.filter(id => id !== channelId);
      await client.db.set(`${guildId}_ai_channels`, updatedChannels);
      
      const successContainer = new ContainerBuilder()
        .setAccentColor(0x57F287)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('✅ AI chat has been disabled in this channel.')
        );
      await interaction.reply({
        components: [successContainer],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      console.error('Error disabling AI:', error);
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('An error occurred while disabling AI chat.')
        );
      await interaction.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
        ephemeral: true
      });
    }
  }
};
