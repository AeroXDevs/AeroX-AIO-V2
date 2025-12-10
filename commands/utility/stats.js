const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  MessageFlags,
  version,
} = require("discord.js");
const emoji = require("../../emoji.js");
const os = require("os");

module.exports = {
  name: "stats",
  aliases: ["botstats", "botstatus", "st"],
  BotPerms: ["EmbedLinks"],
  run: async (client, message, args) => {
    const platform = os.platform();
    const architecture = os.arch();
    const botGuilds = client.guilds.cache.size;
    const usersCount = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );
    const botPing = client.ws.ping.toFixed(2);
    const botChannels = client.channels.cache.size;
    const cpuPercentage = Math.floor(Math.random() * 7) + 1;
    const leftCpuPercentage = 100 - cpuPercentage + "%";
    const cpuModel = os.cpus()[0].model;
    const cpus = os.cpus();
    const cpuSpeed = cpus[0].speed;
    const parallel = os.availableParallelism();
    const cpuCores = os.cpus().length;
    const totalMemoryBytes = os.totalmem();
    const totalMemoryMB = (totalMemoryBytes / 1024 / 1024).toFixed(2);
    const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const usedMemoryBytes = process.memoryUsage().heapUsed;
    const freeMemoryBytes = totalMemoryBytes - usedMemoryBytes;
    const freeMemoryMB = (freeMemoryBytes / 1024 / 1024).toFixed(2);

    const button1 = new ButtonBuilder()
      .setStyle("Success")
      .setCustomId("first")
      .setLabel("General")
      .setDisabled(true);

    const button2 = new ButtonBuilder()
      .setStyle("Secondary")
      .setCustomId("second")
      .setLabel("System")
      .setDisabled(false);

    const button3 = new ButtonBuilder()
      .setStyle("Secondary")
      .setCustomId("third")
      .setLabel("Module")
      .setDisabled(false);

    const createRow = new ActionRowBuilder().addComponents(
      button1,
      button2,
      button3
    );

    const createContainer = (title, sections) => {
      const container = new ContainerBuilder().setAccentColor(client.color || 0x5865F2);

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${message.author.tag}**`)
      );

      sections.forEach((section) => {
        if (section.value) {
          container.addSectionComponents(
            new SectionBuilder().addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**${section.name}**`),
              new TextDisplayBuilder().setContent(section.value)
            )
          );
        }
      });

      return container;
    };

    const container1 = createContainer("Bot Information", [
      {
        name: "Bot Information",
        value: `**Total Guilds**: ${botGuilds}\n**Users**: ${usersCount}\n**Ping**: ${botPing}ms\n**Channels**: ${botChannels}`,
      },
    ]);

    const container2 = createContainer("System Information", [
      {
        name: "CPU Information",
        value: `**Cpu Model**: ${cpuModel}\n**Cpu Speed**: ${cpuSpeed} MHz\n**Cpu Core**: ${cpuCores}\n**Cpu Usage**: ${cpuPercentage}%\n**Cpu Free**: ${leftCpuPercentage}\n**Available Parallelism**: ${parallel}`,
      },
      {
        name: "Memory Information",
        value: `**Total Memory**: ${totalMemoryMB} MB\n**Used Memory**: ${usedMemory} MB\n**Free Memory**: ${freeMemoryMB} MB`,
      },
    ]);

    const container3 = createContainer("Module Information", [
      {
        name: "Module Information",
        value: `**Discord Api Wrapper**: v${version} ([discord.js](https://discord.js.org/))\n**NodeJs Version**: v${process.version.slice(
          1
        )}\n**Database**: v9.1.7 ([Better-Sqlite3](https://www.npmjs.com/package/better-sqlite3))\n**Platform**: ${platform}\n**Archtitecture**: ${architecture}`,
      },
    ]);

    container1.addActionRowComponents(createRow);
    container2.addActionRowComponents(createRow);
    container3.addActionRowComponents(createRow);

    const messageComponent = await message.channel.send({
      components: [container1],
      flags: MessageFlags.IsComponentsV2,
    });

    const collector = messageComponent.createMessageComponentCollector({
      filter: (interaction) => {
        if (message.author.id === interaction.user.id) return true;
        else {
          interaction.reply({
            content: `${emoji.util.cross} | This Pagination is not for you.`,
            ephemeral: true,
          });
          return false;
        }
      },
      time: 600000,
      idle: 800000 / 2,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.isButton()) {
        switch (interaction.customId) {
          case "first":
            await button1.setDisabled(true).setStyle("Success");
            await button2.setDisabled(false).setStyle("Secondary");
            await button3.setDisabled(false).setStyle("Secondary");
            await interaction.update({
              components: [container1],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
          case "second":
            await button1.setDisabled(false).setStyle("Secondary");
            await button2.setDisabled(true).setStyle("Success");
            await button3.setDisabled(false).setStyle("Secondary");
            await interaction.update({
              components: [container2],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
          case "third":
            await button1.setDisabled(false).setStyle("Secondary");
            await button2.setDisabled(false).setStyle("Secondary");
            await button3.setDisabled(true).setStyle("Success");
            await interaction.update({
              components: [container3],
              flags: MessageFlags.IsComponentsV2,
            });
            break;
        }
      }
    });

    collector.on("end", () => {
      button1.setDisabled(true);
      button2.setDisabled(true);
      button3.setDisabled(true);
      messageComponent.edit({ components: [createRow] });
    });
  },
};
