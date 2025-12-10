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
  name: 'ban',
  aliases: [`hackban`, `fuckban`, `fuckyou`, `fuckoff`],
  UserPerms: ['BanMembers'],
  BotPerms: ['BanMembers', 'EmbedLinks'],
  aboveRole: true,
  run: async (client, message, args) => {
    const prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;

    async function banUser(message, client, args) {
      const user = message.mentions.users.first() || await client.users.fetch(args[0]).catch(() => null);

      if (!args[0]) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# 🔨 Ban Command')
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
          new TextDisplayBuilder().setContent('Permanently ban a user from the server as punishment for breaking rules repeatedly.')
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('## Usage'),
          new TextDisplayBuilder().setContent(
            `**Command:** \`${prefix}ban <member> [reason]\`\n` +
            `**Aliases:** \`hackban\` • \`fuckban\` • \`fuckyou\` • \`fuckoff\``
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
          new TextDisplayBuilder().setContent(`${emoji.util.cross} You cannot ban yourself.`)
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
          new TextDisplayBuilder().setContent(`${emoji.util.cross} You cannot ban the bot itself.`)
        );
        return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      if (!targetMember.bannable || targetMember.roles.highest.comparePositionTo(message.guild.members.me.roles.highest) > 0) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# ❌ Error')
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`${emoji.util.cross} I cannot ban this user.\n\nPossible reasons:\n• They have a higher role than me\n• I do not have sufficient permissions`)
        );
        return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      args.shift();
      const reason = args.join(' ');

      await message.guild.members.ban(targetMember.id, {
        reason: reason
      });
      
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔨 User Banned Successfully')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## Ban Details'),
        new TextDisplayBuilder().setContent(
          `${emoji.util.tick} Successfully banned **${user.username}**\n\n` +
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
      await targetMember.send({ content: `You have been banned from **${message.guild.name}** by \`${message.author.username}\`.\n\n**Reason:** ${reason || 'Not provided'}` }).catch(() => {});
    }

    await banUser(message, client, args);
  }
};
