
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const Settings = require('../../settings.js');
const emoji = require('../../emoji.js');
const owner = Settings.bot.credits.developerId;

module.exports = {
  name: 'ignore',
  UserPerms: ['ManageGuild', 'ManageChannels'],
  BotPerms: ['EmbedLinks'],
  run: async (client, message, args) => {
    const prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;
    const arypton = await client.users.fetch(owner);
    const user = message.guild.members.cache.get(args[2]) || message.mentions.members.first() || message.author;
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]) || message.channel;
    const channelLimit = 100;
    const bypassLimit = 100;

    const buildGuideContainer = () => {
      const container = new ContainerBuilder();
      
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.ignore} Ignore Commands`)
      );
      
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## Available Commands'),
        new TextDisplayBuilder().setContent(
          `${emoji.util.arrow} \`${prefix}ignore\`\n` +
          'Shows the guide for the module.\n\n' +
          `${emoji.util.arrow} \`${prefix}ignore channel add <channel>\`\n` +
          'Add the channel in ignore channels.\n\n' +
          `${emoji.util.arrow} \`${prefix}ignore bypass add <user mention/id>\`\n` +
          'Add the user in ignore bypass.\n\n' +
          `${emoji.util.arrow} \`${prefix}ignore channel remove <channel>\`\n` +
          'Remove the channel from ignore channels.\n\n' +
          `${emoji.util.arrow} \`${prefix}ignore bypass remove <user mention/id>\`\n` +
          'Remove the user from ignore bypass.\n\n' +
          `${emoji.util.arrow} \`${prefix}ignore channel show\`\n` +
          'Show ignore module settings for the server.\n\n' +
          `${emoji.util.arrow} \`${prefix}ignore bypass show\`\n` +
          'Show ignore bypass module settings for the server.\n\n' +
          `${emoji.util.arrow} \`${prefix}ignore channel reset\`\n` +
          'Resets ignore settings for the server.\n\n' +
          `${emoji.util.arrow} \`${prefix}ignore bypass reset\`\n` +
          'Resets ignore bypass settings for the server.'
        )
      );
      
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );

      return container;
    };

    await handleIgnoreCommand(client, message, args);

    async function handleIgnoreCommand(client, message, args) {
      const option = args[0];
      const user = message.guild.members.cache.get(args[2]) || message.mentions.members.first() || message.author;
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]) || message.channel;

      switch (option) {
        case 'guide':
          return message.channel.send({ components: [buildGuideContainer()], flags: MessageFlags.IsComponentsV2 });
          break;
        case 'channel':
          if (args[1] === 'add') {
            await handleAddChannel(client, message, channel);
          } else if (args[1] === 'remove') {
            await handleRemoveChannel(client, message, channel);
          } else if (args[1] === 'show') {
            await handleConfig(client, message);
          } else if (args[1] === 'reset') {
            await handleReset(client, message);
          }
          break;
        case 'bypass':
          if (args[1] === 'add') {
            await handleAddBypass(client, message, user);
          } else if (args[1] === 'remove') {
            await handleRemoveBypass(client, message, user);
          } else if (args[1] === 'show') {
            await handleBypassConfig(client, message);
          } else if (args[1] === 'reset') {
            await handleBypassReset(client, message);
          }
          break;
        default:
          return message.channel.send({ components: [buildGuideContainer()], flags: MessageFlags.IsComponentsV2 });
      }
    }

    async function handleAddChannel(client, message, channel) {
      await client.db10.get(`${message.guild.id}_ic`).then(async (data) => {
        if (!data) {
          await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the ignore command again because earlier database was not set up` });
        } else {
          if (!args[2]) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the channel or provide a valid channel ID.` });
          }
          if (!channel) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the channel or provide a valid channel ID.` });
          } else {
            if (data.ignorechannellist.includes(channel.id)) {
              return message.channel.send({ content: `${emoji.util.cross} | Already added \`${channel.name}\` in ignore channel for this guild.` });
            }
            if (data.ignorechannellist.length >= channelLimit) {
              return message.channel.send(`${emoji.util.cross} | You have reached the maximum channel addition limit of 100.`);
            } else {
              await client.db10.push(`${message.guild.id}_ic.ignorechannellist`, channel.id);
              return message.channel.send({ content: `${emoji.util.tick} | Added \`${channel.name}\` in ignore channel for this guild.` });
            }
          }
        }
      });
    }

    async function handleRemoveChannel(client, message, channel) {
      await client.db10.get(`${message.guild.id}_ic`).then(async (data) => {
        if (!data) {
          await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the ignore command again because earlier database was not set up` });
        } else {
          if (!args[2]) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the channel or provide a valid channel ID.` });
          }
          if (!channel) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the channel or provide a valid channel ID.` });
          } else {
            if (!data.ignorechannellist.includes(channel.id)) {
              return message.channel.send({ content: `${emoji.util.cross} | \`${channel.name}\` Yet not added in ignore channel for this guild.` });
            } else {
              await client.db10.pull(`${message.guild.id}_ic.ignorechannellist`, channel.id);
              return message.channel.send({ content: `${emoji.util.tick} | \`${channel.name}\` is Removed from ignore channel for this guild.` });
            }
          }
        }
      });
    }

    async function handleConfig(client, message) {
      await client.db10.get(`${message.guild.id}_ic`).then(async (data) => {
        if (!data) {
          await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the ignore command again because earlier database was not set up` });
        } else {
          const channels = data.ignorechannellist;

          if (channels.length === 0) {
            return message.channel.send(`No channel is in ignore bypass Database`);
          }

          const itemsPerPage = 10;
          const totalPages = Math.ceil(channels.length / itemsPerPage);
          let currentPage = 0;

          const generateContainer = (page) => {
            const startIndex = page * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, channels.length);
            const currentChannels = channels.slice(startIndex, endIndex);
            const mentions = [];

            currentChannels.forEach((channelId, i) => {
              const channel = message.guild.channels.cache.get(channelId);
              if (channel) {
                mentions.push(`\`[${startIndex + i + 1}]\` | ID: [${channelId}](https://discord.com/channels/${message.guild.id}/${channelId}) | <#${channelId}>`);
              }
            });

            const configContainer = new ContainerBuilder()
              .setAccentColor(client.color || 0x5865F2);

            configContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**${client.user.tag}**`)
            );

            configContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Total ignore bypasss - Page ${currentPage + 1}/${totalPages}**`)
            );

            configContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(mentions.join('\n'))
            );

            configContainer.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );

            configContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`*Thanks For Selecting ${client.user.username}*`)
            );

            return configContainer;
          };

          const container = generateContainer(currentPage);

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

          if (totalPages === 1) {
            pag.components.forEach((button) => {
              button.setDisabled(true);
            });
          }

          container.addActionRowComponents(pag);

          const messageComponent = await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });

          const collector = messageComponent.createMessageComponentCollector({
            filter: (interaction) => {
              if (message.author.id === interaction.user.id) return true;
              else {
                const errorContainer = new ContainerBuilder()
                  .setAccentColor(0xED4245)
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.cross} | This Pagination is not for you.`)
                  );
                return interaction.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
              }
            },
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

              const updatedContainer = generateContainer(currentPage);

              const firstButton = pag.components.find((component) => component.customId === "first");
              const previousButton = pag.components.find((component) => component.customId === "previous");
              const nextButton = pag.components.find((component) => component.customId === "next");
              const lastButton = pag.components.find((component) => component.customId === "last");

              firstButton.setDisabled(currentPage === 0);
              previousButton.setDisabled(currentPage === 0);
              nextButton.setDisabled(currentPage === totalPages - 1);
              lastButton.setDisabled(currentPage === totalPages - 1);

              updatedContainer.addActionRowComponents(pag);
              interaction.update({ components: [updatedContainer], flags: MessageFlags.IsComponentsV2 });
            }
          });

          collector.on("end", () => {
            pag.components.forEach((button) => button.setDisabled(true));
            messageComponent.edit({ components: [pag] });
          });
        }
      });
    }

    async function handleReset(client, message) {
      await client.db10.get(`${message.guild.id}_ic`).then(async (data) => {
        if (!data) {
          await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the ignore command again because earlier database was not set up` });
        } else {
          const users = data.ignorechannellist;
          const mentions = [];
          if (users.length !== 0) {
            await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
            return message.channel.send(`Reseted ignore bypass database`);
          } else {
            return message.channel.send(`No channel is in ignore bypass Database`);
          }
        }
      });
    }

    async function handleAddBypass(client, message, user) {
      await client.db10.get(`${message.guild.id}_ic`).then(async (data) => {
        if (!data) {
          await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the ignore command again because earlier database was not set up` });
        } else {
          if (!args[2]) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
          }
          if (!user) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
          } else {
            if (data.ignorebypasslist.includes(user.id)) {
              return message.channel.send({ content: `${emoji.util.cross} | Already added \`${user.user.username}\` in ignore bypass for this guild.` });
            }
            if (data.ignorebypasslist.length >= bypassLimit) {
              return message.channel.send(`${emoji.util.cross} | You have reached the maximum ignore bypass addition limit of 100.`);
            } else {
              await client.db10.push(`${message.guild.id}_ic.ignorebypasslist`, user.id);
              return message.channel.send({ content: `${emoji.util.tick} | Added \`${user.user.username}\` in ignore bypass for this guild.` });
            }
          }
        }
      });
    }

    async function handleRemoveBypass(client, message, user) {
      await client.db10.get(`${message.guild.id}_ic`).then(async (data) => {
        if (!data) {
          await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the ignore command again because earlier database was not set up` });
        } else {
          if (!args[2]) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
          }
          if (!user) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
          } else {
            if (!data.ignorebypasslist.includes(user.id)) {
              return message.channel.send({ content: `${emoji.util.cross} | \`${user.user.username}\` Yet not added in ignore bypass for this guild.` });
            } else {
              await client.db10.pull(`${message.guild.id}_ic.ignorebypasslist`, user.id);
              return message.channel.send({ content: `${emoji.util.tick} | \`${user.user.username}\` is Removed from ignore bypass for this guild.` });
            }
          }
        }
      });
    }

    async function handleBypassConfig(client, message) {
      await client.db10.get(`${message.guild.id}_ic`).then(async (data) => {
        if (!data) {
          await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the ignore command again because earlier database was not set up` });
        } else {
          const bypassUsers = data.ignorebypasslist;

          if (bypassUsers.length === 0) {
            return message.channel.send(`No users are in ignore bypass Database`);
          }

          const itemsPerPage = 10;
          const totalPages = Math.ceil(bypassUsers.length / itemsPerPage);
          let currentPage = 0;

          const generateContainer = (page) => {
            const startIndex = page * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, bypassUsers.length);
            const currentBypass = bypassUsers.slice(startIndex, endIndex);
            const mentions = [];

            currentBypass.forEach((userId, i) => {
              const member = message.guild.members.cache.get(userId);
              if (member) {
                mentions.push(`\`[${startIndex + i + 1}]\` | ID: [${userId}](https://discord.com/users/${userId}) | <@${userId}>`);
              }
            });

            const configContainer = new ContainerBuilder()
              .setAccentColor(client.color || 0x5865F2);

            configContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**${client.user.tag}**`)
            );

            configContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Total Ignore Bypass Users - Page ${currentPage + 1}/${totalPages}**`)
            );

            configContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(mentions.join('\n'))
            );

            configContainer.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );

            configContainer.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`*Thanks For Selecting ${client.user.username}*`)
            );

            return configContainer;
          };

          const container = generateContainer(currentPage);

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

          if (totalPages === 1) {
            pag.components.forEach((button) => {
              button.setDisabled(true);
            });
          }

          container.addActionRowComponents(pag);

          const messageComponent = await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });

          const collector = messageComponent.createMessageComponentCollector({
            filter: (interaction) => {
              if (message.author.id === interaction.user.id) return true;
              else {
                const errorContainer = new ContainerBuilder()
                  .setAccentColor(0xED4245)
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.cross} | This Pagination is not for you.`)
                  );
                return interaction.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
              }
            },
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

              const updatedContainer = generateContainer(currentPage);

              const firstButton = pag.components.find((component) => component.customId === "first");
              const previousButton = pag.components.find((component) => component.customId === "previous");
              const nextButton = pag.components.find((component) => component.customId === "next");
              const lastButton = pag.components.find((component) => component.customId === "last");

              firstButton.setDisabled(currentPage === 0);
              previousButton.setDisabled(currentPage === 0);
              nextButton.setDisabled(currentPage === totalPages - 1);
              lastButton.setDisabled(currentPage === totalPages - 1);

              updatedContainer.addActionRowComponents(pag);
              interaction.update({ components: [updatedContainer], flags: MessageFlags.IsComponentsV2 });
            }
          });

          collector.on("end", () => {
            pag.components.forEach((button) => button.setDisabled(true));
            messageComponent.edit({ components: [pag] });
          });
        }
      });
    }

    async function handleBypassReset(client, message) {
      await client.db10.get(`${message.guild.id}_ic`).then(async (data) => {
        if (!data) {
          await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the ignore command again because earlier database was not set up` });
        } else {
          const users = data.ignorebypasslist;
          if (users.length !== 0) {
            await client.db10.set(`${message.guild.id}_ic`, { ignorechannellist: [], ignorebypasslist: [] });
            return message.channel.send(`Reseted ignore bypass database`);
          } else {
            return message.channel.send(`No users are in ignore bypass Database`);
          }
        }
      });
    }
  }
};
