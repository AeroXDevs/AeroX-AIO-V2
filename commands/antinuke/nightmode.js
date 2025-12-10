const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Settings = require('../../settings.js');
const emoji = require('../../emoji.js');
const owner = Settings.bot.credits.developerId;

module.exports = {
  name: 'nightmode',
  UserPerms: ['Administrator'],
  BotPerms: ['EmbedLinks', 'ManageRoles'],
  aboveRole: true,
  run: async (client, message, args) => {
    const prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;
    const arypton = await client.users.fetch(owner);
    let roleLimit = 100;
    let bypassLimit = 100;

    const guideContainer = new ContainerBuilder()
      .addComponents(
        new TextDisplayBuilder()
          .setHeading(`${emoji.antinuke.nightmode} Night Mode Module Guide`)
          .setFontSize("large"),
        new SeparatorBuilder()
          .setDivider(true),
        new TextDisplayBuilder()
          .setText('**Available Commands**\n\n')
          .setFontSize("medium"),
        new TextDisplayBuilder()
          .setText(
            `${emoji.util.arrow} \`${prefix}nightmode\`\n` +
            'Displays the night mode module guide.\n\n' +
            `${emoji.util.arrow} \`${prefix}nightmode role add <role mention/id>\`\n` +
            'Adds a role to night mode roles.\n\n' +
            `${emoji.util.arrow} \`${prefix}nightmode role remove <role mention/id>\`\n` +
            'Removes a role from night mode roles.\n\n' +
            `${emoji.util.arrow} \`${prefix}nightmode role show\`\n` +
            'Shows server night mode role module settings.\n\n' +
            `${emoji.util.arrow} \`${prefix}nightmode role reset\`\n` +
            'Resets night mode role settings for the server.\n\n' +
            `${emoji.util.arrow} \`${prefix}nightmode bypass add <user mention/id>\`\n` +
            'Adds a user to night mode bypass.\n\n' +
            `${emoji.util.arrow} \`${prefix}nightmode bypass remove <user mention/id>\`\n` +
            'Removes a user from night mode bypass.\n\n' +
            `${emoji.util.arrow} \`${prefix}nightmode bypass show\`\n` +
            'Shows server night mode bypass module settings.\n\n' +
            `${emoji.util.arrow} \`${prefix}nightmode bypass reset\`\n` +
            'Resets night mode bypass settings for the server.\n\n'
          )
          .setFontSize("small"),
        new SeparatorBuilder()
          .setDivider(true)
      );

    await handleNightmodeCommand(client, message, args);

    async function handleNightmodeCommand(client, message, args) {
      const option = args[0];
      const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
      const member = message.mentions.members.first() || message.guild.members.cache.get(args[2]);

      switch (option) {
        case 'role':
          if (args[1] === 'add') {
            await handleAddRole(client, message, role);
          } else if (args[1] === 'remove') {
            await handleRemoveRole(client, message, role);
          } else if (args[1] === 'show') {
            await handleRoleConfig(client, message);
          } else if (args[1] === 'reset') {
            await handleRoleReset(client, message);
          }
          break;
        case 'bypass':
          if (args[1] === 'add') {
            await handleAddBypass(client, message, member);
          } else if (args[1] === 'remove') {
            await handleRemoveBypass(client, message, member);
          } else if (args[1] === 'show') {
            await handleBypassConfig(client, message);
          } else if (args[1] === 'reset') {
            await handleBypassReset(client, message);
          }
          break;
        default:
          return message.channel.send({ components: [guideContainer], flags: MessageFlags.IsComponentsV2 });
      }
    }

    async function handleAddRole(client, message, role) {
      await client.db15.get(`${message.guild.id}_nightmode`).then(async (data) => {
        if (!data) {
          await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the nightmode command again because earlier database was not set up` });
        } else {
          if (!args[2]) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the role or provide a valid role ID.` });
          }
          if (!role) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the role or provide a valid role ID.` });
          } else {
            if (data.nightmoderoleslist.includes(role.id)) {
              return message.channel.send({ content: `${emoji.util.cross} | Already added \`${role.name}\` in nightmode roles for this guild.` });
            }
            if (data.nightmoderoleslist.length >= roleLimit) {
              return message.channel.send(`${emoji.util.cross} | You have reached the maximum Nightmode Role Addition limit of 100.`);
            } else {
              await client.db15.push(`${message.guild.id}_nightmode.nightmoderoleslist`, role.id);
              return message.channel.send({ content: `${emoji.util.tick} | Added \`${role.name}\` in nightmode roles for this guild.` });
            }
          }
        }
      });
    }

    async function handleRemoveRole(client, message, role) {
      await client.db15.get(`${message.guild.id}_nightmode`).then(async (data) => {
        if (!data) {
          await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the nightmode command again because earlier database was not set up` });
        } else {
          if (!args[2]) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the role or provide a valid role ID.` });
          }
          if (!role) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the role or provide a valid role ID.` });
          } else {
            if (!data.nightmoderoleslist.includes(role.id)) {
              return message.channel.send({ content: `${emoji.util.cross} | \`${role.name}\` Yet not added in nightmode roles for this guild.` });
            } else {
              await client.db15.pull(`${message.guild.id}_nightmode.nightmoderoleslist`, role.id);
              return message.channel.send({ content: `${emoji.util.tick} | \`${role.name}\` is Removed from nightmode roles for this guild.` });
            }
          }
        }
      });
    }

    async function handleRoleConfig(client, message) {
      await client.db15.get(`${message.guild.id}_nightmode`).then(async (data) => {
        if (!data) {
          await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the nightmode command again because earlier database was not set up` });
        } else {
          const roles = data.nightmoderoleslist;

          if (roles.length === 0) {
            return message.channel.send(`${emoji.util.cross} No roles are in nightmode roles Database`);
          }

          const itemsPerPage = 10;
          const totalPages = Math.ceil(roles.length / itemsPerPage);
          let currentPage = 0;

          const generateContainer = (page) => {
            const startIndex = page * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, roles.length);
            const currentRoles = roles.slice(startIndex, endIndex);
            const mentions = [];

            currentRoles.forEach((roleId, i) => {
              const role = message.guild.roles.cache.get(roleId);
              if (role) {
                mentions.push(`\`[${startIndex + i + 1}]\` | ID: [${roleId}](https://discord.gg/8wfT8SfB5Z) | <@&${roleId}>`);
              }
            });

            return new ContainerBuilder()
              .addComponents(
                new TextDisplayBuilder()
                  .setHeading(`${emoji.antinuke.nightmode} Total Nightmode Roles`)
                  .setText(`Page ${currentPage + 1}/${totalPages}`)
                  .setFontSize("medium"),
                new SeparatorBuilder()
                  .setDivider(true),
                new TextDisplayBuilder()
                  .setText(mentions.join('\n'))
                  .setFontSize("small")
              );
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

          const messageComponent = await message.channel.send({ components: [container, pag], flags: MessageFlags.IsComponentsV2 });

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
            messageComponent.edit({ components: [generateContainer(currentPage), pag], flags: MessageFlags.IsComponentsV2 });
          });
        }
      });
    }

    async function handleRoleReset(client, message) {
      await client.db15.get(`${message.guild.id}_nightmode`).then(async (data) => {
        if (!data) {
          await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the nightmode command again because earlier database was not set up` });
        } else {
          const users = data.nightmoderoleslist;
          if (users.length !== 0) {
            await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
            return message.channel.send(`${emoji.util.tick} Reseted nightmode roles database`);
          } else {
            return message.channel.send(`${emoji.util.cross} No roles are in nightmode roles Database`);
          }
        }
      });
    }

    async function handleAddBypass(client, message, member) {
      await client.db15.get(`${message.guild.id}_nightmode`).then(async (data) => {
        if (!data) {
          await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the nightmode command again because earlier database was not set up` });
        } else {
          if (!args[2]) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
          }
          if (!member) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
          } else {
            if (data.nightmodebypasslist.includes(member.id)) {
              return message.channel.send({ content: `${emoji.util.cross} | Already added \`${member.user.username}\` in nightmode bypass for this guild.` });
            }
            if (data.nightmodebypasslist.length >= bypassLimit) {
              return message.channel.send(`${emoji.util.cross} | You have reached the maximum Nightmode Bypass Addition limit of 100.`);
            } else {
              await client.db15.push(`${message.guild.id}_nightmode.nightmodebypasslist`, member.id);
              return message.channel.send({ content: `${emoji.util.tick} | Added \`${member.user.username}\` in nightmode bypass for this guild.` });
            }
          }
        }
      });
    }

    async function handleRemoveBypass(client, message, member) {
      await client.db15.get(`${message.guild.id}_nightmode`).then(async (data) => {
        if (!data) {
          await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the nightmode command again because earlier database was not set up` });
        } else {
          if (!args[2]) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
          }
          if (!member) {
            return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
          } else {
            if (!data.nightmodebypasslist.includes(member.id)) {
              return message.channel.send({ content: `${emoji.util.cross} | \`${member.user.username}\` Yet not added in nightmode bypass for this guild.` });
            } else {
              await client.db15.pull(`${message.guild.id}_nightmode.nightmodebypasslist`, member.id);
              return message.channel.send({ content: `${emoji.util.tick} | \`${member.user.username}\` is Removed from nightmode bypass for this guild.` });
            }
          }
        }
      });
    }

    async function handleBypassConfig(client, message) {
      await client.db15.get(`${message.guild.id}_nightmode`).then(async (data) => {
        if (!data) {
          await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the nightmode command again because earlier database was not set up` });
        } else {
          const bypassUsers = data.nightmodebypasslist;

          if (bypassUsers.length === 0) {
            return message.channel.send(`${emoji.util.cross} No users are in nightmode bypass Database`);
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

            return new ContainerBuilder()
              .addComponents(
                new TextDisplayBuilder()
                  .setHeading(`${emoji.antinuke.nightmode} Total Nightmode Bypass`)
                  .setText(`Page ${currentPage + 1}/${totalPages}`)
                  .setFontSize("medium"),
                new SeparatorBuilder()
                  .setDivider(true),
                new TextDisplayBuilder()
                  .setText(mentions.join('\n'))
                  .setFontSize("small")
              );
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

          const messageComponent = await message.channel.send({ components: [container, pag], flags: MessageFlags.IsComponentsV2 });

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
            messageComponent.edit({ components: [generateContainer(currentPage), pag], flags: MessageFlags.IsComponentsV2 });
          });
        }
      });
    }

    async function handleBypassReset(client, message) {
      await client.db15.get(`${message.guild.id}_nightmode`).then(async (data) => {
        if (!data) {
          await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
          return message.channel.send({ content: `${emoji.util.cross} | Please run the nightmode command again because earlier database was not set up` });
        } else {
          const users = data.nightmodebypasslist;
          if (users.length !== 0) {
            await client.db15.set(`${message.guild.id}_nightmode`, { nightmoderoleslist: [], nightmodebypasslist: [] });
            return message.channel.send(`${emoji.util.tick} Reseted nightmode bypass database`);
          } else {
            return message.channel.send(`${emoji.util.cross} No users are in nightmode bypass Database`);
          }
        }
      });
    }
  }
};
