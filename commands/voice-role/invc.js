const {
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
} = require('discord.js');
const Settings = require('../../settings.js');
const emoji = require('../../emoji.js');
const owner = Settings.bot.credits.developerId;

module.exports = {
    name: 'invc',
    UserPerms: ['ManageRoles'],
    BotPerms: ['ManageRoles'],
    aboveRole: true,
    run: async (client, message, args) => {
        const prefix = await client.db8.get(`${message.guild.id}_prefix`) || Settings.bot.info.prefix;
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        switch (args[0]) {
            case 'config':
                const HumanRole = await client.db7.get(`invchumanrole_${message.guild.id}.HumanRole`) || "na";
                const BotRole = await client.db7.get(`invcbotrole_${message.guild.id}.BotRole`) || "na";

                let invcHumanRoleString;
                let invcBotRoleString;
                if (HumanRole === 'na') {
                    invcHumanRoleString = `\`Nothing To Show\``;
                } else {
                    const humanrole = message.guild.roles.cache.get(HumanRole);
                    invcHumanRoleString = humanrole ? `[1] | [${humanrole.id}](https://discord.gg/8wfT8SfB5Z) | \`${humanrole.name}\`` : `\`Invalid Role ID\``;
                }

                if (BotRole === 'na') {
                    invcBotRoleString = `\`Nothing To Show\``;
                } else {
                    const botrole = message.guild.roles.cache.get(BotRole);
                    invcBotRoleString = botrole ? `[1] | [${botrole.id}](https://discord.gg/8wfT8SfB5Z) | \`${botrole.name}\`` : `\`Invalid Role ID\``;
                }

                const container = new ContainerBuilder();
                
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles Configuration`)
                );
                container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );

                if (invcHumanRoleString && invcHumanRoleString !== '') {
                    container.addSectionComponents(
                        new SectionBuilder().addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('## InVC Humans Role'),
                            new TextDisplayBuilder().setContent(invcHumanRoleString)
                        )
                    );
                    container.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                    );
                }

                if (invcBotRoleString && invcBotRoleString !== '') {
                    container.addSectionComponents(
                        new SectionBuilder().addTextDisplayComponents(
                            new TextDisplayBuilder().setContent('## InVC Bot Role'),
                            new TextDisplayBuilder().setContent(invcBotRoleString)
                        )
                    );
                    container.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                }

                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`Thanks For Selecting ${client.user.username}`)
                );

                await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
                break;
                
            case 'humans':
            case 'human':
                if (!role || !args[1]) {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                    );
                    errorContainer.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.cross} Provide a Role`)
                    );
                    await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
                    return;
                }

                if (role.permissions.has("Administrator")) {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                    );
                    errorContainer.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.cross} \`Administrator\` Role cannot be Selected`)
                    );
                    await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
                    return;
                }

                const existingHumanRole = await client.db7.get(`invchumanrole_${message.guild.id}.HumanRole`);
                if (existingHumanRole === role.id) {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                    );
                    errorContainer.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.cross} \`${role.name}\` is already in the database as a human role`)
                    );
                    await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
                    return;
                }

                if (role.comparePositionTo(message.guild.members.me.roles.highest) >= 0) {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                    );
                    errorContainer.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.cross} \`${role.name}\` has a higher or equal position than the bot's role`)
                    );
                    await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
                    return;
                }

                await client.db7.set(`invchumanrole_${message.guild.id}.HumanRole`, role.id);
                await client.db7.set(`invcroleguild_${message.guild.id}.Guild`, message.guild.id);
                
                const successContainer = new ContainerBuilder();
                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                );
                successContainer.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                successContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.tick} Successfully added \`${role.name}\` as invc human Role`)
                );
                await message.channel.send({ components: [successContainer], flags: MessageFlags.IsComponentsV2 });
                break;

            case 'bots':
            case 'bot':
                if (!role || !args[1]) {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                    );
                    errorContainer.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.cross} Provide a Role`)
                    );
                    await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
                    return;
                }

                if (role.permissions.has("Administrator")) {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                    );
                    errorContainer.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.cross} \`Administrator\` Role cannot be Selected`)
                    );
                    await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
                    return;
                }

                const existingBotRole = await client.db7.get(`invcbotrole_${message.guild.id}.BotRole`);
                if (existingBotRole === role.id) {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                    );
                    errorContainer.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.cross} \`${role.name}\` is already in the database as a bot role`)
                    );
                    await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
                    return;
                }

                if (role.comparePositionTo(message.guild.members.me.roles.highest) >= 0) {
                    const errorContainer = new ContainerBuilder();
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                    );
                    errorContainer.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.cross} \`${role.name}\` has a higher or equal position than the bot's role`)
                    );
                    await message.channel.send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
                    return;
                }

                await client.db7.set(`invcbotrole_${message.guild.id}.BotRole`, role.id);
                await client.db7.set(`invcroleguild_${message.guild.id}.Guild`, message.guild.id);
                
                const successBotContainer = new ContainerBuilder();
                successBotContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                );
                successBotContainer.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                successBotContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.tick} Successfully added \`${role.name}\` as invc bot Role`)
                );
                await message.channel.send({ components: [successBotContainer], flags: MessageFlags.IsComponentsV2 });
                break;
                
            case 'reset':
                const promises = [
                    client.db7.delete(`invchumanrole_${message.guild.id}`),
                    client.db7.delete(`invcroleguild_${message.guild.id}.Guild`),
                    client.db7.delete(`invcbotrole_${message.guild.id}`),
                ];

                await Promise.all(promises);

                const resetContainer = new ContainerBuilder();
                resetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                );
                resetContainer.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                resetContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.tick} InVC roles have been reset for this server.`)
                );
                await message.channel.send({ components: [resetContainer], flags: MessageFlags.IsComponentsV2 });
                break;

            default:
                const guide = new ContainerBuilder();
                guide.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.music} In Voice Channel Roles`)
                );
                guide.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                guide.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## Available Commands')
                );
                guide.addSectionComponents(
                    new SectionBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.arrow} \`${prefix}invc config\``),
                        new TextDisplayBuilder().setContent('Shows invc role settings for the server.')
                    )
                );
                guide.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                );
                guide.addSectionComponents(
                    new SectionBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.arrow} \`${prefix}invc humans <role>\``),
                        new TextDisplayBuilder().setContent('Setups invc human role settings for the server.')
                    )
                );
                guide.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                );
                guide.addSectionComponents(
                    new SectionBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.arrow} \`${prefix}invc bots <role>\``),
                        new TextDisplayBuilder().setContent('Setups invc bot role settings for the server.')
                    )
                );
                guide.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                );
                guide.addSectionComponents(
                    new SectionBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.arrow} \`${prefix}invc reset\``),
                        new TextDisplayBuilder().setContent('Resets invc role settings for the server.')
                    )
                );
                guide.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                guide.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`Thanks For Selecting ${client.user.username}`)
                );
                
                await message.channel.send({ components: [guide], flags: MessageFlags.IsComponentsV2 });
                break;
        }
    }
}
