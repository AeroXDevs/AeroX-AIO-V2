const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');

const GUILD_ID_1 = '1428438656116457627';
const GUILD_ID_2 = '1428452169945976986';

async function main() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildEmojisAndStickers]
  });

  await client.login(config.token);

  client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}\n`);

    try {
      
      const guild1 = await client.guilds.fetch(GUILD_ID_1);
      const guild2 = await client.guilds.fetch(GUILD_ID_2);

      console.log(`📊 Server 1: ${guild1.name}`);
      console.log(`   Emojis: ${guild1.emojis.cache.size}`);
      guild1.emojis.cache.forEach(e => console.log(`   - ${e.name} (${e.id})`));

      console.log(`\n📊 Server 2: ${guild2.name}`);
      console.log(`   Emojis: ${guild2.emojis.cache.size}`);
      guild2.emojis.cache.forEach(e => console.log(`   - ${e.name} (${e.id})`));

      
      console.log('\n⚠️  To clean up and redistribute properly:');
      console.log('1. Delete all emojis from both servers manually in Discord');
      console.log('2. Then run: node findEmojis.js');
      console.log('\nThis will ensure proper 50/50 split.');

    } catch (error) {
      console.error('Error:', error);
    }

    await client.destroy();
    process.exit(0);
  });
}

main().catch(console.error);
