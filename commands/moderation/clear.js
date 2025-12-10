const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');
const Settings = require('../../settings.js');
const emoji = require('../../emoji.js');
const owner = Settings.bot.credits.developerId;

async function bulkDeleteMessages(message, amount, client) {
  const fetchedMessages = await message.channel.messages.fetch({ limit: amount + 1 });
  await message.channel.bulkDelete(fetchedMessages, true);

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('# ✅ Messages Cleared')
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${emoji.util.tick} Successfully deleted **${amount}** messages.`)
  );
  
  message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 }).then(m => {
    setTimeout(() => {
      m.delete().catch(() => { });
    }, 3000);
  });
}

module.exports = {
  name: 'clear',
  aliases: ['c', 'purge', 'prune'],
  UserPerms: ['ManageMessages'],
  BotPerms: ['ManageMessages', 'EmbedLinks'],
  run: async (client, message, args) => {

    const list = args[0];
    const amount = parseInt(args[0]);
    const listAmount = parseInt(args[1]) || 50;
    let prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;
    const arypton = await client.users.fetch(owner);

    const guide = new ContainerBuilder();
    guide.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 🗑️ Clear Commands')
    );
    guide.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    guide.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('## Message Type Filters'),
      new TextDisplayBuilder().setContent(
        `\`${prefix}clear bots\` - Delete bot messages\n` +
        `\`${prefix}clear humans\` - Delete human messages\n` +
        `\`${prefix}clear embeds\` - Delete embed messages\n` +
        `\`${prefix}clear files\` - Delete file attachments\n` +
        `\`${prefix}clear mentions\` - Delete mention messages\n` +
        `\`${prefix}clear pins\` - Delete pinned messages`
      )
    );
    guide.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
    );
    guide.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('## Bulk Delete'),
      new TextDisplayBuilder().setContent(`\`${prefix}clear <amount>\` - Delete specified amount of messages (1-99)`)
    );

    if (!list && !amount) {
      return message.channel.send({ components: [guide], flags: MessageFlags.IsComponentsV2 });
    }

    const clearMessages = async (filter) => {
      const messages = await message.channel.messages.fetch({ limit: listAmount });
      const data = messages.filter(filter).map(m => m);

      await message.delete();
      await message.channel.bulkDelete(data.length ? data : 1, true).then(async (m) => {
        const successContainer = new ContainerBuilder();
        successContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# ✅ Messages Cleared')
        );
        successContainer.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        successContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${emoji.util.tick} Cleared **${m.size}** out of **${data.length}** messages!`)
        );
        
        const successMessage = await message.channel.send({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });

        setTimeout(() => {
          successMessage.delete();
        }, 5000);
      });
    };

    switch (list) {
      case 'bots':
        return clearMessages(ms => ms.author.bot && !ms.pinned);
      case 'humans':
        return clearMessages(ms => !ms.author.bot && !ms.pinned);
      case 'embeds':
        return clearMessages(ms => ms.embeds.length && !ms.pinned);
      case 'files':
        return clearMessages(ms => ms.attachments.first() && !ms.pinned);
      case 'mentions':
        return clearMessages(ms => (ms.mentions.users.first() || ms.mentions.members.first() || ms.mentions.channels.first() || ms.mentions.roles.first()) && !ms.pinned);
      case 'pins':
        return clearMessages(ms => ms.pinned);
      default:
        if (isNaN(amount) || amount <= 0 || amount >= 100) {
          const errorContainer = new ContainerBuilder();
          errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('# ❌ Error')
          );
          errorContainer.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          );
          errorContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.cross} Please provide a valid number between **1** and **99**.`)
          );
          return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
        await bulkDeleteMessages(message, amount, client);
    }
  },
};
