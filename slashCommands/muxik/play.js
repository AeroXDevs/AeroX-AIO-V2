const { SlashCommandBuilder, PermissionsBitField, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Search for a song and add it to the queue, if you dare...')
    .addStringOption((option) =>
      option
        .setName('search')
        .setDescription('The song to search for, or your doom')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(client, interaction) {
    try {
      const { channel } = interaction.member.voice;
      if (!channel) {
        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`You're not in a voice channel, genius. Join one first.`)
        );
        return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Connect)) {
        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`I can't join your voice channel. Guess I'll just sit here.`)
        );
        return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
      if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.Speak)) {
        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`(ಠ⌣ಠ) You won't let me speak in your voice channel? Silent treatment?`)
        );
        return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      const searchContainer = new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`<a:google_search:1428686466506293291> **Searching for** \`${interaction.options.getString("search")}\`. *This could take a while...*`)
      );
      await interaction.reply({ components: [searchContainer], flags: MessageFlags.IsComponentsV2 });

      const player = await client.manager.createPlayer({
        guildId: interaction.guild.id,
        textId: interaction.channel.id,
        voiceId: channel.id,
        volume: 100,
        deaf: true
      });
      const string = interaction.options.getString("search");

      const res = await player.search(string, { requester: interaction.user });
      if (!res.tracks.length) {
        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`<a:google_search:1428686466506293291> Nothing Your search skills suck.`)
        );
        return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      if (res.type === "PLAYLIST") {
        for (let track of res.tracks) player.queue.add(track);

        if (!player.playing && !player.paused) player.play();

        const queueLength = res.tracks.length;

        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`<:nmusic:1428686524433825802> | Playlist:${res.playlistName} Tracks: ${queueLength} (RIP)\nRequested by <:narrow:1428686483002363915> ${res.tracks[0].requester} (Masochist)`)
        );
        return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      } else {
        player.queue.add(res.tracks[0]);

        if (!player.playing && !player.paused) player.play();

        const container = new ContainerBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`<:nmusic:1428686524433825802> | Track: ${res.tracks[0].title}\nRequested by <:narrow:1428686483002363915> ${res.tracks[0].requester} (Bored?)`)
        );
        return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }
    } catch {
      
    }
  },
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = await this.getAutocompleteSuggestions(focusedValue);
    await interaction.respond(choices);
  },
  async getAutocompleteSuggestions(query) {
    let choice = [];
    await ytsr(query || SEARCH_DEFAULT, { safeSearch: true, limit: 10 }).then(result => {
      result.items.forEach(x => { choice.push({ name: x.name, value: x.url }) });
    });
    return choice;
  }
};