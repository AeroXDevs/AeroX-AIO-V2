const { createEmbed } = require('../../handler/commonUtils');
const { NoPrefixAccess } = require('../../dev.json');
const Settings = require('../../settings.js');
const emoji = require('../../emoji.js');
const owner = Settings.bot.credits.developerId;
const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder } = require("discord.js");

function getUser(message, args) {
  const user = message.guild.members.cache.get(args[1]) || message.mentions.members.first() || message.author;
  const ID = user.id;
  return { user, ID };
}

async function addUserToNoPrefixList(client, ID) {
  const nodata = createEmbed(client, ID, false, false);

  const data = await client.db4.get(`members_np`);
  if (!data) {
    await client.db4.set(`members_np`, { noprefixlist: [] });
    return nodata;
  } else {
    if (data.noprefixlist.includes(ID)) {
      return 'already_added';
    } else {
      await client.db4.push(`members_np.noprefixlist`, ID);
      return nodata;
    }
  }
}

async function removeUserFromNoPrefixList(client, ID) {
  const nodata = createEmbed(client, ID, false, false);

  const data = await client.db4.get(`members_np`);
  if (!data) {
    await client.db4.set(`members_np`, { noprefixlist: [] });
    return nodata;
  } else {
    if (!data.noprefixlist.includes(ID)) {
      return 'not_found';
    } else {
      await client.db4.pull(`members_np.noprefixlist`, ID);
      return nodata;
    }
  }
}

async function getNoPrefixList(client) {
  const data = await client.db4.get(`members_np`);
  if (!data || !data.noprefixlist || data.noprefixlist.length === 0) return [];
  return data.noprefixlist;
}

