const fs = require('fs');
const path = require('path');
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require('discord.js');
const emoji = require('../../emoji.js');

const stickyFilePath = path.join(__dirname, 'stickies.json');

const loadStickies = () => {
    try {
        if (!fs.existsSync(stickyFilePath)) {
            fs.writeFileSync(stickyFilePath, JSON.stringify({}), 'utf8');
        }
        const data = fs.readFileSync(stickyFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading stickies:', err);
        return {};
    }
};

const saveStickies = (data) => {
    try {
        fs.writeFileSync(stickyFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving stickies:', err);
    }
};

module.exports = {
    name: "stickyadd",
    aliases: ['addsticky', 'newsticky', 'stickynew', 'stickycreate', 'createsticky'],
    description: "Add a sticky message.",
    run: async (client, message, args) => {
        if (message.channel.type === 'dm') {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Sticky Message`)
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `${emoji.util.cross} Please only run commands in a Discord server.`
                )
            );
            return message.channel.send({ 
                components: [container], 
                flags: MessageFlags.IsComponentsV2 
            });
        }

        if (!message.member.permissions.has('ManageMessages')) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Sticky Message`)
            );
            container.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `${emoji.util.cross} You don't have permission to use this command.`
                )
            );
            return message.channel.send({ 
                components: [container], 
                flags: MessageFlags.IsComponentsV2 
            }).catch(() => {});
        }

        const filter = m => m.author.id === message.author.id;

        const build1 = new ContainerBuilder();
        build1.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Sticky Message Builder`)
        );
        build1.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        build1.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## Welcome!'),
            new TextDisplayBuilder().setContent('Type `cancel` at any time to cancel the command.')
        );

        const build2 = new ContainerBuilder();
        build2.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Step 1: Channel`)
        );
        build2.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        build2.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('Please provide a channel for the sticky message to be placed in.')
        );

        const build3 = new ContainerBuilder();
        build3.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Step 2: Message`)
        );
        build3.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        build3.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('Please enter the message you would like the sticky message to say.')
        );

        const build4 = new ContainerBuilder();
        build4.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Success!`)
        );
        build4.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        build4.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${emoji.util.tick} Sticky Message Created!`)
        );

        message.channel.send({ components: [build1], flags: MessageFlags.IsComponentsV2 }).catch(() => {});

        message.channel.send({ components: [build2], flags: MessageFlags.IsComponentsV2 }).then(() => {
            message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    let newcol = collected.first().content.toLowerCase();
                    if (newcol === 'cancel') {
                        const cancelContainer = new ContainerBuilder();
                        cancelContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Canceled`)
                        );
                        cancelContainer.addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                        );
                        cancelContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${emoji.util.cross} Sticky Message Builder Canceled.`)
                        );
                        return message.channel.send({ 
                            components: [cancelContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        }).catch(() => {});
                    }

                    let deChan;
                    if (collected.first().mentions.channels.first()) {
                        deChan = collected.first().mentions.channels.first().id;
                    } else if (!isNaN(collected.first().content)) {
                        deChan = collected.first().content;
                    } else {
                        const errorContainer = new ContainerBuilder();
                        errorContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Error`)
                        );
                        errorContainer.addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                        );
                        errorContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${emoji.util.cross} Invalid channel provided. Command canceled.`)
                        );
                        return message.channel.send({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        }).catch(() => {});
                    }

                    if (!message.guild.channels.cache.has(deChan)) {
                        const errorContainer = new ContainerBuilder();
                        errorContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Error`)
                        );
                        errorContainer.addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                        );
                        errorContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${emoji.util.cross} The provided channel ID does not exist in this server. Command canceled.`)
                        );
                        return message.channel.send({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        }).catch(() => {});
                    }

                    const stickies = loadStickies();
                    if (stickies[deChan]) {
                        const errorContainer = new ContainerBuilder();
                        errorContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Error`)
                        );
                        errorContainer.addSeparatorComponents(
                            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                        );
                        errorContainer.addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`${emoji.util.cross} There is already a sticky message in that channel.`)
                        );
                        return message.channel.send({ 
                            components: [errorContainer], 
                            flags: MessageFlags.IsComponentsV2 
                        }).catch(() => {});
                    }

                    message.channel.send({ components: [build3], flags: MessageFlags.IsComponentsV2 }).then(() => {
                        message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
                            .then(collected => {
                                let newcol = collected.first().content.toLowerCase();
                                if (newcol === 'cancel') {
                                    const cancelContainer = new ContainerBuilder();
                                    cancelContainer.addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Canceled`)
                                    );
                                    cancelContainer.addSeparatorComponents(
                                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                                    );
                                    cancelContainer.addTextDisplayComponents(
                                        new TextDisplayBuilder().setContent(`${emoji.util.cross} Sticky Message Builder Canceled.`)
                                    );
                                    return message.channel.send({ 
                                        components: [cancelContainer], 
                                        flags: MessageFlags.IsComponentsV2 
                                    }).catch(() => {});
                                }
                                let content = collected.first().content;

                                stickies[deChan] = {
                                    guild: message.guild.id,
                                    channel: deChan,
                                    message: content
                                };

                                saveStickies(stickies);
                                message.channel.send({ components: [build4], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
                            }).catch(() => {
                                const timeoutContainer = new ContainerBuilder();
                                timeoutContainer.addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Timeout`)
                                );
                                timeoutContainer.addSeparatorComponents(
                                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                                );
                                timeoutContainer.addTextDisplayComponents(
                                    new TextDisplayBuilder().setContent(`${emoji.util.cross} No response received. Command canceled.`)
                                );
                                message.channel.send({ 
                                    components: [timeoutContainer], 
                                    flags: MessageFlags.IsComponentsV2 
                                }).catch(() => {});
                            });
                    }).catch(() => {});
                }).catch(() => {
                    const timeoutContainer = new ContainerBuilder();
                    timeoutContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Timeout`)
                    );
                    timeoutContainer.addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                    );
                    timeoutContainer.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`${emoji.util.cross} No response received. Command canceled.`)
                    );
                    message.channel.send({ 
                        components: [timeoutContainer], 
                        flags: MessageFlags.IsComponentsV2 
                    }).catch(() => {});
                });
        }).catch(() => {});
    }
};
