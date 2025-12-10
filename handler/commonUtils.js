const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
const emoji = require('../emoji.js');

const createContainer = (client, ID, added, allGuilds) => {
  const description = added
    ? `${emoji.util.tick} | ${added} no prefix to <@${ID}> for ${allGuilds ? 'all guilds' : 'this guild'}`
    : `${emoji.util.cross} | Already ${added ? 'added' : 'removed'} no prefix to <@${ID}> for ${allGuilds ? 'all guilds' : 'this guild'}`;

  const container = new ContainerBuilder()
    .setAccentColor(0x2f3136);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**${client.user.tag}**`)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(description)
  );

  return container;
};

module.exports = { createContainer, createEmbed: createContainer };
