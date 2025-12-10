const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ContainerBuilder, TextDisplayBuilder, SectionBuilder, MessageFlags, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');


const settingsPath = path.join(__dirname, 'welcomeSettings.json');


function readSettings() {
    if (!fs.existsSync(settingsPath)) {
        return {};
    }
    const data = fs.readFileSync(settingsPath, 'utf-8');
    return JSON.parse(data);
}


function writeSettings(settings) {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Set up welcome settings')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup welcome system in your server.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('variables')
                .setDescription('Variables for welcome embed.')
        ),
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        const guildId = interaction.guild.id;
        const settings = readSettings();

        if (interaction.commandName === 'welcome' && interaction.options.getSubcommand() === 'setup') {
            await interaction.deferReply({ ephemeral: true });
            const member = interaction.guild.members.cache.get(interaction.user.id);
            if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                await interaction.editReply("You don't have permission to use this command.");
                return;
            }
              const firstDropdown = new StringSelectMenuBuilder()
              .setCustomId('welcome_options')
              .setPlaceholder('Select this to Make changes in Welcome Embed !!')
              .addOptions(
                  new StringSelectMenuOptionBuilder()
                      .setLabel('Channel For Welcome')
                      .setValue('channel')
                      .setDescription('Enable/Disable/Set Channel For Welcome!')
                      .setEmoji('<:nwave:1428686548098093057>'),

                  new StringSelectMenuOptionBuilder()
                      .setLabel('Message On Welcome')
                      .setValue('message')
                      .setDescription('Enable/Disable/Set Message For Welcome!')
                      .setEmoji('<:eg_mail:1428686796866326709>'),
                  new StringSelectMenuOptionBuilder()
                      .setLabel('Image For Welcome')
                      .setValue('image')
                      .setDescription('Set an image for welcome message')
                      .setEmoji('<:eg_art:1428686804667858964>')
              );

                const secondDropdown = new StringSelectMenuBuilder()
                    .setCustomId('save_reset')
                    .setPlaceholder('Select an option to Save !!')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Save Settings')
                            .setValue('save')
                            .setDescription('Save the current configuration settings')
                            .setEmoji('<:tick_icon:1428686666742239294>'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Reset ALL')
                            .setValue('reset')
                            .setDescription('Delete all custom data')
                            .setEmoji('<:nwrong:1428686674786783294>') // Replace with emotes.del if using a custom emoji
                    );

                const row1 = new ActionRowBuilder().addComponents(firstDropdown);
                const row2 = new ActionRowBuilder().addComponents(secondDropdown);
                const welcomeContainer = new ContainerBuilder()
                .setAccentColor(0x5865F2)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("**Welcome Embed Setup**")
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("**Select an option from the following list to get started!**\n\n> *Join Our [**Discord**](https://discord.com/invite/) or dm [@Devansh Yadav](https://discord.com/users/) if you need help!*")
                )
                .addActionRowComponents(row1, row2);

                await interaction.editReply({
                    content:"Welcome Setup",
                    components: [welcomeContainer],
                    flags: MessageFlags.IsComponentsV2
                });

                
                const filter = i => i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async i => {
                    if (i.customId === 'welcome_options') {
                        const selectedOption = i.values[0];
                        let modal;

                        if (selectedOption === 'channel') {
                            modal = new ModalBuilder()
                                .setCustomId('channel_modal')
                                .setTitle('Set Welcome Channel')
                                .addComponents(
                                    new ActionRowBuilder().addComponents(
                                        new TextInputBuilder()
                                            .setCustomId('channel_input')
                                            .setLabel('Enter the channel ID')
                                            .setStyle(TextInputStyle.Short)
                                    )
                                );
                        } else if (selectedOption === 'message') {
                            modal = new ModalBuilder()
                                .setCustomId('message_modal')
                                .setTitle('Set Welcome Message')
                                .addComponents(
                                    new ActionRowBuilder().addComponents(
                                        new TextInputBuilder()
                                            .setCustomId('message_input')
                                            .setLabel('Enter the welcome message')
                                            .setStyle(TextInputStyle.Paragraph)
                                    )
                                );
                        } else if (selectedOption === 'image') {
                            modal = new ModalBuilder()
                                .setCustomId('image_modal')
                                .setTitle('Set Welcome Image')
                                .addComponents(
                                    new ActionRowBuilder().addComponents(
                                        new TextInputBuilder()
                                            .setCustomId('image_input')
                                            .setLabel('Enter the image URL (GIF, PNG, JPEG, JPG)')
                                            .setStyle(TextInputStyle.Short)
                                    )
                                );
                        }

                        await i.showModal(modal);
                    } else if (i.customId === 'save_reset') {
                        const action = i.values[0];
                        if (action === 'save') {
                            
                            settings[guildId] = settings[guildId] || {};
                            writeSettings(settings);
                            await i.update({ content: 'Settings have been saved.', components: [] });
                        } else if (action === 'reset') {
                            
                            delete settings[guildId];
                            writeSettings(settings);
                            await i.update({ content: 'Settings have been reset.', components: [] });
                        }
                    }
                });

                collector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.editReply({ content: 'Interaction timed out.', components: [] });
                    }
                });
            }

            client.on('interactionCreate', async modalInteraction => {
                if (!modalInteraction.isModalSubmit()) return;

                if (modalInteraction.customId === 'channel_modal') {
                    const channelId = modalInteraction.fields.getTextInputValue('channel_input');
                    settings[guildId] = settings[guildId] || {};
                    settings[guildId].channelId = channelId;
                    writeSettings(settings);
                    await modalInteraction.reply({ content: `Welcome channel set to: <#${channelId}>`, ephemeral: true });
                } else if (modalInteraction.customId === 'message_modal') {
                    const message = modalInteraction.fields.getTextInputValue('message_input');
                    settings[guildId] = settings[guildId] || {};
                    settings[guildId].message = message;
                    writeSettings(settings);
                    await modalInteraction.reply({ content: `Welcome message set to: ${message}`, ephemeral: true });
                } else if (modalInteraction.customId === 'image_modal') {
                    const imageUrl = modalInteraction.fields.getTextInputValue('image_input');
                    const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];
                    const extension = imageUrl.split('.').pop().toLowerCase();

                    if (!validExtensions.includes(extension)) {
                        await modalInteraction.reply({ content: 'Invalid file type. Please provide a URL to a GIF, PNG, JPEG, or JPG image.', ephemeral: true });
                        return;
                    }

                    settings[guildId] = settings[guildId] || {};
                    settings[guildId].imageUrl = imageUrl;
                    writeSettings(settings);
                    await modalInteraction.reply({ content: `Welcome image set to: ${imageUrl}`, ephemeral: true });
                }
            });

        if (interaction.commandName === 'welcome' && interaction.options.getSubcommand() === 'variables') {
            const variablesContainer = new ContainerBuilder()
                .setAccentColor(Math.floor(Math.random() * 0xFFFFFF));

            variablesContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("**Welcome Variables**")
            );

            variablesContainer.addSectionComponents(
                new SectionBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("**{servername}**"),
                    new TextDisplayBuilder().setContent("The name of the server")
                )
            );

            variablesContainer.addSectionComponents(
                new SectionBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("**{user_mention}**"),
                    new TextDisplayBuilder().setContent("The mention of the user")
                )
            );

            variablesContainer.addSectionComponents(
                new SectionBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("**{user_tag}**"),
                    new TextDisplayBuilder().setContent("The tag of the user")
                )
            );

            variablesContainer.addSectionComponents(
                new SectionBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("**{membercount}**"),
                    new TextDisplayBuilder().setContent("The number of members in the server")
                )
            );

            variablesContainer.addSectionComponents(
                new SectionBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("**{n}**"),
                    new TextDisplayBuilder().setContent("This is a newline character")
                )
            );

            interaction.reply({ components: [variablesContainer], flags: MessageFlags.IsComponentsV2 })
        }
    }
};
