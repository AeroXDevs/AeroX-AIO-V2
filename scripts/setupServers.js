
const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers
  ]
});

const SERVER_IDS = ['1428438656116457627', '1428452169945976986'];

async function deleteAllChannels(guild) {
  console.log(`\n🗑️  Deleting all channels and categories in ${guild.name}...`);
  
  const channels = guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory);
  for (const channel of channels.values()) {
    try {
      await channel.delete();
      console.log(`   ✅ Deleted channel: ${channel.name}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`   ❌ Failed to delete ${channel.name}:`, error.message);
    }
  }

  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);
  for (const category of categories.values()) {
    try {
      await category.delete();
      console.log(`   ✅ Deleted category: ${category.name}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`   ❌ Failed to delete ${category.name}:`, error.message);
    }
  }
}

async function createChannels(guild) {
  console.log(`\n📝 Creating channels in ${guild.name}...`);

  
  const category = await guild.channels.create({
    name: '📋〢ꜱᴇʀᴠᴇʀ ᴄʜᴀɴɴᴇʟꜱ',
    type: ChannelType.GuildCategory
  });
  console.log(`   ✅ Created category: ${category.name}`);

  
  const lockedChannels = [
    '📢〢ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛꜱ',
    '🔄〢ᴜᴘᴅᴀᴛᴇꜱ',
    '😀〢ᴇᴍᴏᴊɪꜱ-ʟɪꜱᴛ'
  ];

  const createdChannels = {};

  for (const channelName of lockedChannels) {
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.SendMessages]
        }
      ]
    });
    console.log(`   ✅ Created locked channel: ${channel.name}`);
    createdChannels[channelName] = channel;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  
  const unlockedChannels = [
    '💬〢ɢᴇɴᴇʀᴀʟ',
    '⚡〢ᴄᴍᴅꜱ'
  ];

  for (const channelName of unlockedChannels) {
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id
    });
    console.log(`   ✅ Created channel: ${channel.name}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return createdChannels;
}

async function createBotAdderRole(guild) {
  console.log(`\n👑 Creating Bot Adder role in ${guild.name}...`);
  
  const role = await guild.roles.create({
    name: 'Bot Adder',
    permissions: [PermissionFlagsBits.ManageGuild],
    reason: 'Bot Adder role for server management'
  });
  
  console.log(`   ✅ Created role: ${role.name}`);
  return role;
}

async function displayEmojisInChannel(guild, channel) {
  console.log(`\n😀 Displaying emojis in ${guild.name}...`);
  
  const emojis = Array.from(guild.emojis.cache.values());
  
  if (emojis.length === 0) {
    await channel.send('No emojis found in this server.');
    return;
  }

  const container = new ContainerBuilder();
  
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# Server Emojis\n*Total: ${emojis.length} emojis*`)
  );
  
  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  
  const chunkSize = 20;
  for (let i = 0; i < emojis.length; i += chunkSize) {
    const chunk = emojis.slice(i, i + chunkSize);
    const emojiList = chunk.map(emoji => {
      return `${emoji} **${emoji.name}**\n\`ID: ${emoji.id}\``;
    }).join('\n\n');
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(emojiList)
    );
    
    if (i + chunkSize < emojis.length) {
      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      );
    }
  }

  await channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });
  
  console.log(`   ✅ Displayed ${emojis.length} emojis in ${channel.name}`);
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🚀 Starting server setup...\n`);

  for (const serverId of SERVER_IDS) {
    const guild = client.guilds.cache.get(serverId);
    
    if (!guild) {
      console.log(`❌ Could not find server with ID: ${serverId}`);
      continue;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Processing: ${guild.name} (${guild.id})`);
    console.log('='.repeat(50));

    try {
      
      await deleteAllChannels(guild);

      
      const createdChannels = await createChannels(guild);

      
      await createBotAdderRole(guild);

      
      const emojiChannel = createdChannels['😀〢ᴇᴍᴏᴊɪꜱ-ʟɪꜱᴛ'];
      if (emojiChannel) {
        await displayEmojisInChannel(guild, emojiChannel);
      }

      console.log(`\n✅ Completed setup for ${guild.name}`);
    } catch (error) {
      console.error(`\n❌ Error setting up ${guild.name}:`, error);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('✅ All servers processed!');
  console.log('='.repeat(50));
  console.log('\nYou can now close this script.');
  
  
  
  
});

client.login(config.token);
