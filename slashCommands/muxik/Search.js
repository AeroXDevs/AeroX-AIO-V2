const { SlashCommandBuilder, PermissionsBitField, ContainerBuilder, TextDisplayBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

function convertTime(duration, format = false) {
  let seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours > 0 ? hours : 0;
  minutes = minutes > 0 ? minutes : 0;
  seconds = seconds > 0 ? seconds : 0;

  return format
    ? `${hours > 0 ? `${hours}:` : ""}${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
    : `${hours}:${minutes}:${seconds}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search-song')
    .setDescription('Search for a song and add it to the queue, if you dare...')
    .addStringOption((option) =>
      option
        .setName('search')
        .setDescription('The song to search for, or your doom')
        .setRequired(true)
    ),
  async execute(client, interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        await interaction.deferReply({ ephemeral: false });

        const args = interaction.options.getString("search");

        const { channel } = interaction.member.voice;

        if (!channel) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("You are not in a voice channel!")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Connect)) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("I don't have permission to join your voice channel!")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Speak)) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("I don't have permission to speak in your voice channel!")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const searchContainer = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`Searching for \`${args}\`...`)
        );
        const msg = await interaction.editReply({ components: [searchContainer], flags: MessageFlags.IsComponentsV2 });

        const player = await client.manager.createPlayer({
          guildId: interaction.guild.id,
          textId: interaction.channel.id,
          voiceId: channel.id,
          volume: 100,
          deaf: true,
        });

        let res = await player.search(args, { requester: interaction.user });

        if (!res.tracks.length) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("No results found!")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const options = res.tracks.slice(0, 10).map((track, index) => ({
          label: track.title.substring(0, 100),
          value: track.identifier,
          description: `${convertTime(track.length, true)} | ${track.author}`,
        }));

        const row = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('search-results')
              .setPlaceholder('Select a track')
              .addOptions(options)
          );

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`<a:google_search:1428686466506293291> Select a track from the search results:`)
        );
        container.addActionRowComponents(row);

        const message = await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });

        const filter = (interaction) => interaction.customId === 'search-results';
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
          const selectedTrack = res.tracks.find(track => track.identifier === i.values[0]);
          player.queue.add(selectedTrack);

          if (!player.playing && !player.paused) player.play();

          const trackContainer = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`<:nmusic:1428686524433825802> | Track: ${selectedTrack.title.substring(0, 15)}\nRequested by <:narrow:1428686483002363915> ${selectedTrack.requester} (Bored?)`)
          );

          await i.update({ components: [trackContainer], flags: MessageFlags.IsComponentsV2 });
          collector.stop();
        });

        collector.on('end', collected => {
          if (collected.size === 0) {
            const container = new ContainerBuilder().addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`<:nclock:1428686756554735676> Time's up! No track selected.`)
            );
            interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
          }
        });
      }
    } catch (error) {
      console.log(error);
      const container = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent("An error occurred while processing your request. Please try again later.")
      );
      await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  },
};