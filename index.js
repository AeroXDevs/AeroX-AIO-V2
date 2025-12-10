
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('ready event has been renamed to clientReady')) {
    return; 
  }
  console.warn(warning);
});

const { Collection, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
const Client = require("./rabbit/RabbitClient.js"); 
const config = require("./config.json");
const { ownerIDS } = require("./dev.json");
const fs = require("fs");
const path = require("path");
const { QuickDB } = require("quick.db");
const Dokdo = require("dokdo");
const mongoose = require("mongoose");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const TicketHandler = require("./events/tickethandler");
const { Connectors } = require("shoukaku");
const { Kazagumo, Plugins } = require("kazagumo");
const KazagumoFilter = require("kazagumo-filter");
const ytsr = require("@distube/ytsr");
const SEARCH_DEFAULT = "youtube";
const nodes = [
  {
    name: "LavaLink",
    url: "lavalink.jirayu.net:13592",
    auth: "youshallnotpass",
    secure: false,
  },
]

const client = new Client();
module.exports = client;


const DokdoHandler = new Dokdo.Client(client, {
  aliases: ["dokdo", "dok", "jsk"],
  prefix: ".",
  owners: ownerIDS,
});


function setupDatabases(client) {
  client.db = new QuickDB({ filePath: "./database/antinuke.sqlite" });
  client.db1 = new QuickDB({ filePath: "./database/autorole.sqlite" });
  client.db2 = new QuickDB({ filePath: "./database/badges.sqlite" });
  client.db3 = new QuickDB({ filePath: "./database/customroles.sqlite" });
  client.db4 = new QuickDB({ filePath: "./database/noprefix.sqlite" });
  client.db5 = new QuickDB({ filePath: "./database/automod.sqlite" });
  client.db7 = new QuickDB({ filePath: "./database/voiceroles.sqlite" });
  client.db8 = new QuickDB({ filePath: "./database/guild.sqlite" });
  client.db9 = new QuickDB({ filePath: "./database/welcome.sqlite" });
  client.db10 = new QuickDB({ filePath: "./database/ignore.sqlite" });
  client.db11 = new QuickDB({ filePath: "./database/extra.sqlite" });
  client.db12 = new QuickDB({ filePath: "./database/premium.sqlite" });
  client.db13 = new QuickDB({ filePath: "./database/users.sqlite" });
  client.db14 = new QuickDB({ filePath: "./database/mediachannel.sqlite" });
  client.db15 = new QuickDB({ filePath: "./database/nightmode.sqlite" });
  client.db24_7 = new QuickDB({ filePath: "./database/24-7.sqlite" }); // Add this line
}


function setupCollections(client) {
  client.commands = new Collection();
  client.aliases = new Collection();
  client.events = new Collection();
  client.slashCommands = new Collection();
  client.categories = fs.readdirSync("./commands");
}

client.ticketHandler = new TicketHandler(client);

client.manager = new Kazagumo(
  {
    defaultSearchEngine: "Youtube",
    plugins: [new Plugins.PlayerMoved(client), new KazagumoFilter()],
    send: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  },
  new Connectors.DiscordJS(client),
  nodes,
);


function loadHandlers(client) {
  ["command", "slashCommand", "shoukaku"].forEach((handler) => {
    require(`./handler/${handler}`)(client);
  });
}


function loadClientAccessories(client) {
  ["clientUtils"].forEach((accessories) => {
    require(`./handler/${accessories}`)(client);
  });
}


function setupClient(client) {
  setupDatabases(client);
  setupCollections(client);
  loadHandlers(client);
  loadClientAccessories(client);
}


const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command); 
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(config.token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands },
    );
  } catch (error) {
    if (error.code === 50001) {
      
    } else {
      console.error(error);
    }
  }
})();


const Colors = {
  PINK: '\x1b[38;5;219m',
  PURPLE: '\x1b[38;5;141m',
  BLUE: '\x1b[38;5;111m',
  GREEN: '\x1b[92m',
  WHITE: '\x1b[97m',
  DIM: '\x1b[2m',
  BOLD: '\x1b[1m',
  RESET: '\x1b[0m'
};

module.exports.Colors = Colors;

function printAeroXHeader() {
  console.log(`\n${Colors.PINK}╭─────────────────────────────────────────────────────────────╮${Colors.RESET}`);
  console.log(`${Colors.PINK}│${Colors.RESET}                 ${Colors.BOLD}${Colors.PURPLE}✦ AEROX AIO V2 ✦${Colors.RESET}                 ${Colors.PINK}│${Colors.RESET}`);
  console.log(`${Colors.PINK}│${Colors.RESET}            ${Colors.DIM}${Colors.WHITE}Elegant • Intelligent • Sophisticated${Colors.RESET}           ${Colors.PINK}│${Colors.RESET}`);
  console.log(`${Colors.PINK}╰─────────────────────────────────────────────────────────────╯${Colors.RESET}\n`);
}

