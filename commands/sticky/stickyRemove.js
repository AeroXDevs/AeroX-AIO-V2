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
    if (!fs.existsSync(stickyFilePath)) {
        fs.writeFileSync(stickyFilePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(stickyFilePath, 'utf8'));
};

const saveStickies = (data) => {
    fs.writeFileSync(stickyFilePath, JSON.stringify(data, null, 2));
};

module.exports = {
    name: "stickyremove",
    aliases: ['deletesticky', 'delsticky', 'removesticky', 'remsticky'],
    description: "Delete a sticky message.",
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
            }).then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 12000);
            }).catch(() => {});
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

        const stickies = loadStickies();
        if (stickies[message.channel.id]) {
            delete stickies[message.channel.id];
            saveStickies(stickies);
            
            const successContainer = new ContainerBuilder();
            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Success!`)
            );
            successContainer.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `${emoji.util.tick} Sticky Message Deleted!`
                )
            );
            message.channel.send({ 
                components: [successContainer], 
                flags: MessageFlags.IsComponentsV2 
            }).catch(() => {});
        } else {
            const errorContainer = new ContainerBuilder();
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${emoji.id.sticky} Not Found`)
            );
            errorContainer.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `${emoji.util.cross} There is no sticky message in this channel.`
                )
            );
            message.channel.send({ 
                components: [errorContainer], 
                flags: MessageFlags.IsComponentsV2 
            }).catch(() => {});
        }
    }
};
