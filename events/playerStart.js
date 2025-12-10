const client = require("../index.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, AttachmentBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags, MediaGalleryBuilder, MediaGalleryItemBuilder } = require("discord.js");
const MusicCard = require("../utils/musiccard.js");

client.manager.on("playerStart", async (player, track) => {
    const { container, attachment } = await createContainer(client, player, track);

    const filterOptions = [
        { label: 'Clear', value: 'clear' },
        { label: '8D', value: 'eightD' },
        { label: 'Soft', value: 'soft' },
        { label: 'Speed', value: 'speed' },
        { label: 'Karaoke', value: 'karaoke' },
        { label: 'Nightcore', value: 'nightcore' },
        { label: 'Pop', value: 'pop' },
        { label: 'Vaporwave', value: 'vaporwave' },
        { label: 'Bass', value: 'bass' },
        { label: 'Party', value: 'party' },
        { label: 'Earrape', value: 'earrape' },
        { label: 'Equalizer', value: 'equalizer' },
        { label: 'Electronic', value: 'electronic' },
        { label: 'Radio', value: 'radio' },
        { label: 'Tremolo', value: 'tremolo' },
        { label: 'Treble Bass', value: 'treblebass' },
        { label: 'Vibrato', value: 'vibrato' },
        { label: 'China', value: 'china' },
        { label: 'Chipmunk', value: 'chipmunk' },
        { label: 'Darth Vader', value: 'darthvader' },
        { label: 'Daycore', value: 'daycore' },
        { label: 'Doubletime', value: 'doubletime' },
        { label: 'Pitch', value: 'pitch' },
        { label: 'Rate', value: 'rate' },
        { label: 'Slow', value: 'slow' }
    ];

    const filterMenu = new StringSelectMenuBuilder()
        .setCustomId('filters')
        .setPlaceholder('Select a filter')
        .addOptions(filterOptions);

    const filterRow = new ActionRowBuilder().addComponents(filterMenu);

    const controlButtons = {
        stop: new ButtonBuilder()
            .setCustomId('stop')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('<:stop:1436288955275415563>'),
        rewind: new ButtonBuilder()
            .setCustomId('rewind')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('<:backward:1436288770008682536>'),
        pause: new ButtonBuilder()
            .setCustomId('pause')
            .setStyle(ButtonStyle.Success)
            .setEmoji('<:skip:1436288858235994152>'),
        play: new ButtonBuilder()
            .setCustomId('play')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('<:forward:1436288791823388702>'),
        loop: new ButtonBuilder()
            .setCustomId('loop')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('<:loop:1436288733883404299>')
    };

    const buttonRow = new ActionRowBuilder().addComponents(
        controlButtons.stop,
        controlButtons.rewind,
        controlButtons.pause,
        controlButtons.play,
        controlButtons.loop
    );

    container.addActionRowComponents(filterRow);
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addActionRowComponents(buttonRow);

    const message = await client.channels.cache.get(player.textId)?.send({ components: [container], flags: MessageFlags.IsComponentsV2, files: [attachment] });

    const collector = message.createMessageComponentCollector({
        filter: (interaction) => interaction.user.id === track.requester.id,
        time: player.queue.current.length // Time in milliseconds, set this to a long enough duration if needed
    });

    collector.on('collect', async (interaction) => {
        await handleButtonInteraction(client, player, track, interaction, message, controlButtons, buttonRow, filterRow, container, attachment);
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            message.edit({ components: [] }).catch(console.error);
        }
    });

    return message;
});

async function createContainer(client, player, track) {
    console.log('Track object keys:', Object.keys(track));
    console.log('Track properties:', {
        title: track.title,
        author: track.author,
        thumbnail: track.thumbnail,
        uri: track.uri,
        artworkUrl: track.artworkUrl,
        length: track.length
    });
    
    const musicCard = new MusicCard();
    const buffer = await musicCard.createMusicCard(track, player.position || 0);
    const attachment = new AttachmentBuilder(buffer, { name: `musicard.png` });

    const mediaGalleryItem = new MediaGalleryItemBuilder().setURL("attachment://musicard.png");
    const mediaGallery = new MediaGalleryBuilder().addItems(mediaGalleryItem);

    const container = new ContainerBuilder();
    
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**Currently Playing...**`)
    );
    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`> [${track.title}](https://discord.gg/8wfT8SfB5Z)`)
    );
    container.addMediaGalleryComponents(mediaGallery);

    return { container, attachment };
}

