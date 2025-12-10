const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

function createCodeButton() {
  const button = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Invite")
      .setStyle("Link")
      .setURL(
        `https://discordapp.com/oauth2/authorize?client_id=1323859929773244570&scope=bot%20applications.commands&permissions=268561646`
      )
  );

  return button;
}

module.exports = {
  name: "invite",
  aliases: ["inv"],
  BotPerms: ["EmbedLinks"],
  run: async (client, message, args) => {
    const button = createCodeButton();
    message.channel.send({
      content: `Click the button below.`,
      components: [button],
    });
  },
};