module.exports = {
  name: 'noprefix',
  aliases: ['np'],
  BotPerms: ['EmbedLinks'],
  run: async (client, message, args) => {
    const subcommand = args[0];
    const { user, ID } = getUser(message, args);
    let prefix = await client.db8.get(`${message.guild.id}_prefix`);
    if (!prefix) prefix = Settings.bot.info.prefix;
    const arypton = await client.users.fetch(owner);

    const guideContainer = new ContainerBuilder();
    
    guideContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# No Prefix Module Guide`)
    );
    
    guideContainer.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true)
    );
    
    guideContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('**Available Commands**\n\n')
    );
    
    guideContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${emoji.util.arrow} \`${prefix}noprefix add <user> all\`\n` +
        'Add a user to noprefix users for all servers.\n\n' +
        `${emoji.util.arrow} \`${prefix}noprefix remove <user> all\`\n` +
        'Remove a user from noprefix users from all servers.\n\n' +
        `${emoji.util.arrow} \`${prefix}noprefix show\`\n` +
        'Shows all the users in noprefix database.\n\n' +
        `${emoji.util.arrow} \`${prefix}noprefix reset\`\n` +
        'Removes all the users from noprefix users from the database.\n\n'
      )
    );
    
    guideContainer.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true)
    );

    const firstButton = new ButtonBuilder()
      .setStyle("Primary")
      .setCustomId("first")
      .setLabel("≪")
      .setDisabled(true)
    const backButton = new ButtonBuilder()
      .setStyle("Success")
      .setCustomId("previous")
      .setLabel("Previous")
      .setDisabled(true)
    const cancelButton = new ButtonBuilder()
      .setStyle("Danger")
      .setCustomId("close")
      .setLabel("Close")
      .setDisabled(false)
    const nextButton = new ButtonBuilder()
      .setStyle("Success")
      .setCustomId("next")
      .setLabel("Next")
      .setDisabled(false)
    const lastButton = new ButtonBuilder()
      .setStyle("Primary")
      .setCustomId("last")
      .setLabel("≫")
      .setDisabled(false)

    const pag = new ActionRowBuilder().addComponents(firstButton, backButton, cancelButton, nextButton, lastButton);

    if (!NoPrefixAccess.includes(message.author.id)) {
      return;
    }

    if (NoPrefixAccess.includes(message.author.id)) {
      if (!subcommand) {
        return message.channel.send({ components: [guideContainer], flags: MessageFlags.IsComponentsV2 });
      }

      switch (subcommand) {
        case 'add': {
          switch (args[2]) {
            case 'all': {
              if (!args[1]) {
                return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
              }

              const result = await addUserToNoPrefixList(client, ID);
              const userObject = await client.users.fetch(ID);
              if (result === 'already_added') {
                return message.channel.send({ content: `${emoji.util.cross} | Already added no prefix to \`${userObject.username}\` for all guilds` });
              } else {
                return message.channel.send({ content: `${emoji.util.tick} | Added no prefix to \`${userObject.username}\` for all guilds` });
              }
            }
          }
        }
          break;
        case 'remove': {
          switch (args[2]) {
            case 'all': {
              if (!args[1]) {
                return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
              }

              const result = await removeUserFromNoPrefixList(client, ID);
              const userObject = await client.users.fetch(ID);
              if (result === 'not_found') {
                return message.channel.send({ content: `${emoji.util.cross} | Yet not having no prefix to \`${userObject.username}\` for all guilds` });
              } else {
                return message.channel.send({ content: `${emoji.util.tick} | Removed no prefix from \`${userObject.username}\` for all guilds` });
              }
            }
          }
        }
          break;
        case 'show': {
          const listData = await getNoPrefixList(client);

          if (!listData || listData.length === 0) {
            return message.channel.send(`${emoji.util.cross} Nothing to Show`);
          }

          const totalPages = Math.ceil(listData.length / 10);

          const generateContainer = async (currentPage) => {
            const startIndex = currentPage * 10;
            const endIndex = Math.min(startIndex + 10, listData.length);
            const currentMembers = listData.slice(startIndex, endIndex);

            const fetchUserPromises = currentMembers.map(async (userId, index) => {
              try {
                const user = await client.users.fetch(userId);
                if (!user) return `\`[${startIndex + index + 1}]\` | ID: [${userId}](https://discord.com/users/${userId}) | \`User Not Found\``;
                return `\`[${startIndex + index + 1}]\` | ID: [${userId}](https://discord.com/users/${userId}) | \`${user.username}\``;
              } catch (error) {
                console.error(`Error fetching user ${userId}: ${error.message}`);
                return '';
              }
            });

            const memberList = (await Promise.all(fetchUserPromises)).join("\n");

            const container = new ContainerBuilder();
            
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`## Total No Prefix Users\nPage ${currentPage + 1}/${totalPages}`)
            );
            
            container.addSeparatorComponents(
              new SeparatorBuilder().setDivider(true)
            );
            
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(memberList)
            );
            
            return container;
          };

          let currentPage = 0;
          const container = await generateContainer(currentPage);

          if (totalPages === 1) {
            pag.components.forEach((button) => {
              button.setDisabled(true);
            });
          }

          const messageComponent = await message.channel.send({ components: [container, pag], flags: MessageFlags.IsComponentsV2 });

          const collector = messageComponent.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id === message.author.id,
            time: 200000,
            idle: 300000 / 2,
          });

          collector.on("collect", async (interaction) => {
            if (interaction.isButton()) {
              if (interaction.customId === "next") {
                if (currentPage < totalPages - 1) {
                  currentPage++;
                }
              } else if (interaction.customId === "previous") {
                if (currentPage > 0) {
                  currentPage--;
                }
              } else if (interaction.customId === "first") {
                currentPage = 0;
              } else if (interaction.customId === "last") {
                currentPage = totalPages - 1;
              } else if (interaction.customId === "close") {
                messageComponent.delete().catch((error) => {
                  console.error("Failed to delete message:", error);
                });
                return;
              }

              const updatedContainer = await generateContainer(currentPage);

              firstButton.setDisabled(currentPage === 0);
              backButton.setDisabled(currentPage === 0);
              nextButton.setDisabled(currentPage === totalPages - 1);
              lastButton.setDisabled(currentPage === totalPages - 1);

              interaction.update({ components: [updatedContainer, pag], flags: MessageFlags.IsComponentsV2 });
            }
          });

          collector.on("end", async () => {
            pag.components.forEach((button) => button.setDisabled(true));
            messageComponent.edit({ components: [await generateContainer(currentPage), pag], flags: MessageFlags.IsComponentsV2 });
          });

          break;
        }
        case 'reset': {
          const data = await client.db4.get(`members_np`);
          if (!data) {
            await client.db4.set(`members_np`, { noprefixlist: [] });
            return message.channel.send({ content: `${emoji.util.cross} | Please run the whitelist command again because earlier database was not set up.` });
          } else {
            const users = data.noprefixlist;
            const mentions = [];

            if (users.length !== 0) {
              await client.db4.set(`members_np`, { noprefixlist: [] });
              return message.channel.send({ content: `${emoji.util.tick} Reset Np database` });
            } else {
              return message.channel.send({ content: `${emoji.util.cross} No one is in No Prefix Database` });
            }
          }

        }
        default: {
          message.channel.send({ components: [guideContainer], flags: MessageFlags.IsComponentsV2 });
        }
      }
    }
  }
};
