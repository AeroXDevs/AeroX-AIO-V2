const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  PermissionsBitField
} = require('discord.js');
const { ownerIDS } = require('../../dev.json');
const Settings = require('../../settings.js');
const emoji = require('../../emoji.js');
const owner = Settings.bot.credits.developerId;
const fs = require('fs');
const path = require('path');

const vanityFilePath = path.join(__dirname, 'vanity.json');
let vanityData = require('./vanity.json');

module.exports = {
  name: "vanity",
  aliases: ['vr'],
  UserPerms: [PermissionsBitField.Flags.Administrator],
  BotPerms: [PermissionsBitField.Flags.ManageRoles],
  run: async (client, message, args) => {
    const [command, subCommand, ...subArgs] = args;

    switch (command) {
      case undefined:
        return sendHelpContainer(client, message);

      case "set":
        switch (subCommand) {
          case "vanity":
            return setVanityURL(client, message, subArgs);

          case "role":
            return setVanityRole(client, message, subArgs);

          case "channel":
            return setVanityChannel(client, message, subArgs);

          default:
            break;
        }
        break;

      case "config":
        return sendConfigContainer(client, message);

      case "reset":
        return resetVanitySettings(client, message);

      default:
        break;
    }
  },
};

async function saveVanityData() {
  fs.writeFileSync(vanityFilePath, JSON.stringify(vanityData, null, 2));
}

async function sendHelpContainer(client, message) {
  const container = new ContainerBuilder();
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Role Commands`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('## Available Commands'),
    new TextDisplayBuilder().setContent(
      `${emoji.util.arrow} \`vanity config\`\n` +
      'Shows vanity role settings for the server.\n\n' +
      `${emoji.util.arrow} \`vanity guide\`\n` +
      'Shows the guide for vanity role settings.\n\n' +
      `${emoji.util.arrow} \`vanity set role <role>\`\n` +
      'Setups vanity role settings for the server.\n\n' +
      `${emoji.util.arrow} \`vanity set vanity <vanity>\`\n` +
      'Setups vanity role link settings for the server.\n\n' +
      `${emoji.util.arrow} \`vanity set channel <channel>\`\n` +
      'Setups vanity role settings for the server.\n\n' +
      `${emoji.util.arrow} \`vanity reset\`\n` +
      'Resets vanity role for the server.'
    )
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function setVanityURL(client, message, subArgs) {
  if (!subArgs[0]) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Settings`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${emoji.util.cross} Provide me a vanity URL to set for this server.`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }

  vanityData[message.guild.id] = vanityData[message.guild.id] || {};
  vanityData[message.guild.id].Vanity = subArgs[0];
  await saveVanityData();

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Settings`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${emoji.util.tick} Vanity URL has been set to \`.gg/${subArgs[0]}\`.`)
  );

  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function setVanityRole(client, message, subArgs) {
  const roleMention = message.mentions.roles.first();
  const roleID = subArgs[0];
  const role = roleMention || message.guild.roles.cache.get(roleID);

  if (!role) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Settings`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${emoji.util.cross} Please mention a role or provide a valid role ID.`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }

  if (role.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Settings`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${emoji.util.cross} The ADMINISTRATOR role cannot be selected.`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }

  vanityData[message.guild.id] = vanityData[message.guild.id] || {};
  vanityData[message.guild.id].Role = role.id;
  await saveVanityData();

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Settings`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${emoji.util.tick} The vanity role has been set to ${role}.`)
  );

  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function setVanityChannel(client, message, subArgs) {
  const channelMention = message.mentions.channels.first();
  const channelID = subArgs[0];
  const channel = channelMention || message.guild.channels.cache.get(channelID);

  if (!channel) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Settings`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${emoji.util.cross} Please mention a channel or provide a valid channel ID.`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }

  vanityData[message.guild.id] = vanityData[message.guild.id] || {};
  vanityData[message.guild.id].Channel = channel.id;
  await saveVanityData();

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Settings`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${emoji.util.tick} The vanity channel has been set to ${channel}.`)
  );

  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function sendConfigContainer(client, message) {
  const guildData = vanityData[message.guild.id] || {};
  const vanityRole = guildData.Role || "Not set";
  const vanityURL = guildData.Vanity || "Not set";
  const vanityChannelID = guildData.Channel || "Not set";
  const vanityChannel = vanityChannelID !== "Not set" ? `<#${vanityChannelID}>` : "Not set";

  const container = new ContainerBuilder();
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Role Config`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent('## Current Settings'),
    new TextDisplayBuilder().setContent(
      `${emoji.util.arrow} **Vanity Role:**\n` +
      (vanityRole === 'Not set' ? '`Not set`' : `<@&${vanityRole}>`) + '\n\n' +
      `${emoji.util.arrow} **Vanity URL:**\n` +
      (vanityURL === 'Not set' ? '`Not set`' : `.gg/${vanityURL}`) + '\n\n' +
      `${emoji.util.arrow} **Vanity Channel:**\n` +
      vanityChannel
    )
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function resetVanitySettings(client, message) {
  if (!vanityData[message.guild.id]) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Settings`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`${emoji.util.cross} No vanity settings found to reset.`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }

  delete vanityData[message.guild.id];
  await saveVanityData();

  const container = new ContainerBuilder();
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${emoji.id.vanity} Vanity Settings`)
  );
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`${emoji.util.tick} All vanity settings have been reset.`)
  );

  return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}
