const { createEmbed } = require('../../handler/commonUtils');
const { NoPrefixAccess } = require('../../dev.json');
const Settings = require('../../settings.js');
const emoji = require('../../emoji.js');
const owner = Settings.bot.credits.developerId;
const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder } = require("discord.js");

function getUser(message, args) {
    const user = message.guild.members.cache.get(args[1]) || message.mentions.members.first() || message.author;
    const ID = user.id;
    return { user, ID };
}

async function addUserTovotebypasslist(client, ID) {
    const nodata = createEmbed(client, ID, false, false);

    const data = await client.db4.get(`members_votebypass`);
    if (!data) {
        await client.db4.set(`members_votebypass`, { votebypasslist: [] });
        return nodata;
    } else {
        if (data.votebypasslist.includes(ID)) {
            return 'already_added';
        } else {
            await client.db4.push(`members_votebypass.votebypasslist`, ID);
            return nodata;
        }
    }
}

async function removeUserFromvotebypasslist(client, ID) {
    const nodata = createEmbed(client, ID, false, false);

    const data = await client.db4.get(`members_votebypass`);
    if (!data) {
        await client.db4.set(`members_votebypass`, { votebypasslist: [] });
        return nodata;
    } else {
        if (!data.votebypasslist.includes(ID)) {
            return 'not_found';
        } else {
            await client.db4.pull(`members_votebypass.votebypasslist`, ID);
            return nodata;
        }
    }
}

async function getvotebypasslist(client) {
    const data = await client.db4.get(`members_votebypass`);
    if (!data || !data.votebypasslist || data.votebypasslist.length === 0) return [];
    return data.votebypasslist;
}

module.exports = {
    name: 'bypass',
    BotPerms: ['EmbedLinks'],
    run: async (client, message, args) => {
        const subcommand = args[0];
        const { user, ID } = getUser(message, args);
        let prefix = await client.db8.get(`${message.guild.id}_prefix`);
        if (!prefix) prefix = Settings.bot.info.prefix;
        const arypton = await client.users.fetch(owner);

        const guideContainer = new ContainerBuilder()
            .addComponents(
                new TextDisplayBuilder()
                    .setHeading(`${emoji.owner.bypass} Vote Bypass Module Guide`)
                    .setFontSize("large"),
                new SeparatorBuilder()
                    .setDivider(true),
                new TextDisplayBuilder()
                    .setText('**Available Commands**\n\n')
                    .setFontSize("medium"),
                new TextDisplayBuilder()
                    .setText(
                        `${emoji.util.arrow} \`${prefix}bypass add <user> all\`\n` +
                        'Add a user to vote bypass users for all servers.\n\n' +
                        `${emoji.util.arrow} \`${prefix}bypass remove <user> all\`\n` +
                        'Remove a user from vote bypass users from all servers.\n\n' +
                        `${emoji.util.arrow} \`${prefix}bypass show\`\n` +
                        'Shows all the users in vote bypass database.\n\n' +
                        `${emoji.util.arrow} \`${prefix}bypass reset\`\n` +
                        'Removes all the users from vote bypass users from the database.\n\n'
                    )
                    .setFontSize("small"),
                new SeparatorBuilder()
                    .setDivider(true)
            );

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

        if (!NoPrefixAccess.includes(message.author.id)) {
            return;
        }

        if (NoPrefixAccess.includes(message.author.id)) {
            if (!subcommand) {
                return message.channel.send({ components: [guideContainer], flags: MessageFlags.IsComponentsV2 });
            }

            switch (subcommand) {
                case 'add': {
                    switch (args[2]) {
                        case 'all': {
                            if (!args[1]) {
                                return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
                            }

                            const result = await addUserTovotebypasslist(client, ID);
                            const userObject = await client.users.fetch(ID);
                            if (result === 'already_added') {
                                return message.channel.send({ content: `${emoji.util.cross} | Already added vote bypass to \`${userObject.username}\` for all guilds` });
                            } else {
                                return message.channel.send({ content: `${emoji.util.tick} | Added vote bypass to \`${userObject.username}\` for all guilds` });
                            }
                        }
                    }
                }
                    break;
                case 'remove': {
                    switch (args[2]) {
                        case 'all': {
                            if (!args[1]) {
                                return message.channel.send({ content: `${emoji.util.cross} | Prioritize mentioning the user or provide a valid user ID.` });
                            }

                            const result = await removeUserFromvotebypasslist(client, ID);
                            const userObject = await client.users.fetch(ID);
                            if (result === 'not_found') {
                                return message.channel.send({ content: `${emoji.util.cross} | Yet not having vote bypass to \`${userObject.username}\` for all guilds` });
                            } else {
                                return message.channel.send({ content: `${emoji.util.tick} | Removed vote bypass from \`${userObject.username}\` for all guilds` });
                            }
                        }
                    }
                }
                    break;
                case 'show': {
                    const listData = await getvotebypasslist(client);

                    if (!listData || listData.length === 0) {
                        return message.channel.send(`${emoji.util.cross} Nothing to Show`);
                    }

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

                        return new ContainerBuilder()
                            .addComponents(
                                new TextDisplayBuilder()
                                    .setHeading(`${emoji.owner.bypass} Total Vote Bypass Users`)
                                    .setText(`Page ${currentPage + 1}/${totalPages}`)
                                    .setFontSize("medium"),
                                new SeparatorBuilder()
                                    .setDivider(true),
                                new TextDisplayBuilder()
                                    .setText(memberList)
                                    .setFontSize("small")
                            );
                    };

                    let currentPage = 0;
                    const container = await generateContainer(currentPage);

                    if (totalPages === 1) {
                        pag.components.forEach((button) => {
                            button.setDisabled(true);
                        });
                    }

                    const messageComponent = await message.channel.send({ components: [container, pag], flags: MessageFlags.IsComponentsV2 });

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

                    collector.on("end", async () => {
                        pag.components.forEach((button) => button.setDisabled(true));
                        messageComponent.edit({ components: [await generateContainer(currentPage), pag], flags: MessageFlags.IsComponentsV2 });
                    });

                    break;
                }
                case 'reset': {
                    const data = await client.db4.get(`members_votebypass`);
                    if (!data) {
                        await client.db4.set(`members_votebypass`, { votebypasslist: [] });
                        return message.channel.send({ content: `${emoji.util.cross} | Please run the vote bypass command again because earlier database was not set up.` });
                    } else {
                        const users = data.votebypasslist;
                        const mentions = [];

                        if (users.length !== 0) {
                            await client.db4.set(`members_votebypass`, { votebypasslist: [] });
                            return message.channel.send({ content: `${emoji.util.tick} Reset Np database` });
                        } else {
                            return message.channel.send({ content: `${emoji.util.cross} No one is in vote bypass Database` });
                        }
                    }

                }
                default: {
                    message.channel.send({ components: [guideContainer], flags: MessageFlags.IsComponentsV2 });
                }
            }
        }
    }
};
