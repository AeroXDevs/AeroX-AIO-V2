const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');
const emoji = require('../../emoji.js');
const Settings = require('../../settings.js');
const owner = Settings.bot.credits.developerId;

module.exports = {
  name: 'voice',
  UserPerms: ['MuteMembers', 'DeafenMembers'],
  BotPerms: ['DeafenMembers', 'MuteMembers', 'EmbedLinks'],
  aliases: ["vc"],
  run: async (client, message, args) => {
    let prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;
    const arypton = await client.users.fetch(owner);
    const option = args[0];
    const channel = message.guild.channels.cache.get(args[0]) || message.member.voice.channel;
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    const mentionchannel = new ContainerBuilder();
    mentionchannel.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# ❌ Error')
    );
    mentionchannel.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    mentionchannel.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('Please mention a voice channel or join one first.')
    );

    const mentionsomeone = new ContainerBuilder();
    mentionsomeone.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# ❌ Error')
    );
    mentionsomeone.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    mentionsomeone.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('Please mention a user to perform this action.')
    );

    const guide = new ContainerBuilder();
    guide.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('# 🎤 Voice Moderation Commands')
    );
    guide.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    guide.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('## Bulk Actions'),
      new TextDisplayBuilder().setContent(
        `\`${prefix}voice muteall\` - Mute all members in voice\n` +
        `\`${prefix}voice unmuteall\` - Unmute all members in voice\n` +
        `\`${prefix}voice deafenall\` - Deafen all members in voice\n` +
        `\`${prefix}voice undeafenall\` - Undeafen all members in voice`
      )
    );
    guide.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
    );
    guide.addTextDisplayComponents(
      new TextDisplayBuilder().setContent('## Individual Actions'),
      new TextDisplayBuilder().setContent(
        `\`${prefix}voice mute <user>\` - Mute a specific member\n` +
        `\`${prefix}voice unmute <user>\` - Unmute a specific member\n` +
        `\`${prefix}voice deafen <user>\` - Deafen a specific member\n` +
        `\`${prefix}voice undeafen <user>\` - Undeafen a specific member`
      )
    );

    if (!option) {
      return message.channel.send({ components: [guide], flags: MessageFlags.IsComponentsV2 });
    }

    async function muteAllMembers(channel) {
      const mentionedUsers = [];
      channel.members.forEach((member) => {
        member.voice.setMute(true);
        mentionedUsers.push(member);
      });
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔇 All Members Muted')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} All members in **${channel.name}** have been muted`),
        new TextDisplayBuilder().setContent(`**Affected Members:** ${mentionedUsers.map(user => user.toString()).join(", ")}`)
      );
      message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    async function unmuteAllMembers(channel) {
      const mentionedUsers = [];
      channel.members.forEach((member) => {
        member.voice.setMute(false);
        mentionedUsers.push(member);
      });
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔊 All Members Unmuted')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} All members in **${channel.name}** have been unmuted`),
        new TextDisplayBuilder().setContent(`**Affected Members:** ${mentionedUsers.map(user => user.toString()).join(", ")}`)
      );
      message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    async function deafenAllMembers(channel) {
      const mentionedUsers = [];
      channel.members.forEach((member) => {
        member.voice.setDeaf(true);
        mentionedUsers.push(member);
      });
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔇 All Members Deafened')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} All members in **${channel.name}** have been deafened`),
        new TextDisplayBuilder().setContent(`**Affected Members:** ${mentionedUsers.map(user => user.toString()).join(", ")}`)
      );
      message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    async function undeafenAllMembers(channel) {
      const mentionedUsers = [];
      channel.members.forEach((member) => {
        member.voice.setDeaf(false);
        mentionedUsers.push(member);
      });
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔊 All Members Undeafened')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} All members in **${channel.name}** have been undeafened`),
        new TextDisplayBuilder().setContent(`**Affected Members:** ${mentionedUsers.map(user => user.toString()).join(", ")}`)
      );
      message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    async function muteMember(member) {
      member.voice.setMute(true);
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔇 Member Muted')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} ${member} has been muted in voice`)
      );
      message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    async function unmuteMember(member) {
      member.voice.setMute(false);
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔊 Member Unmuted')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} ${member} has been unmuted in voice`)
      );
      message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    async function deafenMember(member) {
      member.voice.setDeaf(true);
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔇 Member Deafened')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} ${member} has been deafened in voice`)
      );
      message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    async function undeafenMember(member) {
      member.voice.setDeaf(false);
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# 🔊 Member Undeafened')
      );
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} ${member} has been undeafened in voice`)
      );
      message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    switch (option) {
      case 'muteall':
        if (!channel) {
          return message.channel.send({ components: [mentionchannel], flags: MessageFlags.IsComponentsV2 });
        }
        await muteAllMembers(channel);
        break;

      case 'unmuteall':
        if (!channel) {
          return message.channel.send({ components: [mentionchannel], flags: MessageFlags.IsComponentsV2 });
        }
        await unmuteAllMembers(channel);
        break;

      case 'deafenall':
        if (!channel) {
          return message.channel.send({ components: [mentionchannel], flags: MessageFlags.IsComponentsV2 });
        }
        await deafenAllMembers(channel);
        break;

      case 'undeafenall':
        if (!channel) {
          return message.channel.send({ components: [mentionchannel], flags: MessageFlags.IsComponentsV2 });
        }
        await undeafenAllMembers(channel);
        break;

      case 'mute':
        if (!member) {
          return message.channel.send({ components: [mentionsomeone], flags: MessageFlags.IsComponentsV2 });
        }
        await muteMember(member);
        break;

      case 'unmute':
        if (!member) {
          return message.channel.send({ components: [mentionsomeone], flags: MessageFlags.IsComponentsV2 });
        }
        await unmuteMember(member);
        break;

      case 'deafen':
        if (!member) {
          return message.channel.send({ components: [mentionsomeone], flags: MessageFlags.IsComponentsV2 });
        }
        await deafenMember(member);
        break;

      case 'undeafen':
        if (!member) {
          return message.channel.send({ components: [mentionsomeone], flags: MessageFlags.IsComponentsV2 });
        }
        await undeafenMember(member);
        break;

      default:
        return message.channel.send({ components: [guide], flags: MessageFlags.IsComponentsV2 });
    }
  }
}
