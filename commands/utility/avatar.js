const {
  ContainerBuilder,
  TextDisplayBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: "avatar",
  aliases: ["av", "pfp", "pic"],
  BotPerms: ["EmbedLinks"],
  run: async function (client, message, args) {
    const user =
      client.users.cache.get(args[1]) ||
      message.mentions.users.first() ||
      message.author;

    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${user.tag}\n*User Avatar*`
      )
    );

    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(user.displayAvatarURL({ dynamic: true, size: 512 }))
          .setDescription(`${user.tag}'s Avatar`)
      )
    );

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("PNG")
          .setStyle("Link")
          .setURL(user.displayAvatarURL({ format: "png" })),
        new ButtonBuilder()
          .setLabel("JPG")
          .setStyle("Link")
          .setURL(user.displayAvatarURL({ format: "jpg" })),
        new ButtonBuilder()
          .setLabel("WEBP")
          .setStyle("Link")
          .setURL(user.displayAvatarURL({ format: "webp" })),
        new ButtonBuilder()
          .setLabel("DYNAMIC")
          .setStyle("Link")
          .setURL(user.displayAvatarURL({ dynamic: true }))
      )
    );

    message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
