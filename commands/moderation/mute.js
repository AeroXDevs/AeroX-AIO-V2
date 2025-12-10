const { 
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');

module.exports = {
    name: "timeout",
    UserPerms: ['ModerateMembers'],
    aliases: ["mute"],
    usage: "<ID|@member> <duration><s|m|h|d> [reason]",
    BotPerms: ['ModerateMembers'],
    run: async function (client, message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const durationArg = args[1];
        const reason = args.slice(2).join(' ') || 'No reason provided';

        if (!target) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('Please mention a user to timeout.')
            );
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (!durationArg) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('Please specify a duration (e.g., 10m, 1h, 1d).')
            );
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const duration = parseDuration(durationArg);
        if (duration <= 0) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('Please specify a valid duration using s (seconds), m (minutes), h (hours), or d (days).')
            );
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (target.id === message.author.id) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('You cannot timeout yourself.')
            );
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (target.communicationDisabledUntilTimestamp && target.communicationDisabledUntilTimestamp > Date.now()) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${target.user.tag}** is already timed out.`)
            );
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const botMember = message.guild.members.cache.get(client.user.id);
        if (!botMember.permissions.has('ModerateMembers')) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('I do not have the `ModerateMembers` permission.')
            );
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (message.member.roles.highest.position <= target.roles.highest.position) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('You cannot timeout a member with a role equal to or higher than yours.')
            );
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        try {
            await target.timeout(duration, reason);
            
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ⏱️ User Timed Out')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## Timeout Details'),
                new TextDisplayBuilder().setContent(
                    `**Target:** ${target.user.tag}\n` +
                    `**Duration:** ${durationArg}\n` +
                    `**Reason:** ${reason}`
                )
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Moderator:** ${message.author.tag}`)
            );
            
            message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } catch (error) {
            console.error('Timeout command error:', error);
            
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            
            if (error.code === 50013) {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('I do not have permission to timeout this user.\n\nPlease ensure:\n• My role is higher than the user\'s highest role\n• I have the appropriate permissions')
                );
            } else {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('An error occurred while timing out the user.')
                );
            }
            
            message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
    },
};

function parseDuration(duration) {
    const regex = /^(\d+)(s|m|h|d)$/;
    const match = duration.match(regex);

    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return 0;
    }
}
