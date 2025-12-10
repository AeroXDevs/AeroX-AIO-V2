const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

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

function formatQueue(tracks) {
  return tracks.map((track, index) => `${index + 1}. ${track.title} (${convertTime(track.length)})`).join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Displays the current song queue.'),
  async execute(client, interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        await interaction.deferReply({ ephemeral: false });

        const { channel } = interaction.member.voice;

        if (!channel) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("You are not in a voice channel!")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const player = client.manager.players.get(interaction.guild.id);

        if (!player || !player.queue.current) {
          const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("There are no tracks currently in the queue.")
          );
          return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        const queue = player.queue;
        const currentTrack = queue.current;
        const upcomingTracks = queue.tracks || [];

        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# Current Song Queue`),
          new TextDisplayBuilder().setContent(`<:nmusic:1428686524433825802> | Now Playing: ${currentTrack.title} (${convertTime(currentTrack.length)})\n${upcomingTracks.length > 0 ? `\n**Up Next:**\n${formatQueue(upcomingTracks)}` : "\nNo more songs in the queue."}`)
        );

        await interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
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
