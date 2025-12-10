const { 
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require('discord.js');

module.exports = {
    name: "untimeout",
    UserPerms: ['ModerateMembers'],
    aliases: ["unmute"],
    usage: "<ID|@member> [reason]",
    BotPerms: ['ModerateMembers'],
    run: async function (client, message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        const reason = args.slice(1).join(' ') || 'No reason provided';

        if (!target) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('Please mention a user to remove their timeout.')
            );
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (!target.communicationDisabledUntilTimestamp || target.communicationDisabledUntilTimestamp < Date.now()) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**${target.user.tag}** is not currently timed out.`)
            );
            return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        try {
            await target.timeout(null, reason);
            
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ✅ Timeout Removed')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## Details'),
                new TextDisplayBuilder().setContent(
                    `**Target:** ${target.user.tag}\n` +
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
            console.error('Untimeout command error:', error);
            
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('# ❌ Error')
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('An error occurred while removing the timeout.')
            );
            
            message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
    },
};
