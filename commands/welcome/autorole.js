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

module.exports = {
    name: "autorole",
    UserPerms: ['Administrator'],
    BotPerms: ['ManageRoles'],
    aboveRole: true,
    run: async (client, message, args) => {
        const roleMention = message.mentions.roles.first();
        const roleID = args[2];
        const role = roleMention || message.guild.roles.cache.get(roleID);

        const dbKey = `${message.guild.id}_autorole`;
        let data = await client.db1.get(dbKey);
        if (!data) {
            await client.db1.set(dbKey, { role: { humans: [], bots: [] } });
            data = { role: { humans: [], bots: [] } };
        }

        switch (args[0]) {
            case "humans":
                handleRole(args, "humans", data.role.humans, role, message, client);
                break;

            case "bots":
                handleRole(args, "bots", data.role.bots, role, message, client);
                break;

            case "config":
                displayConfig(message, data, client);
                break;

            case "reset":
                resetAutorole(data, message, client);
                break;

            default:
                let prefix = await client.db8.get(`${message.guild.id}_prefix`);
                if (!prefix) prefix = Settings.bot.info.prefix;
                sendAutoroleGuide(client, prefix, message);
                break;
        }
    }
}

async function handleRole(args, type, autorole, role, message, client) {
    const limit = 15;

    switch (args[1]) {
        case "add":
            if (!role) {
                return sendRoleMissingContainer(message);
            }

            if (role.permissions.has("Administrator")) {
                return sendAdminRoleContainer(message);
            }

            if (autorole.includes(role.id)) {
                return sendRoleAlreadyAddedContainer(message, role, type);
            }

            if (autorole.length >= limit) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole`)
                );
                container.addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                );
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`${emoji.util.cross} Maximum number of ${type} roles (15) reached.`)
                );
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }

            autorole.push(role.id);
            await client.db1.set(`${message.guild.id}_autorole.role.${type}`, autorole);
            return sendRoleAddedContainer(message, role, type);

        case "remove":
            if (!role) {
                return sendRoleMissingContainer(message);
            }

            if (role.permissions.has("Administrator")) {
                return sendAdminRoleContainer(message);
            }

            if (!autorole.includes(role.id)) {
                return sendRoleNotInListContainer(message, role, type);
            } else {
                autorole = autorole.filter(id => id !== role.id);
                await client.db1.set(`${message.guild.id}_autorole.role.${type}`, autorole);
                return sendRoleRemovedContainer(message, role, type);
            }
    }
}

function sendRoleMissingContainer(message) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole`)
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.cross} Prioritize mentioning the role or provide a valid role ID.`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

function sendAdminRoleContainer(message) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole`)
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.cross} The Administrator role cannot be selected.`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

function sendRoleAlreadyAddedContainer(message, role, type) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole`)
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.cross} \`${role.name}\` is already in Autorole ${type.charAt(0).toUpperCase() + type.slice(1)} List`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

function sendRoleAddedContainer(message, role, type) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole`)
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} Added \`${role.name}\` to autorole ${type.charAt(0).toUpperCase() + type.slice(1)}.`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

function sendRoleNotInListContainer(message, role, type) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole`)
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.cross} \`${role.name}\` is not in Autorole ${type.charAt(0).toUpperCase() + type.slice(1)} List`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

function sendRoleRemovedContainer(message, role, type) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole`)
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} Removed \`${role.name}\` from autorole ${type.charAt(0).toUpperCase() + type.slice(1)}.`)
    );
    return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}


async function resetAutorole(data, message, client) {
    data.role.humans = [];
    data.role.bots = [];

    await client.db1.set(`${message.guild.id}_autorole`, { role: { humans: [], bots: [] } });
    
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole`)
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`${emoji.util.tick} AutoRole configuration has been reset.`)
    );
    message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

function sendAutoroleGuide(client, prefix, message) {
    const container = new ContainerBuilder();
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole Commands`)
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent('## Available Commands'),
        new TextDisplayBuilder().setContent(
            `${emoji.util.arrow} \`${prefix}autorole humans add <role mention/id>\`\n` +
            'Add a role to the autorole list for humans.\n\n' +
            `${emoji.util.arrow} \`${prefix}autorole humans remove <role mention/id>\`\n` +
            'Remove a role from the autorole list for humans.\n\n' +
            `${emoji.util.arrow} \`${prefix}autorole bots add <role mention/id>\`\n` +
            'Add a role to the autorole list for bots.\n\n' +
            `${emoji.util.arrow} \`${prefix}autorole bots remove <role mention/id>\`\n` +
            'Remove a role from the autorole list for bots.\n\n' +
            `${emoji.util.arrow} \`${prefix}autorole config\`\n` +
            'Display the current autorole configuration.\n\n' +
            `${emoji.util.arrow} \`${prefix}autorole reset\`\n` +
            'Reset the autorole configuration.'
        )
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

async function displayConfig(message, data, client) {
    const humanRole = data.role.humans || "Nothing to Show";
    const botRole = data.role.bots || "Nothing to Show";

    const itemsPerPage = 15;
    const totalPages = Math.ceil(humanRole.length / itemsPerPage) || Math.ceil(botRole.length / itemsPerPage);
    let currentPage = 0;

    function generateContainer(page) {
        const startIndex = page * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, humanRole.length);
        const endIndex1 = Math.min(startIndex + itemsPerPage, botRole.length);
        const currentHumanRoles = humanRole.slice(startIndex, endIndex);
        const currentBotRoles = botRole.slice(startIndex, endIndex1);
        const roleMention = [];
        const roleMention1 = [];

        currentHumanRoles.forEach((roleId, i) => {
            const role = message.guild.roles.cache.get(roleId);
            if (role) {
                roleMention.push(`\`[${startIndex + i + 1}]\` | ID: [${roleId}](https://discord.gg/8wfT8SfB5Z) | <@&${roleId}>`);
            } else {
                roleMention.push(`\`[${startIndex + i + 1}]\` | ID: [${roleId}](https://discord.gg/8wfT8SfB5Z) | Deleted Role`);
            }
        });

        currentBotRoles.forEach((roleId, i) => {
            const role = message.guild.roles.cache.get(roleId);
            if (role) {
                roleMention1.push(`\`[${startIndex + i + 1}]\` | ID: [${roleId}](https://discord.gg/8wfT8SfB5Z) | <@&${roleId}>`);
            } else {
                roleMention1.push(`\`[${startIndex + i + 1}]\` | ID: [${roleId}](https://discord.gg/8wfT8SfB5Z) | Deleted Role`);
            }
        });

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${emoji.id.autorole} AutoRole Config - Page ${currentPage + 1}/${totalPages}`)
        );
        container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## AutoRole Humans'),
            new TextDisplayBuilder().setContent(roleMention.length > 0 ? roleMention.join('\n') : 'No roles to display')
        );
        container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## AutoRole Bots'),
            new TextDisplayBuilder().setContent(roleMention1.length > 0 ? roleMention1.join('\n') : 'No roles to display')
        );
        container.addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );

        return container;
    }

    const containerMsg = generateContainer(currentPage);

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

            const updatedContainer = generateContainer(currentPage);

            firstButton.setDisabled(currentPage === 0);
            backButton.setDisabled(currentPage === 0);
            nextButton.setDisabled(currentPage === totalPages - 1);
            lastButton.setDisabled(currentPage === totalPages - 1);

            interaction.update({ components: [updatedContainer, pag], flags: MessageFlags.IsComponentsV2 });
        }
    });

    collector.on("end", () => {
        pag.components.forEach((button) => button.setDisabled(true));
        messageComponent.edit({ components: [containerMsg, pag] });
    });
}
