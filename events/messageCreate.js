const client = require("../index.js");
const st = require("../settings").bot;
const { ownerIDS } = require("../dev.json");
const { PermissionsBitField, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
const emoji = require("../emoji.js");
const Groq = require("groq-sdk");
const config = require("../config.json");

function isServerOwnerOrBotOwner(message) {
  return (
    message.author.id === message.guild?.ownerId ||
    ownerIDS.includes(message.author.id)
  );
}

function getReadablePermissions(permissions) {
  return permissions.map((perm) => `\`${perm}\``).join(", ");
}

function isUserAboveBotRole(message) {
  const botRolePosition = message.guild.members.me.roles.highest.position;
  const userRolePosition = message.member.roles.highest.position;
  return userRolePosition > botRolePosition;
}

async function isUserInblacklist(client, ID) {
  const data = await client.db4.get(`members_bl`);
  if (!data || !data.blacklist) return false;
  return data.blacklist.includes(ID);
}

async function handleCommand(client, message, args) {
  const cmd = args.shift().toLowerCase();
  if (cmd.length == 0) return;

  let command =
    client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
  const extraOwner =
    (await client.db11.get(`${message.guild.id}_eo.extraownerlist`)) || [];
  const extraAdmin =
    (await client.db11.get(`${message.guild.id}_ea.extraadminlist`)) || [];
  const userHasAdminPerm = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
  const botHasAdminPerm = message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator);
  const channelId = message.channel.id;
  const ignoreChannels =
    (await client.db10.get(`${message.guild.id}_ic.ignorechannellist`)) || [];
  const ignoreBypass =
    (await client.db10.get(`${message.guild.id}_ic.ignorebypasslist`)) || [];
  const mediaChannels =
    (await client.db14.get(
      `${message.guild.id}_mediachannels.mediachannellist`,
    )) || [];
  const missingBotPerms = command?.BotPerms || [];

  if (message.author.bot) return;
  if (!command) return;

  if (mediaChannels.includes(channelId) && !mediaBypass.includes(message.author.id)) return;

  if (
    ignoreChannels.includes(channelId) &&
    !ignoreBypass.includes(message.author.id)
  ) {
    const ignoreMessage = await message.channel.send(
      "This channel is in my ignore list. You cannot use commands here.",
    );
    setTimeout(() => ignoreMessage.delete().catch(console.error), 5000);
    return;
  }

  if (
    command.serverOwnerOnly &&
    !isServerOwnerOrBotOwner(message) &&
    !extraOwner.includes(message.author.id)
  ) {
    return message.channel.send(
      "This command can only be used by the server owner or extra owners.",
    );
  }

  if (
    missingBotPerms.length > 0 &&
    !message.guild.members.me.permissions.has(missingBotPerms)
  ) {
    return message.channel.send(
      `I need ${getReadablePermissions(
        missingBotPerms,
      )} permission(s) to execute this command.`,
    );
  }

  if (
    !isServerOwnerOrBotOwner(message) &&
    botHasAdminPerm &&
    !userHasAdminPerm &&
    !extraOwner.includes(message.author.id) &&
    !extraAdmin.includes(message.author.id)
  ) {
    const missingUserPerms = command.UserPerms || [];

    if (
      missingUserPerms.length > 0 &&
      !message.member.permissions.has(missingUserPerms)
    ) {
      return message.channel.send(
        `You need ${getReadablePermissions(
          missingUserPerms,
        )} permission(s) to use this command.`,
      );
    }
  }

  if (
    command.aboveRole &&
    !isUserAboveBotRole(message) &&
    !isServerOwnerOrBotOwner(message) &&
    !extraOwner.includes(message.author.id)
  ) {
    return message.channel.send(
      "You need a role higher than the bot's role to use this command.",
    );
  }

  command.run(client, message, args);
  return;
}

async function getPrefix(guildId) {
  return (await client.db8.get(`${guildId}_prefix`)) || st.info.prefix;
}

function isBotOrDM(message) {
  return message.author.bot || !message.guild;
}

