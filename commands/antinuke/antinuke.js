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

function createSecurityContainer(title, message, status, footerText) {
  const container = new ContainerBuilder();
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${emoji.id.automod} ${title}`)
  );
  
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('## Security Settings'),
    new TextDisplayBuilder().setContent(`${message}\n**Current Status:** ${status}`)
  );
  
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
  );
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`*${footerText}*`)
  );
  
  return container;
}

function createFeaturesContainer(client, prefix) {
  const container = new ContainerBuilder();
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Anti-Nuke Features\n*Welcome to ${client.user.username}'s Security System*`)
  );
  
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('## Available Protection Features')
  );
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${emoji.util.arrow} Anti Ban\n` +
      `${emoji.util.arrow} Anti Kick\n` +
      `${emoji.util.arrow} Anti Bot\n` +
      `${emoji.util.arrow} Anti Unban\n` +
      `${emoji.util.arrow} Anti Guild Update\n` +
      `${emoji.util.arrow} Anti Member Update\n` +
      `${emoji.util.arrow} Anti Role Create\n` +
      `${emoji.util.arrow} Anti Role Delete\n` +
      `${emoji.util.arrow} Anti Role Update\n` +
      `${emoji.util.arrow} Anti Channel Create\n` +
      `${emoji.util.arrow} Anti Channel Delete\n` +
      `${emoji.util.arrow} Anti Channel Update\n` +
      `${emoji.util.arrow} Anti Webhook Create\n` +
      `${emoji.util.arrow} Anti Webhook Delete\n` +
      `${emoji.util.arrow} Anti Webhook Update\n` +
      `${emoji.util.arrow} Anti Emoji Create\n` +
      `${emoji.util.arrow} Anti Emoji Delete\n` +
      `${emoji.util.arrow} Anti Emoji Update\n` +
      `${emoji.util.arrow} Anti Sticker Create\n` +
      `${emoji.util.arrow} Anti Sticker Delete\n` +
      `${emoji.util.arrow} Anti Sticker Update\n` +
      `${emoji.util.arrow} Anti Prune\n` +
      `${emoji.util.arrow} Auto Recovery`
    )
  );
  
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## Support\nJoin the support server if you need assistance: [Support Server](${Settings.bot.credits.supportServer})`)
  );
  
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
  );
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`*Thanks for selecting ${client.user.username}!*`)
  );
  
  return container;
}

