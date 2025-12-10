const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const { ownerIDS } = require('../../dev.json');

module.exports = {
  name: "dm",
  aliases: ["directmessage"],
  BotPerms: ['SendMessages', 'EmbedLinks'],
  run: async (client, message, args) => {
    
    if (!ownerIDS.includes(message.author.id)) {
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('This command is restricted to bot owners.')
        );
      return await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    }

    
    if (args.length < 2) {
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('Please provide a user ID and a message. Usage: dm <userID> <message>')
        );
      return await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    }

    const userID = args[0];
    const dmMessage = args.slice(1).join(' ');

    try {
      
      const user = await client.users.fetch(userID);

      if (!user) {
        const errorContainer = new ContainerBuilder()
          .setAccentColor(0xED4245)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('User not found. Please provide a valid user ID.')
          );
        return await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
      }

      
      await user.send(dmMessage);

  
      const successContainer = new ContainerBuilder()
        .setAccentColor(0x57F287)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Message sent successfully to ${user.tag}`)
        );
      await message.channel.send({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
    } catch (error) {
      console.error('Error in dm command:', error);
      const errorContainer = new ContainerBuilder()
        .setAccentColor(0xED4245)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('An error occurred while sending the DM. The user might have DMs disabled or the bot might be blocked.')
        );
      await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
    }
  },
};
