
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
const { ownerIDS } = require('../../dev.json');
const Settings = require('../../settings.js');
const emoji = require('../../emoji.js');
const owner = Settings.bot.credits.developerId;

module.exports = {
  name: 'extra',
  run: async (client, message, args) => {
    const prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;
    const arypton = await client.users.fetch(owner);
    const user = message.mentions.members.first() || message.guild.members.cache.get(args[2]) || message.author;
    const ID = user.id
    const extraOwner = await client.db11.get(`${message.guild.id}_eo.extraownerlist`);
    const ownerLimit = 100;
    const adminLimit = 100;

    const buildGuideContainer = () => {
      const container = new ContainerBuilder();
      
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${emoji.id.extra} Extra Commands**`)
      );
      
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('**Available Commands**'),
        new TextDisplayBuilder().setContent(
          `${emoji.util.arrow} \`${prefix}extra\`\n` +
          'Shows the guide for the module.\n\n' +
          `${emoji.util.arrow} \`${prefix}extra owner add <user mention/id>\`\n` +
          'Add the extra owner for the server.\n\n' +
          `${emoji.util.arrow} \`${prefix}extra admin add <user mention/id>\`\n` +
          'Add the extra admin for the server.\n\n' +
          `${emoji.util.arrow} \`${prefix}extra owner remove <user mention/id>\`\n` +
          'Remove the extra owner for the server.\n\n' +
          `${emoji.util.arrow} \`${prefix}extra admin remove <user mention/id>\`\n` +
          'Remove the extra admin for the server.\n\n' +
          `${emoji.util.arrow} \`${prefix}extra owner show\`\n` +
          'Shows the extra owner for this server.\n\n' +
          `${emoji.util.arrow} \`${prefix}extra admin show\`\n` +
          'Shows the extra admin for this server.\n\n' +
          `${emoji.util.arrow} \`${prefix}extra owner reset\`\n` +
          'Resets extra owner settings for the server.\n\n' +
          `${emoji.util.arrow} \`${prefix}extra admin reset\`\n` +
          'Resets extra admin settings for the server.'
        )
      );
      
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );

      return container;
    };

    async function handleExtraOwnerAdd(client, message, user) {
      const data = await client.db11.get(`${message.guild.id}_eo`);
      if (!data) {
        await client.db11.set(`${message.guild.id}_eo`, { extraownerlist: [] });
        return message.channel.send({ content: `${emoji.util.cross} | Please run the extra owner/admin command again because earlier database was not set up` });
      }

      if (!user) {
        return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
      }

      if (data.extraownerlist.includes(ID)) {
        return message.channel.send({ content: `${emoji.util.cross} | Already added \`${user.user.username}\` to Extra Owner for this guild .` });
      }

      if (data.extraownerlist.length >= ownerLimit) {
        return message.channel.send(`${emoji.util.cross} | You have reached the maximum extra owner addition limit of 100.`);
      }

      await client.db11.push(`${message.guild.id}_eo.extraownerlist`, ID);
      return message.channel.send({ content: `${emoji.util.tick} | Added \`${user.user.username}\` to Extra Owner for this guild .` });
    };

    async function handleExtraOwnerRemove(client, message, user) {
      const data = await client.db11.get(`${message.guild.id}_eo`);
      if (!data) {
        await client.db11.set(`${message.guild.id}_eo`, { extraownerlist: [] });
        return message.channel.send({ content: `${emoji.util.cross} | Please run the extra owner/admin command again because earlier database was not set up` });
      }

      if (!user) {
        return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
      }

      if (!data.extraownerlist.includes(ID)) {
        return message.channel.send({ content: `${emoji.util.cross} | Yet not added \`${user.user.username}\` in Extra Owner for this guild .` });
      }

      await client.db11.pull(`${message.guild.id}_eo.extraownerlist`, ID);
      return message.channel.send({ content: `${emoji.util.tick} | Removed \`${user.user.username}\` Extra Owner from this guild .` });
    };

    async function handleExtraOwnerConfig(client, message) {
      const data = await client.db11.get(`${message.guild.id}_eo`);
      if (!data) {
        await client.db11.set(`${message.guild.id}_eo`, { extraownerlist: [] });
        return message.channel.send({ content: `${emoji.util.cross} | Please run the extra owner/admin command again because earlier database was not set up` });
      }

      const users = data.extraownerlist;
      const mentions = [];

      if (users.length === 0) {
        return message.channel.send(`No Extra Owner List`);
      }

      const itemsPerPage = 10;
      const totalPages = Math.ceil(users.length / itemsPerPage);
      let currentPage = 0;

      const generateContainer = (page) => {
        const startIndex = page * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, users.length);
        const currentUsers = users.slice(startIndex, endIndex);

        currentUsers.forEach((userId, i) => {
          mentions.push(`\`[${startIndex + i + 1}]\` | ID: [${userId}](https://discord.com/users/${userId}) | <@${userId}>`);
        });

        const configContainer = new ContainerBuilder()
          .setAccentColor(client.color || 0x5865F2);

        configContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${client.user.tag}**`)
        );

        configContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Extra Owner List - Page ${currentPage + 1}/${totalPages}**`)
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

          firstButton.setDisabled(currentPage === 0);
          backButton.setDisabled(currentPage === 0);
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
    };

    async function handleExtraOwnerReset(client, message) {
      const data = await client.db11.get(`${message.guild.id}_eo`);
      if (!data) {
        await client.db11.set(`${message.guild.id}_eo`, { extraownerlist: [] });
        return message.channel.send({ content: `${emoji.util.cross} | Please run the extra owner/admin command again because earlier database was not set up` });
      }

      const users = data.extraownerlist;
      if (users.length !== 0) {
        await client.db11.set(`${message.guild.id}_eo`, { extraownerlist: [] });
        return message.channel.send(`Reseted Extra Owner List`);
      } else {
        return message.channel.send(`No one is in Extra Owner List`);
      }
    };

    async function handleExtraAdminAdd(client, message, user) {
      const data = await client.db11.get(`${message.guild.id}_ea`);
      if (!data) {
        await client.db11.set(`${message.guild.id}_ea`, { extraadminlist: [] });
        return message.channel.send({ content: `${emoji.util.cross} | Please run the extra owner/admin command again because earlier database was not set up` });
      }

      if (!user) {
        return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
      }

      if (data.extraadminlist.includes(ID)) {
        return message.channel.send({ content: `${emoji.util.cross} | Already added \`${user.user.username}\` to extra admin for this guild .` });
      }

      if (data.extraadminlist.length >= adminLimit) {
        return message.channel.send(`${emoji.util.cross} | You have reached the maximum extra admin addition limit of 100.`);
      }

      await client.db11.push(`${message.guild.id}_ea.extraadminlist`, ID);
      return message.channel.send({ content: `${emoji.util.tick} | Added \`${user.user.username}\` to extra admin for this guild .` });
    };

    async function handleExtraAdminRemove(client, message, user) {
      const data = await client.db11.get(`${message.guild.id}_ea`);
      if (!data) {
        await client.db11.set(`${message.guild.id}_ea`, { extraadminlist: [] });
        return message.channel.send({ content: `${emoji.util.cross} | Please run the extra owner/admin command again because earlier database was not set up` });
      }

      if (!user) {
        return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
      }

      if (!data.extraadminlist.includes(ID)) {
        return message.channel.send({ content: `${emoji.util.cross} | Yet not added \`${user.user.username}\` in extra admin for this guild .` });
      }

      await client.db11.pull(`${message.guild.id}_ea.extraadminlist`, ID);
      return message.channel.send({ content: `${emoji.util.tick} | Removed \`${user.user.username}\` extra admin from this guild .` });
    };

    async function handleExtraAdminConfig(client, message) {
      const data = await client.db11.get(`${message.guild.id}_ea`);
      if (!data) {
        await client.db11.set(`${message.guild.id}_ea`, { extraadminlist: [] });
        return message.channel.send({ content: `${emoji.util.cross} | Please run the extra owner/admin command again because earlier database was not set up` });
      }

      const users = data.extraadminlist;
      const mentions = [];

      if (users.length === 0) {
        return message.channel.send(`No Extra Admin List`);
      }

      const itemsPerPage = 10;
      const totalPages = Math.ceil(users.length / itemsPerPage);
      let currentPage = 0;

      const generateContainer = (page) => {
        const startIndex = page * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, users.length);
        const currentUsers = users.slice(startIndex, endIndex);

        currentUsers.forEach((userId, i) => {
          mentions.push(`\`[${startIndex + i + 1}]\` | ID: [${userId}](https://discord.com/users/${userId}) | <@${userId}>`);
        });

        const configContainer = new ContainerBuilder()
          .setAccentColor(client.color || 0x5865F2);

        configContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**${client.user.tag}**`)
        );

        configContainer.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Extra Admin List - Page ${currentPage + 1}/${totalPages}**`)
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

          firstButton.setDisabled(currentPage === 0);
          backButton.setDisabled(currentPage === 0);
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
    };

    async function handleExtraAdminReset(client, message) {
      const data = await client.db11.get(`${message.guild.id}_ea`);
      if (!data) {
        await client.db11.set(`${message.guild.id}_ea`, { extraadminlist: [] });
        return message.channel.send({ content: `${emoji.util.cross} | Please run the extra owner/admin command again because earlier database was not set up` });
      }

      const users = data.extraadminlist;
      if (users.length !== 0) {
        await client.db11.set(`${message.guild.id}_ea`, { extraadminlist: [] });
        return message.channel.send(`Reseted Extra Admin List`);
      } else {
        return message.channel.send(`No one is in Extra Admin List`);
      }
    };

    switch (args[0]) {
      case undefined:
        if (!message.guild.ownerId.includes(message.author.id) && !ownerIDS.includes(message.author.id) && !extraOwner.includes(message.author.id)) {
          return message.channel.send({ content: `Only Server Owner and Extra Owners Can Use This Command.` });
        }
        return message.channel.send({ components: [buildGuideContainer()], flags: MessageFlags.IsComponentsV2 });
      case 'owner':
        if (!message.guild.ownerId.includes(message.author.id) && !ownerIDS.includes(message.author.id)) {
          return message.channel.send({ content: `Only Server Owner Can Use This Command.` });
        }
        if (args[1] === 'add') {
          return handleExtraOwnerAdd(client, message, user);
        } else if (args[1] === 'remove') {
          return handleExtraOwnerRemove(client, message, user);
        } else if (args[1] === 'show') {
          return handleExtraOwnerConfig(client, message, user);
        } else if (args[1] === 'reset') {
          return handleExtraOwnerReset(client, message);
        }
        break;
      case 'admin':
        if (!message.guild.ownerId.includes(message.author.id) && !ownerIDS.includes(message.author.id) && !extraOwner.includes(message.author.id)) {
          return message.channel.send({ content: `Only Server Owner and Extra Owners Can Use This Command.` });
        }
        if (args[1] === 'add') {
          return handleExtraAdminAdd(client, message, user);
        } else if (args[1] === 'remove') {
          return handleExtraAdminRemove(client, message, user);
        } else if (args[1] === 'show') {
          return handleExtraAdminConfig(client, message, user);
        } else if (args[1] === 'reset') {
          return handleExtraAdminReset(client, message);
        }
        break;
      default:
        return message.channel.send('Invalid command usage.');
    }
  }
};
