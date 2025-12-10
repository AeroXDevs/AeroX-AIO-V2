const { 
  ButtonBuilder, 
  ActionRowBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');

async function nukeChannel(channel, reason) {
  await channel.clone({ reason });
  await channel.delete({ reason });
}

async function sendConfirmationMessage(channel) {
  const confirmButton = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel('Confirm Nuke')
    .setStyle('Danger');

  const cancelButton = new ButtonBuilder()
    .setCustomId('cancel')
    .setLabel('Cancel')
    .setStyle('Secondary');

  const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
  
  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('# ⚠️ Nuke Channel Confirmation')
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      '## Warning\n' +
      'This action will **delete** this channel and create a **clone** with the same settings.\n\n' +
      '**All messages will be permanently lost!**\n\n' +
      'Are you absolutely sure you want to proceed?'
    )
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
  );
  container.addActionRowComponents(row);

  const confirmationMsg = await channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });

  return confirmationMsg;
}

module.exports = {
  name: 'nuke',
  UserPerms: ['ManageChannels'],
  BotPerms: ['EmbedLinks', 'ManageChannels'],
  description: 'Nuke the channel',
  run: async (client, message, args) => {

    const reason = 'Channel Delete Command Used';

    const confirmationMsg = await sendConfirmationMessage(message.channel);

    const filter = (interaction) => interaction.user.id === message.author.id;

    const collector = confirmationMsg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm') {
        await nukeChannel(message.channel, reason);
      } else if (interaction.customId === 'cancel') {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# ❌ Nuke Cancelled')
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('The channel nuke has been cancelled.')
        );
        await interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    });

    collector.on('end', async () => {
      confirmationMsg.edit({ components: [] }).catch(() => {});
    });
  },
};
