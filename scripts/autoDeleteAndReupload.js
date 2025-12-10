const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');


const emojiPatterns = [
  /<a:([^:]+):(\d+)>/g,
  /<:([^:]+):(\d+)>/g,
  /setEmoji\(['"]<a:([^:]+):(\d+)>['"]\)/g,
  /setEmoji\(['"]<:([^:]+):(\d+)>['"]\)/g,
  /emoji: ['"]<a:([^:]+):(\d+)>['"]/g,
  /emoji: ['"]<:([^:]+):(\d+)>['"]/g,
];

const excludeDirs = ['.git', 'node_modules', 'data', '.local', '.cache', '.config'];
const GUILD_ID_1 = '1428438656116457627';
const GUILD_ID_2 = '1428452169945976986';


async function scanDirectory(dir) {
  const emojis = new Map();
  
  async function scan(currentDir) {
    const files = await readdir(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          await scan(filePath);
        }
        continue;
      }
      
      if (!['.js', '.json'].includes(path.extname(file))) continue;
      
      try {
        const content = await readFile(filePath, 'utf8');
        
        for (const pattern of emojiPatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const emojiName = match[1];
            const emojiId = match[2];
            const isAnimated = pattern.toString().includes('<a:');
            const extension = isAnimated ? 'gif' : 'png';
            const emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${extension}`;
            
            emojis.set(emojiId, {
              name: emojiName,
              id: emojiId,
              url: emojiUrl,
              format: isAnimated ? `<a:${emojiName}:${emojiId}>` : `<:${emojiName}:${emojiId}>`,
              file: filePath,
              isAnimated: isAnimated
            });
          }
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
      }
    }
  }
  
  await scan(dir);
  return Array.from(emojis.values());
}


async function deleteAllEmojis(guild) {
  console.log(`\n🗑️  Deleting all emojis from ${guild.name}...`);
  const emojis = Array.from(guild.emojis.cache.values());
  
  for (const emoji of emojis) {
    try {
      await emoji.delete();
      console.log(`   ✅ Deleted: ${emoji.name}`);
      await new Promise(resolve => setTimeout(resolve, 500)); 
    } catch (error) {
      console.error(`   ❌ Failed to delete ${emoji.name}:`, error.message);
    }
  }
  
  console.log(`✅ Deleted ${emojis.length} emojis from ${guild.name}`);
}


async function uploadSingleEmoji(guild, emoji) {
  try {
    const emojiUrl = emoji.url;
    let createdEmoji;
    
    try {
      createdEmoji = await guild.emojis.create({
        attachment: emojiUrl,
        name: emoji.name
      });
      console.log(`✅ Uploaded: ${emoji.name} (Old: ${emoji.id}, New: ${createdEmoji.id})`);
      return {
        oldId: emoji.id,
        newId: createdEmoji.id,
        name: emoji.name,
        isAnimated: emoji.isAnimated
      };
    } catch (uploadError) {
      
      if (emoji.isAnimated && (uploadError.code === 50035 || uploadError.code === 30008)) {
        const pngUrl = emojiUrl.replace('.gif', '.png');
        try {
          createdEmoji = await guild.emojis.create({
            attachment: pngUrl,
            name: emoji.name
          });
          console.log(`✅ Uploaded as PNG: ${emoji.name} (Old: ${emoji.id}, New: ${createdEmoji.id})`);
          return {
            oldId: emoji.id,
            newId: createdEmoji.id,
            name: emoji.name,
            isAnimated: false
          };
        } catch (pngError) {
          console.error(`❌ Failed: ${emoji.name}:`, pngError.message);
        }
      } else {
        console.error(`❌ Failed: ${emoji.name}:`, uploadError.message);
      }
    }
  } catch (error) {
    console.error(`❌ Error: ${emoji.name}:`, error.message);
  }
  return null;
}


async function uploadEmojisToGuilds(client, emojis) {
  const emojiMapping = new Map();
  
  const emojisForGuild1 = emojis.slice(0, 50);
  const emojisForGuild2 = emojis.slice(50);
  
  console.log(`\n📤 Uploading ${emojis.length} emojis:`);
  console.log(`   - First 50 → Server 1`);
  console.log(`   - Remaining ${emojisForGuild2.length} → Server 2\n`);
  
  if (emojisForGuild1.length > 0) {
    const guild1 = await client.guilds.fetch(GUILD_ID_1);
    console.log(`\n📤 Uploading to ${guild1.name}...`);
    
    for (const emoji of emojisForGuild1) {
      const mapping = await uploadSingleEmoji(guild1, emoji);
      if (mapping) emojiMapping.set(emoji.id, mapping);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (emojisForGuild2.length > 0) {
    const guild2 = await client.guilds.fetch(GUILD_ID_2);
    console.log(`\n📤 Uploading to ${guild2.name}...`);
    
    for (const emoji of emojisForGuild2) {
      const mapping = await uploadSingleEmoji(guild2, emoji);
      if (mapping) emojiMapping.set(emoji.id, mapping);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return emojiMapping;
}


async function replaceEmojiIds(rootDir, emojiMapping) {
  console.log('\n🔄 Replacing emoji IDs in files...');
  
  async function replaceInFiles(currentDir) {
    const files = await readdir(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          await replaceInFiles(filePath);
        }
        continue;
      }
      
      if (!['.js', '.json'].includes(path.extname(file))) continue;
      
      try {
        let content = await readFile(filePath, 'utf8');
        let modified = false;
        
        for (const [oldId, mapping] of emojiMapping.entries()) {
          const oldAnimated = `<a:${mapping.name}:${oldId}>`;
          const oldStatic = `<:${mapping.name}:${oldId}>`;
          const newEmoji = mapping.isAnimated ? `<a:${mapping.name}:${mapping.newId}>` : `<:${mapping.name}:${mapping.newId}>`;
          
          if (content.includes(oldAnimated)) {
            content = content.replaceAll(oldAnimated, newEmoji);
            modified = true;
          }
          
          if (content.includes(oldStatic)) {
            content = content.replaceAll(oldStatic, newEmoji);
            modified = true;
          }
          
          const idRegex = new RegExp(`(["'\`])${oldId}\\1`, 'g');
          if (idRegex.test(content)) {
            content = content.replace(idRegex, `$1${mapping.newId}$1`);
            modified = true;
          }
        }
        
        if (modified) {
          await writeFile(filePath, content, 'utf8');
          console.log(`✅ Updated: ${path.relative(rootDir, filePath)}`);
        }
      } catch (error) {
        console.error(`Error: ${filePath}:`, error.message);
      }
    }
  }
  
  await replaceInFiles(rootDir);
}


async function main() {
  const rootDir = __dirname;
  
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildEmojisAndStickers]
  });
  
  await client.login(config.token);
  
  client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}\n`);
    
    try {
      
      const guild1 = await client.guilds.fetch(GUILD_ID_1);
      const guild2 = await client.guilds.fetch(GUILD_ID_2);
      
      await deleteAllEmojis(guild1);
      await deleteAllEmojis(guild2);
      
      console.log('\n✅ All emojis deleted from both servers!\n');
      
      
      console.log('🔍 Scanning project for emojis...');
      const emojis = await scanDirectory(rootDir);
      console.log(`✅ Found ${emojis.length} unique emojis\n`);
      
      
      const emojiMapping = await uploadEmojisToGuilds(client, emojis);
      
      
      const mappingPath = path.join(__dirname, 'emoji-mapping.json');
      const mappingArray = Array.from(emojiMapping.values());
      fs.writeFileSync(mappingPath, JSON.stringify(mappingArray, null, 2));
      console.log(`\n✅ Emoji mapping saved to ${mappingPath}`);
      
      
      await replaceEmojiIds(rootDir, emojiMapping);
      
      console.log('\n🎉 All done! Emojis uploaded and IDs replaced successfully!');
      
    } catch (error) {
      console.error('Error:', error);
    }
    
    await client.destroy();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
