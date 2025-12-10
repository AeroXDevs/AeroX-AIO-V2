const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');
const Settings = require('../../settings.js');
const emoji = require('../../emoji.js');

module.exports = {
  name: 'kick',
  aliases: [`nikalchal`, `outhoja`, `bhagyahase`, `hogyatera`],
  UserPerms: ['KickMembers'],
  BotPerms: ['KickMembers'],
  aboveRole: true,
  run: async (client, message, args) => {
    const prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;

    async function kickUser(message, client, args) {
      const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);

      if (!args[0]) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# 👢 Kick Command')
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            '```diff\n' +
            '- [] = optional argument\n' +
            '- <> = required argument\n' +
            '- Do NOT type these when using commands!\n' +
            '```'
          )
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('## Description'),
          new TextDisplayBuilder().setContent('Remove a user from the server as punishment for breaking rules repeatedly.')
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('## Usage'),
          new TextDisplayBuilder().setContent(
            `**Command:** \`${prefix}kick <member> [reason]\`\n` +
            `**Aliases:** \`nikalchal\` • \`outhoja\` • \`bhagyahase\` • \`hogyatera\``
          )
        );

        return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      const targetMember = message.guild.members.cache.get(user.id);
      if (!targetMember) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# ❌ Error')
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${emoji.util.cross} The provided user is not a member of this server.`)
        );
        return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      if (targetMember === message.author.id) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# ❌ Error')
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${emoji.util.cross} You cannot kick yourself.`)
        );
        return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      if (targetMember === client.user.id) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# ❌ Error')
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${emoji.util.cross} You cannot kick the bot itself.`)
        );
        return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      if (!targetMember.kickable || targetMember.roles.highest.comparePositionTo(message.guild.members.me.roles.highest) > 0) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# ❌ Error')
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${emoji.util.cross} I cannot kick this user.\n\nPossible reasons:\n• They have a higher role than me\n• I do not have sufficient permissions`)
        );
        return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      args.shift();
      const reason = args.join(' ');

      await targetMember.kick({ reason });
      
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 👢 User Kicked Successfully')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## Kick Details'),
        new TextDisplayBuilder().setContent(
          `${emoji.util.tick} Successfully kicked **${user.username}**\n\n` +
          `**Reason:** ${reason || 'Not provided'}`
        )
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Moderator:** ${message.author.tag}`)
      );
      
      await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      await targetMember.send(`You have been kicked from **${message.guild.name}** by \`${message.author.username}\`.\n\n**Reason:** ${reason || 'Not provided'}`).catch(() => {});
    }

    await kickUser(message, client, args);
  }
};