const stickyFilePath = path.join(__dirname, "../commands/sticky/stickies.json");

const loadStickies = () => {
  try {
    if (!fs.existsSync(stickyFilePath)) {
      fs.writeFileSync(stickyFilePath, JSON.stringify({}), "utf8");
    }
    const data = fs.readFileSync(stickyFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error loading stickies:", err);
    return {};
  }
};

const saveStickies = (data) => {
  try {
    fs.writeFileSync(stickyFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving stickies:", err);
  }
};

async function handleStickyMessage(message) {
  const stickies = loadStickies();
  
  
  let stickyPosted = false;
  
  for (const [channelKey, sticky] of Object.entries(stickies)) {
    if (sticky.channel === message.channel.id && sticky.guild === message.guild.id) {
      if (stickyPosted) {
        console.log('Skipping duplicate sticky entry for channel:', message.channel.id);
        continue;
      }
      
      try {
        
        if (sticky.lastMessageId) {
          try {
            const oldMessage = await message.channel.messages.fetch(sticky.lastMessageId);
            if (oldMessage) {
              await oldMessage.delete();
            }
          } catch (err) {
            
          }
        }

        
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(sticky.message)
        );
        
        const sentMessage = await message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        
        stickies[channelKey].lastMessageId = sentMessage.id;
        saveStickies(stickies);
        stickyPosted = true;
      } catch (error) {
        console.error(`Failed to post sticky message in channel ${message.channel.id}:`, error);
      }
    }
  }
}

function getCommandAndArgs(message, prefix, noprefixed, np) {
  if (
    !noprefixed.includes(message.author.id) &&
    !message.content.startsWith(prefix)
  )
    return null;

  return np.includes(message.author.id) === false
    ? message.content.slice(prefix.length).trim().split(/ +/)
    : message.content.startsWith(prefix)
      ? message.content.slice(prefix.length).trim().split(/ +/)
      : message.content.trim().split(/ +/);
}

async function handleAIChat(message, prefix) {
  try {
    const channelId = message.channel.id;
    const guildId = message.guild.id;
    
    const aiChannels = await client.db.get(`${guildId}_ai_channels`) || [];
    
    if (!aiChannels.includes(channelId)) {
      return false;
    }
    
    if (message.content.startsWith(prefix)) {
      return false;
    }
    
    if (!config.groqApiKey || config.groqApiKey === "") {
      console.error('Groq API key is not configured');
      return false;
    }
    
    const groq = new Groq({ apiKey: config.groqApiKey });
    
    await message.channel.sendTyping();
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant in a Discord server. Be friendly, concise, and engaging. Keep responses under 2000 characters."
        },
        {
          role: "user",
          content: message.content
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024
    });
    
    const response = chatCompletion.choices[0]?.message?.content;
    
    if (response) {
      if (response.length > 2000) {
        const chunks = response.match(/.{1,2000}/g) || [];
        for (const chunk of chunks) {
          await message.reply(chunk);
        }
      } else {
        await message.reply(response);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error in AI chat:', error);
    return false;
  }
}

client.on("messageCreate", async (message) => {
  try {
    if (isBotOrDM(message)) return;

    if (!message.guild.members.me.permissionsIn(message.channel).has("SendMessages")) {
      return;
    }

    const isBlacklisted = await isUserInblacklist(client, message.author.id);
    if (isBlacklisted) return;

    await handleStickyMessage(message);

    const prefix = await getPrefix(message.guild.id);
    const aiHandled = await handleAIChat(message, prefix);
    if (aiHandled) return;
    let data = await client.db4.get(`members_np`);

if (!data || !Array.isArray(data.noprefixlist)) {

  data = { noprefixlist: [] };

  await client.db4.set(`members_np`, data);

}

const noprefixed = data.noprefixlist;

const np = [...noprefixed];

    const args = getCommandAndArgs(message, prefix, noprefixed, np);
    if (args) {
      await handleCommand(client, message, args);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
});