async function handleButtonInteraction(client, player, track, interaction, message, controlButtons, buttonRow, filterRow, container, attachment) {
    if (!player) {
        const errorContainer = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`> "No playing in this guild!"`)
        );
        return await interaction.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
    }

    const { channel } = interaction.member.voice;

    if (!channel || interaction.member.voice.channel !== interaction.guild.members.me.voice.channel) {
        const errorContainer = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`> "I'm not in the same voice channel as you!"`)
        );
        return await interaction.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
    }

    switch (interaction.customId) {
        case 'pause':
            await player.pause(player.playing);
            const pausedStatus = player.paused ? `Paused` : `Resumed`;
            controlButtons.pause.setEmoji(player.paused ? '▶️' : '⏸️');
            controlButtons.pause.setCustomId(player.paused ? 'resume' : 'pause');
            
            const updatedButtonRow = new ActionRowBuilder().addComponents(
                controlButtons.stop,
                controlButtons.rewind,
                controlButtons.pause,
                controlButtons.play,
                controlButtons.loop
            );
            
            const mediaGalleryItem = new MediaGalleryItemBuilder().setURL("attachment://musicard.png");
            const mediaGallery = new MediaGalleryBuilder().addItems(mediaGalleryItem);
            
            const updatedContainer = new ContainerBuilder();
            updatedContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Currently Playing...**`)
            );
            updatedContainer.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            updatedContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`> [${track.title}](https://discord.gg/8wfT8SfB5Z)`)
            );
            updatedContainer.addMediaGalleryComponents(mediaGallery);
            updatedContainer.addActionRowComponents(filterRow);
            updatedContainer.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            );
            updatedContainer.addActionRowComponents(updatedButtonRow);
            
            await message.edit({ components: [updatedContainer], flags: MessageFlags.IsComponentsV2 });
            const pauseContainer = new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`*> "${pausedStatus.toLowerCase()}!"*`)
            );
            await interaction.reply({ components: [pauseContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
            break;
        case 'rewind':
            await player.seek(0);
            const rewindContainer = new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`*> "Rewinded the track!"*`)
            );
            await interaction.reply({ components: [rewindContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
            break;
        case 'play':
            await player.play();
            const playContainer = new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`*> "Skipped to the next track!"*`)
            );
            await interaction.reply({ components: [playContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
            break;
        case 'stop':
            await player.destroy();
            console.log(`Player destroyed for guild ${interaction.guild.id}`);
            const stopContainer = new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`*> "Stopped the music!"*`)
            );
            await interaction.reply({ components: [stopContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
            break;
        case 'loop':
            player.setTrackRepeat(!player.trackRepeat);
            const loopStatus = player.trackRepeat ? 'enabled' : 'disabled';
            const loopContainer = new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`*> "Loop ${loopStatus}!"*`)
            );
            await interaction.reply({ components: [loopContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
            break;
        case 'filters':
            const selectedFilter = interaction.values[0];
            if (selectedFilter === 'clear') {
                await player.shoukaku.node.rest.updatePlayer({ guildId: interaction.guild.id, playerOptions: { filters:{} } });
                const clearContainer = new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`*> "Filters cleared!"*`)
                );
                await interaction.reply({ components: [clearContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
            } else {
                await player.filter(selectedFilter);
                const filterContainer = new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`*> "${selectedFilter}" filter applied!*`)
                );
                await interaction.reply({ components: [filterContainer], flags: MessageFlags.IsComponentsV2, ephemeral: true });
            }
            break;
    }
}

function convertTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    if (duration < 3600000) {
        return minutes + ":" + seconds;
    } else {
        return hours + ":" + minutes + ":" + seconds;
    }
}
