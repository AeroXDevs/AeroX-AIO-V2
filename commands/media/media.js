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
  name: 'media',
  UserPerms: ['ManageChannels', 'ManageMessages'],
  BotPerms: ['ManageChannels', 'ManageMessages'],
  run: async (client, message, args) => {
    const prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;
    const limit = 100;

    await handleMediaCommand(client, message, args);

    async function handleMediaCommand(client, message, args) {
      const option = args[0];
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);

      switch (option) {
        case 'channel':
          if (args[1] === 'add') {
            await handleAddChannel(client, message, channel);
          } else if (args[1] === 'remove') {
            await handleRemoveChannel(client, message, channel);
          }
          break;
        case 'config':
          await handleConfig(client, message);
          break;
        case 'reset':
          await handleReset(client, message);
          break;
        default:
          return sendGuideContainer();
      }
    }

    function sendGuideContainer() {
      const container = new ContainerBuilder();
      
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
      );
      
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## Available Commands'),
        new TextDisplayBuilder().setContent(
          `${emoji.util.arrow} \`${prefix}media\`\n` +
          'Shows the guide for the module.\n\n' +
          `${emoji.util.arrow} \`${prefix}media channel add <channel>\`\n` +
          'Add the channel in media channels.\n\n' +
          `${emoji.util.arrow} \`${prefix}media channel remove <channel>\`\n` +
          'Remove the channel from media channels.\n\n' +
          `${emoji.util.arrow} \`${prefix}media config\`\n` +
          'Show media module settings for the server.\n\n' +
          `${emoji.util.arrow} \`${prefix}media reset\`\n` +
          'Resets media settings for the server.'
        )
      );
      
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );

      return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    async function handleAddChannel(client, message, channel) {
      await client.db14.get(`${message.guild.id}_mediachannels`).then(async (data) => {
        if (!data) {
          await client.db14.set(`${message.guild.id}_mediachannels`, { mediachannellist: [] });
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.cross} Please run the media command again because earlier database was not set up`)
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          if (!args[2]) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`${emoji.util.cross} Prioritize Channel Mention`)
            );
            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
          }
          if (!channel) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`${emoji.util.cross} Prioritize Channel Mention`)
            );
            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
          } else {
            if (data.mediachannellist.includes(channel.id)) {
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
              );
              container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${emoji.util.cross} Already added \`${channel.name}\` in media channel for this guild.`)
              );
              return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
            if (data.mediachannellist.length >= limit) {
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
              );
              container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${emoji.util.cross} You have reached the maximum media channel addition limit of 100.`)
              );
              return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            } else {
              await client.db14.push(`${message.guild.id}_mediachannels.mediachannellist`, channel.id);
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
              );
              container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${emoji.util.tick} Added \`${channel.name}\` in media channel for this guild.`)
              );
              return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
          }
        }
      });
    }

    async function handleRemoveChannel(client, message, channel) {
      await client.db14.get(`${message.guild.id}_mediachannels`).then(async (data) => {
        if (!data) {
          await client.db14.set(`${message.guild.id}_mediachannels`, { mediachannellist: [] });
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.cross} Please run the media command again because earlier database was not set up`)
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          if (!args[2]) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`${emoji.util.cross} Prioritize Channel Mention`)
            );
            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
          }
          if (!channel) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`${emoji.util.cross} Prioritize Channel Mention`)
            );
            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
          } else {
            if (!data.mediachannellist.includes(channel.id)) {
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
              );
              container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${emoji.util.cross} \`${channel.name}\` Yet not added in media channel for this guild.`)
              );
              return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            } else {
              await client.db14.pull(`${message.guild.id}_mediachannels.mediachannellist`, channel.id);
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
              );
              container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${emoji.util.tick} \`${channel.name}\` is Removed from media channel for this guild.`)
              );
              return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
          }
        }
      });
    }

    async function handleConfig(client, message) {
      await client.db14.get(`${message.guild.id}_mediachannels`).then(async (data) => {
        if (!data) {
          await client.db14.set(`${message.guild.id}_mediachannels`, { mediachannellist: [] });
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.cross} Please run the media command again because earlier database was not set up`)
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          const channels = data.mediachannellist;

          if (channels.length === 0) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`${emoji.util.cross} No channel is in Media Channel Database`)
            );
            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
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
              } else {
                mentions.push(`\`[${startIndex + i + 1}]\` | Channel with ID ${channelId} has been deleted.`);
              }
            });

            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Total Media Channels - Page ${currentPage + 1}/${totalPages}`)
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(mentions.join('\n'))
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );

            return container;
          };

          const containerMsg = generateContainer(currentPage);

          const firstButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId("first")
            .setLabel("≪")
            .setDisabled(true)
          const backButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId("previous")
            .setLabel("Previous")
            .setDisabled(true)
          const cancelButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId("close")
            .setLabel("Close")
            .setDisabled(false)
          const nextButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setCustomId("next")
            .setLabel("Next")
            .setDisabled(false)
          const lastButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setCustomId("last")
            .setLabel("≫")
            .setDisabled(false)

          const pag = new ActionRowBuilder().addComponents(firstButton, backButton, cancelButton, nextButton, lastButton);

          if (totalPages === 1) {
            pag.components.forEach((button) => {
              button.setDisabled(true);
            });
          }

          const messageComponent = await message.channel.send({ components: [containerMsg, pag], flags: MessageFlags.IsComponentsV2 });

          const collector = messageComponent.createMessageComponentCollector({
            filter: (interaction) => {
              if (message.author.id === interaction.user.id) return true;
              else {
                return interaction.reply({ content: `${emoji.util.cross} | This Pagination is not for you.`, ephemeral: true });
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

              firstButton.setDisabled(currentPage === 0);
              backButton.setDisabled(currentPage === 0);
              nextButton.setDisabled(currentPage === totalPages - 1);
              lastButton.setDisabled(currentPage === totalPages - 1);

              interaction.update({ components: [updatedContainer, pag], flags: MessageFlags.IsComponentsV2 });
            }
          });

          collector.on("end", () => {
            pag.components.forEach((button) => button.setDisabled(true));
            messageComponent.edit({ components: [containerMsg, pag] });
          });
        }
      });
    }

    async function handleReset(client, message) {
      await client.db14.get(`${message.guild.id}_mediachannels`).then(async (data) => {
        if (!data) {
          await client.db14.set(`${message.guild.id}_mediachannels`, { mediachannellist: [] });
          const container = new ContainerBuilder();
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
          );
          container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          );
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.cross} Please run the media command again because earlier database was not set up`)
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          const users = data.mediachannellist;
          if (users.length !== 0) {
            await client.db14.set(`${message.guild.id}_mediachannels`, { mediachannellist: [] });
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`${emoji.util.tick} Reseted Media Channel database`)
            );
            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
          } else {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`# ${emoji.id.moderation} Media Channels`)
            );
            container.addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`${emoji.util.cross} No channel is in Media Channel Database`)
            );
            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
          }
        }
      });
    }
  }
}