module.exports = {
  name: 'antinuke',
  aliases: ['security', 'an'],
  UserPerms: ['Administrator'],
  BotPerms: ['EmbedLinks', 'ManageChannels', 'ManageGuild', 'ManageRoles', 'ManageEmojis', 'ManageWebhooks'],
  aboveRole: true,
  run: async (client, message, args) => {
    console.log('[ANTINUKE] Command triggered by:', message.author.tag, 'Args:', args);
    let prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;
    const arypton = await client.users.fetch(owner);
    let limit = 100;

    const user = message.guild.members.cache.get(args[2]) || message.mentions.members.first() || message.author;
    const member = message.guild.members.cache.get(args[2]) || message.mentions.members.first() || message.author;
    const ID = user.id;
    const antiwizz = [];

    const [
      isActivatedAlready, antiban, antikick, antibot, antiunban, antiguildup,
      antimemberup, antichannelcreate, antichanneldelete, antichannelupdate,
      antirolecreate, antiroledelete, antiroleupdate, antiwebhookcreate,
      antiwebhookdelete, antiwebhookupdate, antiemojicreate, antiemojidelete,
      antiemojiupdate, antistickercreate, antistickerdelete, antistickerupdate, antiprune, autorecovery
    ] = await Promise.all([
      client.db.get(`${message.guild.id}_antinuke`),
      client.db.get(`${message.guild.id}_antiban`),
      client.db.get(`${message.guild.id}_antikick`),
      client.db.get(`${message.guild.id}_antibot`),
      client.db.get(`${message.guild.id}_antiunban`),
      client.db.get(`${message.guild.id}_antiguildupdate`),
      client.db.get(`${message.guild.id}_antimemberupdate`),
      client.db.get(`${message.guild.id}_antichannelcreate`),
      client.db.get(`${message.guild.id}_antichanneldelete`),
      client.db.get(`${message.guild.id}_antichannelupdate`),
      client.db.get(`${message.guild.id}_antirolecreate`),
      client.db.get(`${message.guild.id}_antiroledelete`),
      client.db.get(`${message.guild.id}_antiroleupdate`),
      client.db.get(`${message.guild.id}_antiwebhookcreate`),
      client.db.get(`${message.guild.id}_antiwebhookdelete`),
      client.db.get(`${message.guild.id}_antiwebhookupdate`),
      client.db.get(`${message.guild.id}_antiemojicreate`),
      client.db.get(`${message.guild.id}_antiemojidelete`),
      client.db.get(`${message.guild.id}_antiemojiupdate`),
      client.db.get(`${message.guild.id}_antistickercreate`),
      client.db.get(`${message.guild.id}_antistickerdelete`),
      client.db.get(`${message.guild.id}_antistickerupdate`),
      client.db.get(`${message.guild.id}_antiprune`),
      client.db.get(`${message.guild.id}_autorecovery`)
    ]);

    if (antiban) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Ban`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Ban`)
    }

    if (antikick) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Kick`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Kick`)
    }

    if (antibot) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Bot`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Bot`)
    }

    if (antiunban) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Unban`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Unban`)
    }

    if (antiguildup) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Guild Update`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Guild Update`)
    }

    if (antimemberup) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Member Update`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Member Update`)
    }

    if (antichannelcreate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Channel Create`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Channel Create`)
    }

    if (antichanneldelete) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Channel Delete`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Channel Delete`)
    }

    if (antichannelupdate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Channel Update`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Channel Update`)
    }

    if (antirolecreate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Role Create`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Role Create`)
    }

    if (antiroledelete) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Role Delete`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Role Delete`)
    }

    if (antiroleupdate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Role Update`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Role Update`)
    }

    if (antiwebhookcreate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Webhook Create`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Webhook Create`)
    }

    if (antiwebhookdelete) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Webhook Delete`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Webhook Delete`)
    }

    if (antiwebhookupdate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Webhook Update`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Webhook Update`)
    }

    if (antiemojicreate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Emoji Create`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Emoji Create`)
    }

    if (antiemojidelete) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Emoji Delete`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Emoji Delete`)
    }

    if (antiemojiupdate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Emoji Update`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Emoji Update`)
    }

    if (antistickercreate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Sticker Create`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Sticker Create`)
    }

    if (antistickerdelete) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Sticker Delete`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Sticker Delete`)
    }

    if (antistickerupdate) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Sticker Update`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Sticker Update`)
    }

    if (antiprune) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Anti Prune`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Anti Prune`)
    }

    if (autorecovery) {
      antiwizz.push(`${emoji.util.disabler}${emoji.util.enabled} Auto Recovery`)
    } else {
      antiwizz.push(`${emoji.util.disabled}${emoji.util.enabler} Auto Recovery`)
    }

    const onkrle = createSecurityContainer(
      'Anti-Nuke',
      'Antinuke is currently disabled on your server.',
      `${emoji.util.disabled}`,
      `To activate this feature, use \`${prefix}antinuke enable\``
    );

    const option = args.join(' ').toLowerCase();
    
    switch (option) {
      case '':
      case 'help':
        return message.channel.send({ components: [createFeaturesContainer(client, prefix)], flags: MessageFlags.IsComponentsV2 });

      case 'enable':
        if (isActivatedAlready) {
          const container = createSecurityContainer(
            'Anti-Nuke',
            'Antinuke is already active on your server.',
            `${emoji.util.enabled}`,
            `To deactivate this feature, use \`${prefix}antinuke disable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          await client.db.set(`${message.guild.id}_antinuke`, true);
          const container = createSecurityContainer(
            'Anti-Nuke',
            'Antinuke settings have been successfully enabled on your server.',
            `${emoji.util.enabled}`,
            `To deactivate this feature, use \`${prefix}antinuke disable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

      case 'disable':
        if (!isActivatedAlready) {
          const container = createSecurityContainer(
            'Anti-Nuke',
            'Antinuke has already been deactivated on your server.',
            `${emoji.util.disabled}`,
            `To activate this feature, use \`${prefix}antinuke enable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          await client.db.delete(`${message.guild.id}_antinuke`);
          const container = createSecurityContainer(
            'Anti-Nuke',
            'Antinuke settings have been successfully deactivated on your server.',
            `${emoji.util.disabled}`,
            `To activate this feature, use \`${prefix}antinuke enable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

      case 'antiban enable':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        }
        if (antiban) {
          const container = createSecurityContainer(
            'Anti Ban',
            'Anti Ban is already enabled on your server.',
            `${emoji.util.disabler}${emoji.util.enabled}`,
            `To disable Anti Ban, use \`${prefix}antinuke antiban disable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          await client.db.set(`${message.guild.id}_antiban`, true);
          const container = createSecurityContainer(
            'Anti Ban',
            'Anti Ban has been successfully enabled on your server.',
            `${emoji.util.disabler}${emoji.util.enabled}`,
            `To disable Anti Ban, use \`${prefix}antinuke antiban disable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

      case 'antiban disable':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        }
        if (!antiban) {
          const container = createSecurityContainer(
            'Anti Ban',
            'Anti Ban is already disabled on your server.',
            `${emoji.util.disabled}${emoji.util.enabler}`,
            `To enable Anti Ban, use \`${prefix}antinuke antiban enable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          await client.db.delete(`${message.guild.id}_antiban`);
          const container = createSecurityContainer(
            'Anti Ban',
            'Anti Ban has been successfully disabled on your server.',
            `${emoji.util.disabled}${emoji.util.enabler}`,
            `To enable Anti Ban, use \`${prefix}antinuke antiban enable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

      case 'antikick enable':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        }
        if (antikick) {
          const container = createSecurityContainer(
            'Anti Kick',
            'Anti Kick is already enabled on your server.',
            `${emoji.util.disabler}${emoji.util.enabled}`,
            `To disable Anti Kick, use \`${prefix}antinuke antikick disable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          await client.db.set(`${message.guild.id}_antikick`, true);
          const container = createSecurityContainer(
            'Anti Kick',
            'Anti Kick has been successfully enabled on your server.',
            `${emoji.util.disabler}${emoji.util.enabled}`,
            `To disable Anti Kick, use \`${prefix}antinuke antikick disable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

      case 'antikick disable':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        }
        if (!antikick) {
          const container = createSecurityContainer(
            'Anti Kick',
            'Anti Kick is already disabled on your server.',
            `${emoji.util.disabled}${emoji.util.enabler}`,
            `To enable Anti Kick, use \`${prefix}antinuke antikick enable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          await client.db.delete(`${message.guild.id}_antikick`);
          const container = createSecurityContainer(
            'Anti Kick',
            'Anti Kick has been successfully disabled on your server.',
            `${emoji.util.disabled}${emoji.util.enabler}`,
            `To enable Anti Kick, use \`${prefix}antinuke antikick enable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

      case 'antibot enable':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        }
        if (antibot) {
          const container = createSecurityContainer(
            'Anti Bot',
            'Anti Bot is already enabled on your server.',
            `${emoji.util.disabler}${emoji.util.enabled}`,
            `To disable it, use \`${prefix}antinuke antibot disable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          await client.db.set(`${message.guild.id}_antibot`, true);
          const container = createSecurityContainer(
            'Anti Bot',
            'Anti Bot has been successfully enabled.',
            `${emoji.util.disabler}${emoji.util.enabled}`,
            `To disable it, use \`${prefix}antinuke antibot disable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

      case 'antibot disable':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        }
        if (!antibot) {
          const container = createSecurityContainer(
            'Anti Bot',
            'Anti Bot is already disabled on your server.',
            `${emoji.util.disabled}${emoji.util.enabler}`,
            `To enable it, use \`${prefix}antinuke antibot enable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
          await client.db.delete(`${message.guild.id}_antibot`);
          const container = createSecurityContainer(
            'Anti Bot',
            'Anti Bot has been successfully disabled.',
            `${emoji.util.disabled}${emoji.util.enabler}`,
            `To enable it, use \`${prefix}antinuke antibot enable\``
          );
          return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

      case 'whitelist show':
      case 'wl show':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        } else {
          return client.db.get(`${message.guild.id}_wl`).then(async (data) => {
            if (!data) {
              await client.db.set(`${message.guild.id}_wl`, { whitelisted: [] });
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
              );
              container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${emoji.util.cross} Please run the whitelist command again because earlier database was not set up`)
              );
              return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            } else {
              const listData = data.whitelisted;

              if (!listData || listData.length === 0) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                );
                container.addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`${emoji.util.cross} There are no whitelisted users in this server at the moment.`)
                );
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
              }

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
                  new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Total Whitelisted Users - Page ${currentPage + 1}/${totalPages}`)
                );
                container.addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(memberList)
                );
                container.addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                );
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`*Thanks for selecting ${client.user.username}!*`)
                );
                
                return container;
              };

              let currentPage = 0;
              const containerMsg = await generateContainer(currentPage);

              if (totalPages === 1) {
                pag.components.forEach((button) => {
                  button.setDisabled(true);
                });
              }

              const messageComponent = await message.channel.send({ components: [containerMsg, pag], flags: MessageFlags.IsComponentsV2 });

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

              collector.on("end", () => {
                pag.components.forEach((button) => button.setDisabled(true));
                messageComponent.edit({ components: [containerMsg, pag], flags: MessageFlags.IsComponentsV2 });
              });
            }
          });
        }

      case 'whitelist add':
      case 'wl add':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        } else {
          return client.db.get(`${message.guild.id}_wl`).then(async (data) => {
            if (!data) {
              await client.db.set(`${message.guild.id}_wl`, { whitelisted: [] });
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
              );
              container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${emoji.util.cross} Please run the whitelist command again because earlier database was not set up`)
              );
              return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            } else {
              if (!args[2]) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                );
                container.addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`${emoji.util.cross} Prioritize User Mention or ID`)
                );
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
              }
              if (!member) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                );
                container.addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`${emoji.util.cross} Prioritize User Mention or ID`)
                );
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
              } else {
                if (data.whitelisted.includes(ID)) {
                  const container = new ContainerBuilder();
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                  );
                  container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                  );
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.cross} \`${user.user.username}\` is already whitelisted for this guild.`)
                  );
                  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
                }
                if (data.whitelisted.length >= limit) {
                  const container = new ContainerBuilder();
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                  );
                  container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                  );
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.cross} You have reached the maximum whitelist limit of 100.`)
                  );
                  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
                } else {
                  await client.db.push(`${message.guild.id}_wl.whitelisted`, ID);
                  const container = new ContainerBuilder();
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                  );
                  container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                  );
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.tick} Whitelisted \`${user.user.username}\` for this guild.`)
                  );
                  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
                }
              }
            }
          });
        }

      case 'whitelist remove':
      case 'wl remove':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        } else {
          return client.db.get(`${message.guild.id}_wl`).then(async (data) => {
            if (!data) {
              await client.db.set(`${message.guild.id}_wl`, { whitelisted: [] });
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
              );
              container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${emoji.util.cross} Please run the whitelist command again because earlier database was not set up`)
              );
              return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            } else {
              if (!args[2]) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                );
                container.addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`${emoji.util.cross} Prioritize User Mention or ID`)
                );
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
              }
              if (!member) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                );
                container.addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`${emoji.util.cross} Prioritize User Mention or ID`)
                );
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
              } else {
                if (!data.whitelisted.includes(ID)) {
                  const container = new ContainerBuilder();
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                  );
                  container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                  );
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.cross} \`${user.user.username}\` Yet not whitelisted for this guild.`)
                  );
                  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
                } else {
                  await client.db.pull(`${message.guild.id}_wl.whitelisted`, ID);
                  const container = new ContainerBuilder();
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                  );
                  container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                  );
                  container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.tick} \`${user.user.username}\` is Removed from whitelist for this guild.`)
                  );
                  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
                }
              }
            }
          });
        }

      case 'whitelist reset':
      case 'wl reset':
        if (!isActivatedAlready) {
          return message.channel.send({ components: [onkrle], flags: MessageFlags.IsComponentsV2 });
        } else {
          return client.db.get(`${message.guild.id}_wl`).then(async (data) => {
            if (!data) {
              await client.db.set(`${message.guild.id}_wl`, { whitelisted: [] });
              const container = new ContainerBuilder();
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
              );
              container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${emoji.util.cross} Please run the whitelist command again because earlier database was not set up`)
              );
              return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            } else {
              const users = data.whitelisted;
              if (users.length !== 0) {
                await client.db.set(`${message.guild.id}_wl`, { whitelisted: [] });
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                );
                container.addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`${emoji.util.tick} All users have been successfully removed from the whitelist.`)
                );
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
              } else {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Whitelist`)
                );
                container.addSeparatorComponents(
                  new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                container.addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(`${emoji.util.cross} There are currently no whitelisted users in this server.`)
                );
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
              }
            }
          });
        }

      default:
        if (args[0] === 'whitelist') {
          return;
        }

        if (args[0] === 'wl') {
          return;
        }

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# ${emoji.id.automod} Anti-Nuke Commands`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('## Available Commands'),
          new TextDisplayBuilder().setContent(
            `${emoji.util.arrow} \`${prefix}antinuke enable\` - Enable anti-nuke protection\n` +
            `${emoji.util.arrow} \`${prefix}antinuke disable\` - Disable anti-nuke protection\n` +
            `${emoji.util.arrow} \`${prefix}antinuke antiban enable/disable\`\n` +
            `${emoji.util.arrow} \`${prefix}antinuke antikick enable/disable\`\n` +
            `${emoji.util.arrow} \`${prefix}antinuke antibot enable/disable\`\n` +
            `${emoji.util.arrow} \`${prefix}antinuke whitelist add/remove <user>\`\n` +
            `${emoji.util.arrow} \`${prefix}antinuke whitelist show\`\n` +
            `${emoji.util.arrow} \`${prefix}antinuke whitelist reset\``
          )
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`*Type \`${prefix}antinuke help\` for more information*`)
        );
        return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  }
};
