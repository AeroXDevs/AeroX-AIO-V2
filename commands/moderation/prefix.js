const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
const Settings = require("../../settings.js");
const emoji = require("../../emoji.js");
const owner = Settings.bot.credits.developerId;

const PREFIX_LIMIT = 3;

async function fetchAryptonUser(client) {
  try {
    return await client.users.fetch(owner);
  } catch (error) {
    console.error("Error fetching arypton user:", error);
    return null;
  }
}

async function setPrefix(client, guildId, newPrefix) {
  try {
    await client.db8.set(`${guildId}_prefix`, newPrefix);
  } catch (error) {
    console.error("Error setting prefix in the database:", error);
  }
}

module.exports = {
  name: "prefix",
  aliases: ["customprefix"],
  UserPerms: ["Administrator"],
  BotPerms: ["EmbedLinks"],
  run: async (client, message, args) => {
    try {
      const member = await message.guild.members.fetch(message.author);

      const newPrefix = args[0];

      if (!newPrefix) {
        const container = new ContainerBuilder();

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# Server Settings\n${emoji.util.cross} | Provide me a prefix to set for this server.`
          )
        );

        return message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (newPrefix.length >= PREFIX_LIMIT) {
        const container = new ContainerBuilder();

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# Server Settings\n${emoji.util.cross} | Please choose a smaller prefix. (Length can be max 2 characters).`
          )
        );

        return message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      await setPrefix(client, message.guild.id, newPrefix);

      const arypton = await fetchAryptonUser(client);
      const container = new ContainerBuilder();

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `# Server Settings\n${emoji.util.tick} | The new prefix is now set to **${newPrefix}** Ping me if you ever forget it.`
        )
      );

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  },
};