function printSystemReady(botTag, hasWebhookError, hasMongoose, hasLavalink) {
  const separator = `${Colors.PINK}─${Colors.PURPLE}─${Colors.BLUE}─${Colors.RESET}`;
  
  
  if (hasWebhookError) {
    console.log(`${Colors.BLUE}◆${Colors.RESET} ${Colors.GREEN}Webhook configured${Colors.RESET}`);
  }
  if (hasMongoose) {
    console.log(`${Colors.BLUE}◆${Colors.RESET} ${Colors.GREEN}Mongoose connected${Colors.RESET}`);
  }
  if (hasLavalink) {
    console.log(`${Colors.BLUE}◆${Colors.RESET} ${Colors.GREEN}LavaLink connected${Colors.RESET}`);
  }
  
  console.log(`\n${Colors.BLUE}◆${Colors.RESET} ${Colors.BOLD}${Colors.GREEN}Authentication successful${Colors.RESET} ${Colors.DIM}→${Colors.RESET} ${Colors.PURPLE}${botTag}${Colors.RESET}`);
  console.log(`   ${separator.repeat(20)}`);
  console.log(`\n   ${Colors.BOLD}${Colors.PURPLE}✦ System Operational ✦${Colors.RESET}`);
  console.log(`   ${Colors.DIM}${Colors.WHITE}Modified by ${Colors.PINK}itsfizys${Colors.WHITE} and ${Colors.PINK}AeroX Development${Colors.RESET}`);
  console.log(`   ${Colors.DIM}${Colors.WHITE}Ready to serve with elegance and precision${Colors.RESET}\n`);
  console.log(`   ${separator.repeat(20)}\n`);
}


let mongooseConnected = false;
let lavalinkConnected = false;


client.once('clientReady', async () => {
  printAeroXHeader();
  setupClient(client);
  
  
  setTimeout(() => {
    printSystemReady(client.user.tag, true, mongooseConnected, lavalinkConnected);
  }, 500);

  function loadStickies() {
    const filePath = path.join(__dirname, './commands/sticky/stickies.json');
    let stickies = {};

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      stickies = JSON.parse(data);
    } catch (error) {
      console.error('Error reading stickies.json:', error);
    }

    return stickies;
  }

  client.on('messageCreate', (message) => {
    if (message.author.bot) return; 

    const stickies = loadStickies();

    const sticky = stickies[message.channel.id];
    if (sticky) {
      const container = new ContainerBuilder();
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(sticky.message)
      );

      message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  });

  
  const guilds = client.guilds.cache.map(guild => guild.id);
  for (const guildId of guilds) {
    const channelId = await client.db24_7.get(`24-7_${guildId}`);
    if (channelId) {
      const guild = client.guilds.cache.get(guildId);
      const channel = guild.channels.cache.get(channelId);

      if (channel) {
        try {
          const player = await client.manager.createPlayer({
            guildId: guild.id,
            textId: channel.id, // You may want to store and use a text channel ID for player messages
            voiceId: channel.id,
            volume: 100,
            deaf: true,
          });

          if (!player.playing && !player.paused) player.play();

          console.log(`Reconnected to voice channel ${channel.name} in guild ${guild.name}`);
        } catch (error) {
          console.error(`Failed to reconnect to voice channel ${channel.name} in guild ${guild.name}: ${error.message}`);
        }
      }
    }
  }
});


const snipes = new Map();
client.on("messageDelete", (deletedMessage) => {
  snipes.set(deletedMessage.channel.id, deletedMessage);
});


mongoose
  .connect(config.mongo)
  .then(() => {
    mongooseConnected = true;
  })
  .catch((error) => {
    console.error("Error: Failed to connect to MongoDB.", error);
  });


client.on("messageCreate", async (message) => {
  await DokdoHandler.run(message, snipes);
});



client.on("guildMemberAdd", async (member) => {
  const welcomeSettingsPath = path.join(
    __dirname,
    "slashCommands",
    "welcome",
    "welcomeSettings.json",
  );

  const guildId = member.guild.id;

  fs.readFile(welcomeSettingsPath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading welcome settings file: ${err}`);
      return;
    }

    const welcomeSettings = JSON.parse(data);

    if (welcomeSettings[guildId]) {
      const { channelId, message, imageUrl } = welcomeSettings[guildId];

      const welcomeContainer = new ContainerBuilder()
        .setAccentColor(0x00FF00);

      welcomeContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("**Welcome!**")
      );

      welcomeContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          message
            .replace(/{servername}/g, member.guild.name)
            .replace(/{user_mention}/g, `<@${member.id}>`)
            .replace(/{user_tag}/g, member.user.tag)
            .replace(/{membercount}/g, member.guild.memberCount)
            .replace(/{\n}/g, "\n")
        )
      );

      if (imageUrl) {
        const { MediaGalleryBuilder, MediaGalleryItemBuilder } = require("discord.js");
        welcomeContainer.addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(imageUrl).setDescription(`Welcome to ${member.guild.name}`)
          )
        );
      }

      welcomeContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`*Welcome to ${member.guild.name}*`)
      );

      const channel = member.guild.channels.cache.get(channelId);
      if (channel) {
        channel.send({ content: `Welcome <@${member.id}>`, components: [welcomeContainer], flags: MessageFlags.IsComponentsV2 });
      } else {
        console.error(
          `Channel with ID ${channelId} not found in guild ${guildId}`,
        );
      }
    } else {
      console.log(`No welcome settings found for guild ${guildId}`);
    }
  });
});


client.login(config.token);

client.manager.shoukaku.on("ready", (name) => {
  lavalinkConnected = true;
});
client.manager.shoukaku.on("error", (name, error) =>
  console.error(`Lavalink - ${name}: Error Caught,`, error),
);
client.manager.shoukaku.on("close", (name, code, reason) =>
  console.warn(
    `Lavalink - ${name}: Closed, Code ${code}, Reason ${reason || "No reason"}`,
  ),
);

client.manager.shoukaku.on("disconnect", (name, players, moved) => {
  if (moved) return;
  players.map((player) => player.connection.disconnect());
  console.warn(`Lavalink - ${name}: Disconnected`);
});
